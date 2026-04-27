export interface Theme {
  id: string;
  name: string;
  emoji: string;
  bg: string;
  ground: string;
  path: string;
  water: string;
  tree: string;
  building: string;
  buildingRoof: string;
  text: string;
  accent: string;
  panel: string;
  panelBorder: string;
  terminal: string;
  terminalText: string;
  sky: string;
}

export const THEMES: Theme[] = [
  {
    id: "galaxy",
    name: "Galaxy",
    emoji: "🌌",
    bg: "#050010",
    ground: "#1a0a3a",
    path: "#9060d0",
    water: "#0a0030",
    tree: "#200060",
    building: "#1a0050",
    buildingRoof: "#6020c0",
    text: "#e0d0ff",
    accent: "#b060ff",
    panel: "rgba(5,0,16,0.92)",
    panelBorder: "#b060ff",
    terminal: "#030008",
    terminalText: "#b060ff",
    sky: "#050010",
  },
  {
    id: "nebula",
    name: "Nebula",
    emoji: "🔮",
    bg: "#07010f",
    ground: "#2a0a3a",
    path: "#d070e0",
    water: "#0d003a",
    tree: "#3a0060",
    building: "#1e0040",
    buildingRoof: "#c020a0",
    text: "#f5e0ff",
    accent: "#ff60d8",
    panel: "rgba(7,1,15,0.92)",
    panelBorder: "#ff60d8",
    terminal: "#040009",
    terminalText: "#ff60d8",
    sky: "#07010f",
  },
  {
    id: "blackhole",
    name: "Black Hole",
    emoji: "🌑",
    bg: "#000003",
    ground: "#04000e",
    path: "#00e0c8",
    water: "#000008",
    tree: "#001414",
    building: "#000c0c",
    buildingRoof: "#006e60",
    text: "#c8fff8",
    accent: "#00e0c8",
    panel: "rgba(0,0,3,0.96)",
    panelBorder: "#00e0c8",
    terminal: "#000002",
    terminalText: "#00e0c8",
    sky: "#000003",
  },
  {
    id: "solarflare",
    name: "Solar Flare",
    emoji: "☀️",
    bg: "#0f0400",
    ground: "#3d1200",
    path: "#ffb020",
    water: "#180800",
    tree: "#2d0900",
    building: "#5c1800",
    buildingRoof: "#e04800",
    text: "#fff2d0",
    accent: "#ff8c00",
    panel: "rgba(15,4,0,0.92)",
    panelBorder: "#ff8c00",
    terminal: "#090200",
    terminalText: "#ff8c00",
    sky: "#0a0200",
  },
  {
    id: "aurora",
    name: "Aurora",
    emoji: "💫",
    bg: "#000e06",
    ground: "#002e14",
    path: "#40ffaa",
    water: "#001508",
    tree: "#004020",
    building: "#002010",
    buildingRoof: "#008840",
    text: "#c0ffe8",
    accent: "#00ff88",
    panel: "rgba(0,14,6,0.92)",
    panelBorder: "#00ff88",
    terminal: "#000803",
    terminalText: "#00ff88",
    sky: "#000a04",
  },
  {
    id: "pulsar",
    name: "Pulsar",
    emoji: "⚡",
    bg: "#000510",
    ground: "#001840",
    path: "#40b8ff",
    water: "#000a20",
    tree: "#001e54",
    building: "#001040",
    buildingRoof: "#0060c0",
    text: "#d0e8ff",
    accent: "#40b8ff",
    panel: "rgba(0,5,16,0.92)",
    panelBorder: "#40b8ff",
    terminal: "#000308",
    terminalText: "#40b8ff",
    sky: "#000510",
  },
];

export const DEFAULT_THEME = THEMES[0];
