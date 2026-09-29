document.addEventListener("DOMContentLoaded", () => {
    initPhysicsFooter();
    initScrollAnimations();
    initCustomCursor();
});

// Custom Cursor Logic
function initCustomCursor() {
    const dot = document.getElementById('cursor-dot');
    const outline = document.getElementById('cursor-outline');
    
    // Check if device supports hover (ignore on mobile)
    if (window.matchMedia("(hover: none)").matches) {
        dot.style.display = 'none';
        outline.style.display = 'none';
        document.body.style.cursor = 'auto';
        return;
    }

    window.addEventListener('mousemove', (e) => {
        dot.style.left = `${e.clientX}px`;
        dot.style.top = `${e.clientY}px`;
        
        // Slight delay on the outline for that smooth, magnetic feel
        setTimeout(() => {
            outline.style.left = `${e.clientX}px`;
            outline.style.top = `${e.clientY}px`;
        }, 50);
    });

    document.addEventListener('mousedown', () => {
        outline.style.transform = 'translate(-50%, -50%) scale(0.7)';
        dot.style.transform = 'translate(-50%, -50%) scale(1.5)';
    });
    
    document.addEventListener('mouseup', () => {
        outline.style.transform = 'translate(-50%, -50%) scale(1)';
        dot.style.transform = 'translate(-50%, -50%) scale(1)';
    });

    // Hover states for interactables
    const clickables = document.querySelectorAll('a, .project-card, .modal-close');
    clickables.forEach(el => {
        el.addEventListener('mouseenter', () => {
            outline.style.width = '60px';
            outline.style.height = '60px';
            outline.style.backgroundColor = 'rgba(255,51,0,0.1)';
            dot.style.opacity = '0';
        });
        el.addEventListener('mouseleave', () => {
            outline.style.width = '40px';
            outline.style.height = '40px';
            outline.style.backgroundColor = 'transparent';
            dot.style.opacity = '1';
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
    
    // Trigger immediately for items in viewport on load
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

// Physics Sandbox Logic
function initPhysicsFooter() {
    const Engine = Matter.Engine,
          Render = Matter.Render,
          Runner = Matter.Runner,
          MouseConstraint = Matter.MouseConstraint,
          Mouse = Matter.Mouse,
          World = Matter.World,
          Bodies = Matter.Bodies,
          Composite = Matter.Composite;

    const engine = Engine.create();
    const world = engine.world;
    const container = document.getElementById('canvas-container');
    
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

    Render.run(render);
    const runner = Runner.create();
    Runner.run(runner, engine);

    // Deep Dark + Toxic Orange palette
    const colors = ['#0a0a0a', '#111111', '#1a1a1a', '#ff3300'];

    const wallOptions = { isStatic: true, render: { fillStyle: 'transparent' } };

    let ground = Bodies.rectangle(width / 2, height + 25, width * 2, 50, wallOptions);
    let leftWall = Bodies.rectangle(-25, height / 2, 50, height * 2, wallOptions);
    let rightWall = Bodies.rectangle(width + 25, height / 2, 50, height * 2, wallOptions);

    Composite.add(world, [ground, leftWall, rightWall]);

    function createPart(x, y) {
        const type = Math.floor(Math.random() * 4);
        const color = colors[Math.floor(Math.random() * colors.length)];
        const isAccent = color === '#ff3300';
        
        const commonOptions = {
            restitution: 0.5,
            friction: 0.1,
            density: isAccent ? 0.08 : 0.05, // Accent pieces feel heavier
            render: { 
                fillStyle: isAccent ? 'transparent' : color, 
                strokeStyle: isAccent ? '#ff3300' : '#222222', 
                lineWidth: isAccent ? 2 : 1 
            }
        };

        let body;
        const scale = (Math.random() * 0.5) + 0.8;

        switch(type) {
            case 0: body = Bodies.circle(x, y, 25 * scale, commonOptions); break;
            case 1: body = Bodies.rectangle(x, y, 50 * scale, 40 * scale, commonOptions); break;
            case 2: body = Bodies.rectangle(x, y, 90 * scale, 15 * scale, commonOptions); break;
            case 3: body = Bodies.polygon(x, y, 6, 20 * scale, commonOptions); break;
        }
        return body;
    }

    const parts = [];
    for (let i = 0; i < 25; i++) {
        parts.push(createPart((Math.random() * (width - 100)) + 50, -Math.random() * 1000 - 100));
    }
    Composite.add(world, parts);

    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: { stiffness: 0.2, render: { visible: false } }
    });

    Composite.add(world, mouseConstraint);
    render.mouse = mouse;

    mouseConstraint.mouse.element.removeEventListener("mousewheel", mouseConstraint.mouse.mousewheel);
    mouseConstraint.mouse.element.removeEventListener("DOMMouseScroll", mouseConstraint.mouse.mousewheel);

    window.addEventListener('resize', () => {
        width = container.clientWidth;
        height = container.clientHeight;
        render.canvas.width = width;
        render.canvas.height = height;
        Matter.Body.setPosition(ground, { x: width / 2, y: height + 25 });
        Matter.Body.setPosition(rightWall, { x: width + 25, y: height / 2 });
    });

    Matter.Events.on(mouseConstraint, 'mousedown', function(event) {
        const mousePosition = event.mouse.position;
        const bodiesUnderMouse = Matter.Query.point(world.bodies, mousePosition);
        if (bodiesUnderMouse.length === 0) {
            Composite.add(world, createPart(mousePosition.x, mousePosition.y));
        }
    });
}
