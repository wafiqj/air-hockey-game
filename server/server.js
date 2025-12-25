const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Configuration
const PORT = process.env.PORT || 8080;
const WORLD_WIDTH = 1200;
const WORLD_HEIGHT = 600;
const VIEWPORT_WIDTH = 600;

// Game constants
const PADDLE_RADIUS = 40;
const PUCK_RADIUS = 25;
const GOAL_WIDTH = 150;
const FRICTION = 0.99;
const MAX_PUCK_SPEED = 25;
const WINNING_SCORE = 7;

// State Management
const rooms = new Map();

// Generate unique 4-character room code
function generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars (0,O,1,I)
    let code;
    do {
        code = '';
        for (let i = 0; i < 4; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
    } while (rooms.has(code));
    return code;
}

// Create HTTP server for serving static files
const server = http.createServer((req, res) => {
    let filePath = path.join(__dirname, '..', 'client', req.url === '/' ? 'index.html' : req.url);

    const extname = path.extname(filePath);
    const contentTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css'
    };

    const contentType = contentTypes[extname] || 'text/plain';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(404);
            res.end('File not found');
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
});

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Initialize game state
function createGameState() {
    return {
        puck: {
            x: WORLD_WIDTH / 2,
            y: WORLD_HEIGHT / 2,
            vx: 0,
            vy: 0,
            radius: PUCK_RADIUS
        },
        paddles: {
            left: {
                x: 100,
                y: WORLD_HEIGHT / 2,
                radius: PADDLE_RADIUS
            },
            right: {
                x: WORLD_WIDTH - 100,
                y: WORLD_HEIGHT / 2,
                radius: PADDLE_RADIUS
            }
        },
        score: {
            left: 0,
            right: 0
        },
        gameStatus: 'waiting',
        lastGoalSide: null,
        winner: null
    };
}

// Create room
function createRoom(roomId) {
    const room = {
        id: roomId,
        clients: [],
        game: createGameState(),
        gameLoop: null
    };
    rooms.set(roomId, room);
    console.log(`Room ${roomId} created. Active rooms: ${rooms.size}`);
    return room;
}

// Get room
function getRoom(roomId) {
    return rooms.get(roomId.toUpperCase());
}

// Assign side to client
function assignSide(room) {
    const leftCount = room.clients.filter(c => c.side === 'left').length;
    const rightCount = room.clients.filter(c => c.side === 'right').length;

    return leftCount <= rightCount ? 'left' : 'right';
}

// Broadcast to all clients in room
function broadcastToRoom(room, message) {
    const messageStr = JSON.stringify(message);
    room.clients.forEach(client => {
        if (client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(messageStr);
        }
    });
}

// Physics update
function updatePhysics(room) {
    const game = room.game;
    const puck = game.puck;

    if (game.gameStatus !== 'playing') return;

    // Apply velocity
    puck.x += puck.vx;
    puck.y += puck.vy;

    // Apply friction
    puck.vx *= FRICTION;
    puck.vy *= FRICTION;

    // Clamp speed
    const speed = Math.sqrt(puck.vx * puck.vx + puck.vy * puck.vy);
    if (speed > MAX_PUCK_SPEED) {
        puck.vx = (puck.vx / speed) * MAX_PUCK_SPEED;
        puck.vy = (puck.vy / speed) * MAX_PUCK_SPEED;
    }

    // Wall collisions (top and bottom)
    let wallHit = false;
    if (puck.y - puck.radius < 0) {
        puck.y = puck.radius;
        puck.vy = -puck.vy * 0.9;
        wallHit = true;
    }
    if (puck.y + puck.radius > WORLD_HEIGHT) {
        puck.y = WORLD_HEIGHT - puck.radius;
        puck.vy = -puck.vy * 0.9;
        wallHit = true;
    }
    if (wallHit) {
        broadcastToRoom(room, { type: 'sound', sound: 'wall', intensity: speed / MAX_PUCK_SPEED });
    }

    // Goal detection
    const goalTop = (WORLD_HEIGHT - GOAL_WIDTH) / 2;
    const goalBottom = (WORLD_HEIGHT + GOAL_WIDTH) / 2;

    // Left goal (right player scores)
    if (puck.x - puck.radius < 0) {
        if (puck.y > goalTop && puck.y < goalBottom) {
            game.score.right++;
            game.lastGoalSide = 'right';
            handleGoal(room, 'right');
            return;
        } else {
            puck.x = puck.radius;
            puck.vx = -puck.vx * 0.9;
            broadcastToRoom(room, { type: 'sound', sound: 'wall', intensity: speed / MAX_PUCK_SPEED });
        }
    }

    // Right goal (left player scores)
    if (puck.x + puck.radius > WORLD_WIDTH) {
        if (puck.y > goalTop && puck.y < goalBottom) {
            game.score.left++;
            game.lastGoalSide = 'left';
            handleGoal(room, 'left');
            return;
        } else {
            puck.x = WORLD_WIDTH - puck.radius;
            puck.vx = -puck.vx * 0.9;
            broadcastToRoom(room, { type: 'sound', sound: 'wall', intensity: speed / MAX_PUCK_SPEED });
        }
    }

    // Paddle collisions
    ['left', 'right'].forEach(side => {
        const paddle = game.paddles[side];
        const dx = puck.x - paddle.x;
        const dy = puck.y - paddle.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = puck.radius + paddle.radius;

        if (dist < minDist) {
            const angle = Math.atan2(dy, dx);
            const overlap = minDist - dist;

            puck.x += Math.cos(angle) * overlap;
            puck.y += Math.sin(angle) * overlap;

            const nx = dx / dist;
            const ny = dy / dist;
            const relVel = puck.vx * nx + puck.vy * ny;

            puck.vx -= 2 * relVel * nx;
            puck.vy -= 2 * relVel * ny;

            if (paddle.lastVx !== undefined) {
                puck.vx += paddle.lastVx * 0.5;
                puck.vy += paddle.lastVy * 0.5;
            }

            puck.vx *= 1.1;
            puck.vy *= 1.1;

            const hitStrength = Math.sqrt(puck.vx * puck.vx + puck.vy * puck.vy) / MAX_PUCK_SPEED;
            broadcastToRoom(room, { type: 'sound', sound: 'paddle', intensity: hitStrength, side: side });
        }
    });

    // Broadcast game state
    broadcastToRoom(room, {
        type: 'game_state',
        game: {
            puck: game.puck,
            paddles: game.paddles,
            score: game.score,
            gameStatus: game.gameStatus
        }
    });
}

function handleGoal(room, scorer) {
    const game = room.game;
    game.gameStatus = 'goal';

    if (game.score.left >= WINNING_SCORE) {
        game.winner = 'left';
        game.gameStatus = 'finished';
    } else if (game.score.right >= WINNING_SCORE) {
        game.winner = 'right';
        game.gameStatus = 'finished';
    }

    broadcastToRoom(room, {
        type: 'goal',
        scorer: scorer,
        score: game.score,
        winner: game.winner
    });

    if (game.gameStatus !== 'finished') {
        setTimeout(() => {
            resetPuck(room, scorer === 'left' ? 'right' : 'left');
            game.gameStatus = 'playing';
        }, 1500);
    }
}

function resetPuck(room, servingSide) {
    const game = room.game;
    game.puck.x = servingSide === 'left' ? WORLD_WIDTH * 0.25 : WORLD_WIDTH * 0.75;
    game.puck.y = WORLD_HEIGHT / 2;
    game.puck.vx = 0;
    game.puck.vy = 0;
}

function startGame(room) {
    if (room.gameLoop) return;

    room.game.gameStatus = 'playing';
    resetPuck(room, 'left');

    room.game.paddles.left = { x: 100, y: WORLD_HEIGHT / 2, radius: PADDLE_RADIUS };
    room.game.paddles.right = { x: WORLD_WIDTH - 100, y: WORLD_HEIGHT / 2, radius: PADDLE_RADIUS };

    room.gameLoop = setInterval(() => updatePhysics(room), 1000 / 60);

    broadcastToRoom(room, {
        type: 'game_start',
        game: room.game
    });
}

function resetGame(room) {
    if (room.gameLoop) {
        clearInterval(room.gameLoop);
        room.gameLoop = null;
    }
    room.game = createGameState();

    const leftPlayers = room.clients.filter(c => c.side === 'left').length;
    const rightPlayers = room.clients.filter(c => c.side === 'right').length;

    if (leftPlayers >= 1 && rightPlayers >= 1) {
        startGame(room);
    }
}

function cleanupRoom(room) {
    if (room.gameLoop) {
        clearInterval(room.gameLoop);
    }
    rooms.delete(room.id);
    console.log(`Room ${room.id} deleted. Active rooms: ${rooms.size}`);
}

// Handle WebSocket connections
wss.on('connection', (ws) => {
    let currentClient = null;
    let currentRoom = null;

    console.log('New client connected');

    ws.on('message', (data) => {
        try {
            const message = JSON.parse(data);

            switch (message.type) {
                case 'create_room': {
                    const roomId = generateRoomCode();
                    currentRoom = createRoom(roomId);

                    const side = 'left'; // Creator is always left
                    const viewportOffset = 0;

                    currentClient = {
                        ws,
                        id: `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        side,
                        viewportOffset
                    };

                    currentRoom.clients.push(currentClient);

                    ws.send(JSON.stringify({
                        type: 'room_created',
                        roomId: roomId,
                        clientId: currentClient.id,
                        side: currentClient.side,
                        viewportOffset: currentClient.viewportOffset,
                        worldWidth: WORLD_WIDTH,
                        worldHeight: WORLD_HEIGHT,
                        viewportWidth: VIEWPORT_WIDTH,
                        game: currentRoom.game
                    }));

                    console.log(`Client ${currentClient.id} created room ${roomId}`);
                    break;
                }

                case 'join_room': {
                    const roomId = (message.roomId || '').toUpperCase();

                    if (!roomId || roomId.length !== 4) {
                        ws.send(JSON.stringify({
                            type: 'room_error',
                            message: 'Invalid room code'
                        }));
                        return;
                    }

                    currentRoom = getRoom(roomId);

                    if (!currentRoom) {
                        ws.send(JSON.stringify({
                            type: 'room_error',
                            message: 'Room not found'
                        }));
                        return;
                    }

                    const side = assignSide(currentRoom);
                    const viewportOffset = side === 'left' ? 0 : VIEWPORT_WIDTH;

                    currentClient = {
                        ws,
                        id: `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        side,
                        viewportOffset
                    };

                    currentRoom.clients.push(currentClient);

                    ws.send(JSON.stringify({
                        type: 'room_joined',
                        roomId: roomId,
                        clientId: currentClient.id,
                        side: currentClient.side,
                        viewportOffset: currentClient.viewportOffset,
                        worldWidth: WORLD_WIDTH,
                        worldHeight: WORLD_HEIGHT,
                        viewportWidth: VIEWPORT_WIDTH,
                        game: currentRoom.game
                    }));

                    console.log(`Client ${currentClient.id} joined room ${roomId} as ${side}`);

                    // Check if we can start the game
                    const leftPlayers = currentRoom.clients.filter(c => c.side === 'left').length;
                    const rightPlayers = currentRoom.clients.filter(c => c.side === 'right').length;

                    if (leftPlayers >= 1 && rightPlayers >= 1 && currentRoom.game.gameStatus === 'waiting') {
                        startGame(currentRoom);
                    }
                    break;
                }

                case 'leave_room': {
                    if (currentRoom && currentClient) {
                        currentRoom.clients = currentRoom.clients.filter(c => c !== currentClient);

                        if (currentRoom.clients.length === 0) {
                            cleanupRoom(currentRoom);
                        } else {
                            currentRoom.game.gameStatus = 'waiting';
                            broadcastToRoom(currentRoom, {
                                type: 'player_left',
                                waiting: true
                            });
                        }

                        currentRoom = null;
                        currentClient = null;
                    }
                    break;
                }

                case 'paddle_move': {
                    if (!currentRoom || !currentClient) return;

                    const paddle = currentRoom.game.paddles[currentClient.side];
                    const prevX = paddle.x;
                    const prevY = paddle.y;

                    const halfWidth = WORLD_WIDTH / 2;
                    let newX = message.x;
                    let newY = message.y;

                    if (currentClient.side === 'left') {
                        newX = Math.max(PADDLE_RADIUS, Math.min(halfWidth - PADDLE_RADIUS, newX));
                    } else {
                        newX = Math.max(halfWidth + PADDLE_RADIUS, Math.min(WORLD_WIDTH - PADDLE_RADIUS, newX));
                    }

                    newY = Math.max(PADDLE_RADIUS, Math.min(WORLD_HEIGHT - PADDLE_RADIUS, newY));

                    paddle.x = newX;
                    paddle.y = newY;

                    paddle.lastVx = newX - prevX;
                    paddle.lastVy = newY - prevY;

                    broadcastToRoom(currentRoom, {
                        type: 'paddle_update',
                        side: currentClient.side,
                        paddle: paddle
                    });
                    break;
                }

                case 'restart_game': {
                    if (!currentRoom) return;
                    resetGame(currentRoom);
                    break;
                }
            }
        } catch (err) {
            console.error('Error processing message:', err);
        }
    });

    ws.on('close', () => {
        if (currentRoom && currentClient) {
            currentRoom.clients = currentRoom.clients.filter(c => c !== currentClient);
            console.log(`Client ${currentClient.id} disconnected`);

            if (currentRoom.clients.length === 0) {
                cleanupRoom(currentRoom);
            } else {
                const leftPlayers = currentRoom.clients.filter(c => c.side === 'left').length;
                const rightPlayers = currentRoom.clients.filter(c => c.side === 'right').length;

                if (leftPlayers < 1 || rightPlayers < 1) {
                    currentRoom.game.gameStatus = 'waiting';
                    broadcastToRoom(currentRoom, {
                        type: 'player_left',
                        waiting: true
                    });
                }
            }
        }
    });
});

server.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════════════════╗
║           🏒 Air Hockey Server Running                   ║
╠══════════════════════════════════════════════════════════╣
║  URL: http://localhost:${PORT}                             ║
║  World Size: ${WORLD_WIDTH}px x ${WORLD_HEIGHT}px                          ║
║  Winning Score: ${WINNING_SCORE} goals                               ║
║  Room System: Enabled                                    ║
╚══════════════════════════════════════════════════════════╝
    `);
});
