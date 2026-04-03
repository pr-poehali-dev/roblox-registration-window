import { useState } from "react";
import Icon from "@/components/ui/icon";

type Screen = "login" | "register" | "forgot" | "game" | "skins" | "3d" | "friends" | "profile" | "support";

interface User {
  username: string;
  avatar: string;
  level: number;
  coins: number;
}

interface Friend {
  id: number;
  name: string;
  status: "online" | "offline" | "ingame";
  avatar: string;
  game?: string;
}

const GAMES = [
  {
    id: 1,
    title: "Небесные острова",
    category: "3D Платформер",
    players: "12.4K",
    rating: 4.9,
    image: "https://cdn.poehali.dev/projects/7d82a088-8a93-4b0c-b9fa-92ab812ad1eb/files/b29c27c1-d977-4b2d-b5bb-a93d5a8c5d74.jpg",
    tag: "🔥 Топ",
    color: "#7C3AED",
  },
  {
    id: 2,
    title: "Выживание в лесу",
    category: "Выживание",
    players: "8.1K",
    rating: 4.7,
    image: "https://cdn.poehali.dev/projects/7d82a088-8a93-4b0c-b9fa-92ab812ad1eb/files/acfbaf03-6b4a-4792-b114-ccd8e44dad11.jpg",
    tag: "🌿 Новинка",
    color: "#059669",
  },
  {
    id: 3,
    title: "Нео Гонки",
    category: "Гонки",
    players: "21.7K",
    rating: 4.8,
    image: "https://cdn.poehali.dev/projects/7d82a088-8a93-4b0c-b9fa-92ab812ad1eb/files/cfb68a3f-d54b-49e4-8508-e533ec826b76.jpg",
    tag: "⚡ Хит",
    color: "#0891B2",
  },
  {
    id: 4,
    title: "Магическое Королевство",
    category: "RPG Приключение",
    players: "6.3K",
    rating: 4.6,
    image: "https://cdn.poehali.dev/projects/7d82a088-8a93-4b0c-b9fa-92ab812ad1eb/files/63da0e21-32a4-4e39-829c-122a38084c97.jpg",
    tag: "✨ Популярное",
    color: "#BE185D",
  },
];

const SKINS = [
  { id: 1, name: "Космонавт", rarity: "Легендарный", price: 500, color: "#7C3AED", emoji: "👨‍🚀", owned: true },
  { id: 2, name: "Ниндзя", rarity: "Редкий", price: 200, color: "#0891B2", emoji: "🥷", owned: true },
  { id: 3, name: "Рыцарь", rarity: "Обычный", price: 100, color: "#059669", emoji: "⚔️", owned: false },
  { id: 4, name: "Дракон", rarity: "Мифический", price: 1000, color: "#BE185D", emoji: "🐉", owned: false },
  { id: 5, name: "Пират", rarity: "Редкий", price: 250, color: "#D97706", emoji: "🏴‍☠️", owned: false },
  { id: 6, name: "Робот", rarity: "Эпический", price: 400, color: "#6366F1", emoji: "🤖", owned: true },
];

const MOCK_FRIENDS: Friend[] = [
  { id: 1, name: "SuperPlayer99", status: "ingame", avatar: "🎮", game: "Небесные острова" },
  { id: 2, name: "NinjaKing", status: "online", avatar: "🥷" },
  { id: 3, name: "DragonSlayer", status: "offline", avatar: "⚔️" },
  { id: 4, name: "StarCraft22", status: "online", avatar: "⭐" },
  { id: 5, name: "CoolDude777", status: "ingame", avatar: "🚀", game: "Нео Гонки" },
  { id: 6, name: "MysticMage", status: "offline", avatar: "🧙" },
];

const MOCK_USER: User = {
  username: "ГостьИгрок",
  avatar: "👾",
  level: 12,
  coins: 1250,
};

export default function Index() {
  const [screen, setScreen] = useState<Screen>("login");
  const [activeNav, setActiveNav] = useState<Screen>("game");
  const [user, setUser] = useState<User>(MOCK_USER);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ username: "", email: "", password: "", confirm: "" });
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  const [friendRequest, setFriendRequest] = useState("");
  const [editProfile, setEditProfile] = useState(false);
  const [profileEdit, setProfileEdit] = useState({ username: MOCK_USER.username, password: "" });

  const isLoggedIn = ["game", "skins", "3d", "friends", "profile", "support"].includes(screen);

  const handleLogin = () => {
    if (loginForm.username) setUser({ ...MOCK_USER, username: loginForm.username });
    setScreen("game");
    setActiveNav("game");
  };

  const handleGuest = () => {
    setScreen("game");
    setActiveNav("game");
  };

  const handleRegister = () => {
    if (registerForm.username) setUser({ ...MOCK_USER, username: registerForm.username });
    setScreen("game");
    setActiveNav("game");
  };

  const handleNav = (nav: Screen) => {
    setScreen(nav);
    setActiveNav(nav);
  };

  const statusColor = (s: Friend["status"]) =>
    s === "online" ? "#22C55E" : s === "ingame" ? "#A78BFA" : "#6B7280";

  const statusLabel = (s: Friend["status"]) =>
    s === "online" ? "В сети" : s === "ingame" ? "В игре" : "Не в сети";

  return (
    <div className="roblox-app">

      {/* ===== AUTH SCREENS ===== */}
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

            {/* LOGIN */}
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

            {/* REGISTER */}
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

            {/* FORGOT */}
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
                    <p>Письмо отправлено! Проверь почту и перейди по ссылке для сброса пароля.</p>
                  </div>
                )}
                <button className="link-btn" style={{ marginTop: "8px" }} onClick={() => { setScreen("login"); setForgotSent(false); }}>
                  ← Назад к входу
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== MAIN APP ===== */}
      {isLoggedIn && (
        <div className="app-layout">

          {/* SIDEBAR */}
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
              <span>{user.coins.toLocaleString()} монет</span>
            </div>

            <nav className="sidebar-nav">
              {([
                { id: "game", icon: "🎮", label: "Игры" },
                { id: "3d", icon: "🌐", label: "3D Платформер" },
                { id: "skins", icon: "👗", label: "Скины" },
                { id: "friends", icon: "👥", label: "Друзья", badge: MOCK_FRIENDS.filter(f => f.status !== "offline").length },
                { id: "profile", icon: "👤", label: "Профиль" },
                { id: "support", icon: "💬", label: "Поддержка" },
              ] as const).map(item => (
                <button
                  key={item.id}
                  className={`nav-item ${activeNav === item.id ? "nav-active" : ""}`}
                  onClick={() => handleNav(item.id as Screen)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                  {"badge" in item && item.badge && (
                    <span className="nav-badge">{item.badge}</span>
                  )}
                </button>
              ))}
            </nav>

            <button className="sidebar-logout" onClick={() => setScreen("login")}>
              <Icon name="LogOut" size={16} />
              <span>Выйти</span>
            </button>
          </aside>

          {/* CONTENT */}
          <main className="main-content">

            {/* GAMES PAGE */}
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
                        <button className="btn-play" style={{ background: game.color }}>Играть</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3D PAGE */}
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
                    <button className="btn-launch">🚀 Запустить игру</button>
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

            {/* SKINS PAGE */}
            {screen === "skins" && (
              <div className="page animate-fade-in">
                <div className="page-header">
                  <h1 className="page-title">Скины</h1>
                  <p className="page-sub">Настрой своего персонажа</p>
                </div>
                <div className="skin-balance">
                  <span>Твой баланс:</span>
                  <span className="skin-coins">🪙 {user.coins.toLocaleString()}</span>
                </div>
                <div className="skins-grid">
                  {SKINS.map(skin => (
                    <div key={skin.id} className={`skin-card ${skin.owned ? "skin-owned" : ""}`}
                      style={{ "--skin-col": skin.color } as React.CSSProperties}>
                      <div className="skin-emoji">{skin.emoji}</div>
                      <div className="skin-name">{skin.name}</div>
                      <div className="skin-rarity" style={{ color: skin.color }}>{skin.rarity}</div>
                      {skin.owned
                        ? <button className="btn-equip">Надеть</button>
                        : <button className="btn-buy">🪙 {skin.price}</button>
                      }
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FRIENDS PAGE */}
            {screen === "friends" && (
              <div className="page animate-fade-in">
                <div className="page-header">
                  <h1 className="page-title">Друзья</h1>
                  <p className="page-sub">{MOCK_FRIENDS.filter(f => f.status !== "offline").length} из {MOCK_FRIENDS.length} онлайн</p>
                </div>
                <div className="add-friend-bar">
                  <input className="field-input" placeholder="Никнейм друга..." value={friendRequest}
                    onChange={e => setFriendRequest(e.target.value)} />
                  <button className="btn-add">
                    <Icon name="UserPlus" size={16} /> Добавить
                  </button>
                </div>
                <div className="section-label">👥 Список друзей</div>
                <div className="friends-list">
                  {MOCK_FRIENDS.map(f => (
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
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PROFILE PAGE */}
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
                      <span className="pbadge pbadge-coins">🪙 {user.coins.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div className="pstats-row">
                  {[
                    { n: "47", l: "Игр сыграно" },
                    { n: "12", l: "Побед" },
                    { n: String(MOCK_FRIENDS.length), l: "Друзей" },
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

            {/* SUPPORT PAGE */}
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
