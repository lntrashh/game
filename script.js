const world = document.getElementById('world');
const startBtn = document.getElementById('startBtn');
const scoreDisplay = document.getElementById('score');
const gun = document.getElementById('gun');

// Variáveis do Jogador
let px = 0, pz = 0; // Posição (X e Z)
let rot = 0;        // Rotação da câmera (Eixo Y)
const speed = 12;   // Velocidade de movimento
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

// Movimento do Mouse = Girar Câmera
document.addEventListener('mousemove', (e) => {
    if (document.pointerLockElement === document.body) {
        rot -= e.movementX * 0.15; // Sensibilidade do mouse
    }
});

// Atirar
document.addEventListener('mousedown', () => {
    if (document.pointerLockElement !== document.body) return;

    // Animação de recuo da arma (Recoil)
    gun.style.transform = "translateY(40px) rotateX(10deg)";
    setTimeout(() => gun.style.transform = "translateY(0) rotateX(0)", 100);

    // Mágica do Tiro: Pega o elemento HTML exato no centro da tela
    const target = document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2);

    if (target && target.classList.contains('bot')) {
        target.dataset.health -= 50;
        
        // Efeito de tomar dano (piscar branco)
        target.style.backgroundColor = 'white';
        setTimeout(() => { if (target) target.style.backgroundColor = '#e74c3c'; }, 100);

        // Se a vida zerar, elimina o bot
        if (target.dataset.health <= 0) {
            target.remove();
            kills++;
            scoreDisplay.innerText = `Kills: ${kills}`;
            spawnBot(); // Nasce outro
        }
    }
});

// Sistema de Bots
function spawnBot() {
    let bot = document.createElement('div');
    bot.className = 'bot';
    
    // Posição aleatória no mapa
    let bx = (Math.random() - 0.5) * 3000;
    let bz = (Math.random() - 0.5) * 3000;
    
    bot.dataset.x = bx;
    bot.dataset.z = bz;
    bot.dataset.health = 100;
    
    world.appendChild(bot);
}

// Loop Principal do Jogo (Roda 60x por segundo)
function gameLoop() {
    // Cálculo trigonométrico para andar na direção que está olhando
    const s = Math.sin(rot * Math.PI / 180);
    const c = Math.cos(rot * Math.PI / 180);

    if (keys['w']) { px -= s * speed; pz -= c * speed; }
    if (keys['s']) { px += s * speed; pz += c * speed; }
    if (keys['a']) { px -= c * speed; pz += s * speed; }
    if (keys['d']) { px += c * speed; pz -= s * speed; }

    // Move a CÂMERA atualizando o mundo 3D na direção oposta
    world.style.transform = `translateZ(800px) rotateY(${rot}deg) translate3d(${-px}px, 0, ${-pz}px)`;

    // Faz os bots sempre olharem para você (Técnica de Billboarding do DOOM)
    document.querySelectorAll('.bot').forEach(b => {
        let bx = b.dataset.x;
        let bz = b.dataset.z;
        // Y=60 garante que eles fiquem em pé no chão
        b.style.transform = `translate3d(${bx}px, 60px, ${bz}px) rotateY(${-rot}deg)`;
    });

    requestAnimationFrame(gameLoop);
}

// Inicia com 5 bots e começa o loop
for (let i = 0; i < 5; i++) spawnBot();
gameLoop();
