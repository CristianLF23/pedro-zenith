(()=>{
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const html=document.documentElement;
  let introFadeTimer=0,introCloseTimer=0;
  const locked=[];
  function closeIntro(){
    clearTimeout(introFadeTimer);clearTimeout(introCloseTimer);clearTimeout(window.zenithIntroFailSafe);
    const wasActive=html.classList.contains('intro-active');
    html.classList.remove('intro-active','intro-leaving','intro-ready');
    locked.splice(0).forEach(([node,inert])=>{node.inert=inert});
    if(wasActive){document.dispatchEvent(new Event('zenith:intro-complete'));requestAnimationFrame(()=>dispatchEvent(new Event('resize')))}
  }
  if(html.classList.contains('intro-active')){
    [...document.body.children].filter(node=>!node.matches('.site-intro,script')).forEach(node=>{locked.push([node,node.inert]);node.inert=true});
    const startIntro=()=>{
      if(!html.classList.contains('intro-active'))return;
      html.classList.add('intro-ready');
      introFadeTimer=setTimeout(()=>html.classList.add('intro-leaving'),2700);
      introCloseTimer=setTimeout(closeIntro,3500);
    };
    const image=document.querySelector('.intro-ink');
    image.decode().then(startIntro).catch(closeIntro);
    // The document stays usable even if an unrelated initialization fails.
    clearTimeout(window.zenithIntroFailSafe);window.zenithIntroFailSafe=setTimeout(closeIntro,6000);
  }
  reduce.addEventListener('change',()=>{if(reduce.matches)closeIntro()});
  addEventListener('keydown',event=>{if(event.key==='Escape'&&html.classList.contains('intro-active'))closeIntro()});
  const film=document.querySelector('.hero-film video');
  if(film){
    let visible=false,pending=false,retries=0,retryTimer=0;
    const wantsPlayback=()=>visible&&!document.hidden&&!reduce.matches&&!html.classList.contains('intro-active');
    function playFilm(){
      if(!wantsPlayback()){clearTimeout(retryTimer);film.pause();return}
      if(pending||!film.paused)return;
      film.muted=true;film.defaultMuted=true;pending=true;
      Promise.resolve(film.play()).then(()=>{
        pending=false;retries=0;
        if(!wantsPlayback())film.pause();
      }).catch(()=>{
        pending=false;
        if(wantsPlayback()&&retries<3){clearTimeout(retryTimer);retryTimer=setTimeout(playFilm,[500,1500,3000][retries++])}
      });
    }
    new IntersectionObserver(entries=>{visible=entries[0].isIntersecting&&entries[0].intersectionRatio>=.12;if(visible)retries=0;playFilm()},{threshold:[0,.12]}).observe(film);
    for(const event of ['canplay','loadeddata'])film.addEventListener(event,playFilm);
    film.addEventListener('pause',()=>{if(wantsPlayback()){clearTimeout(retryTimer);retryTimer=setTimeout(playFilm,250)}});
    film.addEventListener('stalled',()=>{if(wantsPlayback()){clearTimeout(retryTimer);retryTimer=setTimeout(playFilm,500)}});
    for(const event of ['pointerdown','touchend','pageshow','online'])addEventListener(event,()=>{retries=0;playFilm()},{passive:true});
    document.addEventListener('visibilitychange',playFilm);
    document.addEventListener('zenith:intro-complete',playFilm);
    reduce.addEventListener('change',playFilm);
  }
  const studies=document.querySelector('#estudos');
  const section=document.querySelector('.artist-journey'),track=section.querySelector('.journey-track'),windowEl=section.querySelector('.journey-window');
  const position=section.querySelector('.journey-position'),buttons=[section.querySelector('[data-journey-prev]'),section.querySelector('[data-journey-next]')];
  const shortScreen=matchMedia('(max-height: 499px)');
  const mobileScreen=matchMedia('(max-width: 799px), (pointer: coarse) and (max-width: 1023px)');
  let enhanced=false,start=0,distance=1,maxLeft=0,frame=0,stickyStart=0,stickyEnd=0;
  const clamp=value=>Math.min(1,Math.max(0,value));
  function mark(progress){
    const index=progress>.5?1:0;
    position.textContent=`0${index+1} / 02`;
    buttons.forEach((button,i)=>{if(i===index)button.setAttribute('aria-current','true');else button.removeAttribute('aria-current')});
  }
  function draw(){
    frame=0;
    const entry=clamp((innerHeight*.9-studies.getBoundingClientRect().top)/(innerHeight*.65));
    studies.style.setProperty('--ornament-opacity',(reduce.matches ? .18 : entry*.18).toFixed(3));
    if(!enhanced)return;
    const progress=clamp((scrollY-start)/distance);
    windowEl.style.setProperty('--journey-top',`${stickyStart+(stickyEnd-stickyStart)*progress}px`);
    track.scrollLeft=0;
    track.style.transform=`translate3d(${-maxLeft*progress}px,0,0)`;
    mark(progress);
  }
  function schedule(){if(!frame)frame=requestAnimationFrame(draw)}
  function measure(){
    const previousProgress=!enhanced&&maxLeft?clamp(track.scrollLeft/maxLeft):0;
    enhanced=!reduce.matches&&!shortScreen.matches&&!mobileScreen.matches;
    section.classList.toggle('journey-enhanced',enhanced);
    section.style.height='';
    track.style.transform='';
    track.scrollLeft=0;
    windowEl.style.removeProperty('--journey-top');
    maxLeft=Math.max(0,track.scrollWidth-track.clientWidth);
    distance=innerWidth<=620?Math.max(360,Math.min(innerHeight*.7,maxLeft*1.3)):Math.max(innerHeight*.95,maxLeft*.86);
    if(enhanced){
      const windowHeight=windowEl.offsetHeight;
      const head=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--head'))||0;
      // Taller screens pin below the header; short screens read the full panel before pinning.
      const stickyTop=Math.min(head,innerHeight-windowHeight);
      stickyStart=stickyTop;
      stickyEnd=innerWidth<=620?head:stickyTop;
      windowEl.style.setProperty('--journey-top',`${stickyTop}px`);
      section.style.height=`${windowHeight+distance+stickyEnd-stickyStart}px`;
      start=section.getBoundingClientRect().top+scrollY-stickyTop;
      section.querySelector('.journey-hint').textContent='Continue rolando para conhecer o processo';
    }else {
      track.scrollLeft=maxLeft*previousProgress;
      mark(previousProgress);
      section.querySelector('.journey-hint').textContent='Deslize para o lado ou toque em Artista e Em sessão';
    }
    schedule();
  }
  function go(index){
    if(enhanced)scrollTo({top:start+distance*index,behavior:reduce.matches?'instant':'smooth'});
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
  shortScreen.addEventListener('change',measure);reduce.addEventListener('change',measure);
  mobileScreen.addEventListener('change',measure);
  addEventListener('load',measure);document.fonts.ready.then(measure);measure();
  const works=document.querySelector('#obras-track'),detail=document.querySelector('.work-detail-window');
  if(works&&detail){
    const slides=[...works.children],photo=detail.querySelector('img'),zoom=detail.querySelector('.zoom');
    const points={'a13-braco.webp':[64,58],'a14-mao.webp':[53,55],'a16-pescoco.jpeg':[50,48],'blackout-740.webp':[38,55]};
    let detailFrame=0,lastSrc='';
    function showDetail(){
      detailFrame=0;
      const slide=slides.reduce((nearest,next)=>Math.abs(next.offsetLeft-slides[0].offsetLeft-works.scrollLeft)<Math.abs(nearest.offsetLeft-slides[0].offsetLeft-works.scrollLeft)?next:nearest);
      const image=slide.querySelector('img'),src=image.getAttribute('src');
      if(src===lastSrc)return;lastSrc=src;
      const point=points[src.split('/').pop()]||[50,52];
      detail.style.setProperty('--detail-x',`${point[0]}%`);detail.style.setProperty('--detail-y',`${point[1]}%`);
      photo.src=src;photo.alt=`Detalhe: ${image.alt}`;zoom.dataset.src=src;zoom.dataset.label=image.alt;zoom.setAttribute('aria-label',`Ampliar ${image.alt}`);
    }
    works.addEventListener('scroll',()=>{if(!detailFrame)detailFrame=requestAnimationFrame(showDetail)},{passive:true});showDetail();
  }
})();
