const world = document.getElementById('world');
const startBtn = document.getElementById('startBtn');
const scoreDisplay = document.getElementById('score');
const gun = document.getElementById('gun');

let px = 0, pz = 0; 
let rot = 0;        
const speed = 18; // Deixei um pouco mais rápido para compensar o mapa grande
let kills = 0;
const keys = {};

document.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
document.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

startBtn.addEventListener('click', () => {
    document.body.requestPointerLock();
    startBtn.style.display = 'none';
});

document.addEventListener('mousemove', (e) => {
    if (document.pointerLockElement === document.body) {
        rot += e.movementX * 0.15;
    }
});

document.addEventListener('mousedown', () => {
    if (document.pointerLockElement !== document.body) return;

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

function buildMap() {
    // Espalhei as paredes num mapa muito maior
    const mapLayout = [
        { x: 800, z: -1500, ry: 0 },
        { x: -800, z: -1500, ry: 0 },
        { x: 0, z: -2500, ry: 90 },
        { x: 1500, z: -800, ry: 90 },
        { x: -1500, z: -800, ry: 90 },
        { x: 1000, z: 1200, ry: 45 },
        { x: -1000, z: 1200, ry: -45 },
        { x: 2500, z: 0, ry: 0 },
        { x: -2500, z: 0, ry: 0 }
    ];

    mapLayout.forEach(data => {
        let w = document.createElement('div');
        w.className = 'wall';
        w.style.transform = `translate3d(${data.x}px, -50px, ${data.z}px) rotateY(${data.ry}deg)`;
        world.appendChild(w);
    });
}

function spawnBot() {
    let bot = document.createElement('div');
    bot.className = 'bot';
    
    // Bots agora nascem em um raio de 10.000 pixels (Cenário Gigante)
    let bx = (Math.random() - 0.5) * 10000;
    let bz = (Math.random() - 0.5) * 10000;
    
    bot.dataset.x = bx;
    bot.dataset.z = bz;
    bot.dataset.health = 100;
    
    world.appendChild(bot);
}

function gameLoop() {
    const rad = rot * Math.PI / 180;
    const sin = Math.sin(rad);
    const cos = Math.cos(rad);

    let moveX = 0;
    let moveZ = 0;

    // A MÁGICA DA MOVIMENTAÇÃO CORRIGIDA AQUI
    // Agora o W sempre vai na direção da câmera, o S foge da câmera
    if (keys['w']) { moveX += sin; moveZ -= cos; } // Frente
    if (keys['s']) { moveX -= sin; moveZ += cos; } // Trás
    if (keys['a']) { moveX -= cos; moveZ -= sin; } // Esquerda
    if (keys['d']) { moveX += cos; moveZ += sin; } // Direita

    if (moveX !== 0 || moveZ !== 0) {
        const length = Math.sqrt(moveX * moveX + moveZ * moveZ);
        px += (moveX / length) * speed;
        pz += (moveZ / length) * speed;
    }

    // Limites do mapa gigantesco (30 mil / 2 = 15 mil pra cada lado)
    if (px > 14000) px = 14000;
    if (px < -14000) px = -14000;
    if (pz > 14000) pz = 14000;
    if (pz < -14000) pz = -14000;

    world.style.transform = `translateZ(700px) rotateY(${rot}deg) translate3d(${-px}px, 0, ${-pz}px)`;

    document.querySelectorAll('.bot').forEach(b => {
        let bx = parseFloat(b.dataset.x);
        let bz = parseFloat(b.dataset.z);
        
        let dx = px - bx;
        let dz = pz - bz;
        let dist = Math.sqrt(dx * dx + dz * dz);
        
        // Bots agora começam a te caçar quando você chega mais perto que 3000px
        if (dist > 200 && dist < 3000) {
            bx += (dx / dist) * 3; // Eles estão um pouco mais rápidos também
            bz += (dz / dist) * 3;
        }

        b.dataset.x = bx;
        b.dataset.z = bz;
        b.style.transform = `translate3d(${bx}px, 10px, ${bz}px) rotateY(${-rot}deg)`;
    });

    requestAnimationFrame(gameLoop);
}

buildMap();
for (let i = 0; i < 15; i++) spawnBot(); // Coloquei 15 bots no mapa agora!
gameLoop();
