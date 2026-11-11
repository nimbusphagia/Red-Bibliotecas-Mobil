import { createAuthor } from "@/features/catalog/internal/author/service";
import type { CollaboratorRole } from "@/features/catalog/internal/author/types";
import { listBooks } from "@/features/catalog/internal/book/service";
import { listCategories } from "@/features/catalog/internal/category/service";
import { createCollection } from "@/features/catalog/internal/collection/service";
import { createPublisher } from "@/features/catalog/internal/publisher/service";
import { createSeries } from "@/features/catalog/internal/series/service";
import { listSubcategories } from "@/features/catalog/internal/subcategory/service";
import {
  exitCopies,
  registerCopies,
} from "@/features/inventory/internal/movement/service";
import { lendCopies } from "@/features/loans/internal/loan/service";
import { createVisitor } from "@/features/loans/internal/visitor/service";

const AUTHORS: [string, string | null][] = [
  ["Gabriel", "García Márquez"],
  ["Mario", "Vargas Llosa"],
  ["José María", "Arguedas"],
  ["Ricardo", "Palma"],
  ["Clorinda", "Matto de Turner"],
  ["Julio", "Cortázar"],
  ["Isabel", "Allende"],
  ["Horacio", "Quiroga"],
  ["César", "Vallejo"],
  ["Pablo", "Neruda"],
  ["Antoine", "de Saint-Exupéry"],
  ["J. K.", "Rowling"],
  ["Quino", null],
  ["Marcela", "Paz"],
  ["Stephen", "Hawking"],
  ["Yuval Noah", "Harari"],
  ["Rosa", "Díaz"],
  ["Luis", "Paredes"],
  ["Gemma", "Rovira"],
  ["Javier", "Sampedro"],
];

const PUBLISHERS = [
  "Alfaguara",
  "Planeta",
  "Santillana",
  "Norma",
  "Salamandra",
];

const COLLECTIONS: [publisher: string, name: string][] = [
  ["Alfaguara", "Biblioteca Contemporánea"],
  ["Santillana", "Clásicos Escolares"],
  ["Norma", "Cuentos del Mundo"],
];

const SERIES: [name: string, author: string][] = [
  ["Harry Potter", "J. K. Rowling"],
  ["Mafalda", "Quino"],
  ["Papelucho", "Marcela Paz"],
];

// Categorías y subcategorías: las de la migración 0001
const L = "Literatura";
const C = "Consulta";
const E = "Texto Escolar";
const LEN = "Lengua y Literatura";
const CUE = "Cuento";
const POE = "Poesía";
const PER = "Personajes";
const HIS = "Historia";
const NAT = "Ciencias de la Naturaleza";
const SOC = "Ciencias Sociales";
const GEO = "Geografía";

type Extra = {
  pub?: string;
  col?: string;
  series?: string;
  ill?: boolean; // el autor también es ilustrador
  tr?: string; // traductor
};
type Book = [
  title: string,
  by: string,
  cat: string,
  sub: string,
  year: number,
  pages: number,
  copies: number,
  extra?: Extra,
];

const BC = { pub: "Alfaguara", col: "Biblioteca Contemporánea" };
const CE = { pub: "Santillana", col: "Clásicos Escolares" };
const HP = { pub: "Salamandra", series: "Harry Potter", tr: "Gemma Rovira" };
const MF = { pub: "Norma", series: "Mafalda", ill: true };
const PA = { pub: "Santillana", series: "Papelucho" };

const BOOKS: Book[] = [
  ["Cien años de soledad", "Gabriel García Márquez", L, LEN, 1967, 471, 3, BC],
  [
    "El amor en los tiempos del cólera",
    "Gabriel García Márquez",
    L,
    LEN,
    1985,
    348,
    2,
    BC,
  ],
  [
    "Crónica de una muerte anunciada",
    "Gabriel García Márquez",
    L,
    LEN,
    1981,
    122,
    2,
    { pub: "Alfaguara" },
  ],
  ["La ciudad y los perros", "Mario Vargas Llosa", L, LEN, 1963, 400, 2, BC],
  [
    "Conversación en La Catedral",
    "Mario Vargas Llosa",
    L,
    LEN,
    1969,
    600,
    1,
    { pub: "Alfaguara" },
  ],
  [
    "Los ríos profundos",
    "José María Arguedas",
    L,
    LEN,
    1958,
    250,
    1,
    { pub: "Planeta" },
  ],
  [
    "Todas las sangres",
    "José María Arguedas",
    L,
    LEN,
    1964,
    580,
    1,
    { pub: "Planeta" },
  ],
  ["Tradiciones peruanas", "Ricardo Palma", L, CUE, 1872, 420, 3, CE],
  ["Aves sin nido", "Clorinda Matto de Turner", L, LEN, 1889, 280, 2, CE],
  ["Rayuela", "Julio Cortázar", L, LEN, 1963, 600, 1, { pub: "Alfaguara" }],
  ["Bestiario", "Julio Cortázar", L, CUE, 1951, 190, 2, { pub: "Alfaguara" }],
  [
    "La casa de los espíritus",
    "Isabel Allende",
    L,
    LEN,
    1982,
    433,
    2,
    { pub: "Planeta" },
  ],
  [
    "Cuentos de la selva",
    "Horacio Quiroga",
    L,
    CUE,
    1918,
    120,
    4,
    { pub: "Norma", col: "Cuentos del Mundo" },
  ],
  ["Anaconda", "Horacio Quiroga", L, CUE, 1921, 150, 1, { pub: "Norma" }],
  ["Trilce", "César Vallejo", L, POE, 1922, 120, 2, { pub: "Planeta" }],
  ["Los heraldos negros", "César Vallejo", L, POE, 1919, 130, 1], // sin editorial
  [
    "Veinte poemas de amor y una canción desesperada",
    "Pablo Neruda",
    L,
    POE,
    1924,
    90,
    2,
    { pub: "Salamandra" },
  ],
  [
    "Canto general",
    "Pablo Neruda",
    L,
    POE,
    1950,
    400,
    1,
    { pub: "Salamandra" },
  ],
  [
    "El principito",
    "Antoine de Saint-Exupéry",
    L,
    CUE,
    1943,
    96,
    5,
    { pub: "Salamandra", ill: true },
  ],
  [
    "Harry Potter y la piedra filosofal",
    "J. K. Rowling",
    L,
    PER,
    1997,
    309,
    4,
    HP,
  ],
  [
    "Harry Potter y la cámara secreta",
    "J. K. Rowling",
    L,
    PER,
    1998,
    341,
    3,
    HP,
  ],
  [
    "Harry Potter y el prisionero de Azkaban",
    "J. K. Rowling",
    L,
    PER,
    1999,
    435,
    2,
    HP,
  ],
  ["Mafalda 1", "Quino", L, PER, 1966, 112, 2, MF],
  ["Mafalda 2", "Quino", L, PER, 1967, 112, 2, MF],
  ["Papelucho", "Marcela Paz", L, PER, 1947, 150, 3, PA],
  ["Papelucho en vacaciones", "Marcela Paz", L, PER, 1957, 160, 2, PA],
  [
    "Breve historia del tiempo",
    "Stephen Hawking",
    C,
    NAT,
    1988,
    256,
    3,
    { pub: "Planeta", tr: "Javier Sampedro" },
  ],
  [
    "Sapiens: de animales a dioses",
    "Yuval Noah Harari",
    C,
    HIS,
    2011,
    496,
    2,
    { pub: "Santillana" },
  ],
  [
    "Geografía del Perú",
    "Luis Paredes",
    E,
    GEO,
    2015,
    180,
    6,
    { pub: "Santillana" },
  ],
  [
    "Ciencias Sociales 3",
    "Rosa Díaz",
    E,
    SOC,
    2018,
    160,
    6,
    { pub: "Santillana" },
  ],
];

// [visitante, título, cantidad de copias prestadas]
const LOANS: [string, string, number][] = [
  ["Ana Torres", "Cien años de soledad", 2],
  ["Ana Torres", "La ciudad y los perros", 2],
  ["Luis Ramos", "Harry Potter y la piedra filosofal", 1],
  ["Luis Ramos", "Mafalda 1", 2],
  ["Luis Ramos", "El principito", 1],
];

const idsByName = (rows: { id: number; name: string }[]) =>
  new Map(rows.map((r) => [r.name, r.id]));

export async function seedDev(actorId: number): Promise<string> {
  if ((await listBooks({ limit: 1 })).total > 0) {
    return "Ya hay libros: no se hizo nada";
  }

  const authors = new Map<string, number>();
  for (const [firstName, lastName] of AUTHORS) {
    const a = await createAuthor({ firstName, lastName });
    authors.set([firstName, lastName].filter(Boolean).join(" "), a.id);
  }

  const publishers = new Map<string, number>();
  for (const name of PUBLISHERS) {
    publishers.set(name, (await createPublisher({ name })).id);
  }

  const collections = new Map<string, number>();
  for (const [publisher, name] of COLLECTIONS) {
    const publisherId = publishers.get(publisher)!;
    collections.set(name, (await createCollection({ name, publisherId })).id);
  }

  const series = new Map<string, number>();
  for (const [name, author] of SERIES) {
    const authorId = authors.get(author)!;
    series.set(name, (await createSeries({ name, authorId })).id);
  }

  const categories = idsByName(await listCategories({ limit: 100 }));
  const subcategories = idsByName(await listSubcategories({ limit: 100 }));

  const collab = (name: string, role: CollaboratorRole) => ({
    authorId: authors.get(name)!,
    role,
  });

  const { lines } = await registerCopies(actorId, {
    lines: BOOKS.map(([title, by, cat, sub, year, pages, copies, x = {}]) => ({
      quantity: copies,
      omitWords: x.series ? [x.series] : [], // evita etiquetas repetidas
      book: {
        title,
        publisherId: x.pub ? publishers.get(x.pub) : null,
        collectionId: x.col ? collections.get(x.col) : null,
        seriesId: x.series ? series.get(x.series) : null,
        categoryId: categories.get(cat),
        subcategoryId: subcategories.get(sub),
        publicationYear: year,
        pageCount: pages,
        collaborators: [
          collab(by, "writer"),
          ...(x.ill ? [collab(by, "illustrator")] : []),
          ...(x.tr ? [collab(x.tr, "translator")] : []),
        ],
      },
    })),
  });

  const copiesOf = new Map(
    lines.map((l) => [l.title, l.copies.map((c) => c.copyId)]),
  );

  // Préstamos
  const visitors = new Map<string, number>();
  for (const name of ["Ana Torres", "Luis Ramos"]) {
    visitors.set(name, (await createVisitor({ name, role: "teacher" })).id);
  }
  for (const [name, visitorId] of visitors) {
    const copyIds = LOANS.filter(([v]) => v === name).flatMap(([, title, n]) =>
      copiesOf.get(title)!.slice(0, n),
    );
    await lendCopies(actorId, { visitorId, copyIds });
  }

  // Una copia perdida
  await exitCopies(actorId, {
    reason: "loss",
    copyIds: copiesOf.get("Sapiens: de animales a dioses")!.slice(0, 1),
  });

  return `Seed listo: ${BOOKS.length} libros`;
}
