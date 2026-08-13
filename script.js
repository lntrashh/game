const world = document.getElementById('world');
const startBtn = document.getElementById('startBtn');
const scoreDisplay = document.getElementById('score');
const gun = document.getElementById('gun');

// Variáveis do Jogador
let px = 0, pz = 0; 
let rot = 0;        
const speed = 10;   
let kills = 0;
const keys = {};

// Controles do Teclado
document.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
document.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

// Iniciar e Travar o Mouse (Pointer Lock)
startBtn.addEventListener('click', () => {
    document.body.requestPointerLock();
    startBtn.style.display = 'none';
});

// Movimento do Mouse (MOUSE CORRIGIDO AQUI!)
document.addEventListener('mousemove', (e) => {
    if (document.pointerLockElement === document.body) {
        rot += e.movementX * 0.15; // Troquei de - para + para desinverter
    }
});

// Atirar
document.addEventListener('mousedown', () => {
    if (document.pointerLockElement !== document.body) return;

    gun.style.transform = "translateY(40px) rotateX(10deg)";
    setTimeout(() => gun.style.transform = "translateY(0) rotateX(0)", 100);

    const target = document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2);

    if (target && target.classList.contains('bot')) {
        target.dataset.health -= 50;
        
        target.style.backgroundColor = 'white';
        setTimeout(() => { if (target) target.style.backgroundColor = '#e74c3c'; }, 100);

        if (target.dataset.health <= 0) {
            target.remove();
            kills++;
            scoreDisplay.innerText = `Kills: ${kills}`;
            spawnBot(); // Nasce outro
        }
    }
});

// Criar o Cenário (Paredes)
function buildMap() {
    // Lista de paredes: X, Z, e rotação Y
    const mapLayout = [
        { x: 500, z: -500, ry: 0 },
        { x: -500, z: -500, ry: 0 },
        { x: 0, z: -800, ry: 90 },
        { x: 800, z: 0, ry: 90 },
        { x: -800, z: 0, ry: 90 },
        { x: 300, z: 600, ry: 45 },
        { x: -300, z: 600, ry: -45 }
    ];

    mapLayout.forEach(wallData => {
        let w = document.createElement('div');
        w.className = 'wall';
        // A altura (Y) é 0 para alinhar com o chão (150px por causa da perspectiva)
        w.style.transform = `translate3d(${wallData.x}px, 0px, ${wallData.z}px) rotateY(${wallData.ry}deg)`;
        world.appendChild(w);
    });
}

// Sistema de Bots
function spawnBot() {
    let bot = document.createElement('div');
    bot.className = 'bot';
    
    // Nascem mais longe de você
    let bx = (Math.random() - 0.5) * 4000;
    let bz = (Math.random() - 0.5) * 4000;
    
    bot.dataset.x = bx;
    bot.dataset.z = bz;
    bot.dataset.health = 100;
    
    world.appendChild(bot);
}

// Loop Principal
function gameLoop() {
    // Cálculo para andar na direção certa
    const s = Math.sin(rot * Math.PI / 180);
    const c = Math.cos(rot * Math.PI / 180);

    if (keys['w']) { px -= s * speed; pz -= c * speed; }
    if (keys['s']) { px += s * speed; pz += c * speed; }
    if (keys['a']) { px -= c * speed; pz += s * speed; }
    if (keys['d']) { px += c * speed; pz -= s * speed; }

    // Atualiza a Câmera
    world.style.transform = `translateZ(600px) rotateY(${rot}deg) translate3d(${-px}px, 0, ${-pz}px)`;

    // Lógica dos Bots (IA)
    document.querySelectorAll('.bot').forEach(b => {
        let bx = parseFloat(b.dataset.x);
        let bz = parseFloat(b.dataset.z);
        
        // Descobre a distância e a direção até o jogador
        let dx = px - bx;
        let dz = pz - bz;
        let dist = Math.sqrt(dx * dx + dz * dz);
        
        // Se estiver longe, o bot anda na sua direção
        if (dist > 150) {
            bx += (dx / dist) * 2; // O "2" é a velocidade do bot
            bz += (dz / dist) * 2;
        }

        b.dataset.x = bx;
        b.dataset.z = bz;

        // Atualiza no CSS (Eles sempre olham para você usando a rotação invertida da câmera)
        b.style.transform = `translate3d(${bx}px, 70px, ${bz}px) rotateY(${-rot}deg)`;
    });

    requestAnimationFrame(gameLoop);
}

// Inicializa o jogo
buildMap();
for (let i = 0; i < 6; i++) spawnBot();
gameLoop();
