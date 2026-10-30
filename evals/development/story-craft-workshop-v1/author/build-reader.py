from pathlib import Path
import subprocess,re,html
root=Path(__file__).resolve().parent.parent
css='''*{box-sizing:border-box}body{margin:0;background:#fff;color:#202020;font-family:Georgia,serif;font-size:19px;line-height:1.6}main{max-width:800px;margin:48px auto;padding:0 24px 64px}h1{font-size:38px;line-height:1.15;letter-spacing:-.02em}h2{font-size:26px;margin-top:2em}p{margin:1.2em 0}a{color:#175d8d;text-underline-offset:3px;overflow-wrap:anywhere}figure{margin:30px 0}img{display:block;width:100%;height:auto}figcaption{display:none}pre{font-size:14px;white-space:pre-wrap;overflow-wrap:anywhere;background:#f5f5f5;padding:16px}code{overflow-wrap:anywhere}@media(max-width:600px){body{font-size:18px}main{margin:28px auto;padding:0 20px 40px}h1{font-size:31px}}'''
for version in ['original','revised']:
    folder=root/version
    source=(folder/'README.md').read_text()
    title=re.search(r'^title: "(.*)"',source,re.M)[1]
    body=re.sub(r'^---\n.*?\n---\n','',source,flags=re.S)
    # Localize downloadable assets in rendered HTML only; preserve pinned Markdown.
    body=body.replace('https://datahub.io/blog/2026-temperature-record-hurdle/_r/-/','')
    fragment=subprocess.check_output(['pandoc','-f','markdown','-t','html5'],input=body.encode()).decode()
    fragment=re.sub(r'(<img src="([^"]+)".*?/>)',r'<a href="\2" aria-label="Open chart at full size">\1</a>',fragment,flags=re.S)
    page=f'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{html.escape(title)}</title><style>{css}</style></head><body><main><h1>{html.escape(title)}</h1>{fragment}</main></body></html>\n'
    (folder/'index.html').write_text(page)
