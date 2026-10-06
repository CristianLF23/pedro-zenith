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
  let frame=0;
  const clamp=value=>Math.min(1,Math.max(0,value));
  function draw(){
    frame=0;
    if(!studies)return;
    const entry=clamp((innerHeight*.9-studies.getBoundingClientRect().top)/(innerHeight*.65));
    studies.style.setProperty('--ornament-opacity',(reduce.matches ? .18 : entry*.18).toFixed(3));
  }
  function schedule(){if(!frame)frame=requestAnimationFrame(draw)}
  addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);
  reduce.addEventListener('change',schedule);
  addEventListener('load',schedule);document.fonts.ready.then(schedule);schedule();
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
