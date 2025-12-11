// script.js — Galería modal, thumbnails -> video, formulario accessible
(() => {
  // Elements
  const thumbs = document.getElementById('thumbs');
  const mainVideo = document.querySelector('.main-video');
  const heroVideo = document.getElementById('heroVideo');

  const modal = document.getElementById('modal');
  const modalImg = document.getElementById('modalImg');
  const closeBtns = document.querySelectorAll('[data-close]');

  // Open modal image
  function openModal(src, alt='Preview'){
    modalImg.src = src;
    modalImg.alt = alt;
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(){
    modal.setAttribute('aria-hidden', 'true');
    modalImg.src = '';
    document.body.style.overflow = '';
  }

  closeBtns.forEach(b => b.addEventListener('click', closeModal));
  document.querySelector('.modal-backdrop')?.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => { if(e.key === 'Escape') closeModal(); });

  // Thumbnails click: change main video (if data-video) or open modal large image
  thumbs?.addEventListener('click', (e) => {
    const img = e.target.closest('img');
    if(!img) return;
    const videoSrc = img.dataset.video;
    const large = img.dataset.large || img.src;
    if(videoSrc && mainVideo){
      // change main video source
      mainVideo.pause();
      mainVideo.src = videoSrc;
      mainVideo.load();
      mainVideo.play().catch(()=>{ /* autoplay blocked */ });
      // small visual indicator
      document.querySelectorAll('#thumbs img').forEach(i => i.style.opacity = '0.8');
      img.style.opacity = '1';
      return;
    }
    // open modal image
    openModal(large, img.alt || 'Preview');
  });

  // CONTACT FORM: validation inline
  const form = document.getElementById('contactForm');
  const feedback = form?.querySelector('.form-feedback');
  if(form){
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const message = form.message.value.trim();
      if(!name || !email || !message){
        if(feedback){ feedback.textContent = 'Por favor completa todos los campos.'; feedback.style.color = '#ffb3b3'; }
        return;
      }

      // Simulate send
      if(feedback){ feedback.textContent = 'Enviando...'; feedback.style.color = '#fffdbf'; }
      setTimeout(() => {
        if(feedback){ feedback.textContent = `Gracias ${name}, hemos recibido tu mensaje.`; feedback.style.color = '#bfffd9'; }
        form.reset();
        setTimeout(()=> { if(feedback) feedback.textContent = ''; }, 4200);
      }, 800);
    });
  }

  // add accessible titles to videos
  [mainVideo, heroVideo].forEach(v => { if(v) v.setAttribute('title','Tráiler de Fary'); });
})();
