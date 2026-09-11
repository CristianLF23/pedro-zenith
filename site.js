(()=>{
'use strict';document.documentElement.classList.add('js');
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],reduced=matchMedia('(prefers-reduced-motion: reduce)');
const menu=$('.menu-toggle'),mobile=$('#mobile-nav');
function closeMenu(){mobile.hidden=true;menu.setAttribute('aria-expanded','false')}
menu.addEventListener('click',()=>{const opening=mobile.hidden;mobile.hidden=!opening;menu.setAttribute('aria-expanded',String(opening))});
mobile.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!mobile.hidden){closeMenu();menu.focus()}});
document.addEventListener('click',e=>{if(!mobile.hidden&&!e.target.closest('.header'))closeMenu()});
matchMedia('(min-width: 761px)').addEventListener('change',e=>{if(e.matches)closeMenu()});

const dialog=$('#detail'),image=$('#detail-photo'),frame=$('.detail-image');let opener;
$$('[data-detail]').forEach(link=>link.addEventListener('click',e=>{
 if(typeof dialog.showModal!=='function')return;
 e.preventDefault();opener=link;image.src=link.href;image.alt=link.dataset.detail;$('#detail-title').textContent=link.dataset.detail;
 frame.classList.remove('zoomed');$('#zoom').textContent='Aproximar detalhe';$('#zoom').setAttribute('aria-pressed','false');dialog.showModal();$('#close-detail').focus();
}));
$('#close-detail').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog){const b=dialog.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)dialog.close()}});
dialog.addEventListener('close',()=>opener?.focus({preventScroll:true}));
$('#zoom').addEventListener('click',()=>{const zoomed=frame.classList.toggle('zoomed');$('#zoom').setAttribute('aria-pressed',String(zoomed));$('#zoom').textContent=zoomed?'Ver obra inteira':'Aproximar detalhe'});

const eclipse={frente:{alt:'Pedro de frente com camiseta Eclipse preta e símbolo turquesa diante de uma parede vermelha',caption:'Eclipse · Estampa na frente'},costas:{alt:'Pedro de costas com camiseta Eclipse e estampa ornamental turquesa diante de uma parede vermelha',caption:'Eclipse · Estampa nas costas'}};
let eclipseRequest=0;
$$('[data-eclipse]').forEach(button=>button.addEventListener('click',async()=>{
 const side=button.dataset.eclipse,request=++eclipseRequest;
 const next=new Image();next.src=`assets/eclipse-${side}.png`;
 try{await next.decode()}catch{return}
 if(request!==eclipseRequest)return;
 $('#eclipse-photo').src=next.src;$('#eclipse-photo').alt=eclipse[side].alt;$('#eclipse-caption').textContent=eclipse[side].caption;
 $$('[data-eclipse]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
 if(!reduced.matches)$('#eclipse-photo').animate([{opacity:.65},{opacity:1}],{duration:250,easing:'ease-out'});
}));

const ink=$('.ink-stage'),approaches=$$('[data-approach]'),motionNodes=[ink,...approaches],visible=new Set(motionNodes);
const nav=$$('.desktop-nav a'),sections=nav.map(a=>$(a.getAttribute('href')));let frameId=0,lastSection='';
function update(){
 frameId=0;if(document.hidden)return;
 const header=$('.header').getBoundingClientRect().height;
 const positions=sections.map(s=>({id:s.id,top:s.getBoundingClientRect().top}));
 const current=positions.filter(s=>s.top<=header+160).at(-1)?.id||'';
 if(current!==lastSection){nav.forEach(a=>a.getAttribute('href')==='#'+current?a.setAttribute('aria-current','location'):a.removeAttribute('aria-current'));lastSection=current}
 if(reduced.matches){ink.classList.remove('ink-live');ink.style.removeProperty('--ink-hidden');approaches.forEach(e=>e.querySelector('img').style.removeProperty('transform'));return}
 const readings=motionNodes.filter(e=>visible.has(e)).map(e=>({e,top:e.getBoundingClientRect().top}));
 for(const {e,top} of readings){const p=Math.max(0,Math.min(1,(innerHeight*.88-top)/(innerHeight*.7)));
  if(e===ink){ink.classList.add('ink-live');ink.style.setProperty('--ink-hidden',`${Math.round((1-p)*1000)/10}%`)}
  else e.querySelector('img').style.transform=`scale(${1+.03*p})`;
 }
}
function schedule(){if(!frameId)frameId=requestAnimationFrame(update)}
addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);
if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{entries.forEach(({target,isIntersecting})=>isIntersecting?visible.add(target):visible.delete(target));schedule()},{rootMargin:'120px 0px'});motionNodes.forEach(e=>observer.observe(e))}
reduced.addEventListener('change',schedule);document.addEventListener('visibilitychange',schedule);document.fonts.ready.then(schedule);schedule();
})();
