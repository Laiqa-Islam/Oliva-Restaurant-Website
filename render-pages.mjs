import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {menu} from './menu-data.js';

// Render each page with the same navigation, footer, and booking form.
const home=await readFile('index.html','utf8');
const prefix=home.slice(0,home.indexOf('<main id="main">'));
const suffix=home.slice(home.indexOf('</main>')+7);
const formStart=home.indexOf('<form id="booking-form">');
const formEnd=home.indexOf('</div></dialog>',formStart)+6;
const bookingForm=home.slice(formStart,formEnd);
const chapters=Object.entries(menu).map(([key,category],categoryIndex)=>{
  const slug={sharing:'to-share',mains:'something-more',sweet:'sweet-finish'}[key];
  const headline={sharing:'TO <i>SHARE.</i>',mains:'SOMETHING <i>MORE.</i>',sweet:'A SWEET <i>FINISH.</i>'}[key];
  const notes={
    sharing:[['ingredients.webp','Good olive oil. A very good start.','Olive oil and simple kitchen ingredients'],['citrus.webp','A little brightness, in every season.','Freshly sliced seasonal blood oranges'],['finishing.webp','A touch of fire. A final flourish.','Fresh herbs finishing a seasonal plate'],['pour.webp','The finishing touch makes the plate.','Golden sauce being poured over a seasonal plate']],
    mains:[['pasta-hands.webp','Flour, water, and a little patience.','Fresh ribbons of hand-cut pasta'],['finishing.webp','Fresh from the season. Finished by hand.','A chef adding herbs to a seasonal dish'],['ingredients.webp','Let the good ingredients do the talking.','Olive oil and fresh ingredients in sunlight'],['pour.webp','A generous hand, right to the end.','A golden sauce finishing a plate']],
    sweet:[['citrus.webp','The brightest part of the season.','Slices of fresh blood orange'],['chef.webp','Good things deserve a little care.','A chef presenting a carefully composed dish'],['citrus.webp','A little sunshine to finish.','Fresh slices of seasonal citrus'],['ingredients.webp','Simple things. Nothing extra.','Simple kitchen ingredients in afternoon light']]
  }[key];
  const imageIds=[...new Set(notes.map(note=>note[0]))];
  const initialImage=notes[0][0];
  return `<section class="menu-chapter" id="${slug}" data-course="${key}" style="--course-index:${categoryIndex}"><div class="menu-chapter-visual"><div class="chapter-photo-orbit"><div class="chapter-photo chapter-${key}" data-wipe id="kitchen-${key}" role="region" aria-label="${category.label}: kitchen imagery">${imageIds.map(image=>`<div class="kitchen-preview-layer ${image===initialImage?'is-current':''}" data-preview-image="${image}" aria-hidden="${image!==initialImage}"><img src="/images/${image}" alt="${notes.find(note=>note[0]===image)[2]}" loading="lazy" ${image==='citrus.webp'?'class="preview-citrus"':''}></div>`).join('')}<span class="chapter-photo-index" aria-hidden="true">01 / 04</span></div></div><div class="menu-kitchen-note"><span class="eyebrow">Kitchen notes · ${category.label}</span><p>${notes[0][1]}</p></div></div><div class="menu-chapter-copy"><h3 class="reveal">${headline}</h3>${category.dishes.map(([name,description,price],index)=>`<article class="dish reveal ${index===0?'is-spotlit':''}" style="--dish-delay:${index*75}ms" data-preview="${notes[index][0]}" data-kitchen-note="${notes[index][1]}"><div class="dish-top"><h4><button class="dish-preview-button" type="button" aria-controls="kitchen-${key}" aria-pressed="${index===0}" aria-label="Kitchen notes for ${name}"><span>${name}</span><i aria-hidden="true">↗</i></button></h4><span class="dish-price">£${price}</span></div><p>${description}</p></article>`).join('')}</div></section>`;
}).join('\n');
const pages=[
  ['our-spirit','Our Spirit — OLIVA','The ingredients, patience, and Mediterranean spirit behind the Oliva table.'],
  ['menu','The Seasonal Menu — OLIVA','Small plates, handmade pasta, market fish, and a sweet finish. Explore the Oliva sample menu.'],
  ['reservations','A Table for You — OLIVA','Make an evening of it. Explore the Oliva reservation preview and sample opening hours.']
];
for(const [slug,title,description] of pages){
  let content=await readFile(`templates/${slug}.html`,'utf8');
  content=content.replace('{{MENU_CHAPTERS}}',chapters).replace('{{BOOKING_FORM}}',bookingForm);
  let ending=suffix;
  if(slug==='reservations')ending=ending.replace(/\s*<dialog id="booking-dialog"[\s\S]*?<\/dialog>/,'');
  const opening=prefix.replace(/<title>[^<]*<\/title>/,`<title>${title}</title>`).replace(/(<meta name="description" content=")[^"]*/,`$1${description}`).replace('data-page="home"',`data-page="${slug}"`);
  await mkdir(slug,{recursive:true});
  await writeFile(`${slug}/index.html`,opening+content+ending);
}
console.log('Rendered Our Spirit, Menu, and Reservations.');
