(() => {
  'use strict';
  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const scenes=$$('.scene');const saved=new Map();let currentScene='',currentWork='fluxo',noticeTimer;
  const works={
    fluxo:{title:'Fluxo contínuo.',category:'Ornamental · Freehand',region:'braco',area:'Braço e mão',image:'braco',width:740,height:902,description:'As pontas percorrem o antebraço e seguem pelo dorso da mão. O espaço sem tinta também constrói o desenho.',observe:'O espaço entre as linhas',alt:'Tatuagem ornamental preta do antebraço até o dorso da mão',collection:'fluxo'},
    letra:{title:'Palavra e forma.',category:'Dark lettering',region:'braco',area:'Antebraço',image:'lettering',width:620,height:830,description:'A escrita se aproxima do ornamento. O desenho envolve um centro de pele e prolonga suas pontas pelo antebraço.',observe:'O centro em negativo',alt:'Tatuagem de dark lettering no antebraço, com letras em torno de um espaço de pele',collection:'letra'},
    mao:{title:'O traço continua.',category:'Ornamental · Detalhe',region:'mao',area:'Dorso da mão',image:'braco',width:740,height:902,description:'Esta é a continuação da mesma composição do braço. As pontas se abrem pelo dorso da mão e afilam em direção aos dedos.',observe:'A continuidade da mesma obra',alt:'Detalhe da mesma tatuagem ornamental no dorso da mão',collection:'fluxo'},
    preto:{title:'Presença do preto.',category:'Blackout',region:'perna',area:'Panturrilha',image:'blackout',width:400,height:735,description:'Uma massa contínua de preto ocupa a panturrilha. O contorno acompanha o volume da perna e torna a superfície parte da composição.',observe:'O volume e o contorno',alt:'Blackout preto cobrindo a panturrilha',collection:'preto'}
  };
  const regions={braco:['fluxo','letra'],mao:['mao'],perna:['preto']};
  const regionNames={braco:'Braço',mao:'Mão',perna:'Perna'};
  function notice(message){clearTimeout(noticeTimer);$('.status-message').textContent=message;$('.status-message').classList.add('visible');noticeTimer=setTimeout(()=>$('.status-message').classList.remove('visible'),3000)}
  function updateSaveButton(){const active=saved.has(works[currentWork].collection);$('#save-work').setAttribute('aria-pressed',String(active));$('#save-work').firstChild.textContent=active?'Referência guardada ':'Guardar como referência ';$('#save-work span').textContent=active?'✓':'+';$$('.collection-count').forEach(el=>el.textContent=saved.size)}
  function setWork(key){currentWork=works[key]?key:'fluxo';const work=works[currentWork],siblings=regions[work.region],index=siblings.indexOf(currentWork);const img=$('#work-photo');img.src=`assets/${work.image}-740.webp`;img.srcset=work.width>400?`assets/${work.image}-400.webp 400w, assets/${work.image}-740.webp ${work.width}w`:'';img.alt=work.alt;img.width=work.width;img.height=work.height;$('#open-detail').className='art-frame'+(work.region==='mao'?' hand':work.region==='perna'?' leg':'');$('#work-category').textContent=work.category;$('#work-title').textContent=work.title;$('#work-description').textContent=work.description;$('#work-region').textContent=work.area;$('#fact-region').textContent=work.area;$('#fact-observe').textContent=work.observe;$('#work-position').textContent=`${index+1} de ${siblings.length}`;$('#work-index').textContent=`0${index+1} / 0${siblings.length}`;$('#previous-work').disabled=siblings.length<2;$('#next-work').disabled=siblings.length<2;$$('[data-region]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.region===work.region)));updateSaveButton();if(!reduced.matches)img.animate([{opacity:.2},{opacity:1}],{duration:450,easing:'ease-out'})}
  function closeMenu(){const button=$('.menu-toggle');button.setAttribute('aria-expanded','false');$('#mobile-nav').hidden=true;button.lastElementChild.textContent='+'}
  function updateCurrentSection(){
    const readingLine=$('.site-header').getBoundingClientRect().bottom+innerHeight*.2;
    let id='inicio';
    for(const scene of scenes){if(scene.getBoundingClientRect().top<=readingLine)id=scene.id}
    if(id===currentScene)return;
    currentScene=id;document.body.dataset.scene=id;
    $$('.site-header nav a, .header-project, #mobile-nav a').forEach(a=>a.hash==='#'+id?a.setAttribute('aria-current','location'):a.removeAttribute('aria-current'));
  }
  function followHash(initial=false){
    const [id,work]=location.hash.slice(1).split('/');
    const section=scenes.find(scene=>scene.id===id);
    if(!section)return;
    if(id==='atlas'&&works[work]){
      setWork(work);
      const align=()=>section.scrollIntoView({behavior:initial||reduced.matches?'instant':'smooth'});
      if(initial)document.fonts.ready.then(align);else align();
    }
    if(!initial)section.querySelector('h1').focus({preventScroll:true});
    closeMenu();
  }
  document.documentElement.classList.add('js');setWork(currentWork);followHash(true);updateCurrentSection();
  addEventListener('hashchange',()=>followHash());
  let scrollFrame=0;
  addEventListener('scroll',()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(()=>{scrollFrame=0;updateCurrentSection()})},{passive:true});
  addEventListener('resize',updateCurrentSection);
  $('.skip').addEventListener('click',e=>{e.preventDefault();$('#conteudo').focus({preventScroll:true});$('#conteudo').scrollIntoView({behavior:'instant'})});
  $('.menu-toggle').addEventListener('click',()=>{const expanded=$('.menu-toggle').getAttribute('aria-expanded')==='true';$('#mobile-nav').hidden=expanded;$('.menu-toggle').setAttribute('aria-expanded',String(!expanded));$('.menu-toggle span').textContent=expanded?'+':'×'});
  const eclipsePhoto=$('#eclipse-photo');let eclipseRequest=0;
  $$('[data-eclipse]').forEach(button=>button.addEventListener('click',()=>{
    const side=button.dataset.eclipse,request=++eclipseRequest;
    if(!['frente','costas'].includes(side))return;
    eclipsePhoto.src=`assets/eclipse-${side}.png`;
    eclipsePhoto.alt=side==='frente'?'Pedro de frente com camiseta Eclipse, pequeno símbolo turquesa no peito e parede vermelha':'Pedro de costas com camiseta Eclipse, estampa ornamental turquesa e parede vermelha';
    $('#eclipse-caption').textContent=side==='frente'?'Eclipse · Símbolo na frente':'Eclipse · Estampa nas costas';
    $$('[data-eclipse]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    eclipsePhoto.decode().then(()=>{if(request===eclipseRequest&&!reduced.matches)eclipsePhoto.animate([{opacity:.55},{opacity:1}],{duration:300,easing:'ease-out'})}).catch(()=>notice('Não foi possível carregar esta foto. Tente selecionar a vista novamente.'));
  }));
  $('#mobile-nav').addEventListener('click',e=>{if(e.target.closest('a'))closeMenu()});document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});
  $$('[data-region]').forEach(b=>b.addEventListener('click',()=>{const region=b.dataset.region;$('#region-choice').value=regionNames[region];updateMessage();setWork(regions[region][0])}));
  function nextWork(delta){const options=regions[works[currentWork].region],index=options.indexOf(currentWork);setWork(options[(index+delta+options.length)%options.length])}
  $('#previous-work').addEventListener('click',()=>nextWork(-1));$('#next-work').addEventListener('click',()=>nextWork(1));
  function updateCollection(){const list=$('#reference-list');list.replaceChildren();if(!saved.size){const empty=document.createElement('p');empty.className='empty-collection';empty.textContent='Você pode começar sem referências. Ou guardar uma obra que chamou sua atenção.';list.append(empty)}else saved.forEach((work,key)=>{const item=document.createElement('div');item.className='reference-item';const image=document.createElement('img');image.src=`assets/${work.image}-400.webp`;image.alt='';image.width=55;image.height=66;const content=document.createElement('div');const title=document.createElement('strong');title.textContent=work.title;const region=document.createElement('span');region.textContent=work.area;content.append(title,region);const remove=document.createElement('button');remove.type='button';remove.textContent='×';remove.setAttribute('aria-label','Remover referência '+work.title);remove.addEventListener('click',()=>{saved.delete(key);updateCollection();updateSaveButton();updateMessage();notice('Referência removida.');$('#projeto .text-link').focus()});item.append(image,content,remove);list.append(item)});updateMessage()}
  $('#save-work').addEventListener('click',()=>{const work=works[currentWork],key=work.collection;if(saved.has(key)){saved.delete(key);notice('Referência removida.')}else{saved.set(key,works[key]);notice('Referência guardada para o seu projeto.')}if(!$('#region-choice').value)$('#region-choice').value=regionNames[work.region];updateCollection();updateSaveButton()});
  function updateMessage(){let message='Olá, Pedro! Quero conversar sobre uma tatuagem.';const region=$('#region-choice').value,note=$('#project-note').value.trim();if(region)message+=' Região que imagino: '+region+'.';if(saved.size)message+=' Referências que escolhi no seu Atlas: '+[...saved.values()].map(w=>w.title.replace(/\.$/,'')+' ('+w.area+')').join('; ')+'.';if(note)message+=' Minha ideia: '+note;$('#whatsapp').href='https://wa.me/5561981110353?text='+encodeURIComponent(message)}
  $('#region-choice').addEventListener('change',updateMessage);$('#project-note').addEventListener('input',updateMessage);$('#project-form').addEventListener('submit',e=>e.preventDefault());
  const dialog=$('#detail-dialog'),frame=$('.detail-image-frame');let detailOpener;
  $('#open-detail').addEventListener('click',()=>{const work=works[currentWork];$('#detail-photo').src=`assets/${work.image}-740.webp`;$('#detail-photo').alt=work.alt;$('#detail-photo').width=work.width;$('#detail-photo').height=work.height;$('#detail-title').textContent=work.title;$('#detail-caption').textContent=work.description;frame.classList.remove('zoomed');$('#detail-zoom').setAttribute('aria-pressed','false');$('#detail-zoom').textContent='Aproximar detalhe';detailOpener=document.activeElement;dialog.showModal();document.body.classList.add('has-dialog')});
  $('.close-detail').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});dialog.addEventListener('close',()=>{document.body.classList.remove('has-dialog');detailOpener?.focus({preventScroll:true})});
  $('#detail-zoom').addEventListener('click',()=>{const active=frame.classList.toggle('zoomed');$('#detail-zoom').setAttribute('aria-pressed',String(active));$('#detail-zoom').textContent=active?'Ver composição inteira':'Aproximar detalhe';frame.scrollTop=active?frame.scrollHeight*.18:0});
  const steps=['A anatomia orienta a composição. O espaço que fica sem tinta também precisa ser pensado.','O marcador encontra o caminho diretamente na pele. As linhas podem ser ajustadas ao volume e ao movimento.','A tinta dá peso à composição. O preto e os intervalos de pele passam a trabalhar juntos.'];$$('[data-step]').forEach(b=>b.addEventListener('click',()=>{$$('[data-step]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));$('.step-text').textContent=steps[Number(b.dataset.step)]}));
})();
