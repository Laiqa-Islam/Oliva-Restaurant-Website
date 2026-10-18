import {reducedMotion,clamp,mix,ease,range} from './motion-utils.js';
import {initMenuMotion} from './menu-motion.js';

export function initPageMotion(){
  if(document.body.dataset.page==='home')return;
  const header=document.querySelector('.header');
  const hero=document.querySelector('.inner-hero');
  const title=hero?.querySelector('.inner-title');
  const driftingMedia=document.querySelector('[data-hero-drift]');
  const process=document.querySelector('.process-runway');
  const panels=[...document.querySelectorAll('.process-panel')];
  const photos=[...document.querySelectorAll('.process-photos figure')];
  const dots=[...document.querySelectorAll('.process-rail span')];
  const count=document.querySelector('.process-count');
  const darkSections=[...document.querySelectorAll('[data-header-dark]')];
  const parallax=[...document.querySelectorAll('[data-parallax]')];
  const progress=document.querySelector('.page-progress');
  const chapters=[...document.querySelectorAll('.menu-chapter')];
  const categoryLinks=[...document.querySelectorAll('.menu-category-nav a')];
  const updateMenu=initMenuMotion();
  let frame=0;
  if(!reducedMotion)document.body.classList.add('page-motion');

  function update(){
    frame=0;
    header.classList.toggle('scrolled',scrollY>50);
    header.classList.toggle('over-film',darkSections.some(section=>{const rect=section.getBoundingClientRect();return rect.top<=70&&rect.bottom>70}));
    progress.style.transform=`scaleX(${scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight)})`;
    const currentChapter=chapters.filter(chapter=>chapter.getBoundingClientRect().top<innerHeight*.4).at(-1);
    categoryLinks.forEach(link=>{if(currentChapter&&link.hash==='#'+currentChapter.id)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current')});
    updateMenu?.();
    if(reducedMotion)return;
    if(hero&&!updateMenu){
      const rect=hero.getBoundingClientRect();
      const p=clamp(-rect.top/Math.max(1,rect.height));
      if(title){title.style.translate=`${p*-35}px ${p*90}px`;title.style.opacity=1-range(p,.3,.9)}
      if(driftingMedia)driftingMedia.style.transform=`translateY(${p*-65}px) rotate(${mix(-8,8,p)}deg) scale(${1+p*.14})`;
      const video=hero.querySelector(':scope > video');
      if(video)video.style.transform=`translateY(${p*120}px) scale(1.08)`;
    }
    if(process){
      const rect=process.getBoundingClientRect();
      const p=clamp(-rect.top/Math.max(1,rect.height-innerHeight));
      const segment=Math.min(2,Math.floor(p*3));
      panels.forEach((panel,index)=>{panel.classList.toggle('is-active',index===segment);panel.inert=index!==segment});
      photos.forEach((photo,index)=>{
        const distance=index-segment;
        photo.style.transform=`translate(${distance*32}px,${Math.abs(distance)*18}px) rotate(${distance*9+(p*3-segment)*-4}deg) scale(${1-Math.abs(distance)*.07})`;
        photo.style.opacity=index<segment?'0':'1';
        photo.style.zIndex=String(5-index);
      });
      dots.forEach((dot,index)=>dot.classList.toggle('is-active',index===segment));
      count.textContent=`${String(segment+1).padStart(2,'0')} / 03`;
    }
    parallax.forEach(element=>{const rect=element.parentElement.getBoundingClientRect();if(rect.bottom>0&&rect.top<innerHeight)element.style.transform=`translateY(${(innerHeight/2-rect.top-rect.height/2)*Number(element.dataset.parallax)}px) scale(1.12)`});
  }
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(update)};
  addEventListener('scroll',schedule,{passive:true});
  addEventListener('resize',schedule);
  addEventListener('load',schedule);
  document.fonts.ready.then(schedule);
  update();
  if(!reducedMotion){
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('wipe-visible');observer.unobserve(entry.target)}}),{threshold:.12});
    document.querySelectorAll('[data-wipe]').forEach(element=>observer.observe(element));
  }
}
