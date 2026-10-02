(()=>{
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const section=document.querySelector('.artist-journey'),track=section.querySelector('.journey-track'),windowEl=section.querySelector('.journey-window');
  const position=section.querySelector('.journey-position'),buttons=[section.querySelector('[data-journey-prev]'),section.querySelector('[data-journey-next]')];
  const desktop=matchMedia('(min-width: 800px) and (min-height: 740px)');
  let enhanced=false,start=0,distance=1,maxLeft=0,frame=0;
  const clamp=value=>Math.min(1,Math.max(0,value));
  function mark(progress){
    const index=progress>.5?1:0;
    position.textContent=`0${index+1} / 02`;
    buttons.forEach((button,i)=>{if(i===index)button.setAttribute('aria-current','true');else button.removeAttribute('aria-current')});
  }
  function draw(){
    frame=0;
    if(!enhanced)return;
    const progress=clamp((scrollY-start)/distance);
    track.scrollLeft=maxLeft*progress;
    mark(progress);
  }
  function schedule(){if(!frame)frame=requestAnimationFrame(draw)}
  function measure(){
    enhanced=desktop.matches&&!reduce.matches;
    section.classList.toggle('journey-enhanced',enhanced);
    section.style.height='';
    maxLeft=Math.max(0,track.scrollWidth-track.clientWidth);
    distance=Math.max(innerHeight*.95,maxLeft*.86);
    if(enhanced){
      section.style.height=`${windowEl.offsetHeight+distance}px`;
      start=section.getBoundingClientRect().top+scrollY-parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--head'));
      section.querySelector('.journey-hint').textContent='Continue rolando para conhecer o processo';
    }else section.querySelector('.journey-hint').textContent='Deslize para conhecer o processo';
    schedule();
  }
  function go(index){
    if(enhanced)scrollTo({top:start+distance*index,behavior:'smooth'});
    else track.scrollTo({left:maxLeft*index,behavior:reduce.matches?'instant':'smooth'});
  }
  buttons.forEach((button,index)=>button.addEventListener('click',()=>go(index)));
  track.addEventListener('keydown',event=>{
    if(event.target!==track)return;
    if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();go(event.key==='ArrowRight'?1:0)}
  });
  track.addEventListener('scroll',()=>{if(!enhanced)mark(maxLeft?track.scrollLeft/maxLeft:0)},{passive:true});
  track.addEventListener('focusin',event=>{
    if(!enhanced)return;
    const panel=event.target.closest('.journey-panel');
    if(panel){const index=[...track.children].indexOf(panel);scrollTo({top:start+distance*index,behavior:'instant'})}
  });
  addEventListener('scroll',schedule,{passive:true});addEventListener('resize',measure);
  desktop.addEventListener('change',measure);reduce.addEventListener('change',measure);
  addEventListener('load',measure);document.fonts.ready.then(measure);measure();
  const freehand=document.querySelector('#freehand');let visible=false;
  const syncCrest=()=>freehand.classList.toggle('crest-active',visible&&!document.hidden&&!reduce.matches);
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;syncCrest()},{threshold:.05}).observe(freehand);
  document.addEventListener('visibilitychange',syncCrest);reduce.addEventListener('change',syncCrest);
  const works=document.querySelector('#obras-track'),detail=document.querySelector('.work-detail-window');
  if(works&&detail){
    const slides=[...works.children],photo=detail.querySelector('img'),zoom=detail.querySelector('.zoom');
    const points={'a13-braco.webp':[64,58],'a14-mao.webp':[53,55],'a16-pescoco.jpeg':[50,48],'blackout-740.webp':[38,55]};
    let detailFrame=0,lastSrc='';
    function showDetail(){
      detailFrame=0;
      const slide=slides.reduce((nearest,next)=>Math.abs(next.offsetLeft-works.offsetLeft-works.scrollLeft)<Math.abs(nearest.offsetLeft-works.offsetLeft-works.scrollLeft)?next:nearest);
      const image=slide.querySelector('img'),src=image.getAttribute('src');
      if(src===lastSrc)return;lastSrc=src;
      const point=points[src.split('/').pop()]||[50,52];
      detail.style.setProperty('--detail-x',`${point[0]}%`);detail.style.setProperty('--detail-y',`${point[1]}%`);
      photo.src=src;photo.alt=`Detalhe: ${image.alt}`;zoom.dataset.src=src;zoom.dataset.label=image.alt;zoom.setAttribute('aria-label',`Ampliar ${image.alt}`);
    }
    works.addEventListener('scroll',()=>{if(!detailFrame)detailFrame=requestAnimationFrame(showDetail)},{passive:true});showDetail();
  }
})();
