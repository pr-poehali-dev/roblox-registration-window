import { useState, useEffect, useRef, useCallback } from "react";
import Icon from "@/components/ui/icon";

type Screen = "login" | "register" | "forgot" | "game" | "skins" | "3d" | "friends" | "profile" | "support" | "play-islands";

interface User {
  username: string;
  avatar: string;
  level: number;
  bloxcoins: number;
}

interface Friend {
  id: number;
  name: string;
  status: "online" | "offline" | "ingame";
  avatar: string;
  game?: string;
}

interface FriendRequest {
  id: number;
  name: string;
  avatar: string;
}

// ===== GAME CONSTANTS =====
const CANVAS_W = 800;
const CANVAS_H = 420;
const GRAVITY = 0.55;
const JUMP_FORCE = -13;
const MOVE_SPEED = 5;
const PLAYER_W = 32;
const PLAYER_H = 36;

interface Platform {
  x: number;
  y: number;
  w: number;
  h: number;
  checkpoint?: boolean;
  checkpointId?: number;
}

interface GamePlayer {
  x: number;
  y: number;
  vx: number;
  vy: number;
  onGround: boolean;
  checkpointX: number;
  checkpointY: number;
  lastCheckpoint: number;
  dead: boolean;
  deathTimer: number;
}

const PLATFORMS: Platform[] = [
  { x: 0, y: 370, w: 160, h: 20 },
  { x: 220, y: 320, w: 120, h: 18 },
  { x: 400, y: 270, w: 100, h: 18, checkpoint: true, checkpointId: 1 },
  { x: 560, y: 230, w: 90, h: 18 },
  { x: 710, y: 190, w: 80, h: 18 },
  { x: 850, y: 150, w: 100, h: 18, checkpoint: true, checkpointId: 2 },
  { x: 1010, y: 200, w: 80, h: 18 },
  { x: 1150, y: 160, w: 90, h: 18 },
  { x: 1300, y: 120, w: 80, h: 18, checkpoint: true, checkpointId: 3 },
  { x: 1450, y: 80, w: 120, h: 18 },
  { x: 1640, y: 100, w: 90, h: 18 },
  { x: 1800, y: 60, w: 200, h: 20 },
];

const INITIAL_PLAYER: GamePlayer = {
  x: 60, y: 310, vx: 0, vy: 0, onGround: false,
  checkpointX: 60, checkpointY: 310, lastCheckpoint: 0, dead: false, deathTimer: 0,
};

const GAMES = [
  { id: 1, title: "Небесные острова", category: "Платформер", players: "12.4K", rating: 4.9,
    image: "https://cdn.poehali.dev/projects/7d82a088-8a93-4b0c-b9fa-92ab812ad1eb/files/b29c27c1-d977-4b2d-b5bb-a93d5a8c5d74.jpg",
    tag: "🔥 Топ", color: "#7C3AED" },
  { id: 2, title: "Выживание в лесу", category: "Выживание", players: "8.1K", rating: 4.7,
    image: "https://cdn.poehali.dev/projects/7d82a088-8a93-4b0c-b9fa-92ab812ad1eb/files/acfbaf03-6b4a-4792-b114-ccd8e44dad11.jpg",
    tag: "🌿 Новинка", color: "#059669" },
  { id: 3, title: "Нео Гонки", category: "Гонки", players: "21.7K", rating: 4.8,
    image: "https://cdn.poehali.dev/projects/7d82a088-8a93-4b0c-b9fa-92ab812ad1eb/files/cfb68a3f-d54b-49e4-8508-e533ec826b76.jpg",
    tag: "⚡ Хит", color: "#0891B2" },
  { id: 4, title: "Магическое Королевство", category: "RPG", players: "6.3K", rating: 4.6,
    image: "https://cdn.poehali.dev/projects/7d82a088-8a93-4b0c-b9fa-92ab812ad1eb/files/63da0e21-32a4-4e39-829c-122a38084c97.jpg",
    tag: "✨ Популярное", color: "#BE185D" },
];

const SKINS_DATA = [
  { id: 1, name: "Космонавт", rarity: "Легендарный", price: 500, color: "#7C3AED", emoji: "👨‍🚀", owned: true },
  { id: 2, name: "Ниндзя", rarity: "Редкий", price: 200, color: "#0891B2", emoji: "🥷", owned: true },
  { id: 3, name: "Рыцарь", rarity: "Обычный", price: 100, color: "#059669", emoji: "⚔️", owned: false },
  { id: 4, name: "Дракон", rarity: "Мифический", price: 1000, color: "#BE185D", emoji: "🐉", owned: false },
  { id: 5, name: "Пират", rarity: "Редкий", price: 250, color: "#D97706", emoji: "🏴‍☠️", owned: false },
  { id: 6, name: "Робот", rarity: "Эпический", price: 400, color: "#6366F1", emoji: "🤖", owned: true },
];

const INITIAL_FRIENDS: Friend[] = [
  { id: 1, name: "SuperPlayer99", status: "ingame", avatar: "🎮", game: "Небесные острова" },
  { id: 2, name: "NinjaKing", status: "online", avatar: "🥷" },
  { id: 3, name: "DragonSlayer", status: "offline", avatar: "⚔️" },
  { id: 4, name: "StarCraft22", status: "online", avatar: "⭐" },
  { id: 5, name: "CoolDude777", status: "ingame", avatar: "🚀", game: "Нео Гонки" },
];

const FAKE_PLAYERS = ["PixelHero", "BlockMaster", "SkyJumper", "NeonRider", "StarWatcher", "CubeKing", "LavaRunner", "IceWolf"];
const AVATARS = ["🐸", "🦊", "🐺", "🦁", "🐯", "🦅", "🐲", "🤖", "👽", "🧙"];

const MOCK_USER: User = { username: "ГостьИгрок", avatar: "👾", level: 12, bloxcoins: 1250 };

// ===== ISLANDS GAME COMPONENT =====
function IslandsGame({ onBack }: { onBack: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playerRef = useRef<GamePlayer>({ ...INITIAL_PLAYER });
  const keysRef = useRef<Record<string, boolean>>({});
  const cameraXRef = useRef(0);
  const frameRef = useRef(0);
  const activatedCheckpointsRef = useRef<Set<number>>(new Set());
  const [checkpointMsg, setCheckpointMsg] = useState("");
  const [deaths, setDeaths] = useState(0);
  const [won, setWon] = useState(false);
  const [animFrame, setAnimFrame] = useState(0);

  const resetPlayer = useCallback((toCheckpoint = false) => {
    const p = playerRef.current;
    if (toCheckpoint) {
      playerRef.current = {
        ...p,
        x: p.checkpointX, y: p.checkpointY,
        vx: 0, vy: 0, dead: false, deathTimer: 0, onGround: false,
      };
    } else {
      playerRef.current = { ...INITIAL_PLAYER };
      activatedCheckpointsRef.current = new Set();
      cameraXRef.current = 0;
    }
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      keysRef.current[e.code] = e.type === "keydown";
    };
    window.addEventListener("keydown", handleKey);
    window.addEventListener("keyup", handleKey);
    return () => { window.removeEventListener("keydown", handleKey); window.removeEventListener("keyup", handleKey); };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const tick = () => {
      const p = playerRef.current;
      const keys = keysRef.current;

      if (!p.dead && !won) {
        // movement
        if (keys["ArrowLeft"] || keys["KeyA"]) p.vx = -MOVE_SPEED;
        else if (keys["ArrowRight"] || keys["KeyD"]) p.vx = MOVE_SPEED;
        else p.vx *= 0.8;

        if ((keys["ArrowUp"] || keys["KeyW"] || keys["Space"]) && p.onGround) {
          p.vy = JUMP_FORCE;
          p.onGround = false;
        }

        p.vy += GRAVITY;
        p.x += p.vx;
        p.y += p.vy;
        p.onGround = false;

        // platform collision
        for (const pl of PLATFORMS) {
          if (p.x + PLAYER_W > pl.x && p.x < pl.x + pl.w && p.y + PLAYER_H > pl.y && p.y + PLAYER_H < pl.y + pl.h + 12 && p.vy >= 0) {
            p.y = pl.y - PLAYER_H;
            p.vy = 0;
            p.onGround = true;

            if (pl.checkpoint && pl.checkpointId !== undefined && !activatedCheckpointsRef.current.has(pl.checkpointId)) {
              activatedCheckpointsRef.current.add(pl.checkpointId);
              p.checkpointX = pl.x + pl.w / 2 - PLAYER_W / 2;
              p.checkpointY = pl.y - PLAYER_H;
              p.lastCheckpoint = pl.checkpointId;
              setCheckpointMsg(`🚩 Чекпоинт ${pl.checkpointId} сохранён!`);
              setTimeout(() => setCheckpointMsg(""), 2000);
            }
          }
        }

        // death by fall
        if (p.y > CANVAS_H + 100) {
          p.dead = true;
          setDeaths(d => d + 1);
          setTimeout(() => resetPlayer(true), 800);
        }

        // win
        const lastPl = PLATFORMS[PLATFORMS.length - 1];
        if (p.x > lastPl.x + 20 && p.y < lastPl.y + lastPl.h) {
          setWon(true);
        }

        // camera
        const targetCam = p.x - CANVAS_W / 3;
        cameraXRef.current += (targetCam - cameraXRef.current) * 0.1;
        if (cameraXRef.current < 0) cameraXRef.current = 0;
      }

      // ===== DRAW =====
      const cam = cameraXRef.current;
      const t = Date.now() / 1000;

      // sky gradient
      const sky = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
      sky.addColorStop(0, "#0D0820");
      sky.addColorStop(0.5, "#1a0a40");
      sky.addColorStop(1, "#0a1a30");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      // stars
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      for (let i = 0; i < 60; i++) {
        const sx = ((i * 137 + 50) % CANVAS_W);
        const sy = ((i * 97 + 30) % (CANVAS_H * 0.7));
        const ss = Math.sin(t * 2 + i) * 0.5 + 0.5;
        ctx.globalAlpha = 0.3 + ss * 0.5;
        ctx.fillRect(sx, sy, 1.5, 1.5);
      }
      ctx.globalAlpha = 1;

      // clouds (parallax)
      ctx.fillStyle = "rgba(255,255,255,0.04)";
      for (let i = 0; i < 5; i++) {
        const cx2 = ((i * 320 - cam * 0.2 + 2000) % (CANVAS_W + 200)) - 100;
        ctx.beginPath();
        ctx.ellipse(cx2, 60 + i * 25, 80, 30, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // platforms
      for (const pl of PLATFORMS) {
        const px = pl.x - cam;
        if (px > -200 && px < CANVAS_W + 200) {
          const isCheckpoint = pl.checkpoint;
          const activated = isCheckpoint && pl.checkpointId !== undefined && activatedCheckpointsRef.current.has(pl.checkpointId);

          // glow under platform
          const glow = ctx.createRadialGradient(px + pl.w / 2, pl.y + 10, 0, px + pl.w / 2, pl.y + 10, pl.w * 0.6);
          if (isCheckpoint) {
            glow.addColorStop(0, activated ? "rgba(34,197,94,0.3)" : "rgba(255,200,50,0.3)");
            glow.addColorStop(1, "transparent");
          } else {
            glow.addColorStop(0, "rgba(124,58,237,0.25)");
            glow.addColorStop(1, "transparent");
          }
          ctx.fillStyle = glow;
          ctx.fillRect(px - pl.w * 0.3, pl.y - 10, pl.w * 1.6, 40);

          // platform body
          const grad = ctx.createLinearGradient(px, pl.y, px, pl.y + pl.h);
          if (isCheckpoint) {
            grad.addColorStop(0, activated ? "#22C55E" : "#F59E0B");
            grad.addColorStop(1, activated ? "#15803D" : "#B45309");
          } else {
            grad.addColorStop(0, "#6D28D9");
            grad.addColorStop(1, "#3B0764");
          }
          ctx.fillStyle = grad;
          roundRect(ctx, px, pl.y, pl.w, pl.h, 5);
          ctx.fill();

          // top edge highlight
          ctx.fillStyle = isCheckpoint ? (activated ? "rgba(134,239,172,0.5)" : "rgba(252,211,77,0.5)") : "rgba(167,139,250,0.5)";
          ctx.fillRect(px + 4, pl.y, pl.w - 8, 2);

          // flag on checkpoint
          if (isCheckpoint) {
            const flagX = px + pl.w / 2;
            const flagY = pl.y - 28;
            ctx.strokeStyle = activated ? "#22C55E" : "#F59E0B";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(flagX, pl.y);
            ctx.lineTo(flagX, flagY);
            ctx.stroke();
            ctx.fillStyle = activated ? "#22C55E" : "#F59E0B";
            ctx.beginPath();
            ctx.moveTo(flagX, flagY);
            ctx.lineTo(flagX + 14, flagY + 5);
            ctx.lineTo(flagX, flagY + 10);
            ctx.fill();
          }
        }
      }

      // player
      if (!p.dead) {
        const px = p.x - cam;
        const bob = Math.sin(t * 8) * (p.onGround ? 2 : 0);

        // shadow
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.beginPath();
        ctx.ellipse(px + PLAYER_W / 2, p.y + PLAYER_H + 2, PLAYER_W * 0.4, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // body
        const pGrad = ctx.createLinearGradient(px, p.y + bob, px, p.y + PLAYER_H + bob);
        pGrad.addColorStop(0, "#A78BFA");
        pGrad.addColorStop(1, "#7C3AED");
        ctx.fillStyle = pGrad;
        roundRect(ctx, px, p.y + bob, PLAYER_W, PLAYER_H, 8);
        ctx.fill();

        // eyes
        ctx.fillStyle = "#fff";
        ctx.beginPath(); ctx.ellipse(px + 9, p.y + 12 + bob, 4.5, 5, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(px + 23, p.y + 12 + bob, 4.5, 5, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#1E1B4B";
        const eyeDir = p.vx > 0 ? 1 : p.vx < 0 ? -1 : 0;
        ctx.beginPath(); ctx.ellipse(px + 10 + eyeDir, p.y + 13 + bob, 2.5, 3, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(px + 24 + eyeDir, p.y + 13 + bob, 2.5, 3, 0, 0, Math.PI * 2); ctx.fill();

        // smile
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(px + PLAYER_W / 2, p.y + 23 + bob, 6, 0.2, Math.PI - 0.2);
        ctx.stroke();

        // jump squish
        if (!p.onGround) {
          ctx.fillStyle = "rgba(124,58,237,0.3)";
          ctx.beginPath();
          ctx.ellipse(px + PLAYER_W / 2, p.y + PLAYER_H + bob + 2, 10, 3, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // death flash
      if (p.dead) {
        ctx.fillStyle = "rgba(239,68,68,0.15)";
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      }

      // HUD
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      roundRect(ctx, 10, 10, 160, 38, 8);
      ctx.fill();
      ctx.fillStyle = "#F0F2FF";
      ctx.font = "bold 13px Nunito, sans-serif";
      ctx.fillText(`💀 Смерти: ${deaths}`, 20, 28);
      ctx.fillText(`🚩 ЧП: ${p.lastCheckpoint}/3`, 20, 43);

      // controls hint
      ctx.fillStyle = "rgba(0,0,0,0.4)";
      roundRect(ctx, CANVAS_W - 180, 10, 170, 28, 8);
      ctx.fill();
      ctx.fillStyle = "#8B8FAD";
      ctx.font = "11px Nunito, sans-serif";
      ctx.fillText("← → / WASD + ПРОБЕЛ — прыжок", CANVAS_W - 175, 28);

      frameRef.current = requestAnimationFrame(tick);
      setAnimFrame(f => f + 1);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [won, resetPlayer, deaths]);

  return (
    <div className="islands-game-wrap">
      <div className="islands-header">
        <button className="btn-back" onClick={onBack}>← Назад</button>
        <span className="islands-title">🏝️ Небесные острова</span>
        <button className="btn-restart" onClick={() => { resetPlayer(false); setWon(false); setDeaths(0); }}>
          🔄 Заново
        </button>
      </div>

      <div className="canvas-wrap">
        <canvas ref={canvasRef} width={CANVAS_W} height={CANVAS_H} className="game-canvas" />
        {won && (
          <div className="win-overlay">
            <div className="win-content">
              <div className="win-emoji">🏆</div>
              <h2>Ты победил!</h2>
              <p>Смерти: {deaths} · Чекпоинты: 3/3</p>
              <button className="btn-primary" onClick={() => { resetPlayer(false); setWon(false); setDeaths(0); }}>
                Играть снова
              </button>
              <button className="btn-guest" onClick={onBack} style={{ marginTop: 8 }}>
                В меню
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="islands-hint">
        <span>🟣 Фиолетовые острова</span>
        <span>🟡 Чекпоинт (сохраняет позицию)</span>
        <span>🟢 Чекпоинт активирован</span>
        <span>🏁 Долети до последнего острова!</span>
      </div>
    </div>
  );
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ===== MAIN COMPONENT =====
export default function Index() {
  const [screen, setScreen] = useState<Screen>("login");
  const [activeNav, setActiveNav] = useState<Screen>("game");
  const [user, setUser] = useState<User>(MOCK_USER);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ username: "", email: "", password: "", confirm: "" });
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  const [editProfile, setEditProfile] = useState(false);
  const [profileEdit, setProfileEdit] = useState({ username: MOCK_USER.username, password: "" });

  // Friends system
  const [friends, setFriends] = useState<Friend[]>(INITIAL_FRIENDS);
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([
    { id: 101, name: "PixelHero", avatar: "🐸" },
    { id: 102, name: "BlockMaster", avatar: "🦊" },
  ]);
  const [friendSearch, setFriendSearch] = useState("");
  const [searchResult, setSearchResult] = useState<{ name: string; avatar: string } | null>(null);
  const [searchMsg, setSearchMsg] = useState("");
  const [sentRequests, setSentRequests] = useState<string[]>([]);

  const isLoggedIn = screen !== "login" && screen !== "register" && screen !== "forgot";

  const handleLogin = () => {
    if (loginForm.username) setUser({ ...MOCK_USER, username: loginForm.username });
    setScreen("game"); setActiveNav("game");
  };
  const handleGuest = () => { setScreen("game"); setActiveNav("game"); };
  const handleRegister = () => {
    if (registerForm.username) setUser({ ...MOCK_USER, username: registerForm.username });
    setScreen("game"); setActiveNav("game");
  };
  const handleNav = (nav: Screen) => { setScreen(nav); setActiveNav(nav); };

  const statusColor = (s: Friend["status"]) =>
    s === "online" ? "#22C55E" : s === "ingame" ? "#A78BFA" : "#6B7280";
  const statusLabel = (s: Friend["status"]) =>
    s === "online" ? "В сети" : s === "ingame" ? "В игре" : "Не в сети";

  // Friends logic
  const handleSearchFriend = () => {
    const q = friendSearch.trim();
    if (!q) return;
    if (friends.find(f => f.name.toLowerCase() === q.toLowerCase())) {
      setSearchMsg("Этот игрок уже в списке друзей");
      setSearchResult(null);
      return;
    }
    const fake = FAKE_PLAYERS.find(p => p.toLowerCase().includes(q.toLowerCase()));
    if (fake) {
      const av = AVATARS[Math.floor(Math.random() * AVATARS.length)];
      setSearchResult({ name: fake, avatar: av });
      setSearchMsg("");
    } else {
      setSearchResult(null);
      setSearchMsg("Игрок не найден");
    }
  };

  const handleSendRequest = (name: string, avatar: string) => {
    setSentRequests(prev => [...prev, name]);
    setSearchResult(null);
    setFriendSearch("");
    setSearchMsg(`✅ Запрос отправлен игроку ${name}`);
    setTimeout(() => setSearchMsg(""), 3000);
    // simulate auto-accept after 3s
    setTimeout(() => {
      setFriends(prev => [...prev, { id: Date.now(), name, avatar, status: "online" }]);
      setSentRequests(prev => prev.filter(n => n !== name));
    }, 3000);
  };

  const handleAcceptRequest = (req: FriendRequest) => {
    setFriends(prev => [...prev, { id: req.id, name: req.name, avatar: req.avatar, status: "online" }]);
    setIncomingRequests(prev => prev.filter(r => r.id !== req.id));
  };

  const handleDeclineRequest = (id: number) => {
    setIncomingRequests(prev => prev.filter(r => r.id !== id));
  };

  const handleRemoveFriend = (id: number) => {
    setFriends(prev => prev.filter(f => f.id !== id));
  };

  const onlineFriends = friends.filter(f => f.status !== "offline").length;

  return (
    <div className="roblox-app">

      {/* ===== AUTH ===== */}
      {!isLoggedIn && (
        <div className="auth-bg">
          <div className="auth-particles">
            {[...Array(18)].map((_, i) => (
              <div key={i} className="particle" style={{ "--i": i } as React.CSSProperties} />
            ))}
          </div>
          <div className="auth-card">
            <div className="auth-logo">
              <span className="auth-logo-icon">🎮</span>
              <span className="auth-logo-text">BlockWorld</span>
            </div>

            {screen === "login" && (
              <div className="auth-form animate-fade-in">
                <h2 className="auth-title">Добро пожаловать!</h2>
                <p className="auth-sub">Войди и начни играть прямо сейчас</p>
                <div className="field-group">
                  <label className="field-label">Никнейм</label>
                  <input className="field-input" placeholder="Твой никнейм..." value={loginForm.username}
                    onChange={e => setLoginForm({ ...loginForm, username: e.target.value })} />
                </div>
                <div className="field-group">
                  <label className="field-label">Пароль</label>
                  <input className="field-input" type="password" placeholder="Пароль..." value={loginForm.password}
                    onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} />
                </div>
                <button className="btn-primary" onClick={handleLogin}>Войти</button>
                <button className="btn-guest" onClick={handleGuest}>👤 Войти как гость</button>
                <div className="auth-links">
                  <button className="link-btn" onClick={() => setScreen("forgot")}>Забыл пароль?</button>
                  <span className="auth-sep">•</span>
                  <button className="link-btn" onClick={() => setScreen("register")}>Регистрация</button>
                </div>
              </div>
            )}

            {screen === "register" && (
              <div className="auth-form animate-fade-in">
                <h2 className="auth-title">Создай аккаунт</h2>
                <p className="auth-sub">Присоединяйся к миллионам игроков</p>
                <div className="field-group">
                  <label className="field-label">Никнейм</label>
                  <input className="field-input" placeholder="Придумай никнейм..." value={registerForm.username}
                    onChange={e => setRegisterForm({ ...registerForm, username: e.target.value })} />
                </div>
                <div className="field-group">
                  <label className="field-label">Email</label>
                  <input className="field-input" type="email" placeholder="твой@email.com" value={registerForm.email}
                    onChange={e => setRegisterForm({ ...registerForm, email: e.target.value })} />
                </div>
                <div className="field-group">
                  <label className="field-label">Пароль</label>
                  <input className="field-input" type="password" placeholder="Придумай пароль..." value={registerForm.password}
                    onChange={e => setRegisterForm({ ...registerForm, password: e.target.value })} />
                </div>
                <div className="field-group">
                  <label className="field-label">Подтверди пароль</label>
                  <input className="field-input" type="password" placeholder="Повтори пароль..." value={registerForm.confirm}
                    onChange={e => setRegisterForm({ ...registerForm, confirm: e.target.value })} />
                </div>
                <button className="btn-primary" onClick={handleRegister}>Зарегистрироваться</button>
                <button className="link-btn" style={{ marginTop: "8px" }} onClick={() => setScreen("login")}>← Уже есть аккаунт</button>
              </div>
            )}

            {screen === "forgot" && (
              <div className="auth-form animate-fade-in">
                <h2 className="auth-title">Восстановление</h2>
                <p className="auth-sub">Введи email — пришлём инструкцию</p>
                {!forgotSent ? (
                  <>
                    <div className="field-group">
                      <label className="field-label">Email</label>
                      <input className="field-input" type="email" placeholder="твой@email.com" value={forgotEmail}
                        onChange={e => setForgotEmail(e.target.value)} />
                    </div>
                    <button className="btn-primary" onClick={() => setForgotSent(true)}>Отправить письмо</button>
                  </>
                ) : (
                  <div className="forgot-success">
                    <div className="success-icon">✉️</div>
                    <p>Письмо отправлено! Проверь почту и перейди по ссылке.</p>
                  </div>
                )}
                <button className="link-btn" style={{ marginTop: "8px" }} onClick={() => { setScreen("login"); setForgotSent(false); }}>← Назад к входу</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== ISLANDS GAME ===== */}
      {screen === "play-islands" && (
        <IslandsGame onBack={() => { setScreen("game"); setActiveNav("game"); }} />
      )}

      {/* ===== MAIN APP ===== */}
      {isLoggedIn && screen !== "play-islands" && (
        <div className="app-layout">
          <aside className="sidebar">
            <div className="sidebar-logo">
              <span>🎮</span>
              <span className="sidebar-logo-text">BlockWorld</span>
            </div>
            <div className="sidebar-user">
              <div className="sidebar-avatar">{user.avatar}</div>
              <div>
                <div className="sidebar-username">{user.username}</div>
                <div className="sidebar-level">Уровень {user.level}</div>
              </div>
            </div>
            <div className="sidebar-coins">
              <span>🪙</span>
              <span>{user.bloxcoins.toLocaleString()} BloxCoin</span>
            </div>
            <nav className="sidebar-nav">
              {([
                { id: "game", icon: "🎮", label: "Игры" },
                { id: "3d", icon: "🌐", label: "3D Платформер" },
                { id: "skins", icon: "👗", label: "Скины" },
                { id: "friends", icon: "👥", label: "Друзья", badge: onlineFriends + incomingRequests.length },
                { id: "profile", icon: "👤", label: "Профиль" },
                { id: "support", icon: "💬", label: "Поддержка" },
              ] as const).map(item => (
                <button key={item.id} className={`nav-item ${activeNav === item.id ? "nav-active" : ""}`}
                  onClick={() => handleNav(item.id as Screen)}>
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                  {"badge" in item && item.badge ? <span className="nav-badge">{item.badge}</span> : null}
                </button>
              ))}
            </nav>
            <button className="sidebar-logout" onClick={() => setScreen("login")}>
              <Icon name="LogOut" size={16} /><span>Выйти</span>
            </button>
          </aside>

          <main className="main-content">

            {/* GAMES */}
            {screen === "game" && (
              <div className="page animate-fade-in">
                <div className="page-header">
                  <h1 className="page-title">Игры</h1>
                  <p className="page-sub">Выбери свою игру и начни приключение</p>
                </div>
                <div className="search-bar">
                  <Icon name="Search" size={18} />
                  <input placeholder="Найти игру..." className="search-input" />
                </div>
                <div className="section-label">🔥 Популярные игры</div>
                <div className="games-grid">
                  {GAMES.map(game => (
                    <div key={game.id} className="game-card" style={{ "--card-accent": game.color } as React.CSSProperties}>
                      <div className="game-img-wrap">
                        <img src={game.image} alt={game.title} className="game-img" />
                        <span className="game-tag">{game.tag}</span>
                      </div>
                      <div className="game-body">
                        <div className="game-category">{game.category}</div>
                        <div className="game-name">{game.title}</div>
                        <div className="game-meta">
                          <span><Icon name="Users" size={12} /> {game.players}</span>
                          <span>⭐ {game.rating}</span>
                        </div>
                        <button className="btn-play" style={{ background: game.color }}
                          onClick={() => game.id === 1 ? setScreen("play-islands") : undefined}>
                          {game.id === 1 ? "▶ Играть" : "Скоро"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3D */}
            {screen === "3d" && (
              <div className="page animate-fade-in">
                <div className="page-header">
                  <h1 className="page-title">3D Платформер</h1>
                  <p className="page-sub">Погрузись в полное 3D приключение</p>
                </div>
                <div className="platformer-hero">
                  <div className="platformer-glow" />
                  <div className="platformer-content">
                    <div className="platformer-badge">🌐 3D ЭКСКЛЮЗИВ</div>
                    <h2 className="platformer-title">Небесные острова 3D</h2>
                    <p className="platformer-desc">Исследуй огромный мир плавающих островов, собирай артефакты и побеждай боссов в полном 3D пространстве</p>
                    <div className="platformer-stats">
                      <div className="p-stat"><div className="p-num">47</div><div className="p-lbl">Уровней</div></div>
                      <div className="p-stat"><div className="p-num">12K</div><div className="p-lbl">Игроков</div></div>
                      <div className="p-stat"><div className="p-num">4.9</div><div className="p-lbl">Рейтинг</div></div>
                    </div>
                    <button className="btn-launch" onClick={() => setScreen("play-islands")}>🚀 Запустить игру</button>
                  </div>
                </div>
                <div className="section-label">🗺️ Миры</div>
                <div className="worlds-grid">
                  {["Лесной мир", "Ледяные пики", "Огненные горы", "Подводный грот", "Облачный замок", "Тёмное подземелье"].map((w, i) => (
                    <div key={i} className={`world-card ${i < 2 ? "world-unlocked" : "world-locked"}`}>
                      <span className="world-num">{i + 1}</span>
                      <span className="world-name">{w}</span>
                      <span>{i < 2 ? "✅" : "🔒"}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SKINS */}
            {screen === "skins" && (
              <div className="page animate-fade-in">
                <div className="page-header">
                  <h1 className="page-title">Скины</h1>
                  <p className="page-sub">Настрой своего персонажа</p>
                </div>
                <div className="skin-balance">
                  <span>Твой баланс:</span>
                  <span className="skin-coins">🪙 {user.bloxcoins.toLocaleString()} BloxCoin</span>
                </div>
                <div className="skins-grid">
                  {SKINS_DATA.map(skin => (
                    <div key={skin.id} className={`skin-card ${skin.owned ? "skin-owned" : ""}`}
                      style={{ "--skin-col": skin.color } as React.CSSProperties}>
                      <div className="skin-emoji">{skin.emoji}</div>
                      <div className="skin-name">{skin.name}</div>
                      <div className="skin-rarity" style={{ color: skin.color }}>{skin.rarity}</div>
                      {skin.owned
                        ? <button className="btn-equip">Надеть</button>
                        : <button className="btn-buy">🪙 {skin.price} BC</button>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FRIENDS */}
            {screen === "friends" && (
              <div className="page animate-fade-in">
                <div className="page-header">
                  <h1 className="page-title">Друзья</h1>
                  <p className="page-sub">{onlineFriends} из {friends.length} онлайн</p>
                </div>

                {/* Incoming requests */}
                {incomingRequests.length > 0 && (
                  <>
                    <div className="section-label" style={{ color: "#FCD34D" }}>
                      🔔 Входящие запросы ({incomingRequests.length})
                    </div>
                    <div className="requests-list">
                      {incomingRequests.map(req => (
                        <div key={req.id} className="request-row">
                          <span className="req-avatar">{req.avatar}</span>
                          <span className="req-name">{req.name}</span>
                          <span className="req-sub">хочет добавить тебя в друзья</span>
                          <div className="req-btns">
                            <button className="btn-accept" onClick={() => handleAcceptRequest(req)}>
                              <Icon name="Check" size={14} /> Принять
                            </button>
                            <button className="btn-decline" onClick={() => handleDeclineRequest(req.id)}>
                              <Icon name="X" size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Search */}
                <div className="section-label">🔍 Найти игрока</div>
                <div className="add-friend-bar">
                  <input className="field-input" placeholder="Введи никнейм игрока..."
                    value={friendSearch}
                    onChange={e => setFriendSearch(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSearchFriend()} />
                  <button className="btn-add" onClick={handleSearchFriend}>
                    <Icon name="Search" size={16} /> Найти
                  </button>
                </div>

                {searchMsg && (
                  <div className={`search-msg ${searchMsg.startsWith("✅") ? "search-msg-ok" : "search-msg-err"}`}>
                    {searchMsg}
                  </div>
                )}

                {searchResult && (
                  <div className="search-result-row">
                    <span className="req-avatar">{searchResult.avatar}</span>
                    <div className="friend-info">
                      <span className="friend-name">{searchResult.name}</span>
                      <span className="friend-status" style={{ color: "#22C55E" }}>В сети</span>
                    </div>
                    {sentRequests.includes(searchResult.name) ? (
                      <span className="req-sent-label">Запрос отправлен...</span>
                    ) : (
                      <button className="btn-add" onClick={() => handleSendRequest(searchResult!.name, searchResult!.avatar)}>
                        <Icon name="UserPlus" size={15} /> Добавить
                      </button>
                    )}
                  </div>
                )}

                {/* Friends list */}
                <div className="section-label">👥 Мои друзья ({friends.length})</div>
                <div className="friends-list">
                  {friends.map(f => (
                    <div key={f.id} className="friend-row">
                      <div className="friend-av-wrap">
                        <span className="friend-av">{f.avatar}</span>
                        <span className="friend-dot" style={{ background: statusColor(f.status) }} />
                      </div>
                      <div className="friend-info">
                        <span className="friend-name">{f.name}</span>
                        <span className="friend-status" style={{ color: statusColor(f.status) }}>
                          {statusLabel(f.status)}{f.game && ` · ${f.game}`}
                        </span>
                      </div>
                      <div className="friend-btns">
                        {f.status === "ingame" && <button className="btn-join">Войти</button>}
                        <button className="btn-msg"><Icon name="MessageCircle" size={15} /></button>
                        <button className="btn-remove" onClick={() => handleRemoveFriend(f.id)} title="Удалить из друзей">
                          <Icon name="UserMinus" size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PROFILE */}
            {screen === "profile" && (
              <div className="page animate-fade-in">
                <div className="page-header">
                  <h1 className="page-title">Профиль</h1>
                  <p className="page-sub">Твои данные и достижения</p>
                </div>
                <div className="profile-hero">
                  <div className="profile-av">{user.avatar}</div>
                  <div>
                    <h2 className="profile-username">{user.username}</h2>
                    <div className="profile-badges">
                      <span className="pbadge pbadge-level">⭐ Уровень {user.level}</span>
                      <span className="pbadge pbadge-coins">🪙 {user.bloxcoins.toLocaleString()} BC</span>
                    </div>
                  </div>
                </div>
                <div className="pstats-row">
                  {[
                    { n: "47", l: "Игр сыграно" },
                    { n: "12", l: "Побед" },
                    { n: String(friends.length), l: "Друзей" },
                    { n: "3", l: "Скинов" },
                  ].map((s, i) => (
                    <div key={i} className="pstat-box">
                      <div className="pstat-num">{s.n}</div>
                      <div className="pstat-lbl">{s.l}</div>
                    </div>
                  ))}
                </div>
                <div className="profile-section">
                  <div className="profile-sec-hdr">
                    <span>⚙️ Настройки аккаунта</span>
                    <button className="btn-edit-sm" onClick={() => setEditProfile(!editProfile)}>
                      {editProfile ? "Отмена" : "✏️ Изменить"}
                    </button>
                  </div>
                  {editProfile ? (
                    <div className="profile-edit">
                      <div className="field-group">
                        <label className="field-label">Никнейм</label>
                        <input className="field-input" value={profileEdit.username}
                          onChange={e => setProfileEdit({ ...profileEdit, username: e.target.value })} />
                      </div>
                      <div className="field-group">
                        <label className="field-label">Новый пароль</label>
                        <input className="field-input" type="password" placeholder="Введи новый пароль..."
                          value={profileEdit.password}
                          onChange={e => setProfileEdit({ ...profileEdit, password: e.target.value })} />
                      </div>
                      <button className="btn-primary" onClick={() => {
                        setUser({ ...user, username: profileEdit.username });
                        setEditProfile(false);
                      }}>Сохранить</button>
                    </div>
                  ) : (
                    <div className="profile-info">
                      <div className="info-row"><span className="info-key">Никнейм</span><span className="info-val">{user.username}</span></div>
                      <div className="info-row"><span className="info-key">Пароль</span><span className="info-val">••••••••</span></div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SUPPORT */}
            {screen === "support" && (
              <div className="page animate-fade-in">
                <div className="page-header">
                  <h1 className="page-title">Поддержка</h1>
                  <p className="page-sub">Мы всегда готовы помочь</p>
                </div>
                <div className="support-cards">
                  {[
                    { icon: "🐛", title: "Сообщить об ошибке", desc: "Нашёл баг? Расскажи нам", btn: "Отправить репорт" },
                    { icon: "💡", title: "Предложение", desc: "Есть идея? Мы её рассмотрим", btn: "Написать идею" },
                    { icon: "💬", title: "Онлайн чат", desc: "Поговори с поддержкой", btn: "Начать чат" },
                  ].map((c, i) => (
                    <div key={i} className="support-card">
                      <div className="support-icon">{c.icon}</div>
                      <h3 className="support-title">{c.title}</h3>
                      <p className="support-desc">{c.desc}</p>
                      <button className={`btn-support ${i === 2 ? "btn-support-primary" : ""}`}>{c.btn}</button>
                    </div>
                  ))}
                </div>
                <div className="support-form">
                  <h3 className="support-form-title">📩 Написать нам</h3>
                  <div className="field-group">
                    <label className="field-label">Тема обращения</label>
                    <input className="field-input" placeholder="Кратко опиши проблему..." />
                  </div>
                  <div className="field-group">
                    <label className="field-label">Сообщение</label>
                    <textarea className="field-textarea" rows={4} placeholder="Опиши подробнее..." />
                  </div>
                  <button className="btn-primary">Отправить</button>
                </div>
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
}
