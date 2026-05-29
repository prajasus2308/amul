// Config parameters
const TOTAL_FRAMES = 202;
const FOLDER_NAME = 'img amul';
const FRAME_PREFIX = 'ezgif-frame-';
const FRAME_EXTENSION = 'jpg';

// State variables
const images = [];
let loadedCount = 0;
let targetFrame = 0;
let currentFrame = 0;
const lerpFactor = 0.08; // Smoothness factor for scroll inertia

// DOM Elements
const canvas = document.getElementById('splash-canvas');
const ctx = canvas.getContext('2d');
const preloader = document.getElementById('preloader');
const loaderBar = document.getElementById('loader-bar');
const loaderPercentageText = document.getElementById('loader-percentage-text');
const heroPin = document.getElementById('hero-pin');
const heroContent = document.getElementById('hero-content');

// 1. Image Preloader
function getFramePath(index) {
  const paddedIndex = String(index).padStart(3, '0');
  return `./${FOLDER_NAME}/${FRAME_PREFIX}${paddedIndex}.${FRAME_EXTENSION}`;
}

function preloadImages() {
  return new Promise((resolve) => {
    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = getFramePath(i);
      img.onload = () => {
        loadedCount++;
        const percentage = Math.floor((loadedCount / TOTAL_FRAMES) * 100);
        loaderBar.style.width = `${percentage}%`;
        loaderPercentageText.innerText = percentage;

        if (loadedCount === TOTAL_FRAMES) {
          setTimeout(() => {
            const storedUser = localStorage.getItem('username');
            if (storedUser) {
              // Bypasses if already logged in
              preloader.classList.add('fade-out');
              document.body.classList.remove('no-scroll');
              resolve();
            } else {
              // Hides loading and prompts sign-in
              const loadingStep = document.getElementById('preloader-loading-step');
              const signinStep = document.getElementById('preloader-signin-step');
              if (loadingStep) loadingStep.classList.add('hidden');
              if (signinStep) {
                signinStep.classList.remove('hidden');
                
                const form = document.getElementById('preloader-signin-form');
                form.addEventListener('submit', (e) => {
                  e.preventDefault();
                  const nameVal = document.getElementById('preloader-username').value.trim();
                  if (nameVal) {
                    localStorage.setItem('username', nameVal);
                    
                    // Dispatch a custom event to notify animations.js to update UI
                    window.dispatchEvent(new CustomEvent('user-signed-in', { detail: { name: nameVal } }));
                    
                    preloader.classList.add('fade-out');
                    document.body.classList.remove('no-scroll');
                    resolve();
                  }
                });
              } else {
                // fallback
                preloader.classList.add('fade-out');
                document.body.classList.remove('no-scroll');
                resolve();
              }
            }
          }, 600); // Small delay to let users see the complete loading screen
        }
      };
      img.onerror = () => {
        console.error(`Failed to load frame ${i} from path: ${img.src}`);
        loadedCount++;
      };
      images.push(img);
    }
  });
}

// 2. Resize Canvas to cover screen (Aspect-Ratio Cover behavior)
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  // Redraw current frame on resize
  drawFrame(Math.round(currentFrame));
}

// Draw the specific frame image onto the canvas (similar to object-fit: cover)
function drawFrame(index) {
  const img = images[index];
  if (!img || !img.complete) return;

  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;
  const imgWidth = img.naturalWidth;
  const imgHeight = img.naturalHeight;

  // Calculate ratio to scale image
  const imgRatio = imgWidth / imgHeight;
  const canvasRatio = canvasWidth / canvasHeight;

  let drawWidth, drawHeight, drawX, drawY;

  if (canvasRatio > imgRatio) {
    // Canvas is wider than image
    drawWidth = canvasWidth;
    drawHeight = canvasWidth / imgRatio;
    drawX = 0;
    drawY = (canvasHeight - drawHeight) / 2;
  } else {
    // Canvas is taller than image
    drawWidth = canvasHeight * imgRatio;
    drawHeight = canvasHeight;
    drawX = (canvasWidth - drawWidth) / 2;
    drawY = 0;
  }

  // Draw to canvas
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
}

// 3. Scroll Tracker
function handleScroll() {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  
  // The pinning range is: from scrollY = 0 to scrollY = pinHeight
  // pinHeight is total height of pin container minus the sticky element height (100vh)
  const pinHeight = heroPin.offsetHeight - window.innerHeight;
  
  if (pinHeight <= 0) return;

  const scrollFraction = Math.max(0, Math.min(1, scrollTop / pinHeight));
  
  // Calculate target frame (0 to TOTAL_FRAMES - 1)
  targetFrame = Math.floor(scrollFraction * (TOTAL_FRAMES - 1));

  // 4. Hero Content Fade Out & Slide Up Interaction
  // Fade out slowly as user scrolls 30% of the section
  if (scrollFraction <= 0.3) {
    const progress = scrollFraction / 0.3; // normalized 0 to 1
    const opacity = 1 - progress;
    const translateY = -50 * progress; // moves up by 50px
    
    heroContent.style.opacity = opacity.toFixed(3);
    heroContent.style.transform = `translateY(${translateY.toFixed(1)}px)`;
    heroContent.style.pointerEvents = opacity < 0.1 ? 'none' : 'auto';
  } else {
    heroContent.style.opacity = '0';
    heroContent.style.transform = 'translateY(-50px)';
    heroContent.style.pointerEvents = 'none';
  }
}

// 5. Smooth Render Animation Loop (Lerp)
function animationLoop() {
  // Lerp equation: Current = Current + (Target - Current) * EaseFactor
  currentFrame += (targetFrame - currentFrame) * lerpFactor;
  
  // Draw the frame
  drawFrame(Math.round(currentFrame));
  
  requestAnimationFrame(animationLoop);
}

// Initialize everything on load
window.addEventListener('DOMContentLoaded', async () => {
  // Preload frames
  await preloadImages();
  
  // Setup sizing
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
  
  // Scroll Listener
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // Trigger once to initialize target frame and opacity states

  // Start canvas lerp loop
  animationLoop();
});
