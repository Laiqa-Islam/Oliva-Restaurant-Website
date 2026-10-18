import { mkdir,copyFile,cp } from 'node:fs/promises';
await import('./render-pages.mjs');
await mkdir('dist',{recursive:true});
for(const file of ['index.html','style.css','pages.css','app.js','home-motion.js','pages.js','menu-motion.js','motion-utils.js','menu-data.js']) await copyFile(file,`dist/${file}`);
for(const directory of ['our-spirit','menu','reservations'])await cp(directory,`dist/${directory}`,{recursive:true});
await cp('public','dist',{recursive:true});
console.log('Built OLIVA to dist/');
