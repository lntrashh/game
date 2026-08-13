const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const healthUi = document.getElementById('healthUi');
const weaponUi = document.getElementById('weaponUi');
const scoreUi = document.getElementById('scoreUi');

// Controles
const keys = {};
let mouseX = 0;
let mouseY = 0;
let isShooting = false;

window.addEventListener('keydown', (e) => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', (e) => keys[e.key.toLowerCase()] = false);
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
});
canvas.addEventListener('mousedown', () => isShooting = true);
canvas.addEventListener('mouseup', () => isShooting = false);

// Sistema de Armas
const weapons = {
    '1': { name: 'Pistola', fireRate: 400, damage: 25, speed: 8, color: '#f1c40f', automatic: false },
    '2': { name: 'AK-47', fireRate: 150, damage: 30, speed: 10, color: '#e67e22', automatic: true },
    '3': { name: 'AWP', fireRate: 1200, damage: 100, speed: 15, color: '#ecf0f1', automatic: false }
};

let bullets = [];
let bots = [];
let kills = 0;

// Classe do Jogador
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 20;
        this.speed = 3;
        this.health = 100;
        this.currentWeapon = '1';
        this.lastShot = 0;
        this.shotFired = false; // Para armas semi-automáticas
    }

    update() {
        // Movimentação WASD
        if (keys['w'] && this.y > 0) this.y -= this.speed;
        if (keys['s'] && this.y < canvas.height - this.size) this.y += this.speed;
        if (keys['a'] && this.x > 0) this.x -= this.speed;
        if (keys['d'] && this.x < canvas.width - this.size) this.x += this.speed;

        // Troca de Arma
        if (keys['1']) this.changeWeapon('1');
        if (keys['2']) this.changeWeapon('2');
        if (keys['3']) this.changeWeapon('3');

        // Lógica de Tiro
        const weapon = weapons[this.currentWeapon];
        const now = Date.now();

        if (isShooting) {
            if (now - this.lastShot > weapon.fireRate) {
                if (weapon.automatic || !this.shotFired) {
                    this.shoot(weapon);
                    this.lastShot = now;
                    this.shotFired = true;
                }
            }
        } else {
            this.shotFired = false; // Reseta o gatilho se soltar o mouse
        }
    }

    changeWeapon(key) {
        this.currentWeapon = key;
        weaponUi.innerText = `Arma: ${weapons[key].name} (${key})`;
    }

    shoot(weapon) {
        // Calcula o ângulo em direção ao mouse
        const centerX = this.x + this.size / 2;
        const centerY = this.y + this.size / 2;
        const angle = Math.atan2(mouseY - centerY, mouseX - centerX);

        const dx = Math.cos(angle) * weapon.speed;
        const dy = Math.sin(angle) * weapon.speed;

        bullets.push({ 
            x: centerX, y: centerY, w: 6, h: 6, 
            dx: dx, dy: dy, 
            damage: weapon.damage, 
            color: weapon.color,
            isPlayer: true 
        });
    }

    draw() {
        ctx.fillStyle = '#3498db'; // CT Azul
        ctx.beginPath();
        ctx.arc(this.x + this.size/2, this.y + this.size/2, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Classe do Bot (Inimigo)
class Bot {
    constructor() {
        // Nasce numa borda aleatória
        this.x = Math.random() > 0.5 ? 0 : canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = 20;
        this.speed = 1.2;
        this.health = 100;
        this.lastShot = Date.now() + Math.random() * 2000;
    }

    update(player) {
        // Segue o jogador
        const angle = Math.atan2(player.y - this.y, player.x - this.x);
        this.x += Math.cos(angle) * this.speed;
        this.y += Math.sin(angle) * this.speed;

        // Atira no jogador (chance a cada 1.5s)
        const now = Date.now();
        if (now - this.lastShot > 1500) {
            this.shoot(angle);
            this.lastShot = now;
        }
    }

    shoot(angle) {
        const dx = Math.cos(angle) * 5;
        const dy = Math.sin(angle) * 5;
        bullets.push({ 
            x: this.x + this.size/2, y: this.y + this.size/2, w: 5, h: 5, 
            dx: dx, dy: dy, 
            damage: 15, 
            color: 'red',
            isPlayer: false 
        });
    }

    draw() {
        ctx.fillStyle = '#e74c3c'; // TR Vermelho
        ctx.beginPath();
        ctx.arc(this.x + this.size/2, this.y + this.size/2, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

const player = new Player(canvas.width / 2, canvas.height / 2);

function spawnBot() {
    if (bots.length < 5) { // Máximo de 5 bots na tela
        bots.push(new Bot());
    }
    setTimeout(spawnBot, 2000);
}

// Colisão circular simples
function checkCollision(x1, y1, r1, x2, y2, r2) {
    const dist = Math.hypot(x1 - x2, y1 - y2);
    return dist < r1 + r2;
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (player.health <= 0) {
        ctx.fillStyle = "black";
        ctx.font = "40px Arial";
        ctx.fillText("VOCÊ MORREU! F5 para reiniciar.", 100, canvas.height/2);
        return;
    }

    player.update();
    player.draw();

    // Atualiza Tiros
    for (let i = bullets.length - 1; i >= 0; i--) {
        let b = bullets[i];
        b.x += b.dx;
        b.y += b.dy;

        ctx.fillStyle = b.color;
        ctx.fillRect(b.x - b.w/2, b.y - b.h/2, b.w, b.h);

        // Remove tiros fora da tela
        if (b.x < 0 || b.x > canvas.width || b.y < 0 || b.y > canvas.height) {
            bullets.splice(i, 1);
            continue;
        }

        // Dano no Jogador (Tiro de Bot)
        if (!b.isPlayer && checkCollision(b.x, b.y, b.w/2, player.x + player.size/2, player.y + player.size/2, player.size)) {
            player.health -= b.damage;
            healthUi.innerText = `Vida: ${Math.max(0, player.health)}`;
            bullets.splice(i, 1);
            continue;
        }

        // Dano nos Bots (Tiro do Jogador)
        if (b.isPlayer) {
            for (let j = bots.length - 1; j >= 0; j--) {
                let bot = bots[j];
                if (checkCollision(b.x, b.y, b.w/2, bot.x + bot.size/2, bot.y + bot.size/2, bot.size)) {
                    bot.health -= b.damage;
                    bullets.splice(i, 1);
                    
                    if (bot.health <= 0) {
                        bots.splice(j, 1);
                        kills++;
                        scoreUi.innerText = `Kills: ${kills}`;
                    }
                    break; 
                }
            }
        }
    }

    // Atualiza Bots
    for (let i = bots.length - 1; i >= 0; i--) {
        bots[i].update(player);
        bots[i].draw();
    }

    requestAnimationFrame(gameLoop);
}

// Inicia spawn de bots e o loop do jogo
spawnBot();
gameLoop();
