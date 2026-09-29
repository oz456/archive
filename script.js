document.addEventListener("DOMContentLoaded", () => {
    initBootSequence();
    initScrollAnimations();
    initCustomCursor();
    initTVNoise('noise-canvas-1', 0.1); // Subtle noise for placeholder
});

// Boot Sequence
function initBootSequence() {
    const bootScreen = document.getElementById('boot-screen');
    const bootText = document.getElementById('boot-text');
    if (!bootScreen) return;

    // Prevent scrolling during boot
    document.body.style.overflow = 'hidden';
    
    // Simplest loader: A quick system ping
    bootText.innerHTML = 'MK_01<span id="boot-cursor">_</span>';
    const cursor = document.getElementById('boot-cursor');
    
    // Blink cursor
    const blinkInterval = setInterval(() => cursor.style.opacity = cursor.style.opacity == 0 ? 1 : 0, 200);

    // Flash and reveal site after a very short delay
    setTimeout(() => {
        clearInterval(blinkInterval);
        bootScreen.classList.add('crt-off');
        document.body.style.overflow = '';
        setTimeout(() => bootScreen.remove(), 500); // Remove from DOM after flash
    }, 800);
}

// Custom Cursor Logic
function initCustomCursor() {
    const dot = document.getElementById('cursor-dot');
    
    if (window.matchMedia("(hover: none)").matches) {
        dot.style.display = 'none';
        document.body.style.cursor = 'auto';
        return;
    }

    window.addEventListener('mousemove', (e) => {
        dot.style.left = `${e.clientX}px`;
        dot.style.top = `${e.clientY}px`;
    });

    document.addEventListener('mousedown', () => {
        dot.style.transform = 'translate(-50%, -50%) scale(2)';
        dot.style.backgroundColor = 'var(--accent)';
        dot.style.boxShadow = '0 0 15px var(--accent)';
    });
    
    document.addEventListener('mouseup', () => {
        dot.style.transform = 'translate(-50%, -50%) scale(1)';
        dot.style.backgroundColor = 'var(--text-bright)';
        dot.style.boxShadow = '0 0 10px var(--text-bright)';
    });

    const clickables = document.querySelectorAll('a, .project-card, .modal-close');
    clickables.forEach(el => {
        el.addEventListener('mouseenter', () => {
            dot.style.transform = 'translate(-50%, -50%) scale(3)';
            dot.style.mixBlendMode = 'difference';
        });
        el.addEventListener('mouseleave', () => {
            dot.style.transform = 'translate(-50%, -50%) scale(1)';
            dot.style.mixBlendMode = 'normal';
        });
    });
}

// Scroll Reveal Animations
function initScrollAnimations() {
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1 });

    reveals.forEach(reveal => observer.observe(reveal));
    
    setTimeout(() => {
        reveals.forEach(reveal => {
            const rect = reveal.getBoundingClientRect();
            if(rect.top < window.innerHeight) {
                reveal.classList.add('active');
            }
        });
    }, 100);
}

// Modal Logic
function openModal(videoSrc) {
    const modal = document.getElementById('video-modal');
    const video = document.getElementById('modal-video');
    video.src = videoSrc;
    modal.classList.remove('hidden');
    video.play();
}

function closeModal() {
    const modal = document.getElementById('video-modal');
    const video = document.getElementById('modal-video');
    modal.classList.add('hidden');
    video.pause();
    video.src = '';
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
});

// TV Static / Dotish Noise Effect
function initTVNoise(canvasId, intensity = 0.2) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let w, h;
    let noiseData = [];
    let frame = 0;

    const resize = () => {
        w = canvas.width = canvas.parentElement.clientWidth;
        h = canvas.height = canvas.parentElement.clientHeight;
        createNoise();
    };

    const createNoise = () => {
        const idata = ctx.createImageData(w, h);
        const buffer32 = new Uint32Array(idata.data.buffer);
        const len = buffer32.length;

        for (let i = 0; i < len; i++) {
            if (Math.random() < intensity) {
                const shade = Math.floor(Math.random() * 255);
                if (Math.random() > 0.98) {
                    buffer32[i] = 0xff0000ff; // Red
                } else if (Math.random() > 0.98) {
                    buffer32[i] = 0xffff0000; // Blue
                } else {
                    buffer32[i] = (255 << 24) | (shade << 16) | (shade << 8) | shade; // Greyscale
                }
            } else {
                buffer32[i] = (255 << 24) | (10 << 16) | (10 << 8) | 10; // Dark bg
            }
        }
        noiseData.push(idata);
    };

    window.addEventListener('resize', () => {
        noiseData = [];
        resize();
        for(let i=0; i<10; i++) createNoise();
    });

    resize();
    for(let i=0; i<10; i++) createNoise();

    const loop = () => {
        frame = (frame + 1) % noiseData.length;
        ctx.putImageData(noiseData[frame], 0, 0);
        
        ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.1})`;
        ctx.fillRect(0, 0, w, h);
        
        ctx.fillStyle = 'rgba(255,255,255,0.03)';
        const scanlineY = (Date.now() / 10) % h;
        ctx.fillRect(0, scanlineY, w, 10);

        requestAnimationFrame(loop);
    };

    loop();
}


