/* script.js — Preloader, theme toggle, burger menu, audio, form, accessibility */

(() => {
  // ---------- PRELOADER ----------
  const preloader = document.getElementById('preloader');
  const preProgress = document.getElementById('preProgress');
  const app = document.getElementById('app');

  // Simulate loading assets & show progressive bar (replace with real asset loading if needed)
  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 22; // simulated steps
    if (progress >= 100) progress = 100;
    preProgress.style.width = progress + '%';
    if (progress === 100) {
      clearInterval(interval);
      // small delay for polish
      setTimeout(() => {
        preloader.setAttribute('aria-hidden','true');
        preloader.classList.add('hidden');
        app.classList.remove('hidden');
        app.style.opacity = 0;
        // fade in
        requestAnimationFrame(()=> {
          app.style.transition = 'opacity .6s ease';
          app.style.opacity = 1;
        });
      }, 600);
    }
  }, 300);

  // ---------- BURGER MENU ----------
  const burger = document.getElementById('burger');
  const mainNav = document.getElementById('mainNav');
  burger?.addEventListener('click', () => {
    const expanded = burger.getAttribute('aria-expanded') === 'true';
    burger.setAttribute('aria-expanded', String(!expanded));
    if (!expanded) {
      mainNav.style.display = 'flex';
      mainNav.style.flexDirection = 'column';
      mainNav.style.position = 'absolute';
      mainNav.style.right = '20px';
      mainNav.style.top = '72px';
      mainNav.style.background = 'var(--panel)';
      mainNav.style.padding = '12px';
      mainNav.style.borderRadius = '8px';
      mainNav.style.boxShadow = '0 8px 24px rgba(0,0,0,0.6)';
    } else {
      mainNav.style.display = '';
      mainNav.style.position = '';
      mainNav.style.right = '';
      mainNav.style.top = '';
      mainNav.style.background = '';
    }
  });

  // Close menu on resize if larger
  window.addEventListener('resize', () => {
    if (window.innerWidth > 980) {
      mainNav.style.display = '';
      mainNav.style.position = '';
      burger.setAttribute('aria-expanded','false');
    }
  });

  // ---------- THEME TOGGLE ----------
  const themeToggle = document.getElementById('themeToggle');
  themeToggle?.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    if (current === 'light') {
      document.documentElement.removeAttribute('data-theme');
      themeToggle.setAttribute('aria-pressed','false');
    } else {
      document.documentElement.setAttribute('data-theme','light');
      themeToggle.setAttribute('aria-pressed','true');
    }
  });

  // Persist preference (optional)
  const storedTheme = localStorage.getItem('ls_theme');
  if (storedTheme === 'light') {
    document.documentElement.setAttribute('data-theme','light');
    themeToggle?.setAttribute('aria-pressed','true');
  }
  // Save cookie on change
  themeToggle?.addEventListener('click', () => {
    const t = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    localStorage.setItem('ls_theme', t);
  });

  // ---------- AUDIO (Web Audio API) ----------
  let audioCtx, masterGain;
  let audioOn = false;
  const audioToggle = document.getElementById('audioToggle');

  function startAudio() {
    if (audioOn) return;
    audioOn = true;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioCtx();
      masterGain = audioCtx.createGain();
      masterGain.gain.value = 0.06;
      masterGain.connect(audioCtx.destination);

      // Ambient pad - two detuned oscillators
      const o1 = audioCtx.createOscillator();
      const o2 = audioCtx.createOscillator();
      o1.type = 'sawtooth'; o2.type = 'sawtooth';
      o1.frequency.value = 110; o2.frequency.value = 138;
      const padGain = audioCtx.createGain(); padGain.gain.value = 0.35;

      const filter = audioCtx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 900;

      o1.connect(padGain); o2.connect(padGain);
      padGain.connect(filter); filter.connect(masterGain);

      o1.start(); o2.start();

      // LFO for movement
      const lfo = audioCtx.createOscillator();
      lfo.type = 'sine'; lfo.frequency.value = 0.12;
      const lfoGain = audioCtx.createGain(); lfoGain.gain.value = 0.12;
      lfo.connect(lfoGain); lfoGain.connect(padGain.gain);
      lfo.start();

      // Chime scheduler
      function scheduleChimes() {
        const now = audioCtx.currentTime;
        const notes = [440, 554.37, 659.25];
        notes.forEach((f, i) => {
          const o = audioCtx.createOscillator();
          o.type = 'square'; o.frequency.value = f;
          const g = audioCtx.createGain(); g.gain.value = 0.0;
          o.connect(g); g.connect(masterGain);
          const t = now + i * 0.45;
          g.gain.setValueAtTime(0.0, t);
          g.gain.linearRampToValueAtTime(0.14, t + 0.02);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.85);
          o.start(t); o.stop(t + 1.2);
        });
      }
      scheduleChimes();
      setInterval(scheduleChimes, 8000);

      audioToggle.textContent = '♫';
      audioToggle.setAttribute('aria-pressed','true');
    } catch (err) {
      console.warn('Audio start failed', err);
    }
  }

  function stopAudio() {
    if (!audioOn) return;
    try {
      audioCtx.close();
    } catch (e) {}
    audioOn = false;
    audioToggle.textContent = '♪';
    audioToggle.setAttribute('aria-pressed','false');
  }

  // Start audio on user gesture to avoid autoplay blocking
  const startOnGesture = () => {
    startAudio();
    ['click','keydown','touchstart'].forEach(ev => window.removeEventListener(ev, startOnGesture));
  };
  ['click','keydown','touchstart'].forEach(ev => window.addEventListener(ev, startOnGesture, {passive:true}));

  audioToggle?.addEventListener('click', () => {
    if (!audioOn) startAudio(); else stopAudio();
  });

  // ---------- CONTACT FORM ----------
  const form = document.getElementById('contactForm');
  const feedback = form?.querySelector('.form-feedback');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const message = form.message.value.trim();
      if (!name || !email || !message) {
        if (feedback) { feedback.textContent = 'Por favor completa todos los campos.'; feedback.style.color = '#ffb3b3'; }
        return;
      }
      if (feedback) { feedback.textContent = 'Enviando...'; feedback.style.color = '#fffdbf'; }
      setTimeout(() => {
        if (feedback) { feedback.textContent = `Gracias ${name}, tu mensaje ha sido recibido.`; feedback.style.color = '#bfffd9'; }
        form.reset();
        setTimeout(()=> { if (feedback) feedback.textContent = ''; }, 4200);
      }, 900);
    });
  }

  // ---------- Accessibility: reduce motion respect ----------
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduce.matches) {
    document.querySelectorAll('.emblem').forEach(el => el.style.animation = 'none');
    document.querySelectorAll('*').forEach(el => el.style.transition = 'none');
  }

})();
