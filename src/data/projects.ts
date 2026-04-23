export interface Project {
  id: string;
  name: string;
  tagline: string;
  description: string;
  tech: string[];
  link?: string;
  repo?: string;
  emoji: string;
  color: string;
  status: "live" | "wip" | "archived";
}

export const PROJECTS: Project[] = [
  {
    id: "focus-flight",
    name: "Focus Flight",
    tagline: "Productivity wrapped in aviation aesthetics",
    description:
      "A focus timer that turns your work sessions into flights. Book a route, take off, land when done. Split-flap arrivals board, ambient sounds, session logbook.",
    tech: ["React", "TypeScript", "Tailwind", "Vite", "Framer Motion"],
    link: "https://rohini-focus-flight.vercel.app",
    repo: "https://github.com/rohini-raja/Focus-Flight",
    emoji: "✈️",
    color: "#0a84ff",
    status: "live",
  },
  {
    id: "naruto-tasks",
    name: "Hidden Leaf Tasks",
    tagline: "Ninja-themed task manager",
    description:
      "A Naruto-themed task management app. Track missions, rank up through the ninja tiers, and manage your squad. Built with Express, PostgreSQL, and React.",
    tech: ["React", "Express", "PostgreSQL", "Neon", "TypeScript"],
    link: "https://rohini-hidden-leaf.vercel.app",
    emoji: "🍃",
    color: "#ff6b00",
    status: "live",
  },
];
