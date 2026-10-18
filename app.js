import {menu} from './menu-data.js';
import {reducedMotion,clamp,mix,ease,range} from './motion-utils.js';
import {initHomeMotion} from './home-motion.js';
import {initPageMotion} from './pages.js';
const dishMarkup = dishes => dishes.map(([name,description,price])=>`<article class="dish"><div class="dish-top"><h3>${name}</h3><span class="dish-price">£${price}</span></div><p>${description}</p></article>`).join('');
const panel = document.querySelector('#menu-panel');
if(panel)panel.innerHTML = dishMarkup(menu.sharing.dishes);
const fullMenuContent=document.querySelector('#full-menu-content');
if(fullMenuContent)fullMenuContent.innerHTML = Object.values(menu).map(category=>`<h3 class="category-title">${category.label}</h3>${dishMarkup(category.dishes)}`).join('');
const tabs = [...document.querySelectorAll('[data-category]')];
function selectCategory(tab){
  tabs.forEach(t=>{t.setAttribute('aria-selected',String(t===tab));t.tabIndex=t===tab?0:-1});
  const category=menu[tab.dataset.category];
  panel.innerHTML=dishMarkup(category.dishes);panel.setAttribute('aria-labelledby',tab.id);
  const photo=document.querySelector('#menu-image');photo.src='/images/'+category.image;photo.alt=category.alt;
  if(!reducedMotion){panel.animate([{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'translateY(0)'}],{duration:400,easing:'ease-out'});photo.animate([{opacity:.3},{opacity:1}],{duration:500})}
}
tabs.forEach((tab,index)=>{tab.addEventListener('click',()=>selectCategory(tab));tab.addEventListener('keydown',event=>{let next;if(event.key==='ArrowRight')next=(index+1)%tabs.length;if(event.key==='ArrowLeft')next=(index-1+tabs.length)%tabs.length;if(event.key==='Home')next=0;if(event.key==='End')next=tabs.length-1;if(next!==undefined){event.preventDefault();tabs[next].focus();selectCategory(tabs[next])}})});
initHomeMotion();
initPageMotion();
if(!reducedMotion){
 document.querySelectorAll('[data-split]').forEach(element=>{
  let index=0;const walk=node=>{for(const child of [...node.childNodes]){if(child.nodeType===3&&child.textContent.trim()){const fragment=document.createDocumentFragment();child.textContent.split(/(\s+)/).forEach(word=>{if(!word.trim())fragment.append(document.createTextNode(word));else{const clip=document.createElement('span');clip.className='word-clip';const inner=document.createElement('span');inner.textContent=word;inner.style.setProperty('--i',index++);clip.append(inner);fragment.append(clip)}});child.replaceWith(fragment)}else if(child.nodeType===1&&!child.classList.contains('intro-thumbnail'))walk(child)}};walk(element);
 });
 const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');revealObserver.unobserve(entry.target)}}),{threshold:.12});
 document.querySelectorAll('.reveal').forEach(element=>revealObserver.observe(element));document.body.classList.add('motion-ready');
}
const videos=[...document.querySelectorAll('video')];
videos.forEach(video=>{if(reducedMotion){video.pause();video.removeAttribute('autoplay')}});
const videoObserver=new IntersectionObserver(entries=>entries.forEach(({target,isIntersecting})=>{if(isIntersecting&&!reducedMotion&&target.dataset.userPaused!=='true')target.play().catch(()=>{});else target.pause()}),{threshold:.05});
videos.forEach(video=>{videoObserver.observe(video);video.addEventListener('play',()=>syncVideoButton(video));video.addEventListener('pause',()=>syncVideoButton(video))});
function syncVideoButton(video){const button=document.querySelector(`[data-video="${video.id}"]`);if(button){button.textContent=video.paused?'▷':'Ⅱ';button.setAttribute('aria-label',`${video.paused?'Play':'Pause'} ${video.dataset.description||'background'} video`)}}
document.querySelectorAll('[data-video]').forEach(button=>button.addEventListener('click',()=>{const video=document.getElementById(button.dataset.video);if(video.paused){video.dataset.userPaused='false';video.play().catch(()=>{})}else{video.dataset.userPaused='true';video.pause()}syncVideoButton(video)}));
if(!reducedMotion&&matchMedia('(hover:hover) and (pointer:fine)').matches){
 document.querySelectorAll('.magnetic').forEach(button=>{button.addEventListener('pointermove',event=>{const rect=button.getBoundingClientRect();button.style.transform=`translate(${(event.clientX-rect.left-rect.width/2)*.2}px,${(event.clientY-rect.top-rect.height/2)*.2}px)`});button.addEventListener('pointerleave',()=>button.style.transform='')});
 const cursor=document.querySelector('.cursor');let cursorX=-150,cursorY=-150,targetX=-150,targetY=-150,cursorActive=false,cursorFrame=0;
 function moveCursor(){cursorX=mix(cursorX,targetX,.17);cursorY=mix(cursorY,targetY,.17);cursor.style.transform=`translate(${cursorX-45}px,${cursorY-45}px) scale(${cursorActive?1:0})`;if(Math.abs(cursorX-targetX)+Math.abs(cursorY-targetY)>.1||cursorActive)cursorFrame=requestAnimationFrame(moveCursor);else cursorFrame=0}
 document.querySelectorAll('[data-cursor],.gallery-card>div').forEach(element=>{element.addEventListener('pointerenter',()=>{cursor.querySelector('span').textContent=element.dataset.cursor||'Life at Oliva';cursorActive=true;cursor.classList.add('show');if(!cursorFrame)moveCursor()});element.addEventListener('pointermove',event=>{targetX=event.clientX;targetY=event.clientY;if(!cursorFrame)moveCursor()});element.addEventListener('pointerleave',()=>{cursorActive=false;cursor.classList.remove('show')})});
}
const navToggle=document.querySelector('.nav-toggle');const mobileNav=document.querySelector('.mobile-nav');
function closeNav(){navToggle.setAttribute('aria-expanded','false');navToggle.setAttribute('aria-label','Open navigation');mobileNav.classList.remove('open');mobileNav.inert=true;document.querySelector('main').inert=false;document.querySelector('footer').inert=false;document.body.classList.remove('locked')}
navToggle.addEventListener('click',()=>{const open=navToggle.getAttribute('aria-expanded')!=='true';navToggle.setAttribute('aria-expanded',String(open));navToggle.setAttribute('aria-label',open?'Close navigation':'Open navigation');mobileNav.classList.toggle('open',open);mobileNav.inert=!open;document.querySelector('main').inert=open;document.querySelector('footer').inert=open;document.body.classList.toggle('locked',open)});
document.querySelector('.header .wordmark').addEventListener('click',closeNav);
mobileNav.querySelectorAll('a').forEach(link=>link.addEventListener('click',closeNav));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&mobileNav.classList.contains('open')){closeNav();navToggle.focus()}});
matchMedia('(min-width: 761px)').addEventListener('change',e=>{if(e.matches)closeNav()});
function openDialog(dialog){closeNav();dialog.showModal();document.body.classList.add('locked')}
document.querySelectorAll('dialog').forEach(dialog=>{dialog.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>document.body.classList.remove('locked'));dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close()}})});
const bookingDialog=document.querySelector('#booking-dialog');const form=document.querySelector('#booking-form');const result=document.querySelector('#booking-result');let reservation;
const localDate=(date)=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
form.elements.date.min=localDate(new Date());
document.querySelectorAll('[data-book]').forEach(button=>button.addEventListener('click',()=>{form.elements.date.min=localDate(new Date());openDialog(bookingDialog)}));
document.querySelector('.full-menu')?.addEventListener('click',()=>openDialog(document.querySelector('#full-menu-dialog')));
document.querySelector('#privacy-open').addEventListener('click',()=>openDialog(document.querySelector('#privacy-dialog')));
function updateTimes(){
 const date=form.elements.date.value;if(!date)return;const day=new Date(date+'T12:00:00').getDay();
 [...form.elements.time.options].forEach(option=>{if(!option.value)return;const hour=Number(option.value.split(':')[0]);option.disabled=day===1||((day===2||day===3||day===4)&&hour<17)||(new Date(`${date}T${option.value}:00`)<=new Date());if(option.disabled&&option.selected)form.elements.time.value=''});
 document.querySelector('#booking-error').textContent=day===1?'Mondays are our day to rest. Please choose Tuesday to Sunday.':'';
 form.elements.date.setCustomValidity(day===1?'Please choose Tuesday to Sunday.':'');
}
form.elements.date.addEventListener('change',updateTimes);
form.addEventListener('submit',event=>{event.preventDefault();updateTimes();if(!form.reportValidity())return;reservation=Object.fromEntries(new FormData(form));const date=new Date(`${reservation.date}T${reservation.time}:00`);if(date<=new Date()){document.querySelector('#booking-error').textContent='Please choose a time in the future.';return}const name=reservation.name.trim();if(!name){form.elements.name.setCustomValidity('Please enter your name.');form.elements.name.reportValidity();return}const friendly=date.toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'});document.querySelector('#booking-summary').textContent=`${name}, a table for ${reservation.guests} on ${friendly} at ${reservation.time}.`;form.hidden=true;result.hidden=false;document.querySelector('#calendar-download').focus()});
form.elements.name.addEventListener('input',()=>form.elements.name.setCustomValidity(''));
document.querySelector('#booking-again').addEventListener('click',()=>{form.hidden=false;result.hidden=true;form.elements.name.focus()});
document.querySelector('#calendar-download').addEventListener('click',()=>{if(!reservation)return;const start=new Date(`${reservation.date}T${reservation.time}:00`);const end=new Date(start.getTime()+90*60000);const stamp=date=>date.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z/,'Z');const data=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Oliva//Restaurant Concept//EN','BEGIN:VEVENT',`UID:${crypto.randomUUID()}@oliva.example`,`DTSTAMP:${stamp(new Date())}`,`DTSTART:${stamp(start)}`,`DTEND:${stamp(end)}`,'SUMMARY:Oliva - concept reservation reminder','DESCRIPTION:Design concept only. This is not a confirmed restaurant booking.','END:VEVENT','END:VCALENDAR'].join('\r\n');const url=URL.createObjectURL(new Blob([data],{type:'text/calendar;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='oliva-evening.ics';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)});

// A short curtain links the separate pages without replacing native navigation.
const curtain=document.querySelector('.route-curtain');
document.querySelectorAll('a[href]').forEach(link=>link.addEventListener('click',event=>{
 const destination=new URL(link.href,location.href);
 if(reducedMotion||!curtain||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||link.target||link.hasAttribute('download')||destination.origin!==location.origin||destination.pathname===location.pathname)return;
 event.preventDefault();closeNav();curtain.classList.add('is-leaving');
 setTimeout(()=>location.assign(destination.href),500);
}));
addEventListener('pageshow',()=>curtain?.classList.remove('is-leaving'));
const canonicalPath=location.pathname.replace(/index\.html$/,'').replace(/\/$/,'')||'/';
document.querySelectorAll('.desktop-nav a,.mobile-nav a').forEach(link=>{const path=new URL(link.href).pathname.replace(/\/$/,'')||'/';if(path===canonicalPath)link.setAttribute('aria-current','page')});
document.querySelector('[data-print-menu]')?.addEventListener('click',()=>print());
