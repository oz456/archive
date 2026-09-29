document.addEventListener("DOMContentLoaded", () => {
    initPhysicsFooter();
});

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

// Close modal on escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
    }
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
            showAngleIndicator: false,
            pixelRatio: window.devicePixelRatio
        }
    });

    Render.run(render);
    const runner = Runner.create();
    Runner.run(runner, engine);

    // Monochromatic aesthetic palette
    const colors = ['#111111', '#1a1a1a', '#222222', '#ffffff'];

    const wallOptions = { 
        isStatic: true, 
        render: { fillStyle: 'transparent' } 
    };

    let ground = Bodies.rectangle(width / 2, height + 25, width * 2, 50, wallOptions);
    let leftWall = Bodies.rectangle(-25, height / 2, 50, height * 2, wallOptions);
    let rightWall = Bodies.rectangle(width + 25, height / 2, 50, height * 2, wallOptions);

    Composite.add(world, [ground, leftWall, rightWall]);

    function createPart(x, y) {
        const type = Math.floor(Math.random() * 4);
        const color = colors[Math.floor(Math.random() * colors.length)];
        const isBright = color === '#ffffff';
        
        const commonOptions = {
            restitution: 0.6,
            friction: 0.1,
            density: 0.05,
            render: { 
                fillStyle: isBright ? 'transparent' : color, 
                strokeStyle: isBright ? '#ffffff' : '#333333', 
                lineWidth: 1 
            }
        };

        let body;
        const scale = (Math.random() * 0.5) + 0.8;

        switch(type) {
            case 0: // Gear/Wheel
                body = Bodies.circle(x, y, 25 * scale, commonOptions);
                break;
            case 1: // Microchip/Block
                body = Bodies.rectangle(x, y, 50 * scale, 40 * scale, commonOptions);
                break;
            case 2: // Structural Beam
                body = Bodies.rectangle(x, y, 90 * scale, 15 * scale, commonOptions);
                break;
            case 3: // Nut/Hex
                body = Bodies.polygon(x, y, 6, 20 * scale, commonOptions);
                break;
        }
        return body;
    }

    // Add initial falling parts sparsely
    const parts = [];
    for (let i = 0; i < 20; i++) {
        parts.push(createPart(
            (Math.random() * (width - 100)) + 50, 
            -Math.random() * 1000 - 100
        ));
    }
    Composite.add(world, parts);

    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
            stiffness: 0.2,
            render: { visible: false }
        }
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
            const newPart = createPart(mousePosition.x, mousePosition.y);
            Composite.add(world, newPart);
        }
    });
}
