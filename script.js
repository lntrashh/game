const world = document.getElementById('world');
const startBtn = document.getElementById('startBtn');
const scoreDisplay = document.getElementById('score');
const gun = document.getElementById('gun');

// Variáveis do Jogador
let px = 0, pz = 0; 
let rot = 0;        
const speed = 15; // Velocidade ajustada  
let kills = 0;
const keys = {};

// Controles
document.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
document.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

// Travar Mouse
startBtn.addEventListener('click', () => {
    document.body.requestPointerLock();
    startBtn.style.display = 'none';
});

// Girar Câmera
document.addEventListener('mousemove', (e) => {
    if (document.pointerLockElement === document.body) {
        rot += e.movementX * 0.15;
    }
});

// Atirar
document.addEventListener('mousedown', () => {
    if (document.pointerLockElement !== document.body) return;

    // Recuo (Recoil) mais realista para trás e para cima
    gun.style.transform = "translate(20px, 30px) rotate(-5deg)";
    setTimeout(() => gun.style.transform = "translate(0, 0) rotate(0)", 100);

    const target = document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2);

    if (target && target.classList.contains('bot')) {
        target.dataset.health -= 50;
        
        target.style.filter = 'brightness(200%)';
        setTimeout(() => { if (target) target.style.filter = 'none'; }, 100);

        if (target.dataset.health <= 0) {
            target.remove();
            kills++;
            scoreDisplay.innerText = `Kills: ${kills}`;
            spawnBot(); 
        }
    }
});

// Mapa de Paredes
function buildMap() {
    const mapLayout = [
        { x: 500, z: -800, ry: 0 },
        { x: -500, z: -800, ry: 0 },
        { x: 0, z: -1200, ry: 90 },
        { x: 800, z: -400, ry: 90 },
        { x: -800, z: -400, ry: 90 },
        { x: 400, z: 600, ry: 45 },
        { x: -400, z: 600, ry: -45 }
    ];

    mapLayout.forEach(data => {
        let w = document.createElement('div');
        w.className = 'wall';
        // A altura (Y) -50 puxa a parede do chão pra cima
        w.style.transform = `translate3d(${data.x}px, -50px, ${data.z}px) rotateY(${data.ry}deg)`;
        world.appendChild(w);
    });
}

function spawnBot() {
    let bot = document.createElement('div');
    bot.className = 'bot';
    
    // Nascem em um raio aleatório
    let bx = (Math.random() - 0.5) * 3000;
    let bz = (Math.random() - 0.5) * 3000;
    
    bot.dataset.x = bx;
    bot.dataset.z = bz;
    bot.dataset.health = 100;
    
    world.appendChild(bot);
}

// Loop Principal Corrigido
function gameLoop() {
    // Matemática trigonométrica precisa para FPS
    const rad = rot * Math.PI / 180;
    const sin = Math.sin(rad);
    const cos = Math.cos(rad);

    let moveX = 0;
    let moveZ = 0;

    // Detecta intenção de movimento
    if (keys['w']) { moveX -= sin; moveZ -= cos; }
    if (keys['s']) { moveX += sin; moveZ += cos; }
    if (keys['a']) { moveX -= cos; moveZ += sin; }
    if (keys['d']) { moveX += cos; moveZ -= sin; }

    // Normaliza o vetor para não andar mais rápido na diagonal
    if (moveX !== 0 || moveZ !== 0) {
        const length = Math.sqrt(moveX * moveX + moveZ * moveZ);
        px += (moveX / length) * speed;
        pz += (moveZ / length) * speed;
    }

    // Limita para não sair do mapa infinitamente
    if (px > 4500) px = 4500;
    if (px < -4500) px = -4500;
    if (pz > 4500) pz = 4500;
    if (pz < -4500) pz = -4500;

    // Atualiza a Câmera
    world.style.transform = `translateZ(700px) rotateY(${rot}deg) translate3d(${-px}px, 0, ${-pz}px)`;

    // IA dos Bots
    document.querySelectorAll('.bot').forEach(b => {
        let bx = parseFloat(b.dataset.x);
        let bz = parseFloat(b.dataset.z);
        
        let dx = px - bx;
        let dz = pz - bz;
        let dist = Math.sqrt(dx * dx + dz * dz);
        
        // Bots te seguem e encostam no chão (Y = 10)
        if (dist > 200) {
            bx += (dx / dist) * 2.5; 
            bz += (dz / dist) * 2.5;
        }

        b.dataset.x = bx;
        b.dataset.z = bz;
        b.style.transform = `translate3d(${bx}px, 10px, ${bz}px) rotateY(${-rot}deg)`;
    });

    requestAnimationFrame(gameLoop);
}

buildMap();
for (let i = 0; i < 6; i++) spawnBot();
gameLoop();
