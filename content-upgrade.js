(()=>{
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const rail=document.querySelector('[data-techniques]');
  if(rail){
    const track=rail.querySelector('.technique-track'),cards=[...track.children],count=rail.querySelector('.technique-count'),play=rail.querySelector('[data-tech-play]');
    let index=0,paused=true,visible=false,timer=0,raf=0,drag=null;
    const max=()=>Math.max(0,track.scrollWidth-track.clientWidth);
    const leftFor=i=>Math.min(max(),cards[i].offsetLeft-cards[0].offsetLeft);
    function sync(){
      if(reduce.matches)paused=true;
      clearTimeout(timer);play.disabled=reduce.matches;play.textContent=paused?'Reproduzir':'Pausar';play.setAttribute('aria-pressed',String(paused));
      count.textContent=`${String(index+1).padStart(2,'0')} / 05`;
      if(!paused&&visible&&!reduce.matches&&!document.hidden&&!document.querySelector('dialog[open]'))timer=setTimeout(()=>go(index+1),10000);
    }
    function go(i){index=(i+cards.length)%cards.length;track.scrollTo({left:leftFor(index),behavior:reduce.matches?'auto':'smooth'});sync();}
    function pause(){paused=true;sync();}
    rail.querySelector('[data-tech-prev]').addEventListener('click',()=>{pause();go(index-1)});
    rail.querySelector('[data-tech-next]').addEventListener('click',()=>{pause();go(index+1)});
    play.addEventListener('click',()=>{paused=!paused;sync()});
    rail.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')pause()});
    rail.addEventListener('focusin',pause);
    track.addEventListener('touchstart',pause,{passive:true});
    track.addEventListener('wheel',pause,{passive:true});
    track.addEventListener('keydown',e=>{
      if(e.target!==track)return;
      if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();pause();go(index+(e.key==='ArrowRight'?1:-1))}
      if(e.key==='Home'||e.key==='End'){e.preventDefault();pause();go(e.key==='Home'?0:cards.length-1)}
    });
    track.addEventListener('pointerdown',e=>{
      pause();if(e.pointerType!=='mouse'||e.button!==0)return;
      drag={id:e.pointerId,x:e.clientX,left:track.scrollLeft};track.setPointerCapture(e.pointerId);track.classList.add('is-dragging');
    });
    track.addEventListener('pointermove',e=>{if(drag&&e.pointerId===drag.id)track.scrollLeft=drag.left+drag.x-e.clientX});
    function endDrag(){drag=null;track.classList.remove('is-dragging');}
    track.addEventListener('pointerup',endDrag);track.addEventListener('pointercancel',endDrag);track.addEventListener('lostpointercapture',endDrag);
    track.addEventListener('scroll',()=>{
      if(raf)return;raf=requestAnimationFrame(()=>{raf=0;
        if(track.scrollLeft>=max()-2)index=cards.length-1;
        else index=cards.reduce((nearest,card,i)=>Math.abs(leftFor(i)-track.scrollLeft)<Math.abs(leftFor(nearest)-track.scrollLeft)?i:nearest,0);
        count.textContent=`${String(index+1).padStart(2,'0')} / 05`;
      });
    },{passive:true});
    new IntersectionObserver(entries=>{visible=entries[0].isIntersecting&&entries[0].intersectionRatio>=.2;sync()},{threshold:[0,.2]}).observe(rail);
    document.addEventListener('visibilitychange',sync);document.addEventListener('zenith:care-state',sync);
    reduce.addEventListener('change',()=>{if(reduce.matches)paused=true;sync()});
    document.querySelector('#viewer')?.addEventListener('close',sync);
    addEventListener('resize',()=>{track.scrollTo({left:leftFor(index),behavior:'auto'});sync()});
    sync();
  }
  const disclosure=document.querySelector('#cuidados');
  if(disclosure&&typeof HTMLDialogElement!=='undefined'&&typeof HTMLDialogElement.prototype.showModal==='function'){
    const trigger=disclosure.querySelector('summary'),panel=disclosure.querySelector('.care-panel');
    const dialog=document.createElement('dialog');dialog.className='care-drawer';dialog.id='care-drawer';dialog.setAttribute('aria-labelledby','care-title');
    dialog.append(panel);document.body.append(dialog);
    const close=panel.querySelector('.care-close');close.hidden=false;
    trigger.setAttribute('aria-haspopup','dialog');trigger.setAttribute('aria-controls',dialog.id);trigger.setAttribute('aria-expanded','false');
    let returnFocus=null,closeTimer=0;
    function open(from){
      clearTimeout(closeTimer);dialog.classList.remove('is-closing');
      if(dialog.open)return;
      returnFocus=from;dialog.showModal();document.documentElement.classList.add('care-open');trigger.setAttribute('aria-expanded','true');
      panel.querySelector('.care-body').scrollTop=0;close.focus({preventScroll:true});document.dispatchEvent(new Event('zenith:care-state'));
    }
    function finish(){clearTimeout(closeTimer);dialog.close();}
    function shut(){if(!dialog.open||dialog.classList.contains('is-closing'))return;if(reduce.matches){finish();return}dialog.classList.add('is-closing');closeTimer=setTimeout(finish,260);}
    trigger.addEventListener('click',e=>{e.preventDefault();open(trigger)});
    document.querySelectorAll('[data-care-open]').forEach(link=>link.addEventListener('click',e=>{e.preventDefault();open(link.closest('.mobile-menu')?document.querySelector('.menu-button'):link)}));
    close.addEventListener('click',shut);dialog.addEventListener('cancel',e=>{e.preventDefault();shut()});
    dialog.addEventListener('keydown',e=>{
      if(e.key!=='Tab')return;
      const focusable=[...dialog.querySelectorAll('a[href],button:not([disabled])')].filter(el=>!el.hidden);
      const first=focusable[0],last=focusable.at(-1);
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
    });
    dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)shut()});
    dialog.addEventListener('close',()=>{clearTimeout(closeTimer);dialog.classList.remove('is-closing');document.documentElement.classList.remove('care-open');trigger.setAttribute('aria-expanded','false');returnFocus?.focus({preventScroll:true});document.dispatchEvent(new Event('zenith:care-state'))});
    reduce.addEventListener('change',()=>{if(reduce.matches&&dialog.classList.contains('is-closing'))finish()});
    if(location.hash==='#cuidados')open(trigger);
  }
})();
