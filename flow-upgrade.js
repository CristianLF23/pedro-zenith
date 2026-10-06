(()=>{
  const disclosure=document.querySelector('.workshop-disclosure');
  if(disclosure&&typeof disclosure.animate==='function'){
    const summary=disclosure.querySelector('summary'),content=disclosure.querySelector('.workshop-details');
    const reduce=matchMedia('(prefers-reduced-motion: reduce)');
    let targetOpen=disclosure.open,heightAnimation=null,contentAnimation=null,revision=0;
    summary.setAttribute('aria-expanded',String(targetOpen));
    function finish(open){
      revision++;
      heightAnimation?.cancel();contentAnimation?.cancel();
      heightAnimation=null;contentAnimation=null;
      disclosure.open=open;disclosure.style.overflow='';content.inert=false;
      summary.setAttribute('aria-expanded',String(open));
      // Recalculate the existing scroll lettering after the page height changes.
      dispatchEvent(new Event('resize'));
    }
    function toggle(){
      targetOpen=!targetOpen;
      if(reduce.matches){finish(targetOpen);return}
      // Measure before cancellation so a rapid second click reverses smoothly.
      const startHeight=disclosure.getBoundingClientRect().height;
      const startOpacity=disclosure.open?getComputedStyle(content).opacity:'0';
      const step=++revision;
      heightAnimation?.cancel();contentAnimation?.cancel();
      disclosure.open=true;disclosure.style.overflow='hidden';
      const endHeight=targetOpen?disclosure.getBoundingClientRect().height:summary.getBoundingClientRect().height;
      content.inert=!targetOpen;
      if(!targetOpen&&content.contains(document.activeElement))summary.focus({preventScroll:true});
      summary.setAttribute('aria-expanded',String(targetOpen));
      heightAnimation=disclosure.animate([{height:`${startHeight}px`},{height:`${endHeight}px`}],{duration:targetOpen?460:360,easing:'cubic-bezier(.22,.75,.25,1)',fill:'both'});
      contentAnimation=content.animate([{opacity:startOpacity},{opacity:targetOpen?1:0}],{duration:targetOpen?360:220,easing:'ease-out',fill:'both'});
      heightAnimation.finished.then(()=>{if(step===revision)finish(targetOpen)}).catch(()=>{});
    }
    summary.addEventListener('click',event=>{event.preventDefault();toggle()});
    disclosure.addEventListener('toggle',()=>{if(!heightAnimation){targetOpen=disclosure.open;summary.setAttribute('aria-expanded',String(targetOpen))}});
    addEventListener('resize',()=>{if(heightAnimation)finish(targetOpen)});
    reduce.addEventListener('change',()=>{if(reduce.matches)finish(targetOpen)});
  }
  const track=document.querySelector('#artes-track'),link=document.querySelector('[data-art-inquiry]'),label=document.querySelector('[data-art-selection]');
  if(!track||!link||!label)return;
  const slides=[...track.children];let frame=0;
  function sync(){
    frame=0;
    const selected=slides.reduce((nearest,slide)=>Math.abs(slide.offsetLeft-slides[0].offsetLeft-track.scrollLeft)<Math.abs(nearest.offsetLeft-slides[0].offsetLeft-track.scrollLeft)?slide:nearest);
    const name=selected.querySelector('img').alt;
    label.textContent=`Arte selecionada: ${name}`;
    link.textContent='Consultar esta arte no WhatsApp';
    link.href='https://wa.me/5561981110353?text='+encodeURIComponent(`Olá, Pedro! Quero consultar a disponibilidade da arte ${name}.`);
  }
  track.addEventListener('scroll',()=>{if(!frame)frame=requestAnimationFrame(sync)},{passive:true});
  function pauseAndSync(){
    const play=track.closest('[data-carousel]').querySelector('[data-play]');
    if(play?.textContent==='Pausar')play.click();
    sync();
  }
  link.addEventListener('focus',pauseAndSync);link.addEventListener('pointerenter',pauseAndSync);link.addEventListener('pointerdown',pauseAndSync);link.addEventListener('click',sync);
  addEventListener('resize',sync);sync();
})();
