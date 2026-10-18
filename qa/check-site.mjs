import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname} from 'node:path';

const base='http://127.0.0.1:3000';
const routes=['/','/our-spirit/','/menu/','/reservations/'];
const requests=new Set(routes);
let links=0;
for(const route of routes){
  const file=resolve('dist','.'+route,'index.html');
  const html=await readFile(file,'utf8');
  assert.equal((html.match(/<h1\b/g)||[]).length,1,`${route} must have one main heading`);
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);
  assert.equal(ids.length,new Set(ids).size,`${route} contains duplicate IDs`);
  assert.equal((html.match(/id="booking-form"/g)||[]).length,1,`${route} needs exactly one booking form`);
  for(const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)){
    const url=new URL(match[1],base+route);
    if(url.origin!==base)continue;
    const target=resolve('dist','.'+url.pathname+(url.pathname.endsWith('/')?'index.html':''));
    await stat(target);
    if(url.hash&&url.hash!=='#'){
      const targetHtml=url.pathname===route?html:await readFile(target,'utf8');
      assert.ok(targetHtml.includes(`id="${decodeURIComponent(url.hash.slice(1))}"`),`${route}: missing anchor ${url.pathname+url.hash}`);
    }
    requests.add(url.pathname);links++;
  }
}
for(const filename of ['style.css','pages.css']){
  const css=await readFile('dist/'+filename,'utf8');
  for(const match of css.matchAll(/url\(['"]?(\/[^)'" ]+)/g)){await stat('dist'+match[1]);requests.add(match[1]);}
}
for(const filename of ['app.js','home-motion.js','pages.js','motion-utils.js','menu-data.js']){
  const source=await readFile('dist/'+filename,'utf8');
  for(const match of source.matchAll(/from\s+['"]\.\/([^'"]+)/g)){await stat('dist/'+match[1]);requests.add('/'+match[1]);}
}
const responses=await Promise.all([...requests].map(async path=>{
  const response=await fetch(base+path,{method:'HEAD'});
  assert.equal(response.status,200,`${path} did not load`);
  if(extname(path)==='.js')assert.ok(response.headers.get('content-type')?.includes('javascript'));
  return path;
}));
for(const route of routes.filter(route=>route!=='/')){
  const response=await fetch(base+route.slice(0,-1),{redirect:'manual'});
  assert.equal(response.status,308,'Clean routes should redirect to their canonical directory');
  assert.equal(response.headers.get('location'),route);
}
console.log(`Passed: ${routes.length} pages, ${links} internal links/assets, ${responses.length} HTTP resources, unique IDs, booking forms, section anchors, and clean-route redirects.`);
