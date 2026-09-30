import { marked } from 'marked';
import sanitize from 'sanitize-html';
import postcss from 'postcss';
import valueParser from 'postcss-value-parser';
import { createHash } from 'node:crypto';
import type { Workspace } from './bb-workspace.ts';
import { readWorkspaceFile, PreviewError } from './files.ts';
import { resolveAssetPath } from './asset-routes.ts';
import { LIMITS } from './limits.ts';
export type DocumentPreview={html:string;revision:string;warnings:string[]};
const defaultStyle='body{font:16px/1.65 system-ui,sans-serif;color:#202124;background:white;margin:0;padding:24px;overflow-wrap:anywhere}h1,h2,h3{line-height:1.25}h1{font-size:30px}img{max-width:100%;height:auto}table{border-collapse:collapse;display:block;overflow:auto}th,td{border:1px solid #ddd;padding:8px;text-align:left}pre{overflow:auto;padding:12px;background:#f4f4f4}a{color:#1758a8}blockquote{border-left:3px solid #ddd;padding-left:16px;margin-left:0}';
export async function renderDocument(workspace:Workspace,path:string):Promise<DocumentPreview> {
  const warnings:string[]=[];
  const file=await readWorkspaceFile(workspace.rootPath,path);
  if(!['text/html','text/markdown'].includes(file.mediaType))throw new PreviewError('unsupported_type','Choose a Markdown or HTML document.');
  let expanded=0;
  function reserve(text:string) {expanded+=Buffer.byteLength(text);if(expanded>LIMITS.bundleBytes)throw new PreviewError('asset_limit','Expanded document exceeds the 30 MiB limit.');return text;}
  const revisions=[`${file.path}:${file.revision}`];let total=file.bytes.length;let count=0;
  const cache=new Map<string,string>();
  const loading=new Set<string>();
  async function asset(base:string,reference:string):Promise<string> {
    const assetPath=resolveAssetPath(base,reference);
    if(cache.has(assetPath))return cache.get(assetPath)!;
    if(loading.has(assetPath))throw new PreviewError('asset_cycle','Circular CSS import.');
    if(++count>LIMITS.assetCount)throw new PreviewError('asset_limit','Document exceeds the 100-asset limit.');
    loading.add(assetPath);
    try {
      const input=await readWorkspaceFile(workspace.rootPath,assetPath);total+=input.bytes.length;
      if(total>LIMITS.bundleBytes)throw new PreviewError('asset_limit','Document and assets exceed 30 MiB.');
      revisions.push(`${assetPath}:${input.revision}`);
      let value:string;
      if(input.mediaType==='text/css') value=await css(input.bytes.toString('utf8'),assetPath);
      else if(input.mediaType.startsWith('image/'))value=`data:${input.mediaType};base64,${input.bytes.toString('base64')}`;
      else throw new PreviewError('unsupported_type','Only CSS and images can be embedded.');
      cache.set(assetPath,value);return value;
    }finally{loading.delete(assetPath);}
  }
  async function safeAsset(base:string,reference:string):Promise<string> {
    try{return await asset(base,reference);}catch(cause){if(cause instanceof PreviewError && cause.code==='asset_limit')throw cause;warnings.push(`Asset unavailable: ${reference} (${cause instanceof Error?cause.message:'read failed'})`);return '';}
  }
  async function css(source:string,base:string):Promise<string> {
    const tree=postcss.parse(source);
    const imports:postcss.AtRule[]=[];tree.walkAtRules('import',rule=>{imports.push(rule);});
    for(const rule of imports) {
      const token=valueParser(rule.params).nodes[0];
      const ref=token?.type==='string'?token.value:token?.type==='function'&&token.value==='url'?valueParser.stringify(token.nodes).replace(/^['"]|['"]$/g,''):'';
      const imported=ref?await safeAsset(base,ref):'';
      // Preserve imported style content; media-condition handling is deferred.
      if(imported && !imported.startsWith('data:')){reserve(imported);const remainder=rule.params.slice(token.sourceEndIndex).trim();const parsed=postcss.parse(imported);if(remainder){const media=postcss.atRule({name:'media',params:remainder});media.append(parsed.nodes);rule.replaceWith(media);}else rule.replaceWith(parsed);}else rule.remove();
    }
    const declarations:postcss.Declaration[]=[];tree.walkDecls(decl=>{declarations.push(decl);});
    for(const decl of declarations) {
      const parsed=valueParser(decl.value);const urls:valueParser.FunctionNode[]=[];
      parsed.walk(node=>{if(node.type==='function' && node.value.toLowerCase()==='url')urls.push(node);});
      for(const node of urls) {
        const ref=valueParser.stringify(node.nodes).replace(/^['"]|['"]$/g,'');
        const url=ref.startsWith('data:image/')?ref:await safeAsset(base,ref);
        reserve(url);
        node.nodes=[{type:'string',quote:'"',value:url.startsWith('data:image/')?url:'',sourceIndex:0,sourceEndIndex:0}];
      }
      decl.value=parsed.toString();
    }
    return tree.toString();
  }
  let source=file.bytes.toString('utf8').replace(/^\uFEFF/,'');
  if(file.mediaType==='text/markdown') {
    if(source.startsWith('---\n')||source.startsWith('---\r\n')) {
      const match=source.match(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/);
      if(!match)throw new PreviewError('document_updating','Frontmatter is incomplete; the document may still be updating.');
      source=source.slice(match[0].length);
    }
    source=await marked.parse(source,{gfm:true});
  }
  reserve(source);
  const refs=new Set<string>();const styles:string[]=[];const attributes=new Set<string>();
  // First pass collects only sources that can survive the sanitizer.
  const allowedTags=[...sanitize.defaults.allowedTags,'img','style','link'];
  const options:sanitize.IOptions={allowedTags,allowedAttributes:{'*':['id','class','title','style'],img:['src','alt','width','height'],a:['href','title'],link:['rel','href'],th:['colspan','rowspan'],td:['colspan','rowspan']},allowVulnerableTags:true,allowedSchemes:['https','http','mailto'],allowedSchemesByTag:{img:['data'],link:[]},allowProtocolRelative:false,
    transformTags:{'*':(tag,attrs)=>{if(attrs.style)attributes.add(attrs.style);return {tagName:tag,attribs:attrs};},img:(tag,attrs)=>{if(attrs.src)refs.add(attrs.src);return {tagName:tag,attribs:attrs};},link:(tag,attrs)=>{if(attrs.rel==='stylesheet'&&attrs.href)refs.add(attrs.href);return {tagName:tag,attribs:attrs};}},
    textFilter:(text,tag)=>{if(tag==='style')styles.push(text);return text;},
  };
  sanitize(source,options);
  const embedded=new Map<string,string>();for(const ref of refs)embedded.set(ref,ref.startsWith('data:image/')?ref:await safeAsset(path,ref));
  const inlineStyles=new Map<string,string>();for(const style of styles)inlineStyles.set(style,await css(style,path));
  const inlineAttributes=new Map<string,string>();for(const style of attributes){const processed=await css(`x{${style}}`,path);inlineAttributes.set(style,processed.slice(processed.indexOf('{')+1,processed.lastIndexOf('}')));}
  const body=sanitize(source,{...options,allowedTags:allowedTags.filter(t=>t!=='link'),allowedAttributes:{...options.allowedAttributes,a:['href','title','data-preview-path','target','rel']},
    transformTags:{
      '*':(tag,attrs)=>{if(attrs.style){attrs.style=reserve(inlineAttributes.get(attrs.style)||'');}return {tagName:tag,attribs:attrs};},
      img:(tag,attrs)=>({tagName:tag,attribs:{...attrs,src:reserve(embedded.get(attrs.src)||''),alt:attrs.alt||(embedded.get(attrs.src)?'Image preview':'Image unavailable')}}),
      link:(_tag,attrs)=>({tagName:'span',attribs:{},text:''}),
      a:(tag,attrs)=>{
        const href=attrs.href||'';
        if(/^(https?:|mailto:)/i.test(href))return {tagName:tag,attribs:{...attrs,target:'_blank',rel:'noopener noreferrer'}};
        if(href.startsWith('#'))return {tagName:tag,attribs:attrs};
        try{return {tagName:tag,attribs:{...attrs,href:'#','data-preview-path':resolveAssetPath(path,href)}};}catch{return {tagName:'span',attribs:{}};}
      },
    },textFilter:(text,tag)=>tag==='style'?reserve(inlineStyles.get(text)||''):text,
  });
  const linkedStyles=[...refs].map(ref=>embedded.get(ref)||'').filter(value=>value && !value.startsWith('data:'));
  const styleText=[defaultStyle,...linkedStyles.map(reserve)].join('\n').replace(/<\/style/gi,'');
  const html=`<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:; style-src 'unsafe-inline'; form-action 'none'; base-uri 'none'"><style>${styleText}</style></head><body>${body}</body></html>`;
  if(Buffer.byteLength(html)>LIMITS.bundleBytes)throw new PreviewError('asset_limit','Expanded document exceeds the 30 MiB limit.');
  const revision=createHash('sha256').update(revisions.join('\n')).update(html).update(warnings.join('\n')).digest('hex');
  return {html,revision,warnings};
}
