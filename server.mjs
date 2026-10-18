import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { resolve, extname } from 'node:path';
const built = process.argv.includes('--dist');
if(!built)await import('./render-pages.mjs');
const root = resolve(built ? 'dist' : '.');
const types = {'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.webp':'image/webp','.woff2':'font/woff2','.ttf':'font/ttf','.svg':'image/svg+xml','.mp4':'video/mp4'};
createServer(async (req,res) => {
 try {
  let path = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  if(['/our-spirit','/menu','/reservations'].includes(path)){res.writeHead(308,{Location:path+'/'+new URL(req.url,'http://localhost').search});res.end();return;}
  if(path.endsWith('/'))path += 'index.html';
  if(!built && (/^\/(images|fonts|video)\//.test(path) || path === '/favicon.svg')) path = '/public'+path;
  const file = resolve(root,'.'+path);
  if(!file.startsWith(root+'\\') && !file.startsWith(root+'/')) throw Error();
  const info = await stat(file);if(!info.isFile()) throw Error();
  const headers = {'Content-Type':types[extname(file)] || 'application/octet-stream','Accept-Ranges':'bytes'};
  if(req.headers.range){
   const match = /^bytes=(\d+)-(\d*)$/.exec(req.headers.range);
   if(!match){res.writeHead(416,{'Content-Range':`bytes */${info.size}`});res.end();return;}
   const start = Number(match[1]),end = Math.min(match[2] ? Number(match[2]) : info.size-1,info.size-1);
   if(start > end || start >= info.size){res.writeHead(416,{'Content-Range':`bytes */${info.size}`});res.end();return;}
   res.writeHead(206,{...headers,'Content-Range':`bytes ${start}-${end}/${info.size}`,'Content-Length':end-start+1});
   if(req.method === 'HEAD')res.end();else createReadStream(file,{start,end}).pipe(res);
  }else{
   res.writeHead(200,{...headers,'Content-Length':info.size});
   if(req.method === 'HEAD')res.end();else if(extname(file)==='.mp4')createReadStream(file).pipe(res);else res.end(await readFile(file));
  }
 }catch{res.writeHead(404);res.end('Not found');}
}).listen(3000,'127.0.0.1',()=>console.log('OLIVA is ready at http://127.0.0.1:3000'));
