/**
 * Premium Animation & Interactive Experience Script
 * Created by Pratyush Raj ✨
 */

document.addEventListener('DOMContentLoaded', () => {
  // ─── 1. TOP PROGRESS BAR ───
  const progressPercent = document.getElementById('scroll-progress-bar');
  
  function updateProgressBar() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (progressPercent) {
      progressPercent.style.width = `${scrollPercent}%`;
    }
  }
  window.addEventListener('scroll', updateProgressBar, { passive: true });
  updateProgressBar();

  // ─── 2. CUTE PLAYFUL WEB AUDIO SOUNDS ───
  // Synthesizing retro/kawaii sound effects on the fly!
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  function playSound(type) {
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    const now = audioCtx.currentTime;

    if (type === 'hover') {
      // Soft bubble pop / sparkle sound
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(1400, now + 0.1);
      gain.gain.setValueAtTime(0.02, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'click') {
      // High-pitched happy ding
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.setValueAtTime(900, now + 0.05);
      osc.frequency.exponentialRampToValueAtTime(1600, now + 0.2);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === 'scroll') {
      // Very subtle airy whoosh (not too annoying, only triggers occasionally)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.3);
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    }
  }

  // Attach sounds to all buttons and links
  document.querySelectorAll('a, button, .flip-card-wrapper').forEach(el => {
    el.addEventListener('mouseenter', () => playSound('hover'));
    el.addEventListener('click', () => playSound('click'));
  });

  // ─── 3. FLOATING CLOUDS, STARS, AND HEARTS (DYNAMIC PARTICLES) ───
  const particlesLayer = document.getElementById('particles-layer');
  const emojis = ['🌸', '✨', '💖', '🐰', '🍭', '⭐', '🎈'];
  
  function createParticle() {
    if (!particlesLayer) return;
    const particle = document.createElement('div');
    particle.className = 'floating-particle';
    particle.innerText = emojis[Math.floor(Math.random() * emojis.length)];
    
    // Random sizes, positions and delays
    const size = Math.random() * 1.5 + 1; // 1rem to 2.5rem
    particle.style.fontSize = `${size}rem`;
    particle.style.left = `${Math.random() * 100}vw`;
    
    // Bottom start position
    particle.style.bottom = `-50px`;
    
    // Duration
    const duration = Math.random() * 12 + 8; // 8s to 20s
    particle.style.animationDuration = `${duration}s`;
    
    // Add to body
    particlesLayer.appendChild(particle);

    // Cleanup after animation completes
    setTimeout(() => {
      particle.remove();
    }, duration * 1000);
  }

  // Generate particles periodically
  setInterval(createParticle, 1200);
  // Spawn a few initial ones
  for (let i = 0; i < 10; i++) {
    setTimeout(createParticle, i * 300);
  }

  // ─── 4. PARALLAX BACKDROP SCROLL EFFECTS ───
  const parallaxLayers = document.querySelectorAll('.parallax-bg');
  
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    
    // Standard parallax shift for decorated elements
    parallaxLayers.forEach(layer => {
      const speed = parseFloat(layer.getAttribute('data-speed')) || 0.15;
      const yOffset = -(scrollY * speed);
      layer.style.transform = `translateY(${yOffset}px)`;
    });
  });

  // ─── 5. SCROLL ENTRY ANIMATIONS (INTERSECTION OBSERVER) ───
  const revealElements = document.querySelectorAll('.scroll-reveal');
  
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        // If it's a counter block, start counting!
        const counters = entry.target.querySelectorAll('.counter-value');
        counters.forEach(counter => {
          if (!counter.classList.contains('counted')) {
            startCounterAnimation(counter);
          }
        });
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // ─── 6. SCROLL TRIGGERED COUNTERS ───
  function startCounterAnimation(counter) {
    counter.classList.add('counted');
    const target = parseInt(counter.getAttribute('data-target'), 10);
    const suffix = counter.getAttribute('data-suffix') || '';
    const duration = 2000; // 2 seconds
    const start = 0;
    const startTime = performance.now();

    function updateCounter(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing out quadratic
      const easeProgress = progress * (2 - progress);
      const currentValue = Math.floor(easeProgress * target);
      
      counter.innerText = currentValue + suffix;

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        counter.innerText = target + suffix;
      }
    }

    requestAnimationFrame(updateCounter);
  }

  // ─── 7. STICKY NAV SMOOTH ACTIVE HIGHLIGHTS ───
  const sections = document.querySelectorAll('section, #hero-pin');
  const navLinks = document.querySelectorAll('.nav-link');

  function updateActiveNav() {
    let currentSectionId = '';
    const scrollPos = window.scrollY + 250; // offset for nav height

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        if (section.id === 'hero-pin') {
          currentSectionId = 'home';
        } else {
          currentSectionId = section.getAttribute('id');
        }
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('data-section') === currentSectionId) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', updateActiveNav, { passive: true });
  updateActiveNav();

  // ─── 8. INTERACTIVE LOCATION ACCESS & MAP SYSTEM ───
  const btnStore = document.getElementById('btn-store');
  const locationModal = document.getElementById('location-modal');
  const modalCard = document.getElementById('modal-card');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const closeModalDesktopBtn = document.getElementById('close-modal-desktop-btn');
  const btnDetectLocation = document.getElementById('btn-detect-location');
  const searchForm = document.getElementById('search-location-form');
  const inputSearch = document.getElementById('input-city-search');
  const hotspotBtns = document.querySelectorAll('.hotspot-btn');
  const mapIframe = document.getElementById('store-locator-map');
  const mapLoader = document.getElementById('map-loader-spinner');

  // Default fallback query: Amul Parlour Headquarters in Gujarat
  const DEFAULT_MAP_QUERY = "Amul Parlour Anand Gujarat";

  function openLocationModal() {
    locationModal.classList.remove('hidden');
    locationModal.classList.add('flex');
    setTimeout(() => {
      modalCard.classList.remove('scale-95');
      modalCard.classList.add('scale-100');
    }, 50);

    // Load default map search if no location is loaded yet
    if (mapIframe.src === 'about:blank' || !mapIframe.src) {
      loadMapQuery(DEFAULT_MAP_QUERY);
    }
  }

  function closeLocationModal() {
    modalCard.classList.remove('scale-100');
    modalCard.classList.add('scale-95');
    setTimeout(() => {
      locationModal.classList.remove('flex');
      locationModal.classList.add('hidden');
    }, 300);
  }

  // Load a dynamic maps embed URL securely and show load state
  function loadMapQuery(query) {
    mapLoader.classList.remove('hidden');
    mapLoader.classList.add('flex');
    
    // Embed URL structure utilizing Google's free search parameters
    const searchUrl = `https://maps.google.com/maps?q=${encodeURIComponent(query + " Amul")}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
    mapIframe.src = searchUrl;
  }

  // Hide loader spinner once maps iframe is fully parsed
  mapIframe.addEventListener('load', () => {
    mapLoader.classList.remove('flex');
    mapLoader.classList.add('hidden');
  });

  // Open modal on main CTA click
  if (btnStore) {
    btnStore.addEventListener('click', (e) => {
      e.preventDefault();
      openLocationModal();
    });
  }

  // Add click support to navbar Buy Now button just in case
  const ctaBuyNav = document.getElementById('cta-buy-nav');
  const heroCta = document.getElementById('hero-cta');

  // Close triggers
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeLocationModal);
  if (closeModalDesktopBtn) closeModalDesktopBtn.addEventListener('click', closeLocationModal);
  
  // Close modal when tapping background backdrop
  locationModal.addEventListener('click', (e) => {
    if (e.target === locationModal) {
      closeLocationModal();
    }
  });

  // Geolocation detector action
  if (btnDetectLocation) {
    btnDetectLocation.addEventListener('click', () => {
      btnDetectLocation.disabled = true;
      btnDetectLocation.innerHTML = `<span class="material-icons animate-spin text-lg">sync</span> Fetching GPS...`;
      
      if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser. Please type your city manually below!");
        resetDetectBtn();
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          // Formulate hyper-accurate geo query that Google Maps will search inside user location
          const query = `Amul Parlour near ${lat},${lng}`;
          loadMapQuery(query);
          
          btnDetectLocation.innerHTML = `<span class="material-icons text-lg">check</span> Found Nearby Parlours!`;
          btnDetectLocation.classList.remove('bg-primary');
          btnDetectLocation.classList.add('bg-green-600');
          
          setTimeout(() => {
            resetDetectBtn();
          }, 3000);
        },
        (error) => {
          let msg = "Could not fetch your coordinates. Please search manually in the search bar below!";
          if (error.code === error.PERMISSION_DENIED) {
            msg = "Location permission denied. Please search manually below!";
          }
          alert(msg);
          resetDetectBtn();
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    });
  }

  function resetDetectBtn() {
    if (!btnDetectLocation) return;
    btnDetectLocation.disabled = false;
    btnDetectLocation.innerHTML = `<span class="material-icons text-lg">my_location</span> Use My Live Location`;
    btnDetectLocation.classList.remove('bg-green-600');
    btnDetectLocation.classList.add('bg-primary');
  }

  // Handle address manual searches
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = inputSearch.value.trim();
      if (val) {
        loadMapQuery(`Amul Parlour in ${val}`);
      }
    });
  }

  // Handle hotspot quick-select lists
  hotspotBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const q = btn.getAttribute('data-query');
      if (q) {
        loadMapQuery(q);
        
        // Visual indicator checkmark
        hotspotBtns.forEach(b => b.classList.remove('border-primary', 'bg-rose-50/40'));
        btn.classList.add('border-primary', 'bg-rose-50/40');
      }
    });
  });

  // ─── 9. HORIZONTAL GALLERY SLIDE CONTROLS ───
  const galleryTrack = document.getElementById('gallery-track');
  const prevBtn = document.getElementById('gallery-prev-btn');
  const nextBtn = document.getElementById('gallery-next-btn');

  if (galleryTrack && prevBtn && nextBtn) {
    const scrollAmount = 340; // width of card wrapper + gap approx
    
    prevBtn.addEventListener('click', () => {
      galleryTrack.scrollBy({
        left: -scrollAmount,
        behavior: 'smooth'
      });
    });

    nextBtn.addEventListener('click', () => {
      galleryTrack.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    });

    // Optionally hide/show buttons if at the absolute start or end of the track
    const handleScrollButtons = () => {
      const scrollLeft = galleryTrack.scrollLeft;
      const maxScroll = galleryTrack.scrollWidth - galleryTrack.clientWidth;
      
      // Keep them cute and responsive
      if (scrollLeft <= 5) {
        prevBtn.style.opacity = '0.2';
        prevBtn.style.pointerEvents = 'none';
      } else {
        prevBtn.style.opacity = '';
        prevBtn.style.pointerEvents = '';
      }

      if (scrollLeft >= maxScroll - 5) {
        nextBtn.style.opacity = '0.2';
        nextBtn.style.pointerEvents = 'none';
      } else {
        nextBtn.style.opacity = '';
        nextBtn.style.pointerEvents = '';
      }
    };

    galleryTrack.addEventListener('scroll', handleScrollButtons);
    // Trigger initial check
    setTimeout(handleScrollButtons, 500);
  }

  // ─── 10. FLAVOR EXPLORER INTERACTION ───
  const flavorBtns = document.querySelectorAll('.flavor-explorer-btn');
  const flavorDetailBox = document.getElementById('flavor-detail-box');
  
  const flavorData = {
    Badam: `
      <span class="font-bold text-amber-600 block mb-1">🌰 Amul Kool Badam</span>
      <span class="text-text-light/75 dark:text-text-dark/75 leading-relaxed">
        Wholesome almond crunch combined with cold dairy nutrition. A classic energizer preferred across college canteens during heavy study days!
      </span>
    `,
    Kesar: `
      <span class="font-bold text-yellow-600 block mb-1">💛 Amul Kool Kesar</span>
      <span class="text-text-light/75 dark:text-text-dark/75 leading-relaxed">
        Infused with real royal saffron threads. Balanced traditional wellness meets dairy goodness in a beautifully chilled golden draft.
      </span>
    `,
    Mango: `
      <span class="font-bold text-orange-600 block mb-1">🥭 Amul Kool Mango</span>
      <span class="text-text-light/75 dark:text-text-dark/75 leading-relaxed">
        Bursting with thick tropical Alphonso mango pulp. The ultimate summer picnic vacation thrill packed into every sweet cold sip!
      </span>
    `,
    Rose: `
      <span class="font-bold text-primary block mb-1">🌸 Amul Kool Rose (Exotic Special)</span>
      <span class="text-text-light/75 dark:text-text-dark/75 font-semibold leading-relaxed">
        Crafted from premium hand-picked organic rose water distillations. Highly calming, naturally cooling, and exceptionally premium. The reigning special choice!
      </span>
    `
  };

  flavorBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const f = btn.getAttribute('data-flavor');
      if (f && flavorData[f]) {
        flavorDetailBox.innerHTML = flavorData[f];
        flavorBtns.forEach(b => b.classList.remove('border-primary', 'border-amber-300', 'border-yellow-400', 'border-orange-400', 'bg-rose-50/20'));
        
        // Highlight chosen card dynamically
        if (f === 'Rose') {
          btn.classList.add('border-primary', 'bg-rose-50/20');
        } else {
          btn.classList.add('border-primary');
        }
      }
    });
  });

  // ─── 11. SNACK PAIRINGS ENGINE ───
  const pairingBtns = document.querySelectorAll('.pairing-btn');
  const pairingDisplay = document.getElementById('pairing-display');

  const pairingData = {
    Samosa: `
      <strong>🥟 Samosa + Exotic Rose</strong><br/><br/>
      Spicy, flaky potato filling meets sweet floral dairy chill. The ultimate balance of hot Indian street spices and soothing milk cooling vibes! Perfect during cricket matches.
    `,
    Biryani: `
      <strong>🍛 Biryani + Exotic Rose</strong><br/><br/>
      A rich, heavily spiced Mughal feast paired with a refreshing floral breeze. Perfect to soothe your palate after a fiery, spicy spoonful of biryani!
    `,
    Jalebi: `
      <strong>🥨 Jalebi + Exotic Rose</strong><br/><br/>
      Double the royal sweetness! Hot crispy syrup loops combined with silky cold rose essence. A legendary cheat-day combo that will make you bounce!
    `
  };

  pairingBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const snack = btn.getAttribute('data-snack');
      if (snack && pairingData[snack]) {
        pairingDisplay.innerHTML = pairingData[snack];
        pairingBtns.forEach(b => b.classList.remove('border-primary', 'bg-rose-50/20'));
        btn.classList.add('border-primary', 'bg-rose-50/20');
      }
    });
  });

  // ─── 12. DYNAMIC ROTATING PERSONALITY QUIZ & CUSTOM EDITOR ───
  const btnResetQuiz = document.getElementById('btn-reset-quiz');
  const btnToggleQuizEditor = document.getElementById('btn-toggle-quiz-editor');
  const toggleQuizEditorText = document.getElementById('toggle-quiz-editor-text');
  const quizSlide = document.getElementById('quiz-slide');
  const quizEditor = document.getElementById('quiz-editor');
  const quizEditorForm = document.getElementById('quiz-editor-form');

  const defaultQuestions = [
    {
      q: "What's your ultimate summer cool-down vibe?",
      optA: "Chilling under an air conditioner",
      optB: "Walking through a blooming rose garden"
    },
    {
      q: "How do you handle extremely spicy food?",
      optA: "Just gulp down plain cold water",
      optB: "Need a luxurious, cooling rose-milk shake"
    },
    {
      q: "Pick your dream summer travel destination:",
      optA: "A deep, dark misty pine forest cabin",
      optB: "A golden, royal palace courtyard in Jaipur"
    }
  ];

  let quizScore = 0;
  let currentStep = 1;
  let activeQuestions = [];

  function initializeQuiz() {
    quizScore = 0;
    currentStep = 1;
    if (btnResetQuiz) btnResetQuiz.classList.add('hidden');

    // Retrieve custom questions from local storage
    let customQuestions = [];
    try {
      const customSaved = localStorage.getItem('customQuizQuestions');
      if (customSaved) {
        customQuestions = JSON.parse(customSaved);
      }
    } catch (err) {
      customQuestions = [];
    }

    // Merge default + custom questions
    activeQuestions = [...defaultQuestions, ...customQuestions];

    // Render questions HTML dynamically
    let quizHtml = "";
    activeQuestions.forEach((qObj, index) => {
      const stepIdx = index + 1;
      const displayClass = stepIdx === 1 ? "" : "hidden";
      quizHtml += `
        <div class="quiz-step ${displayClass}" data-step="${stepIdx}">
          <div class="font-bold text-xs text-text-light/50 dark:text-text-dark/50 mb-1 uppercase tracking-wider">
            Question ${stepIdx} of ${activeQuestions.length}
          </div>
          <h4 class="font-bold text-sm text-text-light dark:text-text-dark mb-4">${qObj.q}</h4>
          <div class="space-y-2">
            <button class="quiz-option w-full text-left p-2.5 bg-rose-50/20 dark:bg-rose-900/5 hover:bg-rose-500/10 rounded-xl text-xs transition-colors" data-points="1">
              ${qObj.optA}
            </button>
            <button class="quiz-option w-full text-left p-2.5 bg-rose-50/20 dark:bg-rose-900/5 hover:bg-rose-500/10 rounded-xl text-xs transition-colors" data-points="3">
              ${qObj.optB}
            </button>
          </div>
        </div>
      `;
    });

    if (quizSlide) {
      quizSlide.innerHTML = quizHtml;
      
      // Bind click triggers
      const options = quizSlide.querySelectorAll('.quiz-option');
      options.forEach(opt => {
        opt.addEventListener('click', () => {
          quizScore += parseInt(opt.getAttribute('data-points'), 10);
          
          const activeDiv = quizSlide.querySelector(`.quiz-step[data-step="${currentStep}"]`);
          if (activeDiv) activeDiv.classList.add('hidden');
          
          currentStep++;

          const nextDiv = quizSlide.querySelector(`.quiz-step[data-step="${currentStep}"]`);
          if (nextDiv) {
            nextDiv.classList.remove('hidden');
          } else {
            displayQuizResult();
          }
        });
      });
    }
  }

  function displayQuizResult() {
    if (btnResetQuiz) btnResetQuiz.classList.remove('hidden');
    let title = "";
    let desc = "";

    // Maximum possible score calculation
    const maxScore = activeQuestions.length * 3;
    const threshold = activeQuestions.length * 2;

    if (quizScore >= threshold) {
      title = "🌹 100% Exotic Rose Kool! 🌹";
      desc = "You appreciate the finer, royal things in life! You love luxurious heritage, traditional cooling vibes, and fine floral aesthetics. Keep being exotic!";
    } else {
      title = "🥛 Classic Amul Kool Fan! 🥛";
      desc = "You appreciate classic comfort, nutty badam, and rich golden kesar vibes. Wholesome, friendly, and always refreshing!";
    }

    if (quizSlide) {
      quizSlide.innerHTML = `
        <div class="text-center py-6 px-4 scroll-reveal" data-animation="fade-in">
          <div class="text-3xl mb-3 animate-bounce-slow">✨</div>
          <h4 class="font-bold text-base text-primary mb-2">${title}</h4>
          <p class="text-xs text-text-light/80 dark:text-text-dark/80 leading-relaxed">${desc}</p>
        </div>
      `;
    }
  }

  if (btnResetQuiz) {
    btnResetQuiz.addEventListener('click', () => {
      initializeQuiz();
    });
  }

  if (btnToggleQuizEditor) {
    btnToggleQuizEditor.addEventListener('click', () => {
      if (quizEditor.classList.contains('hidden')) {
        quizEditor.classList.remove('hidden');
        quizSlide.classList.add('hidden');
        if (toggleQuizEditorText) toggleQuizEditorText.innerText = "Take the Quiz";
        if (btnResetQuiz) btnResetQuiz.classList.add('hidden');
      } else {
        quizEditor.classList.add('hidden');
        quizSlide.classList.remove('hidden');
        if (toggleQuizEditorText) toggleQuizEditorText.innerText = "Add Custom Question";
        initializeQuiz();
      }
    });
  }

  if (quizEditorForm) {
    quizEditorForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const qText = document.getElementById('editor-q-text').value.trim();
      const optA = document.getElementById('editor-opt-a').value.trim();
      const optB = document.getElementById('editor-opt-b').value.trim();
      
      if (qText && optA && optB) {
        let customQuestions = [];
        try {
          const customSaved = localStorage.getItem('customQuizQuestions');
          if (customSaved) {
            customQuestions = JSON.parse(customSaved);
          }
        } catch (err) {
          customQuestions = [];
        }
        
        customQuestions.push({ q: qText, optA: optA, optB: optB });
        localStorage.setItem('customQuizQuestions', JSON.stringify(customQuestions));
        
        quizEditorForm.reset();
        alert("Your custom question has been published successfully! 🚀");
        
        quizEditor.classList.add('hidden');
        quizSlide.classList.remove('hidden');
        if (toggleQuizEditorText) toggleQuizEditorText.innerText = "Add Custom Question";
        
        initializeQuiz();
      }
    });
  }

  // Initialize the quiz on page load
  initializeQuiz();

  // ─── 13. SIGN IN & PERSISTENT UPLOADS HISTORY SYSTEM ───
  const btnSigninNav = document.getElementById('btn-signin-nav');
  const btnSigninMobile = document.getElementById('btn-signin-mobile');
  const signinModal = document.getElementById('signin-modal');
  const signinCard = document.getElementById('signin-card');
  const closeSigninBtn = document.getElementById('close-signin-btn');
  const signinForm = document.getElementById('signin-form');
  const signinUsernameInput = document.getElementById('signin-username');
  const signinBtnText = document.getElementById('signin-btn-text');

  // Profile Modal DOM Elements
  const profileModal = document.getElementById('profile-modal');
  const profileCard = document.getElementById('profile-card');
  const closeProfileBtn = document.getElementById('close-profile-btn');
  const btnProfileLogout = document.getElementById('btn-profile-logout');
  const profileNameDisplay = document.getElementById('profile-name-display');

  function openSigninModal() {
    signinModal.classList.remove('hidden');
    signinModal.classList.add('flex');
    setTimeout(() => {
      signinCard.classList.remove('scale-95');
      signinCard.classList.add('scale-100');
    }, 50);
  }

  function closeSigninModal() {
    signinCard.classList.remove('scale-100');
    signinCard.classList.add('scale-95');
    setTimeout(() => {
      signinModal.classList.remove('flex');
      signinModal.classList.add('hidden');
    }, 300);
  }

  function openProfileModal() {
    const name = localStorage.getItem('username');
    if (profileNameDisplay) profileNameDisplay.innerText = name || 'Name';
    
    populateProfileHistoryGrid();

    if (profileModal) {
      profileModal.classList.remove('hidden');
      profileModal.classList.add('flex');
      setTimeout(() => {
        if (profileCard) {
          profileCard.classList.remove('scale-95');
          profileCard.classList.add('scale-100');
        }
      }, 50);
    }
  }

  function closeProfileModal() {
    if (profileCard) {
      profileCard.classList.remove('scale-100');
      profileCard.classList.add('scale-95');
    }
    setTimeout(() => {
      if (profileModal) {
        profileModal.classList.remove('flex');
        profileModal.classList.add('hidden');
      }
    }, 300);
  }

  function populateProfileHistoryGrid() {
    const grid = document.getElementById('profile-history-grid');
    if (!grid) return;
    
    grid.innerHTML = "";
    
    let history = [];
    try {
      const existing = localStorage.getItem('koolMoments');
      if (existing) {
        history = JSON.parse(existing);
      }
    } catch (err) {
      history = [];
    }
    
    if (history.length === 0) {
      grid.className = "flex items-center justify-center text-center p-4 min-h-[12vh]";
      grid.innerHTML = `
        <div class="text-xs text-text-light/50 dark:text-text-dark/50 leading-relaxed max-w-[280px]">
          <span class="material-icons text-2xl text-primary block mb-1">no_photography</span>
          No shared moments yet. Go share your outings in the Lifestyle Gallery!
        </div>
      `;
    } else {
      grid.className = "grid grid-cols-3 gap-2.5 max-h-[28vh] overflow-y-auto pr-1 nutrition-scroll";
      history.forEach((imgUrl, index) => {
        const item = document.createElement('div');
        item.className = "relative aspect-square rounded-xl overflow-hidden border border-rose-100/50 dark:border-rose-900/10 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300 group/thumb cursor-pointer";
        item.innerHTML = `
          <img src="${imgUrl}" class="w-full h-full object-cover group-hover/thumb:scale-110 transition-transform duration-500" alt="Profile thumbnail ${index + 1}"/>
          <div class="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity">
            <span class="text-[10px] text-white font-bold">#${index + 1}</span>
          </div>
        `;
        grid.appendChild(item);
      });
    }
  }

  function updateSigninUI() {
    const name = localStorage.getItem('username');
    if (name) {
      // User is signed in - ONLY display the raw name as requested
      if (signinBtnText) signinBtnText.innerText = name;
      if (btnSigninMobile) btnSigninMobile.innerText = name;
      
      const navIcon = btnSigninNav ? btnSigninNav.querySelector('.material-icons') : null;
      if (navIcon) navIcon.innerText = 'account_circle';
      
      const mobIcon = btnSigninMobile ? btnSigninMobile.querySelector('.material-icons') : null;
      if (mobIcon) mobIcon.innerText = 'account_circle';
    } else {
      // User is signed out
      if (signinBtnText) signinBtnText.innerText = 'Sign In';
      if (btnSigninMobile) btnSigninMobile.innerText = 'Sign In';
      
      const navIcon = btnSigninNav ? btnSigninNav.querySelector('.material-icons') : null;
      if (navIcon) navIcon.innerText = 'login';
      
      const mobIcon = btnSigninMobile ? btnSigninMobile.querySelector('.material-icons') : null;
      if (mobIcon) mobIcon.innerText = 'login';
    }
  }

  function handleSigninClick() {
    const name = localStorage.getItem('username');
    if (name) {
      openProfileModal();
    } else {
      openSigninModal();
    }
  }

  if (btnSigninNav) btnSigninNav.addEventListener('click', handleSigninClick);
  if (btnSigninMobile) btnSigninMobile.addEventListener('click', handleSigninClick);
  if (closeSigninBtn) closeSigninBtn.addEventListener('click', closeSigninModal);
  
  signinModal.addEventListener('click', (e) => {
    if (e.target === signinModal) {
      closeSigninModal();
    }
  });

  if (closeProfileBtn) closeProfileBtn.addEventListener('click', closeProfileModal);
  if (profileModal) {
    profileModal.addEventListener('click', (e) => {
      if (e.target === profileModal) {
        closeProfileModal();
      }
    });
  }

  if (btnProfileLogout) {
    btnProfileLogout.addEventListener('click', () => {
      localStorage.removeItem('username');
      localStorage.removeItem('koolMoments');
      alert("Signed out successfully. History cleared!");
      window.location.reload();
    });
  }

  if (signinForm) {
    signinForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = signinUsernameInput.value.trim();
      if (val) {
        localStorage.setItem('username', val);
        updateSigninUI();
        closeSigninModal();
        alert(`Welcome to the Kool Club, ${val}! 🌸 You can now share and persist your moments.`);
      }
    });
  }

  // Load existing persistent image upload history on start
  function loadPersistedHistory() {
    try {
      const historyStr = localStorage.getItem('koolMoments');
      if (historyStr) {
        const history = JSON.parse(historyStr);
        history.forEach((imgUrl, idx) => {
          appendMomentCardToGallery(imgUrl, idx + 1);
        });
      }
    } catch (err) {
      console.error("Could not parse Kool Moments history:", err);
    }
  }

  function appendMomentCardToGallery(imgUrl, indexNumber) {
    // Generate beautiful new slide wrapper card dynamically
    const newCard = document.createElement('div');
    newCard.className = 'flip-card-wrapper transition-all duration-700 transform scale-100 translate-y-0';
    newCard.innerHTML = `
      <div class="flip-card">
        <div class="flip-card-front border-2 border-primary">
          <img src="${imgUrl}" alt="Your Kool Moment pic ${indexNumber}"/>
          <div class="flip-front-label bg-primary/80">Kool Moment #${indexNumber} 📸</div>
        </div>
        <div class="flip-card-back bg-gradient-to-tr from-primary to-secondary">
          <p><strong>Cool Outing!</strong></p>
          <p>Thanks for sharing your Amul Kool Moment with the community! 🌸</p>
        </div>
      </div>
    `;
    galleryTrack.appendChild(newCard);
  }

  // File Input Uploader listener
  const fileInput = document.getElementById('moment-uploader');
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      // 1. Verify sign-in bounds first
      const name = localStorage.getItem('username');
      if (!name) {
        alert("Please sign in first to upload and save your Kool Moments!");
        openSigninModal();
        fileInput.value = ""; // reset file selector
        return;
      }

      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const imgUrl = event.target.result;
        
        // 2. Persist image base64 into localStorage history array
        let history = [];
        try {
          const existing = localStorage.getItem('koolMoments');
          if (existing) {
            history = JSON.parse(existing);
          }
        } catch (err) {
          history = [];
        }
        
        history.push(imgUrl);
        localStorage.setItem('koolMoments', JSON.stringify(history));

        // 3. Append card dynamically with pop entrance scale-in
        const newCardIdx = history.length;
        appendMomentCardToGallery(imgUrl, newCardIdx);

        const cards = galleryTrack.querySelectorAll('.flip-card-wrapper');
        const lastCard = cards[cards.length - 1];
        if (lastCard) {
          lastCard.classList.add('scale-0', 'translate-y-12');
          setTimeout(() => {
            lastCard.classList.remove('scale-0', 'translate-y-12');
            lastCard.classList.add('scale-100', 'translate-y-0');
          }, 100);
        }

        // Smoothly scroll the carousel track to the absolute end to reveal the picture!
        setTimeout(() => {
          galleryTrack.scrollTo({
            left: galleryTrack.scrollWidth,
            behavior: 'smooth'
          });
        }, 600);
      };
      reader.readAsDataURL(file);
    });
  }

  // Listen to custom sign-in event from app.js
  window.addEventListener('user-signed-in', () => {
    updateSigninUI();
  });

  // Initialize Sign In status and load historical uploads
  updateSigninUI();
  loadPersistedHistory();
});
