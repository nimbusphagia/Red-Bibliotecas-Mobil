import { db } from "@/db/client";
import {
  loanMovement,
  loanMovementLine,
  stockMovement,
  stockMovementLine,
} from "@/db/schema";
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
import { createShelf } from "@/features/inventory/internal/shelf/service";
import {
  lendCopies,
  returnCopies,
} from "@/features/loans/internal/loan/service";
import { listSchoolGrades } from "@/features/loans/internal/reference/service";
import { createVisitor } from "@/features/loans/internal/visitor/service";
import { eq, sql } from "drizzle-orm";

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

// Libro donado, sin editorial
const DONATED: Book = ["Poemas humanos", "César Vallejo", L, POE, 1939, 180, 2];

// Estantes (el "Default" ya existe y es la Estantería General)
const SHELVES: [name: string, description: string][] = [
  ["Literatura", "Novelas y obras clásicas"],
  ["Poesía", "Poemarios y antologías"],
  ["Consulta", "Libros de consulta, solo lectura en sala"],
  ["Textos escolares", "Material de apoyo por grado"],
];

const SHELF_BY_CATEGORY: Record<string, string> = {
  [L]: "Literatura",
  [C]: "Consulta",
  [E]: "Textos escolares",
};
// Los cuentos no tienen estante propio: quedan en el general
const shelfOf = (cat: string, sub: string) =>
  sub === POE ? "Poesía" : sub === CUE ? undefined : SHELF_BY_CATEGORY[cat];

const TEACHERS = ["Ana Torres", "Luis Ramos", "Carmen Soto"];

const STUDENTS: [
  name: string,
  level: "primary" | "secondary",
  grade: number,
][] = [
  ["Diego Quispe", "secondary", 3],
  ["Valeria Huamán", "secondary", 5],
  ["Mateo Flores", "primary", 6],
  ["Camila Rojas", "secondary", 1],
  ["Sofía Mendoza", "primary", 4],
  ["Lucía Vega", "primary", 5],
  ["Joaquín Paredes", "secondary", 2], // sin préstamos
];

type Loan = {
  visitor: string;
  items: [title: string, copies: number][];
  daysAgo: number;
  // Un ejemplar devuelto por título; sin resultado = devuelto en buen estado
  returns?: [
    title: string,
    outcome?: "returned_damaged" | "lost",
    reason?: "discard",
  ][];
};

const LOANS: Loan[] = [
  // Vigentes
  {
    visitor: "Ana Torres",
    items: [
      ["Cien años de soledad", 2],
      ["La ciudad y los perros", 2],
    ],
    daysAgo: 2,
  },
  {
    visitor: "Lucía Vega",
    items: [
      ["Harry Potter y la cámara secreta", 1],
      ["Papelucho en vacaciones", 1],
    ],
    daysAgo: 3,
  },
  // Vencidos
  {
    visitor: "Diego Quispe",
    items: [
      ["Rayuela", 1],
      ["Bestiario", 1],
    ],
    daysAgo: 12,
  },
  { visitor: "Mateo Flores", items: [["Papelucho", 1]], daysAgo: 9 },
  // Bloqueado: 3 ejemplares vencidos
  {
    visitor: "Camila Rojas",
    items: [
      ["Geografía del Perú", 2],
      ["Ciencias Sociales 3", 1],
    ],
    daysAgo: 15,
  },
  // Parcialmente devuelto: quedan 1 Mafalda y 1 Harry Potter
  {
    visitor: "Luis Ramos",
    items: [
      ["Harry Potter y la piedra filosofal", 1],
      ["Mafalda 1", 2],
      ["El principito", 1],
    ],
    daysAgo: 6,
    returns: [["El principito"], ["Mafalda 1", "returned_damaged"]],
  },
  // Finalizados
  {
    visitor: "Carmen Soto",
    items: [
      ["Canto general", 1],
      ["Trilce", 1],
    ],
    daysAgo: 4,
    returns: [["Canto general"], ["Trilce"]],
  },
  {
    visitor: "Valeria Huamán",
    items: [
      ["Breve historia del tiempo", 1],
      ["Sapiens: de animales a dioses", 1],
    ],
    daysAgo: 8,
    returns: [
      ["Breve historia del tiempo"],
      ["Sapiens: de animales a dioses", "lost"],
    ],
  },
  {
    visitor: "Sofía Mendoza",
    items: [
      ["Cuentos de la selva", 1],
      ["Anaconda", 1],
    ],
    daysAgo: 5,
    returns: [["Cuentos de la selva"], ["Anaconda", "lost", "discard"]],
  },
];

const DAY = 86400;

// Igual que backdateLoan: mueve el encabezado y sus líneas
async function backdateStock(id: number, days: number) {
  await db
    .update(stockMovement)
    .set({ createdAt: sql`${stockMovement.createdAt} - ${days * DAY}` })
    .where(eq(stockMovement.id, id));
  await db
    .update(stockMovementLine)
    .set({ createdAt: sql`${stockMovementLine.createdAt} - ${days * DAY}` })
    .where(eq(stockMovementLine.movementId, id));
}

async function backdateLoan(id: number, days: number) {
  await db
    .update(loanMovement)
    .set({
      createdAt: sql`${loanMovement.createdAt} - ${days * DAY}`,
      expiresBy: sql`date(${loanMovement.expiresBy}, ${`-${days} days`})`,
    })
    .where(eq(loanMovement.id, id));
  await db
    .update(loanMovementLine)
    .set({ createdAt: sql`${loanMovementLine.createdAt} - ${days * DAY}` })
    .where(eq(loanMovementLine.movementId, id));
}

const idsByName = (rows: { id: number; name: string }[]) =>
  new Map(rows.map((r) => [r.name, r.id]));

export async function seedDev(actorId: number): Promise<string> {
  if ((await listBooks({ limit: 1 })).total > 0) {
    return "Ya hay libros: no se hizo nada";
  }

  // Catálogo
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

  const shelves = new Map<string, number>();
  for (const [name, description] of SHELVES) {
    shelves.set(name, (await createShelf({ name, description })).id);
  }

  const collab = (name: string, role: CollaboratorRole) => ({
    authorId: authors.get(name)!,
    role,
  });

  const bookLine = ([
    title,
    by,
    cat,
    sub,
    year,
    pages,
    copies,
    x = {},
  ]: Book) => {
    const shelf = shelfOf(cat, sub);
    return {
      quantity: copies,
      shelfId: shelf ? shelves.get(shelf) : undefined,
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
    };
  };

  // Entradas de stock
  const copiesOf = new Map<string, number[]>();
  const track = (lines: { title: string; copies: { copyId: number }[] }[]) => {
    for (const l of lines) {
      copiesOf.set(l.title, [
        ...(copiesOf.get(l.title) ?? []),
        ...l.copies.map((c) => c.copyId),
      ]);
    }
  };
  // Saca ejemplares del pool para que ningún préstamo o salida repita copia
  const take = (title: string, n: number) => {
    const pool = copiesOf.get(title);
    if (!pool) throw new Error(`No hay ejemplares registrados de "${title}"`);
    if (pool.length < n) throw new Error(`Faltan ejemplares de "${title}"`);
    return pool.splice(0, n);
  };

  const purchase = await registerCopies(actorId, {
    reason: "purchase",
    notes: "Compra inicial del catálogo",
    lines: BOOKS.map(bookLine),
  });
  track(purchase.lines);
  await backdateStock(purchase.movement.id, 30);
  const bookIds = new Map(purchase.lines.map((l) => [l.title, l.bookId]));

  const donation = await registerCopies(actorId, {
    reason: "donation",
    notes: "Donación de la promoción 2025",
    lines: [
      { bookId: bookIds.get("El principito")!, quantity: 2 },
      { bookId: bookIds.get("Tradiciones peruanas")!, quantity: 3 },
      bookLine(DONATED),
    ],
  });
  track(donation.lines);
  await backdateStock(donation.movement.id, 14);

  const other = await registerCopies(actorId, {
    reason: "other",
    notes: "Reposición de un ejemplar",
    lines: [{ bookId: bookIds.get("Mafalda 1")!, quantity: 1 }],
  });
  track(other.lines);
  await backdateStock(other.movement.id, 5);

  // Visitantes
  const visitors = new Map<string, number>();
  for (const name of TEACHERS) {
    visitors.set(name, (await createVisitor({ name, role: "teacher" })).id);
  }
  const grades = new Map(
    (await listSchoolGrades()).map((g) => [`${g.level}-${g.grade}`, g.id]),
  );
  for (const [name, level, grade] of STUDENTS) {
    const gradeId = grades.get(`${level}-${grade}`)!;
    visitors.set(
      name,
      (await createVisitor({ name, role: "student", gradeId })).id,
    );
  }

  // Préstamos
  for (const loan of LOANS) {
    const lent = loan.items.map(([title, n]) => ({
      title,
      ids: take(title, n),
    }));
    const { movement } = await lendCopies(actorId, {
      visitorId: visitors.get(loan.visitor)!,
      copyIds: lent.flatMap((l) => l.ids),
    });
    await backdateLoan(movement.id, loan.daysAgo);

    if (loan.returns) {
      await returnCopies(actorId, {
        items: loan.returns.map(
          ([title, outcome = "returned" as const, reason]) => ({
            copyId: lent.find((l) => l.title === title)!.ids[0],
            outcome,
            reason,
          }),
        ),
      });
    }
  }

  // Salidas manuales
  await exitCopies(actorId, {
    reason: "loss",
    copyIds: take("Geografía del Perú", 1),
    notes: "Extraviado en el aula",
  });
  await exitCopies(actorId, {
    reason: "damage",
    copyIds: take("Tradiciones peruanas", 1),
    notes: "Lomo despegado y hojas sueltas",
  });
  await exitCopies(actorId, {
    reason: "discard",
    copyIds: take("Aves sin nido", 1),
    notes: "Deterioro por humedad",
  });

  return `Seed listo: ${BOOKS.length + 1} libros, ${visitors.size} visitantes, ${LOANS.length} préstamos`;
}
