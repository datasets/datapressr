import { useRef,useEffect } from 'react';
export function HtmlPreview({html,path,onNavigate}:{html:string;path:string;onNavigate:(path:string)=>void}) {
  const ref=useRef<HTMLIFrameElement>(null);
  const cleanup=useRef<()=>void>(()=>{});
  const scroll=useRef(0);
  useEffect(()=>()=>cleanup.current(),[]);
  return <iframe ref={ref} title={`Document preview: ${path}`} sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox" className="h-[700px] w-full rounded border bg-white" srcDoc={html} onLoad={()=>{
    cleanup.current();
    const doc=ref.current?.contentDocument;const win=ref.current?.contentWindow;if(!doc||!win)return;
    win.scrollTo(0,scroll.current);
    const clicked=(event:MouseEvent)=>{
      const target=event.target as Element|null;const link=target?.closest?.('a[data-preview-path]');
      const destination=link?.getAttribute('data-preview-path');if(destination){event.preventDefault();onNavigate(destination);}
    };
    const scrolled=()=>{scroll.current=win.scrollY;};
    doc.addEventListener('click',clicked);win.addEventListener('scroll',scrolled);
    cleanup.current=()=>{doc.removeEventListener('click',clicked);win.removeEventListener('scroll',scrolled);};
  }}/>;
}
