/**
 * NIKKU'S LITTLE HAPPINESS UNIVERSE - SCRIPT
 * Interactive features, ambient particle canvas, Web Audio romantic music box,
 * touch bursts, 3D flip card tracking, and surprise animations.
 */

(function () {
  'use strict';

  // ==========================================================================
  // 1. WEB AUDIO SYNTHESIZER (ROMANTIC MUSIC BOX & SOUND EFFECTS)
  // Completely self-contained, 0 external assets, plays a dreamy lullaby
  // ==========================================================================
  class SoundEngine {
    constructor() {
      this.ctx = null;
      this.isPlayingMusic = false;
      this.musicTimer = null;
      this.musicStep = 0;
      this.masterGain = null;
      this.musicGain = null;

      // Romantic music box scale & melody (frequencies in Hz: F# pentatonic / romantic major)
      // Notes: C#5, D#5, F5, F#5, G#5, A#5, C#6, F6
      this.notes = [
        554.37, // C#5
        622.25, // D#5
        698.46, // F5
        739.99, // F#5
        830.61, // G#5
        932.33, // A#5
        1108.73,// C#6
        1396.91 // F6
      ];

      // Dreamy romantic lullaby melody pattern
      this.melody = [
        0, 2, 4, 7, 4, 2, 0, 4,
        1, 3, 5, 6, 5, 3, 1, 3,
        2, 4, 6, 7, 6, 4, 2, 4,
        0, 3, 4, 7, 5, 3, 1, 0
      ];
    }

    // Sound effects gain and init
    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
          this.masterGain = this.ctx.createGain();
          this.masterGain.gain.setValueAtTime(0.28, this.ctx.currentTime);
          this.masterGain.connect(this.ctx.destination);
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    // Single bell chime tone
    playBell(freq, delay = 0, duration = 1.4, vol = 0.25) {
      if (!this.ctx) return;
      const t = this.ctx.currentTime + delay;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(vol, t + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + duration + 0.05);
    }

    // Sound effect: Cute playful cat chirp / purr
    playMeow() {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(520, t);
      osc.frequency.exponentialRampToValueAtTime(780, t + 0.15);
      osc.frequency.exponentialRampToValueAtTime(620, t + 0.3);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.18, t + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.36);
    }

    // Sound effect: Sparkling flower bloom / star chime
    playSparkle() {
      this.init();
      if (!this.ctx) return;
      const chords = [523.25, 659.25, 783.99, 1046.5]; // C major sparkle
      chords.forEach((freq, idx) => {
        this.playBell(freq, idx * 0.07, 0.8, 0.16);
      });
    }

    // Sound effect: Card flip whoosh / soft tap
    playCardFlip() {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, t);
      osc.frequency.exponentialRampToValueAtTime(580, t + 0.09);

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.12);
    }

    // Sound effect: Warm hug chord
    playHugChime() {
      this.init();
      if (!this.ctx) return;
      const warmChords = [440, 554.37, 659.25]; // A major warm harmony
      warmChords.forEach((freq, idx) => {
        this.playBell(freq, idx * 0.04, 1.2, 0.18);
      });
    }
  }

  const sound = new SoundEngine();

  // ==========================================================================
  // 2. AMBIENT PARTICLES CANVAS (HEARTS, SUNFLOWER PETALS, SPARKLING DUST)
  // ==========================================================================
  const canvas = document.getElementById('ambient-canvas');
  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];
  const maxParticles = 35; // Lightweight and smooth on mobile

  function resizeCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  class Particle {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : height + 20;
      this.size = 12 + Math.random() * 14;
      this.speedY = 0.5 + Math.random() * 1.1;
      this.speedX = (Math.random() - 0.5) * 0.8;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotSpeed = (Math.random() - 0.5) * 0.03;
      this.opacity = 0.35 + Math.random() * 0.45;
      this.type = Math.random() > 0.45 ? 'sunflower' : (Math.random() > 0.5 ? 'heart' : 'sparkle');
    }

    update() {
      this.y -= this.speedY;
      this.x += Math.sin(this.y * 0.015) * 0.7 + this.speedX;
      this.rotation += this.rotSpeed;

      if (this.y < -30 || this.x < -30 || this.x > width + 30) {
        this.reset();
      }
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.globalAlpha = this.opacity;

      if (this.type === 'heart') {
        // Draw soft blush heart
        ctx.fillStyle = '#FFAEC0';
        ctx.beginPath();
        const s = this.size * 0.5;
        ctx.moveTo(0, s * 0.3);
        ctx.bezierCurveTo(-s, -s * 0.5, -s * 1.2, s * 0.6, 0, s * 1.2);
        ctx.bezierCurveTo(s * 1.2, s * 0.6, s, -s * 0.5, 0, s * 0.3);
        ctx.fill();
      } else if (this.type === 'sunflower') {
        // Draw delicate golden sunflower petal
        ctx.fillStyle = '#FFD84D';
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size * 0.35, this.size * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();
        // Inner orange tint
        ctx.fillStyle = '#FFAE19';
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size * 0.15, this.size * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Draw magical 4-point sparkle star
        ctx.fillStyle = '#FFF1A8';
        const r = this.size * 0.45;
        ctx.beginPath();
        ctx.moveTo(0, -r);
        ctx.quadraticCurveTo(0, 0, r, 0);
        ctx.quadraticCurveTo(0, 0, 0, r);
        ctx.quadraticCurveTo(0, 0, -r, 0);
        ctx.quadraticCurveTo(0, 0, 0, -r);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  for (let i = 0; i < maxParticles; i++) {
    particles.push(new Particle());
  }

  function animateAmbient() {
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }
    requestAnimationFrame(animateAmbient);
  }
  animateAmbient();

  // ==========================================================================
  // 3. BURST EMITTER (TOUCH / CLICK CELEBRATION EFFECTS)
  // Spawns bursting hearts and sunflowers anywhere Nikku interacts!
  // ==========================================================================
  const burstIcons = ['💛', '🌻', '💗', '✨', '🐾', '🌸', '🥰'];

  function spawnBurst(x, y, count = 10) {
    for (let i = 0; i < count; i++) {
      const el = document.createElement('span');
      el.className = 'burst-particle';
      el.textContent = burstIcons[Math.floor(Math.random() * burstIcons.length)];

      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.6;
      const distance = 40 + Math.random() * 85;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance;
      const rot = (Math.random() - 0.5) * 180;

      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      el.style.setProperty('--tx', `${tx}px`);
      el.style.setProperty('--ty', `${ty}px`);
      el.style.setProperty('--rot', `${rot}deg`);

      document.body.appendChild(el);
      setTimeout(() => el.remove(), 1250);
    }
  }

  // Interactive tap sparkle anywhere on background
  window.addEventListener('pointerdown', (e) => {
    // Only spawn ambient sparkles if not clicking an interactive button
    if (!e.target.closest('button, .flip-card, .cat-card, .sunflower-interactive-wrapper, .envelope-interactive')) {
      spawnBurst(e.clientX, e.clientY, 5);
    }
  });

  // ==========================================================================
  // ==========================================================================
  // 4. BACKGROUND AUDIO: ED SHEERAN - PERFECT (STARTING AT 3:18 = 198 SECONDS)
  // ==========================================================================
  const bgAudio = document.getElementById('bg-audio');
  const SONG_START_TIME = 198; // 3 minutes 18 seconds in seconds

  const welcomeScreen = document.getElementById('welcome-screen');
  const enterBtn = document.getElementById('enter-btn');
  const mainContent = document.getElementById('main-content');
  const musicToggleBtn = document.getElementById('music-toggle-btn');
  const musicLabel = document.getElementById('music-label');

  function updateMusicUI(isPlaying) {
    if (musicToggleBtn && musicLabel) {
      if (isPlaying) {
        musicToggleBtn.classList.add('playing');
        musicLabel.textContent = 'Pause Music';
      } else {
        musicToggleBtn.classList.remove('playing');
        musicLabel.textContent = 'Play Perfect 🎵';
      }
    }
  }

  function playSongFromStartPoint() {
    if (!bgAudio) return;
    
    // Set timestamp to 3:18 if starting or ended
    if (bgAudio.currentTime < SONG_START_TIME || bgAudio.ended) {
      try {
        bgAudio.currentTime = SONG_START_TIME;
      } catch (err) {
        // Will set upon play
      }
    }

    const playPromise = bgAudio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          // Safeguard: Ensure playback position is at 3:18
          if (bgAudio.currentTime < SONG_START_TIME) {
            bgAudio.currentTime = SONG_START_TIME;
          }
          updateMusicUI(true);
        })
        .catch((err) => {
          console.warn("Audio playback awaiting user gesture:", err);
          updateMusicUI(false);
        });
    }
  }

  function toggleSong() {
    if (!bgAudio) return;
    if (bgAudio.paused) {
      playSongFromStartPoint();
    } else {
      bgAudio.pause();
      updateMusicUI(false);
    }
  }

  if (bgAudio) {
    // Cue to 3:18 when metadata loads
    bgAudio.addEventListener('loadedmetadata', () => {
      if (bgAudio.currentTime < SONG_START_TIME) {
        bgAudio.currentTime = SONG_START_TIME;
      }
    });

    // Seamless loop back to 3:18 if song ends
    bgAudio.addEventListener('ended', () => {
      bgAudio.currentTime = SONG_START_TIME;
      bgAudio.play().catch(() => {});
    });

    bgAudio.addEventListener('play', () => updateMusicUI(true));
    bgAudio.addEventListener('pause', () => updateMusicUI(false));
  }

  // ==========================================================================
  // 5. WELCOME SCREEN & OPENING TRANSITION
  // ==========================================================================
  if (enterBtn) {
    enterBtn.addEventListener('click', (e) => {
      sound.init();
      sound.playSparkle();

      const rect = enterBtn.getBoundingClientRect();
      spawnBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 18);

      welcomeScreen.classList.add('fade-out');
      mainContent.classList.remove('hidden');

      setTimeout(() => {
        welcomeScreen.style.display = 'none';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 700);

      // Play "Perfect" by Ed Sheeran starting precisely from 3:18!
      playSongFromStartPoint();
    });
  }

  // Music toggle button in header
  if (musicToggleBtn) {
    musicToggleBtn.addEventListener('click', () => {
      toggleSong();
    });
  }

  // Quick Love Shower Button in Header
  const loveShowerBtn = document.getElementById('love-shower-btn');
  if (loveShowerBtn) {
    loveShowerBtn.addEventListener('click', (e) => {
      sound.playSparkle();
      const rect = loveShowerBtn.getBoundingClientRect();
      spawnBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 16);

      // Rain cascading hearts from the top
      for (let i = 0; i < 12; i++) {
        setTimeout(() => {
          const rx = Math.random() * window.innerWidth;
          spawnBurst(rx, 60, 4);
        }, i * 80);
      }
    });
  }

  // ==========================================================================
  // 6. INTERACTIVE SUNFLOWER
  // ==========================================================================
  const sunflowerInteractive = document.getElementById('sunflower-interactive');
  const sunflowerHead = document.getElementById('sunflower-head');

  if (sunflowerInteractive) {
    const handleSunflowerBloom = (e) => {
      sound.playSparkle();
      const rect = sunflowerInteractive.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      spawnBurst(cx, cy, 18);

      // Rapid happy spin animation on bloom
      if (sunflowerHead) {
        sunflowerHead.animate([
          { transform: 'translate(120px, 120px) scale(0.95) rotate(0deg)' },
          { transform: 'translate(120px, 120px) scale(1.22) rotate(180deg)' },
          { transform: 'translate(120px, 120px) scale(1) rotate(360deg)' }
        ], {
          duration: 900,
          easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
        });
      }
    };

    sunflowerInteractive.addEventListener('click', handleSunflowerBloom);
    sunflowerInteractive.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleSunflowerBloom(e);
      }
    });
  }

  // ==========================================================================
  // 7. CAT PARADISE: INTERACTIVE KITTENS
  // ==========================================================================
  const catCards = document.querySelectorAll('.cat-card');
  const catResponses = {
    waving: "Purrrr! Nikku, you are the most purr-fect human ever! 🐾",
    sleepy: "Zzz... 1000 tiny warm kitty hugs wrapped around Nikku! 💤",
    heart: "Meow! My whole tiny heart belongs to you, beautiful! 💖",
    sunflower: "Meow means I love you SO MUCH, Nikku! 🌻"
  };

  catCards.forEach((card) => {
    const handlePet = (e) => {
      sound.playMeow();
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      spawnBurst(cx, cy, 12);

      // Bounce card
      card.animate([
        { transform: 'scale(1)' },
        { transform: 'scale(1.08) translateY(-6px)' },
        { transform: 'scale(1)' }
      ], {
        duration: 400,
        easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
      });

      // Show temporary floating speech bubble
      const catType = card.dataset.cat || 'waving';
      const captionEl = card.querySelector('.cat-caption');
      if (captionEl) {
        const originalText = captionEl.textContent;
        captionEl.textContent = catResponses[catType] || originalText;
        captionEl.style.color = '#B52B4E';
        setTimeout(() => {
          captionEl.textContent = originalText;
          captionEl.style.color = '';
        }, 3200);
      }
    };

    card.addEventListener('click', handlePet);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handlePet(e);
      }
    });
  });

  // ==========================================================================
  // 8. 10 REASONS WHY YOU'RE SO SPECIAL (FLIP CARDS & PROGRESS TRACKER)
  // ==========================================================================
  const flipCards = document.querySelectorAll('.flip-card');
  const revealedCountEl = document.getElementById('revealed-count');
  const progressBarFill = document.getElementById('progress-bar-fill');
  const allUnlockedBanner = document.getElementById('all-unlocked-banner');
  const flippedSet = new Set();

  flipCards.forEach((card) => {
    const handleFlip = () => {
      sound.playCardFlip();
      const isFlipped = card.classList.toggle('flipped');
      const reasonNum = card.dataset.reason;

      if (isFlipped) {
        flippedSet.add(reasonNum);
        const rect = card.getBoundingClientRect();
        spawnBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 8);
      }

      // Update progress
      const count = flippedSet.size;
      if (revealedCountEl) revealedCountEl.textContent = count;
      if (progressBarFill) progressBarFill.style.width = `${(count / 10) * 100}%`;

      // If all 10 are unlocked, trigger grand celebration
      if (count === 10 && allUnlockedBanner && allUnlockedBanner.classList.contains('hidden')) {
        allUnlockedBanner.classList.remove('hidden');
        sound.playSparkle();
        // Shower screen with celebration confetti
        for (let i = 0; i < 8; i++) {
          setTimeout(() => {
            const rx = Math.random() * window.innerWidth;
            const ry = 150 + Math.random() * (window.innerHeight - 300);
            spawnBurst(rx, ry, 10);
          }, i * 150);
        }
      }
    };

    card.addEventListener('click', handleFlip);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleFlip();
      }
    });
  });

  // ==========================================================================
  // 9. A LITTLE HAPPINESS BUTTON ("NEED A HUG? CLICK HERE 🥺")
  // ==========================================================================
  const hugBtn = document.getElementById('hug-btn');
  const hugCounterEl = document.getElementById('hug-counter');
  const hugMessageBox = document.getElementById('hug-message-box');
  const hugMessageText = document.getElementById('hug-message-text');

  const hugMessages = [
    "Sending you the biggest virtual hug ever! 🤗",
    "You're doing better than you think, sweetheart.",
    "Don't forget to smile, my sunflower! 🌻",
    "One bad day doesn't make a bad life.",
    "I wish I could be there to hold your hand right now.",
    "You're loved more than words can explain.",
    "Take a deep breath, my love. You are safe, you are cherished, and you are never alone.",
    "Your smile is my favourite sight in the whole world. Never lose it! ✨",
    "No matter what happens, I'm always on your team, Nikku. 💕",
    "Sending 10,000 warm forehead kisses straight to you! 🌸",
    "Even the stars are jealous of how bright your soul shines. 💫",
    "Rest your sweet head. Everything is going to be wonderful, I promise."
  ];

  let hugCount = 0;
  let lastMessageIndex = -1;

  if (hugBtn) {
    hugBtn.addEventListener('click', () => {
      sound.playHugChime();
      hugCount++;
      if (hugCounterEl) hugCounterEl.textContent = hugCount;

      const rect = hugBtn.getBoundingClientRect();
      spawnBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 14);

      // Select a new sweet message (avoid repeating immediate consecutive)
      let nextIndex;
      do {
        nextIndex = Math.floor(Math.random() * hugMessages.length);
      } while (nextIndex === lastMessageIndex && hugMessages.length > 1);
      lastMessageIndex = nextIndex;

      // Animate message box
      if (hugMessageBox && hugMessageText) {
        hugMessageBox.style.transform = 'scale(0.96)';
        hugMessageText.style.opacity = '0';

        setTimeout(() => {
          hugMessageText.textContent = hugMessages[nextIndex];
          hugMessageText.style.opacity = '1';
          hugMessageBox.style.transform = 'scale(1)';
        }, 180);
      }
    });
  }

  // ==========================================================================
  // 10. SURPRISE SECRET LOVE ENVELOPE
  // ==========================================================================
  const secretEnvelope = document.getElementById('secret-envelope');

  if (secretEnvelope) {
    const handleEnvelopeToggle = () => {
      sound.playSparkle();
      const isOpen = secretEnvelope.classList.toggle('open');

      const rect = secretEnvelope.getBoundingClientRect();
      spawnBurst(rect.left + rect.width / 2, rect.top + 70, 15);

      const tapHint = secretEnvelope.querySelector('.envelope-tap-hint');
      if (tapHint) {
        tapHint.textContent = isOpen ? "✨ Sealed with infinite love for Nikku ✨" : "✨ Tap the wax seal to open the letter ✨";
      }
    };

    secretEnvelope.addEventListener('click', handleEnvelopeToggle);
    secretEnvelope.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleEnvelopeToggle();
      }
    });
  }

  // ==========================================================================
  // 11. CELEBRATION MODAL ("SEND A KISS BACK 💋")
  // ==========================================================================
  const sendKissBtn = document.getElementById('send-kiss-btn');
  const kissModal = document.getElementById('kiss-modal');
  const closeKissModal = document.getElementById('close-kiss-modal');

  if (sendKissBtn && kissModal) {
    sendKissBtn.addEventListener('click', () => {
      sound.playSparkle();
      kissModal.classList.remove('hidden');

      // Grand celebration burst across screen
      for (let i = 0; i < 10; i++) {
        setTimeout(() => {
          const rx = Math.random() * window.innerWidth;
          const ry = Math.random() * window.innerHeight;
          spawnBurst(rx, ry, 12);
        }, i * 100);
      }
    });
  }

  if (closeKissModal && kissModal) {
    closeKissModal.addEventListener('click', () => {
      sound.playHugChime();
      kissModal.classList.add('hidden');
    });

    kissModal.addEventListener('click', (e) => {
      if (e.target === kissModal) {
        kissModal.classList.add('hidden');
      }
    });
  }

  // ==========================================================================
  // 12. BACK TO TOP BUTTON
  // ==========================================================================
  const backToTopBtn = document.getElementById('back-to-top-btn');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      sound.playSparkle();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

})();
