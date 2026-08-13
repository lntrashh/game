// Selecionando os elementos HTML
const gameArea = document.getElementById('gameArea');
const scoreDisplay = document.getElementById('score');
const timeDisplay = document.getElementById('time');
const startBtn = document.getElementById('startBtn');

// Variáveis do jogo
let score = 0;
let timeLeft = 30;
let gameInterval;
let targetTimer;
let isPlaying = false;

// Inicia o jogo ao clicar no botão
startBtn.addEventListener('click', startGame);

function startGame() {
    if (isPlaying) return;
    
    // Reseta status
    isPlaying = true;
    score = 0;
    timeLeft = 30;
    scoreDisplay.textContent = score;
    timeDisplay.textContent = timeLeft;
    startBtn.disabled = true;
    gameArea.innerHTML = ''; // Limpa a arena

    // Inicia o relógio
    gameInterval = setInterval(updateTime, 1000);
    
    // Spawna o primeiro alvo
    spawnTarget();
}

function updateTime() {
    timeLeft--;
    timeDisplay.textContent = timeLeft;
    
    // Fim de jogo quando o tempo acaba
    if (timeLeft <= 0) {
        endGame();
    }
}

function spawnTarget() {
    if (!isPlaying) return;
    
    // Remove o alvo anterior se o jogador tiver errado/demorado
    gameArea.innerHTML = '';

    // Cria um novo elemento div para ser o alvo
    const target = document.createElement('div');
    target.classList.add('target');

    // Calcula uma posição X e Y aleatória dentro da arena
    const maxX = gameArea.clientWidth - 40;
    const maxY = gameArea.clientHeight - 40;
    
    const randomX = Math.floor(Math.random() * maxX) + 20;
    const randomY = Math.floor(Math.random() * maxY) + 20;

    target.style.left = randomX + 'px';
    target.style.top = randomY + 'px';

    // Adiciona o evento de "tiro" (clique) no alvo usando mousedown para resposta mais rápida
    target.addEventListener('mousedown', hitTarget);

    // Coloca o alvo na tela
    gameArea.appendChild(target);

    // Dificuldade dinâmica: os alvos somem mais rápido quanto mais pontos você tem
    // Começa com 1.2 segundos (1200ms) e o limite mínimo é 400ms.
    const delay = Math.max(400, 1200 - (score * 20)); 
    
    // Configura um timer para o alvo sumir e outro aparecer se você não clicar
    targetTimer = setTimeout(spawnTarget, delay);
}

function hitTarget(e) {
    if (!isPlaying) return;
    
    // Aumenta a pontuação
    score++;
    scoreDisplay.textContent = score;
    
    // Cancela o timer que faria o alvo sumir sozinho
    clearTimeout(targetTimer); 
    
    // Spawna o próximo alvo imediatamente após o "flick"
    spawnTarget(); 
}

function endGame() {
    isPlaying = false;
    clearInterval(gameInterval); // Para o relógio
    clearTimeout(targetTimer);   // Para o spawn de alvos
    gameArea.innerHTML = '';     // Limpa o último alvo
    startBtn.disabled = false;
    
    // Calcula um "Rank" baseado nos pontos em 30 segundos
    let rank = "Silver 1";
    if (score > 15) rank = "Gold Nova";
    if (score > 30) rank = "Master Guardian";
    if (score > 45) rank = "Global Elite";

    setTimeout(() => {
        alert(`Fim de jogo!\nKills: ${score}\nSeu Rank: ${rank}`);
    }, 10);
}
