import {reducedMotion,clamp,mix,ease,range} from './motion-utils.js';

export function initMenuMotion(){
  if(document.body.dataset.page!=='menu')return null;
  const runway=document.querySelector('.menu-hero-runway');
  const hero=document.querySelector('.menu-page-hero');
  const heroTitle=hero.querySelector('.inner-title');
  const heroLines=[...heroTitle.children];
  const dish=hero.querySelector('.menu-hero-dish');
  const frame=dish.querySelector('.menu-hero-frame');
  const still=frame.querySelector('img');
  const film=frame.querySelector('video');
  const shade=frame.querySelector('.menu-film-shade');
  const seal=dish.querySelector('.menu-hero-seal');
  const filmHeading=hero.querySelector('.menu-film-heading');
  const heroBottom=hero.querySelector('.inner-hero-bottom');
  const chapters=[...document.querySelectorAll('.menu-chapter')];
  const categoryNav=document.querySelector('.menu-category-nav');
  const categoryInk=categoryNav.querySelector('.category-ink');
  const categoryProgress=categoryNav.querySelector('.category-progress i');
  const ending=document.querySelector('.menu-ending');
  const pointerFine=matchMedia('(hover:hover) and (pointer:fine)').matches;
  let keyboardBrowsing=false;
  document.addEventListener('keydown',event=>{if(['Tab','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(event.key))keyboardBrowsing=true});
  document.addEventListener('pointermove',()=>{keyboardBrowsing=false},{passive:true});

  chapters.forEach(chapter=>{
    const rows=[...chapter.querySelectorAll('.dish')];
    const layers=[...chapter.querySelectorAll('.kitchen-preview-layer')];
    const note=chapter.querySelector('.menu-kitchen-note p');
    const counter=chapter.querySelector('.chapter-photo-index');
    let selected=rows[0];
    function spotlight(row){
      if(selected===row)return;
      selected=row;
      rows.forEach(candidate=>{const active=candidate===row;candidate.classList.toggle('is-spotlit',active);candidate.querySelector('button').setAttribute('aria-pressed',String(active))});
      layers.forEach(layer=>{const active=layer.dataset.previewImage===row.dataset.preview;layer.classList.toggle('is-current',active);layer.setAttribute('aria-hidden',String(!active))});
      note.textContent=row.dataset.kitchenNote;
      counter.textContent=`${String(rows.indexOf(row)+1).padStart(2,'0')} / 04`;
      if(!reducedMotion)note.animate([{opacity:0,transform:'translateY(7px)'},{opacity:1,transform:'translateY(0)'}],{duration:450,easing:'ease-out'});
    }
    rows.forEach(row=>{
      if(pointerFine)row.addEventListener('pointerenter',()=>{if(!keyboardBrowsing)spotlight(row)});
      const button=row.querySelector('button');
      button.addEventListener('focus',()=>spotlight(row));
      button.addEventListener('click',()=>spotlight(row));
    });
  });

  return function updateMenuMotion(){
    const navRect=categoryNav.getBoundingClientRect();
    const active=categoryNav.querySelector('a[aria-current]')||categoryNav.querySelector('a');
    const activeRect=active.getBoundingClientRect();
    categoryInk.style.width=`${activeRect.width+24}px`;
    categoryInk.style.height=`${activeRect.height+16}px`;
    categoryInk.style.transform=`translate(${activeRect.left-navRect.left-12}px,${activeRect.top-navRect.top-8}px)`;
    const first=chapters[0].getBoundingClientRect(),last=chapters.at(-1).getBoundingClientRect();
    categoryProgress.style.transform=`scaleX(${clamp((innerHeight*.4-first.top)/Math.max(1,last.bottom-first.top-innerHeight*.25))})`;
    if(reducedMotion)return;
    const narrow=innerWidth<=760;
    const rect=runway.getBoundingClientRect();
    const p=clamp(-rect.top/Math.max(1,rect.height-innerHeight));
    const grow=ease(range(p,.02,.92));
    const filmFade=range(p,.2,.68);
    dish.style.right=`${mix(narrow?-5:8,0,grow)}%`;
    dish.style.top=`${mix(narrow?28:21,0,grow)}%`;
    dish.style.width=`${mix(narrow?54:35,100,grow)}%`;
    dish.style.height=`${mix(narrow?49:65,100,grow)}%`;
    dish.style.transform=`rotate(${mix(-8,0,grow)}deg)`;
    frame.style.borderRadius=`${mix(48,0,grow)}% ${mix(48,0,grow)}% 0 0`;
    still.style.opacity=1-filmFade;
    film.style.opacity=filmFade;
    shade.style.opacity=filmFade;
    heroLines.forEach((line,index)=>{line.style.translate=`${(index?1:-1)*grow*(narrow?90:200)}px ${-grow*30}px`});
    heroTitle.style.opacity=1-range(p,.05,.45);
    seal.style.opacity=1-range(p,.08,.4);
    seal.style.rotate=`${p*80}deg`;
    filmHeading.style.opacity=range(p,.43,.78);
    filmHeading.style.transform=`translateY(${(1-range(p,.43,.78))*65}px)`;
    heroBottom.style.opacity=1-range(p,.15,.5);
    heroBottom.inert=p>.5;
    const breadcrumb=hero.querySelector('.inner-hero-top');
    breadcrumb.style.opacity=1-range(p,.08,.35);
    breadcrumb.inert=p>.35;
    hero.querySelector('.menu-film-caption').style.opacity=range(p,.55,.85);
    chapters.forEach((chapter,index)=>{
      const r=chapter.getBoundingClientRect();
      if(r.bottom<0||r.top>innerHeight*1.25)return;
      const through=clamp((innerHeight-r.top)/(innerHeight+r.height));
      chapter.style.setProperty('--course-drift',`${(through-.5)*(narrow?18:45)*(index%2?-1:1)}px`);
      const orbit=chapter.querySelector('.chapter-photo-orbit');
      orbit.style.transform=`translateY(${(through-.5)*-40}px) rotate(${mix(index%2?7:-7,index%2?-4:4,through)}deg)`;
      chapter.querySelector('.chapter-photo').style.setProperty('--photo-scale',String(1.09-through*.09));
    });
    const end=ending.getBoundingClientRect();
    if(end.bottom>0&&end.top<innerHeight){
      const ep=clamp((innerHeight-end.top)/(innerHeight+end.height));
      ending.querySelector('img').style.transform=`translateY(${(ep-.5)*-90}px) scale(1.15)`;
    }
  };
}
