document.addEventListener("DOMContentLoaded", () => {
    initScrollAnimations();
    initCustomCursor();
    initTVNoise('noise-canvas-1', 0.1); // Subtle noise for placeholder
    initZenGarden(); // The 0.000001% footer
});

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

// The 0.000001% Zen Garden
function initZenGarden() {
    const container = document.getElementById('zen-garden');
    if (!container) return;

    const Engine = Matter.Engine,
          Render = Matter.Render,
          Runner = Matter.Runner,
          MouseConstraint = Matter.MouseConstraint,
          Mouse = Matter.Mouse,
          World = Matter.World,
          Bodies = Matter.Bodies;

    const engine = Engine.create();
    
    let width = container.clientWidth;
    let height = container.clientHeight;

    const render = Render.create({
        element: container,
        engine: engine,
        options: {
            width: width,
            height: height,
            background: 'transparent',
            wireframes: false,
            pixelRatio: window.devicePixelRatio
        }
    });

    // The physical representations of Energy, Frequency, Vibration
    const common = { restitution: 0.9, frictionAir: 0.01, density: 0.01 };
    
    // Energy (Red Circle)
    const energy = Bodies.circle(width / 2 - 60, height / 2, 25, {
        ...common,
        render: { fillStyle: '#ff003c' }
    });

    // Frequency (White Triangle)
    const frequency = Bodies.polygon(width / 2, height / 2 - 50, 3, 30, {
        ...common,
        render: { fillStyle: '#ffffff' }
    });

    // Vibration (Outline Square)
    const vibration = Bodies.rectangle(width / 2 + 60, height / 2, 45, 45, {
        ...common,
        render: { fillStyle: 'transparent', strokeStyle: '#555555', lineWidth: 4 }
    });

    const ground = Bodies.rectangle(width / 2, height + 25, width, 50, { isStatic: true, render: { visible: false } });
    const leftWall = Bodies.rectangle(-25, height / 2, 50, height, { isStatic: true, render: { visible: false } });
    const rightWall = Bodies.rectangle(width + 25, height / 2, 50, height, { isStatic: true, render: { visible: false } });

    World.add(engine.world, [energy, frequency, vibration, ground, leftWall, rightWall]);

    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: { stiffness: 0.2, render: { visible: false } }
    });

    World.add(engine.world, mouseConstraint);
    render.mouse = mouse;

    // Fix scrolling interference
    mouseConstraint.mouse.element.removeEventListener("mousewheel", mouseConstraint.mouse.mousewheel);
    mouseConstraint.mouse.element.removeEventListener("DOMMouseScroll", mouseConstraint.mouse.mousewheel);

    Render.run(render);
    const runner = Runner.create();
    Runner.run(runner, engine);

    window.addEventListener('resize', () => {
        width = container.clientWidth;
        height = container.clientHeight;
        render.canvas.width = width;
        render.canvas.height = height;
        Matter.Body.setPosition(ground, { x: width / 2, y: height + 25 });
        Matter.Body.setPosition(rightWall, { x: width + 25, y: height / 2 });
    });
}
