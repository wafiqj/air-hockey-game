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
2. Buat project baru di [railway.app](https://railway.app)
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
│   ├── package.json
│   └── server.js       # Game server + WebSocket
├── client/
│   ├── index.html      # Lobby + Game UI
│   ├── styles.css
│   └── app.js          # Client logic
└── README.md
```

## 🔧 Environment

```bash
PORT=8080  # Railway sets this automatically
```
