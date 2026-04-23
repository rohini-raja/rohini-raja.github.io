export interface Book {
  title: string;
  author: string;
  cover: string;
  rating: number;
  note: string;
  link?: string;
  color: string;
}

export const BOOKS: Book[] = [
  {
    title: "Karna's Wife",
    author: "Kavita Kané",
    cover: "📖",
    rating: 5,
    note: "A retelling of the Mahabharata through Uruvi's eyes — fierce, loving, and heartbreaking. Karna seen anew.",
    link: "https://www.goodreads.com/book/show/13542278",
    color: "#c0392b",
  },
  {
    title: "Indistractable",
    author: "Nir Eyal",
    cover: "🎯",
    rating: 4,
    note: "Taught me that the opposite of distraction isn't focus — it's traction. Changed how I think about time.",
    link: "https://www.goodreads.com/book/show/44595007",
    color: "#2980b9",
  },
  {
    title: "The Vegetarian",
    author: "Han Kang",
    cover: "🌿",
    rating: 5,
    note: "Unsettling and beautiful. A quiet rebellion that becomes something much darker. Stayed with me.",
    link: "https://www.goodreads.com/book/show/25489025",
    color: "#27ae60",
  },
];

export const GOODREADS_USER_ID = "";
