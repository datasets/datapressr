export function ImagePreview({dataUrl,path}:{dataUrl:string;path:string}) {
  return <iframe title={`Image preview: ${path}`} sandbox="" className="h-[600px] w-full border-0 bg-white" srcDoc={`<!doctype html><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:; style-src 'unsafe-inline'"><style>body{margin:0;display:grid;place-items:start center}img{max-width:100%;height:auto}</style><img alt="Chart or image preview" src="${dataUrl}">`}/>;
}
