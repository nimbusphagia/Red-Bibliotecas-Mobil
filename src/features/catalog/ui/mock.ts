export type Contributor = {
  firstName: string;
  lastName: string | null;
  role: "writer" | "illustrator" | "translator";
};

export type BookRow = {
  id: number;
  title: string;
  contributors: Contributor[];
  series: string | null;
  collection: string | null;
  category: string | null;
  shelf: string | null;
  publisher: string | null;
  availableCount: number;
  copyCount: number;
};

export const MOCK_BOOKS: BookRow[] = [
  {
    id: 1,
    title: "Cien años de soledad",
    contributors: [
      { firstName: "Gabriel", lastName: "García Márquez", role: "writer" },
    ],
    series: null,
    collection: "Biblioteca Contemporánea",
    category: "Novela",
    shelf: "A-01",
    publisher: "Alfaguara",
    availableCount: 2,
    copyCount: 3,
  },
  {
    id: 2,
    title: "La ciudad y los perros",
    contributors: [
      { firstName: "Mario", lastName: "Vargas Llosa", role: "writer" },
    ],
    series: null,
    collection: "Biblioteca Contemporánea",
    category: "Novela",
    shelf: "A-02",
    publisher: "Alfaguara",
    availableCount: 0,
    copyCount: 2,
  },
  {
    id: 3,
    title: "Los ríos profundos",
    contributors: [
      { firstName: "José María", lastName: "Arguedas", role: "writer" },
    ],
    series: null,
    collection: null,
    category: "Novela",
    shelf: "A-02",
    publisher: "Horizonte",
    availableCount: 1,
    copyCount: 1,
  },
  {
    id: 4,
    title: "Breve historia del tiempo",
    contributors: [
      { firstName: "Stephen", lastName: "Hawking", role: "writer" },
      { firstName: "Javier", lastName: "Sampedro", role: "translator" },
    ],
    series: null,
    collection: "Divulgación Científica",
    category: "Ciencia",
    shelf: "C-03",
    publisher: "Crítica",
    availableCount: 3,
    copyCount: 4,
  },
  {
    id: 5,
    title: "El principito",
    contributors: [
      { firstName: "Antoine", lastName: "de Saint-Exupéry", role: "writer" },
      {
        firstName: "Antoine",
        lastName: "de Saint-Exupéry",
        role: "illustrator",
      },
    ],
    series: null,
    collection: "Clásicos Infantiles",
    category: "Infantil",
    shelf: "I-01",
    publisher: "Salamandra",
    availableCount: 5,
    copyCount: 5,
  },
  {
    id: 6,
    title: "Harry Potter y la piedra filosofal",
    contributors: [
      { firstName: "J. K.", lastName: "Rowling", role: "writer" },
      { firstName: "Gemma", lastName: "Rovira", role: "translator" },
    ],
    series: "Harry Potter",
    collection: null,
    category: "Fantasía",
    shelf: "F-01",
    publisher: "Salamandra",
    availableCount: 1,
    copyCount: 4,
  },
  {
    id: 7,
    title: "Harry Potter y la cámara secreta",
    contributors: [
      { firstName: "J. K.", lastName: "Rowling", role: "writer" },
      { firstName: "Adolfo", lastName: "Muñoz García", role: "translator" },
    ],
    series: "Harry Potter",
    collection: null,
    category: "Fantasía",
    shelf: "F-01",
    publisher: "Salamandra",
    availableCount: 2,
    copyCount: 3,
  },
  {
    id: 8,
    title: "Sapiens: de animales a dioses",
    contributors: [
      { firstName: "Yuval Noah", lastName: "Harari", role: "writer" },
      { firstName: "Joandomènec", lastName: "Ros", role: "translator" },
    ],
    series: null,
    collection: "Historia y Sociedad",
    category: "Historia",
    shelf: "H-02",
    publisher: "Debate",
    availableCount: 0,
    copyCount: 2,
  },
  {
    id: 9,
    title: "Tradiciones peruanas",
    contributors: [{ firstName: "Ricardo", lastName: "Palma", role: "writer" }],
    series: null,
    collection: "Clásicos Peruanos",
    category: "Cuento",
    shelf: "B-04",
    publisher: null,
    availableCount: 1,
    copyCount: 1,
  },
  {
    id: 10,
    title: "Mafalda 1",
    contributors: [
      {
        firstName: "Joaquín Salvador",
        lastName: "Lavado (Quino)",
        role: "writer",
      },
      {
        firstName: "Joaquín Salvador",
        lastName: "Lavado (Quino)",
        role: "illustrator",
      },
    ],
    series: "Mafalda",
    collection: null,
    category: "Cómic",
    shelf: "G-01",
    publisher: "Lumen",
    availableCount: 2,
    copyCount: 2,
  },
];
