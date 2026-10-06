/* Keep one video and its existing playback observer when the composition changes. */
(() => {
  const film = document.querySelector('.hero-film');
  const works = document.querySelector('#obras');
  const heading = works?.querySelector('.chapter-head');
  if (!film || !works || !heading) return;
  const originalPosition = document.createComment('Video position on mobile');
  film.before(originalPosition);
  const study = document.querySelector('.study-copy');
  const supportingContent = ['.project-options', '.art-inquiry'].map(selector => {
    const node = document.querySelector(selector);
    if (!node) return null;
    const origin = document.createComment('Original mobile reading order');
    node.before(origin);
    return { node, origin };
  }).filter(Boolean);
  const desktop = matchMedia('(min-width: 1001px)');
  const arrange = () => {
    if (desktop.matches) heading.append(film);
    else originalPosition.after(film);
    supportingContent.forEach(({ node, origin }) => {
      if (desktop.matches && study) study.append(node);
      else origin.after(node);
    });
    // The progressive inscription depends on section positions, not a fixed page height.
    window.dispatchEvent(new Event('resize'));
  };
  desktop.addEventListener('change', arrange);
  arrange();
})();
