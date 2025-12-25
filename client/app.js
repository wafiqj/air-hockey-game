/**
 * Air Hockey Client
 * Handles canvas rendering, paddle control, and WebSocket sync
 */

// ===== Sound Manager using Web Audio API =====
class SoundManager {
    constructor() {
        this.audioContext = null;
        this.enabled = true;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
        } catch (e) {
            console.warn('Web Audio API not supported');
            this.enabled = false;
        }
    }

    playPaddleHit(intensity = 0.5) {
        if (!this.enabled || !this.audioContext) return;

        const ctx = this.audioContext;
        const now = ctx.currentTime;

        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(200 + intensity * 100, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.1);

        gainNode.gain.setValueAtTime(0.3 * Math.min(1, intensity + 0.3), now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.15);

        const noise = ctx.createOscillator();
        const noiseGain = ctx.createGain();

        noise.type = 'square';
        noise.frequency.setValueAtTime(400 + intensity * 200, now);
        noise.frequency.exponentialRampToValueAtTime(50, now + 0.05);

        noiseGain.gain.setValueAtTime(0.15 * Math.min(1, intensity + 0.3), now);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

        noise.connect(noiseGain);
        noiseGain.connect(ctx.destination);

        noise.start(now);
        noise.stop(now + 0.05);
    }

    playWallHit(intensity = 0.5) {
        if (!this.enabled || !this.audioContext) return;

        const ctx = this.audioContext;
        const now = ctx.currentTime;

        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(150 + intensity * 50, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.08);

        gainNode.gain.setValueAtTime(0.15 * Math.min(1, intensity + 0.2), now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.1);
    }

    playGoal(isMyGoal = true) {
        if (!this.enabled || !this.audioContext) return;

        const ctx = this.audioContext;
        const now = ctx.currentTime;

        const frequencies = isMyGoal ? [523, 659, 784] : [392, 330, 262];

        frequencies.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + i * 0.12);

            gainNode.gain.setValueAtTime(0, now + i * 0.12);
            gainNode.gain.linearRampToValueAtTime(0.25, now + i * 0.12 + 0.02);
            gainNode.gain.linearRampToValueAtTime(0.15, now + i * 0.12 + 0.15);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + i * 0.12 + 0.4);

            osc.connect(gainNode);
            gainNode.connect(ctx.destination);

            osc.start(now + i * 0.12);
            osc.stop(now + i * 0.12 + 0.4);
        });
    }

    playWin() {
        if (!this.enabled || !this.audioContext) return;

        const ctx = this.audioContext;
        const now = ctx.currentTime;

        const notes = [523, 523, 523, 698, 880, 784, 698, 880];
        const durations = [0.1, 0.1, 0.1, 0.3, 0.15, 0.15, 0.15, 0.5];

        let time = 0;
        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();

            osc.type = 'square';
            osc.frequency.value = freq;

            gainNode.gain.setValueAtTime(0, now + time);
            gainNode.gain.linearRampToValueAtTime(0.15, now + time + 0.01);
            gainNode.gain.setValueAtTime(0.15, now + time + durations[i] * 0.8);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + time + durations[i]);

            osc.connect(gainNode);
            gainNode.connect(ctx.destination);

            osc.start(now + time);
            osc.stop(now + time + durations[i]);

            time += durations[i];
        });
    }

    playLose() {
        if (!this.enabled || !this.audioContext) return;

        const ctx = this.audioContext;
        const now = ctx.currentTime;

        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.8);

        gainNode.gain.setValueAtTime(0.15, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.8);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.8);
    }

    playStart() {
        if (!this.enabled || !this.audioContext) return;

        const ctx = this.audioContext;
        const now = ctx.currentTime;

        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.setValueAtTime(1200, now + 0.1);
        osc.frequency.setValueAtTime(800, now + 0.2);

        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.2, now + 0.02);
        gainNode.gain.setValueAtTime(0.2, now + 0.25);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.35);
    }

    playClick() {
        if (!this.enabled || !this.audioContext) return;

        const ctx = this.audioContext;
        const now = ctx.currentTime;

        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);

        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.05);
    }
}

// ===== Main Game Client =====
class AirHockeyClient {
    constructor() {
        // Screens
        this.lobbyScreen = document.getElementById('lobbyScreen');
        this.gameScreen = document.getElementById('gameScreen');

        // Canvas setup
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        // State
        this.connected = false;
        this.inRoom = false;
        this.roomCode = null;
        this.clientId = null;
        this.side = null;
        this.viewportOffset = 0;
        this.worldWidth = 1200;
        this.worldHeight = 600;
        this.viewportWidth = 600;

        // Game state
        this.game = {
            puck: { x: 600, y: 300, vx: 0, vy: 0, radius: 25 },
            paddles: {
                left: { x: 100, y: 300, radius: 40 },
                right: { x: 1100, y: 300, radius: 40 }
            },
            score: { left: 0, right: 0 },
            gameStatus: 'waiting'
        };

        this.myPaddleTarget = { x: 0, y: 0 };
        this.goalFlash = null;
        this.sound = new SoundManager();

        // UI Elements
        this.setupUIElements();
        this.setupEventListeners();
        this.connect();

        // Check URL for room code
        this.checkUrlForRoom();
    }

    setupUIElements() {
        // Connection
        this.statusEl = document.getElementById('connectionStatus');
        this.statusTextEl = this.statusEl.querySelector('.status-text');

        // Lobby
        this.createRoomBtn = document.getElementById('createRoomBtn');
        this.joinRoomBtn = document.getElementById('joinRoomBtn');
        this.roomCodeInput = document.getElementById('roomCodeInput');

        // Header room display
        this.roomCodeDisplay = document.getElementById('roomCodeDisplay');
        this.currentRoomCodeEl = document.getElementById('currentRoomCode');
        this.copyRoomBtn = document.getElementById('copyRoomBtn');

        // Game
        this.scoreLeftEl = document.getElementById('scoreLeft');
        this.scoreRightEl = document.getElementById('scoreRight');
        this.playerSideEl = document.getElementById('playerSide');
        this.gameStatusEl = document.getElementById('gameStatus');
        this.overlayEl = document.getElementById('gameOverlay');
        this.overlayTitleEl = document.getElementById('overlayTitle');
        this.overlayMessageEl = document.getElementById('overlayMessage');
        this.shareCodeEl = document.getElementById('shareCode');
        this.shareRoomCodeEl = document.getElementById('shareRoomCode');
        this.restartBtnEl = document.getElementById('restartBtn');
        this.leaveRoomBtn = document.getElementById('leaveRoomBtn');
    }

    checkUrlForRoom() {
        const hash = window.location.hash.slice(1);
        if (hash && hash.length === 4) {
            this.roomCodeInput.value = hash.toUpperCase();
        }
    }

    setupEventListeners() {
        // Sound init on first interaction
        const initSound = () => {
            this.sound.init();
            document.removeEventListener('click', initSound);
            document.removeEventListener('touchstart', initSound);
        };
        document.addEventListener('click', initSound);
        document.addEventListener('touchstart', initSound);

        // Lobby buttons
        this.createRoomBtn.addEventListener('click', () => this.createRoom());
        this.joinRoomBtn.addEventListener('click', () => this.joinRoom());

        // Room code input - auto uppercase and join on enter
        this.roomCodeInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        });
        this.roomCodeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.joinRoom();
        });

        // Copy room code
        this.copyRoomBtn.addEventListener('click', () => this.copyRoomCode());

        // Game controls
        this.restartBtnEl.addEventListener('click', () => {
            this.send({ type: 'restart_game' });
        });

        this.leaveRoomBtn.addEventListener('click', () => this.leaveRoom());

        // Canvas events
        this.canvas.addEventListener('mousemove', (e) => this.onPointerMove(e));
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.onPointerMove(e.touches[0]);
        });
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.onPointerMove(e.touches[0]);
        });

        // Resize
        window.addEventListener('resize', () => {
            if (this.inRoom) this.resizeCanvas();
        });
    }

    // ===== Room Management =====
    createRoom() {
        this.sound.playClick();
        this.send({ type: 'create_room' });
    }

    joinRoom() {
        const code = this.roomCodeInput.value.trim().toUpperCase();
        if (code.length !== 4) {
            this.showToast('Please enter a 4-character room code', 'error');
            return;
        }
        this.sound.playClick();
        this.send({ type: 'join_room', roomId: code });
    }

    leaveRoom() {
        this.sound.playClick();
        this.send({ type: 'leave_room' });
        this.inRoom = false;
        this.roomCode = null;
        this.showLobby();
        window.location.hash = '';
    }

    copyRoomCode() {
        if (this.roomCode) {
            navigator.clipboard.writeText(this.roomCode).then(() => {
                this.showToast('Room code copied!');
            });
        }
    }

    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        if (type === 'error') {
            toast.style.background = '#ff4757';
        }
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2000);
    }

    // ===== Screen Management =====
    showLobby() {
        this.lobbyScreen.style.display = 'flex';
        this.gameScreen.style.display = 'none';
        this.roomCodeDisplay.style.display = 'none';
    }

    showGame() {
        this.lobbyScreen.style.display = 'none';
        this.gameScreen.style.display = 'flex';
        this.roomCodeDisplay.style.display = 'flex';
        this.currentRoomCodeEl.textContent = this.roomCode;
        this.shareRoomCodeEl.textContent = this.roomCode;

        // Setup canvas after display
        setTimeout(() => {
            this.resizeCanvas();
            this.startRenderLoop();
        }, 100);
    }

    // ===== Canvas Setup =====
    resizeCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.ctx.scale(dpr, dpr);
        this.canvasWidth = rect.width;
        this.canvasHeight = rect.height;
    }

    // ===== WebSocket Connection =====
    connect() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}`;

        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
            console.log('WebSocket connected');
            this.connected = true;
            this.updateConnectionStatus('connected');
        };

        this.ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            this.handleMessage(message);
        };

        this.ws.onclose = () => {
            console.log('WebSocket disconnected');
            this.connected = false;
            this.updateConnectionStatus('disconnected');
            setTimeout(() => this.connect(), 3000);
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    }

    send(message) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        }
    }

    handleMessage(message) {
        switch (message.type) {
            case 'room_created':
                this.roomCode = message.roomId;
                this.clientId = message.clientId;
                this.side = message.side;
                this.viewportOffset = message.viewportOffset;
                this.worldWidth = message.worldWidth;
                this.worldHeight = message.worldHeight;
                this.viewportWidth = message.viewportWidth;
                this.game = message.game;
                this.inRoom = true;

                window.location.hash = this.roomCode;
                this.showGame();
                this.updateGameUI();
                break;

            case 'room_joined':
                this.roomCode = message.roomId;
                this.clientId = message.clientId;
                this.side = message.side;
                this.viewportOffset = message.viewportOffset;
                this.worldWidth = message.worldWidth;
                this.worldHeight = message.worldHeight;
                this.viewportWidth = message.viewportWidth;
                this.game = message.game;
                this.inRoom = true;

                window.location.hash = this.roomCode;
                this.showGame();
                this.updateGameUI();
                break;

            case 'room_error':
                this.showToast(message.message, 'error');
                break;

            case 'game_start':
                this.game = message.game;
                this.hideOverlay();
                this.sound.playStart();
                break;

            case 'game_state':
                this.game.puck = message.game.puck;
                this.game.paddles = message.game.paddles;
                this.game.score = message.game.score;
                this.game.gameStatus = message.game.gameStatus;
                this.updateScore();
                break;

            case 'paddle_update':
                if (message.side !== this.side) {
                    this.game.paddles[message.side] = message.paddle;
                }
                break;

            case 'goal':
                this.showGoal(message.scorer, message.winner);
                this.game.score = message.score;
                this.updateScore();
                break;

            case 'player_left':
                this.showOverlay('Opponent disconnected', 'Waiting for a new player...', false, true);
                break;

            case 'sound':
                this.handleSound(message);
                break;
        }
    }

    handleSound(message) {
        switch (message.sound) {
            case 'paddle':
                this.sound.playPaddleHit(message.intensity || 0.5);
                break;
            case 'wall':
                this.sound.playWallHit(message.intensity || 0.3);
                break;
        }
    }

    // ===== UI Updates =====
    updateConnectionStatus(status) {
        this.statusEl.className = 'connection-status ' + status;
        const statusTexts = {
            connected: 'Connected',
            disconnected: 'Disconnected'
        };
        this.statusTextEl.textContent = statusTexts[status] || status;
    }

    updateGameUI() {
        this.playerSideEl.className = 'info-badge ' + this.side;
        this.playerSideEl.querySelector('.badge-value').textContent =
            this.side === 'left' ? '← LEFT' : 'RIGHT →';

        this.updateGameStatus();
        this.updateScore();

        if (this.game.gameStatus === 'waiting') {
            this.showOverlay('Waiting for opponent...', 'Share the room code with a friend!', false, true);
        } else if (this.game.gameStatus === 'playing') {
            this.hideOverlay();
        }
    }

    updateGameStatus() {
        const statusTexts = {
            waiting: 'Waiting',
            playing: 'Playing',
            goal: 'GOAL!',
            finished: 'Game Over'
        };
        this.gameStatusEl.querySelector('.badge-value').textContent =
            statusTexts[this.game.gameStatus] || this.game.gameStatus;
    }

    updateScore() {
        this.scoreLeftEl.textContent = this.game.score.left;
        this.scoreRightEl.textContent = this.game.score.right;
    }

    showOverlay(title, message, showRestart, showShareCode = false) {
        this.overlayTitleEl.textContent = title;
        this.overlayMessageEl.textContent = message;
        this.restartBtnEl.style.display = showRestart ? 'inline-block' : 'none';
        this.shareCodeEl.style.display = showShareCode ? 'inline-flex' : 'none';
        this.overlayEl.classList.remove('hidden');
    }

    hideOverlay() {
        this.overlayEl.classList.add('hidden');
    }

    showGoal(scorer, winner) {
        if (this.goalFlash) {
            this.goalFlash.remove();
        }

        this.goalFlash = document.createElement('div');
        this.goalFlash.className = `goal-flash ${scorer}`;
        this.canvas.parentElement.appendChild(this.goalFlash);

        setTimeout(() => {
            if (this.goalFlash) {
                this.goalFlash.remove();
                this.goalFlash = null;
            }
        }, 600);

        if (winner) {
            const isWinner = winner === this.side;
            const winnerText = isWinner ? '🎉 YOU WIN!' : 'You Lose';
            const winnerMessage = isWinner ?
                'Congratulations! You are the champion!' :
                'Better luck next time!';
            this.showOverlay(winnerText, winnerMessage, true, false);

            if (isWinner) {
                this.sound.playWin();
            } else {
                this.sound.playLose();
            }
        } else {
            this.sound.playGoal(scorer === this.side);
        }
    }

    // ===== Game Input =====
    onPointerMove(event) {
        if (!this.inRoom || !this.connected || this.game.gameStatus === 'waiting') return;

        const rect = this.canvas.getBoundingClientRect();
        const localX = event.clientX - rect.left;
        const localY = event.clientY - rect.top;

        const globalX = this.localToGlobalX(localX);
        const globalY = this.localToGlobalY(localY);

        this.myPaddleTarget = { x: globalX, y: globalY };

        this.send({
            type: 'paddle_move',
            x: globalX,
            y: globalY
        });
    }

    localToGlobalX(localX) {
        return (localX / this.canvasWidth) * this.viewportWidth + this.viewportOffset;
    }

    localToGlobalY(localY) {
        return (localY / this.canvasHeight) * this.worldHeight;
    }

    globalToLocalX(globalX) {
        return ((globalX - this.viewportOffset) / this.viewportWidth) * this.canvasWidth;
    }

    globalToLocalY(globalY) {
        return (globalY / this.worldHeight) * this.canvasHeight;
    }

    scaleX(value) {
        return (value / this.viewportWidth) * this.canvasWidth;
    }

    scaleY(value) {
        return (value / this.worldHeight) * this.canvasHeight;
    }

    // ===== Rendering =====
    startRenderLoop() {
        const render = () => {
            if (this.inRoom) {
                this.render();
            }
            requestAnimationFrame(render);
        };
        render();
    }

    render() {
        if (!this.canvasWidth) return;

        this.drawTable();
        this.drawGoals();
        this.drawCenterMarkings();
        this.drawPaddle(this.game.paddles.left, 'left');
        this.drawPaddle(this.game.paddles.right, 'right');
        this.drawPuck();
    }

    drawTable() {
        const ctx = this.ctx;
        const width = this.canvasWidth;
        const height = this.canvasHeight;

        const gradient = ctx.createRadialGradient(
            width / 2, height / 2, 0,
            width / 2, height / 2, Math.max(width, height)
        );
        gradient.addColorStop(0, '#1e5040');
        gradient.addColorStop(1, '#0d2820');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 4;
        ctx.strokeRect(4, 4, width - 8, height - 8);
    }

    drawGoals() {
        const ctx = this.ctx;
        const goalWidth = 150;
        const goalHeight = this.scaleY(goalWidth);
        const goalY = (this.canvasHeight - goalHeight) / 2;

        if (this.viewportOffset === 0) {
            const gradient = ctx.createLinearGradient(0, 0, 30, 0);
            gradient.addColorStop(0, 'rgba(255, 71, 87, 0.6)');
            gradient.addColorStop(1, 'rgba(255, 71, 87, 0)');

            ctx.fillStyle = gradient;
            ctx.fillRect(0, goalY, 30, goalHeight);

            ctx.strokeStyle = 'rgba(255, 71, 87, 0.8)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(2, goalY);
            ctx.lineTo(2, goalY + goalHeight);
            ctx.stroke();
        }

        if (this.viewportOffset > 0) {
            const gradient = ctx.createLinearGradient(this.canvasWidth, 0, this.canvasWidth - 30, 0);
            gradient.addColorStop(0, 'rgba(55, 66, 250, 0.6)');
            gradient.addColorStop(1, 'rgba(55, 66, 250, 0)');

            ctx.fillStyle = gradient;
            ctx.fillRect(this.canvasWidth - 30, goalY, 30, goalHeight);

            ctx.strokeStyle = 'rgba(55, 66, 250, 0.8)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(this.canvasWidth - 2, goalY);
            ctx.lineTo(this.canvasWidth - 2, goalY + goalHeight);
            ctx.stroke();
        }
    }

    drawCenterMarkings() {
        const ctx = this.ctx;

        const centerGlobalX = this.worldWidth / 2;
        const centerLocalX = this.globalToLocalX(centerGlobalX);

        if (centerLocalX >= 0 && centerLocalX <= this.canvasWidth) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.lineWidth = 3;
            ctx.setLineDash([10, 10]);
            ctx.beginPath();
            ctx.moveTo(centerLocalX, 0);
            ctx.lineTo(centerLocalX, this.canvasHeight);
            ctx.stroke();
            ctx.setLineDash([]);

            const circleRadius = this.scaleX(80);
            ctx.beginPath();
            ctx.arc(centerLocalX, this.canvasHeight / 2, circleRadius, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.font = 'bold 60px Orbitron, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if (this.side === 'left' && this.viewportOffset === 0) {
            ctx.fillText('LEFT', this.canvasWidth / 2, this.canvasHeight / 2);
        } else if (this.side === 'right' && this.viewportOffset > 0) {
            ctx.fillText('RIGHT', this.canvasWidth / 2, this.canvasHeight / 2);
        }
    }

    drawPaddle(paddle, side) {
        const ctx = this.ctx;

        const localX = this.globalToLocalX(paddle.x);
        const localY = this.globalToLocalY(paddle.y);
        const radius = this.scaleX(paddle.radius);

        if (localX + radius < 0 || localX - radius > this.canvasWidth) return;

        const isMyPaddle = side === this.side;
        const color = side === 'left' ? '#ff4757' : '#3742fa';
        const glowColor = side === 'left' ? 'rgba(255, 71, 87, 0.6)' : 'rgba(55, 66, 250, 0.6)';

        ctx.shadowColor = glowColor;
        ctx.shadowBlur = isMyPaddle ? 30 : 15;

        const gradient = ctx.createRadialGradient(
            localX - radius * 0.3, localY - radius * 0.3, 0,
            localX, localY, radius
        );
        gradient.addColorStop(0, this.lightenColor(color, 30));
        gradient.addColorStop(0.7, color);
        gradient.addColorStop(1, this.darkenColor(color, 30));

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(localX, localY, radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(localX, localY, radius * 0.6, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(localX, localY, radius * 0.15, 0, Math.PI * 2);
        ctx.fill();
    }

    drawPuck() {
        const ctx = this.ctx;
        const puck = this.game.puck;

        const localX = this.globalToLocalX(puck.x);
        const localY = this.globalToLocalY(puck.y);
        const radius = this.scaleX(puck.radius);

        if (localX + radius < 0 || localX - radius > this.canvasWidth) return;

        const speed = Math.sqrt(puck.vx * puck.vx + puck.vy * puck.vy);
        if (speed > 5) {
            const blurLength = Math.min(speed * 2, 40);
            const angle = Math.atan2(puck.vy, puck.vx);

            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.beginPath();
            ctx.ellipse(
                localX - Math.cos(angle) * blurLength / 2,
                localY - Math.sin(angle) * blurLength / 2,
                radius + blurLength / 2,
                radius,
                angle,
                0, Math.PI * 2
            );
            ctx.fill();
        }

        ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
        ctx.shadowBlur = 20;

        const gradient = ctx.createRadialGradient(
            localX - radius * 0.3, localY - radius * 0.3, 0,
            localX, localY, radius
        );
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.5, '#e0e0e0');
        gradient.addColorStop(1, '#a0a0a0');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(localX, localY, radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;

        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(localX - radius * 0.25, localY - radius * 0.25, radius * 0.3, 0, Math.PI * 2);
        ctx.fill();
    }

    lightenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min(255, (num >> 16) + amt);
        const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
        const B = Math.min(255, (num & 0x0000FF) + amt);
        return `rgb(${R}, ${G}, ${B})`;
    }

    darkenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max(0, (num >> 16) - amt);
        const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
        const B = Math.max(0, (num & 0x0000FF) - amt);
        return `rgb(${R}, ${G}, ${B})`;
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    window.airHockey = new AirHockeyClient();
});
