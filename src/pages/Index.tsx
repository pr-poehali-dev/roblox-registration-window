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

// ===== 3D GAME CONSTANTS =====
const CW = 900;
const CH = 500;

interface Island3D {
  wx: number;
  wz: number;
  wy: number;
  sw: number;
  sd: number;
  sh: number;
  checkpoint?: boolean;
  checkpointId?: number;
  color?: string;
}

interface Player3D {
  wx: number; wz: number; wy: number;
  vx: number; vz: number; vy: number;
  onGround: boolean;
  cpX: number; cpZ: number; cpY: number;
  lastCP: number;
  dead: boolean;
  facing: number;
  carpetOwned: boolean;
  carpetActive: boolean;
  infiniteOwned: boolean;
}

interface Particle {
  x: number; y: number; z: number;
  vx: number; vy: number; vz: number;
  life: number;
  maxLife: number;
}

const BASE_ISLANDS: Island3D[] = [
  { wx: 0,   wz: 0,  wy: 0,   sw: 5,   sd: 5,   sh: 1.5, color: "#6D28D9" },
  { wx: 7,   wz: 1,  wy: 0,   sw: 3,   sd: 3,   sh: 1.5, checkpoint: true, checkpointId: 1, color: "#F59E0B" },
  { wx: 13,  wz: -1, wy: 1,   sw: 3,   sd: 3,   sh: 1.5, color: "#7C3AED" },
  { wx: 19,  wz: 2,  wy: 2,   sw: 2.5, sd: 2.5, sh: 1.5, color: "#5B21B6" },
  { wx: 25,  wz: 0,  wy: 1.5, sw: 3,   sd: 3,   sh: 1.5, checkpoint: true, checkpointId: 2, color: "#F59E0B" },
  { wx: 31,  wz: -2, wy: 3,   sw: 2.5, sd: 2.5, sh: 1.5, color: "#6D28D9" },
  { wx: 37,  wz: 1,  wy: 2.5, sw: 2,   sd: 2,   sh: 1.5, color: "#4C1D95" },
  { wx: 43,  wz: -1, wy: 4,   sw: 3,   sd: 3,   sh: 1.5, checkpoint: true, checkpointId: 3, color: "#F59E0B" },
  { wx: 50,  wz: 2,  wy: 3,   sw: 2,   sd: 2,   sh: 1.5, color: "#7C3AED" },
  { wx: 57,  wz: 0,  wy: 5,   sw: 4,   sd: 4,   sh: 2,   color: "#0891B2" },
];

function generateInfiniteIslands(seed: number): Island3D[] {
  const islands: Island3D[] = [...BASE_ISLANDS];
  let lx = 57; let lz = 0; let ly = 5;
  for (let i = 0; i < 200; i++) {
    const r  = Math.sin(seed + i * 17.3) * 0.5 + 0.5;
    const r2 = Math.sin(seed + i * 7.1)  * 0.5 + 0.5;
    const r3 = Math.sin(seed + i * 3.7)  * 0.5 + 0.5;
    lx += 5 + r * 4;
    lz += (r2 - 0.5) * 5;
    ly += (r3 - 0.45) * 1.5;
    ly = Math.max(-2, Math.min(12, ly));
    const sw = 1.5 + r * 2;
    const isCP = i % 12 === 0;
    const colors = ["#6D28D9","#7C3AED","#5B21B6","#4C1D95","#0891B2","#0E7490"];
    islands.push({
      wx: lx, wz: lz, wy: ly,
      sw, sd: sw, sh: 1.5,
      checkpoint: isCP, checkpointId: isCP ? Math.floor(i / 12) + 4 : undefined,
      color: isCP ? "#F59E0B" : colors[Math.floor(r * colors.length)],
    });
  }
  return islands;
}

const INIT_PLAYER3D: Player3D = {
  wx: 2, wz: 2, wy: 2,
  vx: 0, vz: 0, vy: 0,
  onGround: false,
  cpX: 2, cpZ: 2, cpY: 2,
  lastCP: 0,
  dead: false,
  facing: 0,
  carpetOwned: false,
  carpetActive: false,
  infiniteOwned: false,
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

// ===== 3D PERSPECTIVE HELPERS =====

const FOV_DEG = 70;
const FOV_RAD = (FOV_DEG * Math.PI) / 180;
const NEAR = 0.1;
const LIGHT_DIR = (() => {
  const lx = 0.3, ly = 1.0, lz = 0.5;
  const len = Math.sqrt(lx * lx + ly * ly + lz * lz);
  return { x: lx / len, y: ly / len, z: lz / len };
})();

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function applyLighting(hex: string, normalX: number, normalY: number, normalZ: number, fogT: number): string {
  const { r, g, b } = hexToRgb(hex);
  const dot = Math.max(0, normalX * LIGHT_DIR.x + normalY * LIGHT_DIR.y + normalZ * LIGHT_DIR.z);
  const brightness = 0.35 + 0.65 * dot;
  // fog: lerp toward sky color (#060412)
  const skyR = 6, skyG = 4, skyB = 18;
  const fr = r * brightness * (1 - fogT) + skyR * fogT;
  const fg = g * brightness * (1 - fogT) + skyG * fogT;
  const fb = b * brightness * (1 - fogT) + skyB * fogT;
  return `rgb(${Math.round(fr)},${Math.round(fg)},${Math.round(fb)})`;
}

interface CamState {
  px: number; py: number; pz: number; // position
  yaw: number; // horizontal angle (radians)
}

// Project a world point into screen coords given camera state.
// Returns null if behind near plane.
function perspProject(
  wx: number, wy: number, wz: number,
  cam: CamState
): { sx: number; sy: number; depth: number } | null {
  // Translate to camera space
  const dx = wx - cam.px;
  const dy = wy - cam.py;
  const dz = wz - cam.pz;
  // Rotate around Y axis by -yaw (camera faces +Z in local space)
  const cosY = Math.cos(-cam.yaw);
  const sinY = Math.sin(-cam.yaw);
  const cx = dx * cosY - dz * sinY;
  const cy = dy;
  const cz = dx * sinY + dz * cosY;

  if (cz < NEAR) return null; // behind camera

  const fovScale = 1 / Math.tan(FOV_RAD / 2);
  const sx = CW / 2 + (cx / cz) * fovScale * (CW / 2);
  const sy = CH / 2 - (cy / cz) * fovScale * (CW / 2);
  return { sx, sy, depth: cz };
}

function fillQuad(
  ctx: CanvasRenderingContext2D,
  pts: ({ sx: number; sy: number } | null)[],
  color: string
) {
  const valid = pts.filter(Boolean) as { sx: number; sy: number }[];
  if (valid.length < 3) return;
  ctx.beginPath();
  ctx.moveTo(valid[0].sx, valid[0].sy);
  for (let i = 1; i < valid.length; i++) ctx.lineTo(valid[i].sx, valid[i].sy);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

function drawBox3D(
  ctx: CanvasRenderingContext2D,
  wx: number, wy: number, wz: number,
  sw: number, sd: number, sh: number,
  baseColor: string,
  cam: CamState,
  fogT: number
) {
  // 8 corners of the box
  const corners = [
    perspProject(wx,      wy,      wz,      cam), // 0 BNW
    perspProject(wx + sw, wy,      wz,      cam), // 1 BNE
    perspProject(wx + sw, wy,      wz + sd, cam), // 2 BSE
    perspProject(wx,      wy,      wz + sd, cam), // 3 BSW
    perspProject(wx,      wy + sh, wz,      cam), // 4 TNW
    perspProject(wx + sw, wy + sh, wz,      cam), // 5 TNE
    perspProject(wx + sw, wy + sh, wz + sd, cam), // 6 TSE
    perspProject(wx,      wy + sh, wz + sd, cam), // 7 TSW
  ];

  // Box center Y for top-face visibility
  const bcy = wy + sh / 2;

  // Back-face culling: draw face only if camera is on the normal side
  // dot(normal, camPos - faceCenter) > 0 means face is visible

  // Top face (normal: 0,1,0) — visible if cam is above box center Y
  if (cam.py > bcy) {
    fillQuad(ctx, [corners[4], corners[5], corners[6], corners[7]], applyLighting(baseColor, 0, 1, 0, fogT));
  }

  // North face (normal: 0,0,-1) — visible if cam.pz < face center z
  const faceNorthZ = wz;
  if (cam.pz < faceNorthZ) {
    fillQuad(ctx, [corners[4], corners[5], corners[1], corners[0]], applyLighting(baseColor, 0, 0, -1, fogT));
  }

  // South face (normal: 0,0,+1) — visible if cam.pz > face center z
  const faceSouthZ = wz + sd;
  if (cam.pz > faceSouthZ) {
    fillQuad(ctx, [corners[7], corners[6], corners[2], corners[3]], applyLighting(baseColor, 0, 0, 1, fogT));
  }

  // West face (normal: -1,0,0) — visible if cam.px < face center x
  const faceWestX = wx;
  if (cam.px < faceWestX) {
    fillQuad(ctx, [corners[4], corners[7], corners[3], corners[0]], applyLighting(baseColor, -1, 0, 0, fogT));
  }

  // East face (normal: +1,0,0) — visible if cam.px > face center x
  const faceEastX = wx + sw;
  if (cam.px > faceEastX) {
    fillQuad(ctx, [corners[5], corners[6], corners[2], corners[1]], applyLighting(baseColor, 1, 0, 0, fogT));
  }

  // Top face border
  const topValid = [corners[4], corners[5], corners[6], corners[7]].filter(Boolean) as { sx: number; sy: number }[];
  if (topValid.length >= 3) {
    ctx.beginPath();
    ctx.moveTo(topValid[0].sx, topValid[0].sy);
    for (let i = 1; i < topValid.length; i++) ctx.lineTo(topValid[i].sx, topValid[i].sy);
    ctx.closePath();
    const { r, g, b } = hexToRgb(baseColor);
    ctx.strokeStyle = `rgba(${Math.min(255, r + 60)},${Math.min(255, g + 60)},${Math.min(255, b + 60)},0.5)`;
    ctx.lineWidth = 0.6;
    ctx.stroke();
  }
}

function drawPlayerCube(
  ctx: CanvasRenderingContext2D,
  wx: number, wy: number, wz: number,
  cam: CamState,
  yaw: number // player facing direction
) {
  const s = 0.4; // half-size
  const baseColor = "#A78BFA";
  // Draw a small cube for the player (0.8x0.8x0.8)
  drawBox3D(ctx, wx - s, wy, wz - s, s * 2, s * 2, s * 2, baseColor, cam, 0);

  // Draw face (eyes + smile) on front face
  // Front face is in direction of player yaw
  const faceZ = wz - s - 0.01; // slightly in front
  const eyeY = wy + s * 0.9;
  const leftEyePt = perspProject(wx - s * 0.35, eyeY, faceZ, cam);
  const rightEyePt = perspProject(wx + s * 0.35, eyeY, faceZ, cam);
  if (leftEyePt && rightEyePt) {
    const eyeR = Math.abs(rightEyePt.sx - leftEyePt.sx) * 0.12;
    ctx.fillStyle = "#fff";
    ctx.beginPath(); ctx.arc(leftEyePt.sx, leftEyePt.sy, Math.max(1.5, eyeR), 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(rightEyePt.sx, rightEyePt.sy, Math.max(1.5, eyeR), 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#1E1B4B";
    ctx.beginPath(); ctx.arc(leftEyePt.sx, leftEyePt.sy, Math.max(0.8, eyeR * 0.55), 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(rightEyePt.sx, rightEyePt.sy, Math.max(0.8, eyeR * 0.55), 0, Math.PI * 2); ctx.fill();
    // smile
    const smileCenter = perspProject(wx, wy + s * 0.5, faceZ, cam);
    if (smileCenter) {
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = Math.max(0.8, eyeR * 0.4);
      ctx.beginPath();
      ctx.arc(smileCenter.sx, smileCenter.sy, eyeR * 1.1, 0.1, Math.PI - 0.1);
      ctx.stroke();
    }
  }

  // Shadow ellipse on the nearest island surface
  const shadowPt = perspProject(wx, wy - 0.02, wz, cam);
  if (shadowPt) {
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.ellipse(shadowPt.sx, shadowPt.sy, 14, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  void yaw;
}

function drawCarpet3D(
  ctx: CanvasRenderingContext2D,
  wx: number, wy: number, wz: number,
  cam: CamState,
  t: number
) {
  const wave = Math.sin(t * 3) * 0.06;
  const pts = [
    perspProject(wx - 0.55, wy - 0.1 + wave,  wz - 0.45, cam),
    perspProject(wx + 0.55, wy - 0.1 - wave,  wz - 0.45, cam),
    perspProject(wx + 0.55, wy - 0.1 + wave,  wz + 0.45, cam),
    perspProject(wx - 0.55, wy - 0.1 - wave,  wz + 0.45, cam),
  ];
  const valid = pts.filter(Boolean) as { sx: number; sy: number }[];
  if (valid.length < 3) return;
  ctx.beginPath();
  ctx.moveTo(valid[0].sx, valid[0].sy);
  for (let i = 1; i < valid.length; i++) ctx.lineTo(valid[i].sx, valid[i].sy);
  ctx.closePath();
  const p0 = valid[0], p2 = valid[2] ?? valid[1];
  const grad = ctx.createLinearGradient(p0.sx, p0.sy, p2.sx, p2.sy);
  grad.addColorStop(0, "#DC2626");
  grad.addColorStop(0.3, "#F59E0B");
  grad.addColorStop(0.7, "#DC2626");
  grad.addColorStop(1, "#7C3AED");
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = "#FCD34D";
  ctx.lineWidth = 1;
  ctx.stroke();
}

function drawFlag3D(
  ctx: CanvasRenderingContext2D,
  wx: number, wy: number, wz: number,
  cam: CamState,
  activated: boolean
) {
  const base = perspProject(wx, wy, wz, cam);
  const top  = perspProject(wx, wy + 1.4, wz, cam);
  if (!base || !top) return;
  const color = activated ? "#22C55E" : "#F59E0B";
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(base.sx, base.sy);
  ctx.lineTo(top.sx, top.sy);
  ctx.stroke();
  // flag triangle
  const fl1 = perspProject(wx, wy + 1.4, wz, cam);
  const fl2 = perspProject(wx + 0.5, wy + 1.15, wz, cam);
  const fl3 = perspProject(wx, wy + 0.9, wz, cam);
  if (fl1 && fl2 && fl3) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(fl1.sx, fl1.sy);
    ctx.lineTo(fl2.sx, fl2.sy);
    ctx.lineTo(fl3.sx, fl3.sy);
    ctx.fill();
  }
}

// ===== ISLANDS GAME COMPONENT (3D) =====
function IslandsGame({ onBack, bloxcoins, onSpend }: { onBack: () => void; bloxcoins: number; onSpend: (amt: number) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playerRef = useRef<Player3D>({ ...INIT_PLAYER3D });
  const keysRef = useRef<Record<string, boolean>>({});
  const frameRef = useRef(0);
  const activatedCPRef = useRef<Set<number>>(new Set());
  const islandsRef = useRef<Island3D[]>(BASE_ISLANDS);
  const particlesRef = useRef<Particle[]>([]);
  const [deaths, setDeaths] = useState(0);
  const [won, setWon] = useState(false);
  const [cpMsg, setCpMsg] = useState("");
  const [showShop, setShowShop] = useState(false);
  const [carpetOwned, setCarpetOwned] = useState(false);
  const [infiniteOwned, setInfiniteOwned] = useState(false);
  const [carpetActive, setCarpetActive] = useState(false);
  const carpetRef = useRef(false);
  const infiniteRef = useRef(false);

  // Camera yaw controlled by mouse drag or Q/E keys
  const camYawRef = useRef(0);
  const dragRef = useRef<{ active: boolean; lastX: number }>({ active: false, lastX: 0 });

  const reset = useCallback((toCP = false) => {
    const p = playerRef.current;
    if (toCP) {
      playerRef.current = { ...p, wx: p.cpX, wz: p.cpZ, wy: p.cpY + 0.5, vx: 0, vz: 0, vy: 0, dead: false, onGround: false };
    } else {
      playerRef.current = { ...INIT_PLAYER3D };
      activatedCPRef.current = new Set();
      camYawRef.current = 0;
      particlesRef.current = [];
      if (infiniteRef.current) islandsRef.current = generateInfiniteIslands(Date.now());
      else islandsRef.current = BASE_ISLANDS;
    }
  }, []);

  // Key B to exit, Q/E for camera rotation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.code] = true;
      if (e.code === "KeyB") onBack();
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.code] = false;
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [onBack]);

  // Mouse drag for camera rotation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onMouseDown = (e: MouseEvent) => { dragRef.current = { active: true, lastX: e.clientX }; };
    const onMouseMove = (e: MouseEvent) => {
      if (!dragRef.current.active) return;
      const dx = e.clientX - dragRef.current.lastX;
      camYawRef.current += dx * 0.005;
      dragRef.current.lastX = e.clientX;
    };
    const onMouseUp = () => { dragRef.current.active = false; };
    canvas.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      canvas.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  useEffect(() => { carpetRef.current = carpetActive; }, [carpetActive]);
  useEffect(() => { infiniteRef.current = infiniteOwned; }, [infiniteOwned]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const tick = () => {
      const p = playerRef.current;
      const keys = keysRef.current;
      const t = Date.now() / 1000;
      const SPEED = 0.1;
      const GRAVITY3D = 0.015;
      const JUMP_VY = -0.22;

      // Camera yaw rotation via Q/E
      if (keys["KeyQ"]) camYawRef.current -= 0.03;
      if (keys["KeyE"]) camYawRef.current += 0.03;

      if (!p.dead && !won) {
        // WASD movement relative to camera yaw
        const yaw = camYawRef.current;
        const fwdX = Math.sin(yaw);
        const fwdZ = Math.cos(yaw);
        const rightX = Math.cos(yaw);
        const rightZ = -Math.sin(yaw);

        if (keys["KeyW"] || keys["ArrowUp"]) {
          p.wx += fwdX * SPEED;
          p.wz += fwdZ * SPEED;
          p.facing = yaw;
        }
        if (keys["KeyS"] || keys["ArrowDown"]) {
          p.wx -= fwdX * SPEED;
          p.wz -= fwdZ * SPEED;
        }
        if (keys["KeyA"] || keys["ArrowLeft"]) {
          p.wx -= rightX * SPEED;
          p.wz -= rightZ * SPEED;
        }
        if (keys["KeyD"] || keys["ArrowRight"]) {
          p.wx += rightX * SPEED;
          p.wz += rightZ * SPEED;
        }

        if (carpetRef.current) {
          if (keys["Space"]) p.wy += SPEED * 0.8;
          if (keys["ShiftLeft"] || keys["ShiftRight"]) p.wy -= SPEED * 0.8;
          p.vy = 0;
          p.onGround = false;
        } else {
          if (keys["Space"] && p.onGround) {
            p.vy = JUMP_VY;
            p.onGround = false;
            // spawn jump particles
            for (let i = 0; i < 5; i++) {
              const angle = (Math.PI * 2 * i) / 5;
              particlesRef.current.push({
                x: p.wx, y: p.wy, z: p.wz,
                vx: Math.cos(angle) * 0.08,
                vy: 0.05 + Math.random() * 0.05,
                vz: Math.sin(angle) * 0.08,
                life: 1, maxLife: 1,
              });
            }
          }
          p.vy += GRAVITY3D;
          p.wy += p.vy;
          p.onGround = false;

          for (const isl of islandsRef.current) {
            const topY = isl.wy + isl.sh;
            if (
              p.wx >= isl.wx - 0.35 && p.wx <= isl.wx + isl.sw + 0.35 &&
              p.wz >= isl.wz - 0.35 && p.wz <= isl.wz + isl.sd + 0.35 &&
              p.wy <= topY + 0.15 && p.wy >= topY - 0.45 && p.vy >= 0
            ) {
              p.wy = topY;
              p.vy = 0;
              p.onGround = true;

              if (isl.checkpoint && isl.checkpointId !== undefined && !activatedCPRef.current.has(isl.checkpointId)) {
                activatedCPRef.current.add(isl.checkpointId);
                p.cpX = p.wx; p.cpZ = p.wz; p.cpY = p.wy;
                p.lastCP = isl.checkpointId;
                setCpMsg(`Чекпоинт ${isl.checkpointId} сохранён!`);
                setTimeout(() => setCpMsg(""), 2000);
              }
            }
          }

          if (p.wy < -8) {
            p.dead = true;
            setDeaths(d => d + 1);
            setTimeout(() => reset(true), 700);
          }
        }

        const last = islandsRef.current[islandsRef.current.length - 1];
        if (!infiniteRef.current && p.wx > last.wx + last.sw && p.wy >= last.wy) setWon(true);
      }

      // Update particles
      particlesRef.current = particlesRef.current
        .map(pt => ({ ...pt, x: pt.x + pt.vx, y: pt.y + pt.vy, z: pt.z + pt.vz, vy: pt.vy + 0.003, life: pt.life - 0.04 }))
        .filter(pt => pt.life > 0);

      // ===== CAMERA: third-person behind player =====
      const yaw = camYawRef.current;
      const camDist = 8;
      const camHeight = 4;
      const cam: CamState = {
        px: p.wx - Math.sin(yaw) * camDist,
        py: p.wy + camHeight,
        pz: p.wz - Math.cos(yaw) * camDist,
        yaw,
      };
      // Camera pitch: look slightly downward toward player
      // We handle this via the perspective projection (player is below cam.py)

      // ===== DRAW SKY =====
      const sky = ctx.createLinearGradient(0, 0, 0, CH);
      sky.addColorStop(0,   "#060412");
      sky.addColorStop(0.5, "#1a1040");
      sky.addColorStop(1,   "#0d2060");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, CW, CH);

      // Stars with twinkling
      for (let i = 0; i < 120; i++) {
        const sx = (i * 137.508) % CW;
        const sy = (i * 97.327) % (CH * 0.7);
        const blink = Math.sin(t * 1.5 + i * 0.73) * 0.4 + 0.6;
        const size = i % 5 === 0 ? 2 : 1;
        ctx.fillStyle = `rgba(255,255,255,${blink * 0.75})`;
        ctx.fillRect(sx, sy, size, size);
      }

      // Nebula glows
      for (let i = 0; i < 3; i++) {
        const nx = (i * 300 + 100) % CW;
        const ny = 70 + i * 55;
        const ng = ctx.createRadialGradient(nx, ny, 0, nx, ny, 110);
        ng.addColorStop(0, i === 0 ? "rgba(124,58,237,0.07)" : i === 1 ? "rgba(6,182,212,0.05)" : "rgba(236,72,153,0.04)");
        ng.addColorStop(1, "transparent");
        ctx.fillStyle = ng;
        ctx.fillRect(nx - 120, ny - 120, 240, 240);
      }

      // ===== PAINTER'S SORT + DRAW ISLANDS =====
      const FOG_START = 18;
      const FOG_END   = 55;

      const sorted = [...islandsRef.current].sort((a, b) => {
        const dax = a.wx + a.sw / 2 - cam.px;
        const daz = a.wz + a.sd / 2 - cam.pz;
        const dbx = b.wx + b.sw / 2 - cam.px;
        const dbz = b.wz + b.sd / 2 - cam.pz;
        const da = dax * dax + daz * daz;
        const db = dbx * dbx + dbz * dbz;
        return db - da; // far first
      });

      for (const isl of sorted) {
        const cx = isl.wx + isl.sw / 2;
        const cz = isl.wz + isl.sd / 2;
        const distToBlock = Math.sqrt((cx - cam.px) ** 2 + (cz - cam.pz) ** 2);
        const fogT = Math.min(1, Math.max(0, (distToBlock - FOG_START) / (FOG_END - FOG_START)));
        if (fogT >= 1) continue; // fully fogged out

        const activated = isl.checkpoint && isl.checkpointId !== undefined && activatedCPRef.current.has(isl.checkpointId);
        const blockColor = activated ? "#22C55E" : (isl.color ?? "#6D28D9");

        drawBox3D(ctx, isl.wx, isl.wy, isl.wz, isl.sw, isl.sd, isl.sh, blockColor, cam, fogT);

        if (isl.checkpoint) {
          drawFlag3D(ctx, isl.wx + isl.sw / 2, isl.wy + isl.sh, isl.wz + isl.sd / 2, cam, !!activated);
        }
      }

      // Draw particles
      for (const pt of particlesRef.current) {
        const pp = perspProject(pt.x, pt.y, pt.z, cam);
        if (pp) {
          ctx.globalAlpha = pt.life;
          ctx.fillStyle = "#A78BFA";
          ctx.beginPath();
          ctx.arc(pp.sx, pp.sy, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;

      // Draw carpet under player if active
      if (!p.dead && carpetRef.current) {
        drawCarpet3D(ctx, p.wx, p.wy, p.wz, cam, t);
      }

      // Draw player cube
      if (!p.dead) {
        drawPlayerCube(ctx, p.wx - 0.4, p.wy, p.wz - 0.4, cam, p.facing);
      }

      // Death flash
      if (p.dead) {
        ctx.fillStyle = "rgba(239,68,68,0.22)";
        ctx.fillRect(0, 0, CW, CH);
        ctx.fillStyle = "#F87171";
        ctx.font = "bold 22px Nunito,sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Возрождение...", CW / 2, CH / 2);
        ctx.textAlign = "left";
      }

      // HUD
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.beginPath(); ctx.roundRect(10, 10, 185, 55, 10); ctx.fill();
      ctx.fillStyle = "#F0F2FF";
      ctx.font = "bold 13px Nunito,sans-serif";
      ctx.fillText(`Смерти: ${deaths}`, 20, 30);
      ctx.fillText(`Чекпоинт: ${p.lastCP}`, 20, 50);

      if (carpetRef.current) {
        ctx.fillStyle = "rgba(220,38,38,0.65)";
        ctx.beginPath(); ctx.roundRect(CW / 2 - 75, 10, 150, 26, 8); ctx.fill();
        ctx.fillStyle = "#FCD34D";
        ctx.font = "bold 12px Nunito,sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("РЕЖИМ ПОЛЁТА", CW / 2, 28);
        ctx.textAlign = "left";
      }

      // Mini controls HUD
      ctx.fillStyle = "rgba(0,0,0,0.38)";
      ctx.beginPath(); ctx.roundRect(CW - 215, 10, 205, 42, 8); ctx.fill();
      ctx.fillStyle = "#6B7280";
      ctx.font = "10px Nunito,sans-serif";
      ctx.fillText("WASD — движение  ПРОБЕЛ — прыжок", CW - 210, 26);
      ctx.fillText("Q/E — камера  Мышь — поворот  M — магазин", CW - 210, 42);

      frameRef.current = requestAnimationFrame(tick);
    };

    // M key to open shop
    const handleShopKey = (e: KeyboardEvent) => {
      if (e.code === "KeyM") setShowShop(s => !s);
    };
    window.addEventListener("keydown", handleShopKey);

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("keydown", handleShopKey);
    };
  }, [won, reset, deaths]);

  return (
    <div className="islands-game-wrap">
      <div className="islands-header">
        <button className="btn-back" onClick={onBack}>
          <span className="btn-b-key">B</span> Выйти
        </button>
        <span className="islands-title">🏝️ Небесные острова 3D</span>
        <button className="btn-shop-open" onClick={() => setShowShop(true)}>
          🛒 Магазин
        </button>
        <button className="btn-restart" onClick={() => { reset(false); setWon(false); setDeaths(0); }}>
          🔄 Заново
        </button>
      </div>

      <div className="canvas-wrap" style={{ position: "relative" }}>
        <canvas ref={canvasRef} width={CW} height={CH} className="game-canvas" />

        {cpMsg && (
          <div className="cp-toast">{cpMsg}</div>
        )}

        {/* IN-GAME SHOP */}
        {showShop && (
          <div className="ingame-shop-overlay">
            <div className="ingame-shop">
              <div className="ingame-shop-header">
                <span>🛒 Внутриигровой магазин</span>
                <button className="ingame-shop-close" onClick={() => setShowShop(false)}>✕</button>
              </div>
              <div className="ingame-shop-balance">
                🪙 <strong>{bloxcoins.toLocaleString()} BloxCoin</strong>
              </div>
              <div className="ingame-shop-items">
                {/* Carpet */}
                <div className="shop-item">
                  <div className="shop-item-icon">🪄</div>
                  <div className="shop-item-info">
                    <div className="shop-item-name">Ковёр-самолёт</div>
                    <div className="shop-item-desc">Летай по уровню! ПРОБЕЛ — вверх, SHIFT — вниз. Чекпоинты всё равно работают.</div>
                    <div className="shop-item-price">🪙 300 BloxCoin</div>
                  </div>
                  <div className="shop-item-btns">
                    {carpetOwned ? (
                      <button
                        className={`btn-toggle-item ${carpetActive ? "active" : ""}`}
                        onClick={() => { setCarpetActive(a => !a); }}
                      >
                        {carpetActive ? "✅ Активен" : "Включить"}
                      </button>
                    ) : (
                      <button
                        className="btn-buy-item"
                        disabled={bloxcoins < 300}
                        onClick={() => { onSpend(300); setCarpetOwned(true); }}
                      >
                        Купить
                      </button>
                    )}
                  </div>
                </div>

                {/* Infinite world */}
                <div className="shop-item">
                  <div className="shop-item-icon">♾️</div>
                  <div className="shop-item-info">
                    <div className="shop-item-name">Бесконечный мир</div>
                    <div className="shop-item-desc">Генерирует 200+ случайных островов бесконечно. Прыгай сколько хочешь!</div>
                    <div className="shop-item-price">🪙 500 BloxCoin</div>
                  </div>
                  <div className="shop-item-btns">
                    {infiniteOwned ? (
                      <button className="btn-toggle-item active" onClick={() => {
                        islandsRef.current = generateInfiniteIslands(Date.now());
                        reset(false); setWon(false); setDeaths(0); setShowShop(false);
                      }}>
                        ♾️ Перегенерировать
                      </button>
                    ) : (
                      <button
                        className="btn-buy-item"
                        disabled={bloxcoins < 500}
                        onClick={() => {
                          onSpend(500);
                          setInfiniteOwned(true);
                          islandsRef.current = generateInfiniteIslands(Date.now());
                          reset(false); setWon(false); setDeaths(0); setShowShop(false);
                        }}
                      >
                        Купить
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* WIN */}
        {won && (
          <div className="win-overlay">
            <div className="win-content">
              <div className="win-emoji">🏆</div>
              <h2>Ты долетел!</h2>
              <p>Смерти: {deaths} · Чекпоинты: {activatedCPRef.current.size}/3</p>
              <button className="btn-primary" onClick={() => { reset(false); setWon(false); setDeaths(0); }}>
                Играть снова
              </button>
              <button className="btn-guest" onClick={onBack} style={{ marginTop: 8 }}>В меню</button>
            </div>
          </div>
        )}
      </div>

      <div className="islands-hint">
        <span>WASD — движение</span>
        <span>ПРОБЕЛ — прыжок</span>
        <span>Q/E или мышь — камера</span>
        <span>🟡 Чекпоинт</span>
        <span>M — магазин</span>
        <span><b>B</b> — выйти</span>
      </div>
    </div>
  );
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
        <IslandsGame
          onBack={() => { setScreen("game"); setActiveNav("game"); }}
          bloxcoins={user.bloxcoins}
          onSpend={(amt) => setUser(u => ({ ...u, bloxcoins: Math.max(0, u.bloxcoins - amt) }))}
        />
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