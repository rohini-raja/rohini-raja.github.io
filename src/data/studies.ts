export interface Study {
  id: string;
  title: string;
  type: "paper" | "book" | "course" | "topic";
  emoji: string;
  summary: string;
  status: "done" | "reading" | "queued";
  link?: string;
  tags: string[];
  color: string;
}

export const STUDIES: Study[] = [
  {
    id: "gfs",
    title: "The Google File System",
    type: "paper",
    emoji: "📄",
    summary:
      "Ghemawat et al., 2003. A scalable distributed file system for large data-intensive applications. Key insight: design around frequent component failures, huge sequential reads, appends over overwrites.",
    status: "done",
    link: "https://static.googleusercontent.com/media/research.google.com/en//archive/gfs-sosp2003.pdf",
    tags: ["distributed systems", "storage", "Google"],
    color: "#4285f4",
  },
  {
    id: "mapreduce",
    title: "MapReduce",
    type: "paper",
    emoji: "📄",
    summary: "Dean & Ghemawat, 2004. A programming model for processing large datasets in parallel across a cluster.",
    status: "queued",
    link: "https://static.googleusercontent.com/media/research.google.com/en//archive/mapreduce-osdi04.pdf",
    tags: ["distributed systems", "batch processing", "Google"],
    color: "#34a853",
  },
  {
    id: "dynamo",
    title: "Dynamo: Amazon's Highly Available Key-value Store",
    type: "paper",
    emoji: "📄",
    summary: "DeCandia et al., 2007. Eventually consistent distributed storage. Consistent hashing, vector clocks, quorum.",
    status: "queued",
    link: "https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf",
    tags: ["distributed systems", "databases", "Amazon"],
    color: "#ff9900",
  },
];
