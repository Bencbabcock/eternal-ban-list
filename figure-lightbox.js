(function () {
  var lightbox = document.getElementById('figure-lightbox');
  var lightboxImg = lightbox.querySelector('.figure-lightbox__img');
  var lightboxCaption = lightbox.querySelector('.figure-lightbox__caption');
  var closeBtn = lightbox.querySelector('.figure-lightbox__close');

  function openLightbox(img, captionText) {
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightboxCaption.textContent = captionText;
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function closeLightbox() {
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.figure-row figure, .figure-with-text figure, .figures-two-with-text figure').forEach(function (figure) {
    figure.addEventListener('click', function () {
      var img = figure.querySelector('img');
      var cap = figure.querySelector('figcaption');
      if (img) openLightbox(img, cap ? cap.textContent : '');
    });
  });

  closeBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && lightbox.getAttribute('aria-hidden') === 'false') {
      closeLightbox();
    }
  });
})();
