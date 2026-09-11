(() => {
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const menuButton = document.querySelector('.menu-button');
  const mobileMenu = document.querySelector('.mobile-menu');
  let lastFocus = null;

  const closeMenu = () => {
    if (!menuButton || !mobileMenu) return;
    mobileMenu.hidden = true;
    menuButton.setAttribute('aria-expanded', 'false');
  };

  menuButton?.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') === 'true';
    mobileMenu.hidden = open;
    menuButton.setAttribute('aria-expanded', String(!open));
  });
  mobileMenu?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && mobileMenu && !mobileMenu.hidden) {
      closeMenu();
      menuButton?.focus();
    }
  });

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('in-view');
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
  document.querySelectorAll('.reveal').forEach(node => revealObserver.observe(node));

  const zoneObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => entry.target.classList.toggle('is-visible', entry.isIntersecting));
  }, { threshold: .01 });
  document.querySelectorAll('.motion-zone').forEach(node => zoneObserver.observe(node));

  const tracked = [...document.querySelectorAll('.inscribe'), document.querySelector('.split-study')].filter(Boolean);
  let ticking = false;
  const updateScrollMotion = () => {
    ticking = false;
    if (reduceMotion.matches) return;
    const height = innerHeight || 1;
    tracked.forEach(node => {
      const rect = node.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, (height * .88 - rect.top) / (height * .78 + rect.height * .25)));
      if (node.classList.contains('inscribe')) node.style.setProperty('--inscription', `${Math.round(progress * 100)}%`);
      else {
        node.style.setProperty('--merge-left', `${(-28 + progress * 28).toFixed(2)}vw`);
        node.style.setProperty('--merge-right', `${(28 - progress * 28).toFixed(2)}vw`);
      }
    });
    const orbital = document.querySelector('.orbital-field');
    if (orbital && matchMedia('(pointer: coarse)').matches) {
      const rect = orbital.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, (height - rect.top) / (height + rect.height)));
      orbital.style.setProperty('--py', `${25 + progress * 50}%`);
    }
  };
  const requestMotion = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateScrollMotion);
  };
  addEventListener('scroll', requestMotion, { passive: true });
  addEventListener('resize', requestMotion);
  requestMotion();

  const orbital = document.querySelector('.orbital-field');
  orbital?.addEventListener('pointermove', event => {
    if (reduceMotion.matches || event.pointerType === 'touch') return;
    const rect = orbital.getBoundingClientRect();
    orbital.style.setProperty('--px', `${((event.clientX - rect.left) / rect.width) * 100}%`);
    orbital.style.setProperty('--py', `${((event.clientY - rect.top) / rect.height) * 100}%`);
  });

  const viewer = document.querySelector('#viewer');
  const viewerImage = viewer?.querySelector('.viewer-stage img');
  const viewerTitle = viewer?.querySelector('#viewer-title');
  const viewerClose = viewer?.querySelector('.viewer-close');
  document.querySelectorAll('.zoom').forEach(button => {
    button.addEventListener('click', () => {
      if (!viewer || !viewerImage || typeof viewer.showModal !== 'function') {
        location.href = button.dataset.src;
        return;
      }
      lastFocus = button;
      viewerImage.src = button.dataset.src;
      viewerImage.alt = button.dataset.label || 'Obra ampliada';
      viewerTitle.textContent = button.dataset.label || 'Detalhe';
      viewer.showModal();
      viewerClose?.focus();
    });
  });
  const closeViewer = () => viewer?.open && viewer.close();
  viewerClose?.addEventListener('click', closeViewer);
  viewer?.addEventListener('click', event => {
    if (event.target === viewer) closeViewer();
  });
  viewer?.addEventListener('close', () => {
    if (viewerImage) viewerImage.src = '';
    lastFocus?.focus();
  });

  const sections = [...document.querySelectorAll('main section[id]')];
  const navLinks = [...document.querySelectorAll('.desktop-nav a')];
  const navObserver = new IntersectionObserver(entries => {
    const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    navLinks.forEach(link => {
      const active = link.hash === `#${visible.target.id}`;
      if (active) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  }, { rootMargin: '-30% 0px -55% 0px', threshold: [0, .2, .5] });
  sections.forEach(section => navObserver.observe(section));
})();
