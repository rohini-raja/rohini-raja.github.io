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
    id: "forest",
    name: "Enchanted Forest",
    emoji: "🌿",
    bg: "#0d1f0d",
    ground: "#2d5a1b",
    path: "#c4a35a",
    water: "#1a6b8a",
    tree: "#1a4a0f",
    building: "#5c3d1e",
    buildingRoof: "#8b2e2e",
    text: "#e8f5e0",
    accent: "#6ee86e",
    panel: "rgba(13,31,13,0.92)",
    panelBorder: "#6ee86e",
    terminal: "#0a180a",
    terminalText: "#6ee86e",
    sky: "#0d2b3e",
  },
  {
    id: "ocean",
    name: "Deep Ocean",
    emoji: "🌊",
    bg: "#030d1a",
    ground: "#0a3d5c",
    path: "#a0c4d8",
    water: "#051e3e",
    tree: "#0a5c4a",
    building: "#1a3a5c",
    buildingRoof: "#0a7a9a",
    text: "#d0eeff",
    accent: "#4dd0e1",
    panel: "rgba(3,13,26,0.92)",
    panelBorder: "#4dd0e1",
    terminal: "#020a14",
    terminalText: "#4dd0e1",
    sky: "#020d1f",
  },
  {
    id: "sakura",
    name: "Sakura Spring",
    emoji: "🌸",
    bg: "#1a0a12",
    ground: "#5c2d4a",
    path: "#f4c2d0",
    water: "#9b3a6e",
    tree: "#8b1a4a",
    building: "#4a1a2d",
    buildingRoof: "#c2185b",
    text: "#ffe0ee",
    accent: "#f48fb1",
    panel: "rgba(26,10,18,0.92)",
    panelBorder: "#f48fb1",
    terminal: "#120008",
    terminalText: "#f48fb1",
    sky: "#1a0d1a",
  },
  {
    id: "sunset",
    name: "Desert Sunset",
    emoji: "🌅",
    bg: "#1a0a00",
    ground: "#6b3a00",
    path: "#f0c060",
    water: "#c04000",
    tree: "#4a2a00",
    building: "#8b4513",
    buildingRoof: "#d4600a",
    text: "#fff0d0",
    accent: "#ffa040",
    panel: "rgba(26,10,0,0.92)",
    panelBorder: "#ffa040",
    terminal: "#120800",
    terminalText: "#ffa040",
    sky: "#1a0800",
  },
  {
    id: "galaxy",
    name: "Galaxy Night",
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
    id: "gold",
    name: "Ancient Gold",
    emoji: "✨",
    bg: "#0f0900",
    ground: "#3d2800",
    path: "#d4af37",
    water: "#1a1000",
    tree: "#2d1a00",
    building: "#5c3d00",
    buildingRoof: "#9a7200",
    text: "#fff8dc",
    accent: "#ffd700",
    panel: "rgba(15,9,0,0.92)",
    panelBorder: "#ffd700",
    terminal: "#080600",
    terminalText: "#ffd700",
    sky: "#0a0600",
  },
];

export const DEFAULT_THEME = THEMES[0];
