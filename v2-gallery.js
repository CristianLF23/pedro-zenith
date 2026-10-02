(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var uid = 0;

  function selectedIndex(track, slides) {
    var left = track.scrollLeft;
    var nearest = 0;
    var distance = Infinity;
    slides.forEach(function (slide, index) {
      var offset = Math.abs(left - (slide.offsetLeft - track.offsetLeft));
      if (offset < distance) {
        distance = offset;
        nearest = index;
      }
    });
    return nearest;
  }

  function init() {
    document.querySelectorAll('[data-carousel][data-thumbnails]').forEach(function (root) {
      if (root.dataset.thumbnailsReady === 'true') return;

      var track = root.querySelector('.carousel-track');
      if (!track) return;
      var slides = Array.prototype.filter.call(track.children, function (node) {
        return node.matches('.slide');
      });
      var images = slides.map(function (slide) { return slide.querySelector(':scope > img'); });
      if (!slides.length || images.some(function (image) { return !image || !image.getAttribute('src'); })) return;

      var trackId = track.id || ('zenith-gallery-track-' + (++uid));
      track.id = trackId;
      var nav = document.createElement('nav');
      nav.className = 'zenith-gallery-thumbnails';
      nav.setAttribute('aria-label', 'Navegação de imagens');

      var list = document.createElement('div');
      list.className = 'zenith-gallery-thumbnails-list';
      list.setAttribute('role', 'list');
      nav.appendChild(list);

      var buttons = slides.map(function (slide, index) {
        var image = images[index];
        var label = image.getAttribute('alt') || ('Imagem ' + (index + 1));
        var slideId = slide.id || (trackId + '-slide-' + (index + 1));
        slide.id = slideId;

        var button = document.createElement('button');
        button.type = 'button';
        button.className = 'zenith-gallery-thumb';
        button.dataset.thumbIndex = String(index);
        button.setAttribute('aria-controls', slideId);
        button.setAttribute('aria-label', 'Ver imagem ' + (index + 1) + ': ' + label);
        button.setAttribute('title', label);

        var thumb = document.createElement('img');
        thumb.src = image.currentSrc || image.src;
        thumb.alt = '';
        thumb.setAttribute('aria-hidden', 'true');
        thumb.loading = 'lazy';
        thumb.decoding = 'async';
        button.appendChild(thumb);

        var number = document.createElement('span');
        number.className = 'zenith-gallery-thumb-number';
        number.setAttribute('aria-hidden', 'true');
        number.textContent = String(index + 1).padStart(2, '0');
        button.appendChild(number);

        button.addEventListener('click', function () {
          var left = slide.offsetLeft - track.offsetLeft;
          track.scrollTo({ left: left, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
          sync(index, true);
        });
        list.appendChild(button);
        return button;
      });

      var frame = 0;
      function keepVisible(button) {
        var listLeft = list.scrollLeft;
        var listRight = listLeft + list.clientWidth;
        var buttonLeft = button.offsetLeft;
        var buttonRight = buttonLeft + button.offsetWidth;
        if (buttonLeft < listLeft) list.scrollLeft = buttonLeft;
        else if (buttonRight > listRight) list.scrollLeft = buttonRight - list.clientWidth;
      }

      function sync(index, keepThumb) {
        var safeIndex = Math.max(0, Math.min(slides.length - 1, index));
        buttons.forEach(function (button, buttonIndex) {
          if (buttonIndex === safeIndex) button.setAttribute('aria-current', 'true');
          else button.removeAttribute('aria-current');
        });
        if (keepThumb) keepVisible(buttons[safeIndex]);
      }

      function scheduleSync() {
        if (frame) return;
        frame = window.requestAnimationFrame(function () {
          frame = 0;
          sync(selectedIndex(track, slides), true);
        });
      }

      track.addEventListener('scroll', scheduleSync, { passive: true });
      window.addEventListener('resize', scheduleSync, { passive: true });
      reduceMotion.addEventListener('change', scheduleSync);
      root.dataset.thumbnailsReady = 'true';
      root.insertBefore(nav, root.querySelector('.carousel-controls') || null);
      sync(selectedIndex(track, slides), false);
    });
  }

  window.ZenithGalleryThumbs = window.ZenithGalleryThumbs || {};
  window.ZenithGalleryThumbs.init = init;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
}());
