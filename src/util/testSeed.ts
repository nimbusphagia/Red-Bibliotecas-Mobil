import { db } from "@/db/client";
import {
  account,
  author,
  book,
  copy,
  loanMovement,
  loanMovementLine,
  stockMovement,
  stockMovementLine,
  visitor,
} from "@/db/schema";
import { setInitialPassword } from "@/features/account/internal/service";
import type { AccountRole } from "@/features/account/internal/types";
import { createAuthor } from "@/features/catalog/internal/author/service";
import type { CollaboratorRole } from "@/features/catalog/internal/author/types";
import {
  createBook,
  listBooks,
  updateBook,
} from "@/features/catalog/internal/book/service";
import { listCategories } from "@/features/catalog/internal/category/service";
import { createCollection } from "@/features/catalog/internal/collection/service";
import { createPublisher } from "@/features/catalog/internal/publisher/service";
import { createSeries } from "@/features/catalog/internal/series/service";
import { listSubcategories } from "@/features/catalog/internal/subcategory/service";
import {
  markCopiesLabeled,
  setCopyDamaged,
} from "@/features/inventory/internal/copy/service";
import { RELEASED_STATUSES } from "@/features/inventory/internal/copy/types";
import {
  exitCopies,
  recoverCopy,
  registerCopies,
} from "@/features/inventory/internal/movement/service";
import type {
  EntryResult,
  ExitResult,
} from "@/features/inventory/internal/movement/types";
import {
  createShelf,
  moveCopies,
} from "@/features/inventory/internal/shelf/service";
import {
  lendCopies,
  returnCopies,
} from "@/features/loans/internal/loan/service";
import type { LineOutcome } from "@/features/loans/internal/loan/types";
import { listSchoolGrades } from "@/features/loans/internal/reference/service";
import {
  createVisitor,
  updateVisitor,
} from "@/features/loans/internal/visitor/service";
import { and, eq, inArray, notInArray, sql } from "drizzle-orm";

// Todo se registra "hoy" con los services y luego se retrocede `daysAgo`
// días. Los eventos corren en orden cronológico para que el estado de cada
// ejemplar sea coherente en cada paso.

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
  ["Cruz Roja", null], // autor del libro sin categoría
];

const PUBLISHERS = [
  "Alfaguara",
  "Planeta",
  "Santillana",
  "Norma",
  "Salamandra",
  "Editorial Universitaria", // sin libros
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
  co?: string; // segundo escritor
};
type Book = [
  title: string,
  by: string,
  cat: string | null,
  sub: string | null,
  year: number | null,
  pages: number | null,
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
  // Mal clasificado: se corrige después y sus tejuelos quedan desactualizados
  ["Bestiario", "Julio Cortázar", L, LEN, 1951, 190, 2, { pub: "Alfaguara" }],
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

// Segunda compra: anónimo y dos escritores
const SECOND: Book[] = [
  ["Lazarillo de Tormes", "Anónimo", L, LEN, 1554, 96, 2, CE],
  [
    "Antología del cuento peruano",
    "Rosa Díaz",
    L,
    CUE,
    2020,
    310,
    3,
    { pub: "Santillana", co: "Luis Paredes" },
  ],
];

// Última compra, aún sin etiquetar
const LATEST: Book = [
  "La tía Julia y el escribidor",
  "Mario Vargas Llosa",
  L,
  LEN,
  1977,
  447,
  2,
  BC,
];

// Catalogados sin ejemplares; sin categoría no se puede registrar stock
const CATALOG_ONLY: Book[] = [
  [
    "Pantaleón y las visitadoras",
    "Mario Vargas Llosa",
    L,
    LEN,
    1973,
    310,
    0,
    { pub: "Alfaguara" },
  ],
  ["Manual de primeros auxilios", "Cruz Roja", null, null, null, 64, 0],
];

// Estantes (el "Default" ya existe y es la Estantería General)
const SHELVES: [name: string, description: string | null][] = [
  ["Literatura", "Novelas y obras clásicas"],
  ["Poesía", "Poemarios y antologías"],
  ["Consulta", "Libros de consulta, solo lectura en sala"],
  ["Textos escolares", "Material de apoyo por grado"],
  ["Depósito", null], // vacío
];

const SHELF_BY_CATEGORY: Record<string, string> = {
  [L]: "Literatura",
  [C]: "Consulta",
  [E]: "Textos escolares",
};
// Los cuentos no tienen estante propio: quedan en el general
const shelfOf = (cat: string | null, sub: string | null) =>
  sub === POE
    ? "Poesía"
    : sub === CUE || !cat
      ? undefined
      : SHELF_BY_CATEGORY[cat];

type Student = [
  name: string,
  level: "primary" | "secondary",
  grade: number,
  since: number,
];

const TEACHERS: [name: string, since: number][] = [
  ["Ana Torres", 400],
  ["Luis Ramos", 400],
  ["Carmen Soto", 400],
  ["Jorge Villanueva", 20], // sin préstamos
];

const STUDENTS: Student[] = [
  ["Diego Quispe", "secondary", 3, 330],
  ["Valeria Huamán", "secondary", 5, 330],
  ["Mateo Flores", "primary", 6, 330],
  ["Camila Rojas", "secondary", 1, 300],
  ["Sofía Mendoza", "primary", 4, 300],
  ["Lucía Vega", "primary", 5, 240],
  ["Renata Chávez", "primary", 3, 60],
  ["Andrés Cárdenas", "primary", 2, 30],
  ["Martín Salas", "secondary", 5, 400], // egresado: se desactiva
  ["Joaquín Paredes", "secondary", 2, 90], // sin préstamos
  ["Ximena Gutiérrez del Águila Montoya", "primary", 1, 5], // nombre largo
];

type Return = [daysAgo: number, title: string, outcome?: LineOutcome];
type Loan = {
  visitor: string;
  daysAgo: number;
  items: [title: string, copies: number][];
  returns?: Return[];
  by?: AccountRole;
  notes?: string;
};

// Plazo: 7 días alumnos, 10 docentes. Tarde = devuelto más de 3 días después.
const LOANS: Loan[] = [
  // Fuera de la ventana de reputación (más de 12 meses)
  {
    visitor: "Carmen Soto",
    daysAgo: 390,
    items: [
      ["Cien años de soledad", 1],
      ["Rayuela", 1],
    ],
    returns: [
      [383, "Cien años de soledad"],
      [383, "Rayuela"],
    ],
  },
  {
    visitor: "Carmen Soto",
    daysAgo: 375,
    items: [["Canto general", 1]],
    returns: [[370, "Canto general"]],
  },
  // Valeria: confiable
  {
    visitor: "Valeria Huamán",
    daysAgo: 310,
    items: [["Breve historia del tiempo", 1]],
    returns: [[305, "Breve historia del tiempo"]],
  },
  {
    visitor: "Valeria Huamán",
    daysAgo: 250,
    items: [["Sapiens: de animales a dioses", 1]],
    returns: [[246, "Sapiens: de animales a dioses"]],
  },
  {
    visitor: "Valeria Huamán",
    daysAgo: 180,
    items: [["Cien años de soledad", 1]],
    returns: [[176, "Cien años de soledad"]],
    by: "staff",
  },
  {
    visitor: "Valeria Huamán",
    daysAgo: 120,
    items: [["Harry Potter y la piedra filosofal", 1]],
    returns: [[115, "Harry Potter y la piedra filosofal"]],
  },
  {
    visitor: "Valeria Huamán",
    daysAgo: 60,
    items: [["Rayuela", 1]],
    returns: [[55, "Rayuela"]],
  },
  { visitor: "Valeria Huamán", daysAgo: 0, items: [["Trilce", 1]] },
  // Diego: regular (2 tardías + 1 deteriorado) y un préstamo muy vencido
  {
    visitor: "Diego Quispe",
    daysAgo: 280,
    items: [["Harry Potter y la cámara secreta", 1]],
    returns: [[266, "Harry Potter y la cámara secreta"]],
  },
  {
    visitor: "Diego Quispe",
    daysAgo: 200,
    items: [["Mafalda 2", 1]],
    returns: [[196, "Mafalda 2"]],
    by: "staff",
  },
  {
    visitor: "Diego Quispe",
    daysAgo: 140,
    items: [["Cuentos de la selva", 1]],
    returns: [[128, "Cuentos de la selva"]],
  },
  {
    visitor: "Diego Quispe",
    daysAgo: 70,
    items: [["Ciencias Sociales 3", 1]],
    returns: [[66, "Ciencias Sociales 3", "returned_damaged"]],
  },
  {
    visitor: "Diego Quispe",
    daysAgo: 25,
    items: [
      ["Rayuela", 1],
      ["Bestiario", 1],
    ],
  },
  // Camila: en riesgo (2 perdidos + 1 irreparable) y bloqueada (3 vencidos)
  {
    visitor: "Camila Rojas",
    daysAgo: 290,
    items: [["Geografía del Perú", 1]],
    returns: [[286, "Geografía del Perú", "lost"]],
  },
  {
    visitor: "Camila Rojas",
    daysAgo: 210,
    items: [["Sapiens: de animales a dioses", 1]],
    returns: [[205, "Sapiens: de animales a dioses", "discarded"]],
  },
  {
    visitor: "Camila Rojas",
    daysAgo: 150,
    items: [["El principito", 1]],
    returns: [[146, "El principito", "lost"]],
  },
  // Se lleva el Ciencias Sociales 3 deteriorado: se presta igual
  {
    visitor: "Camila Rojas",
    daysAgo: 15,
    items: [
      ["Geografía del Perú", 2],
      ["Ciencias Sociales 3", 1],
    ],
  },
  // Sofía: confiable; su pérdida se recuperó y cuenta como devolución
  {
    visitor: "Sofía Mendoza",
    daysAgo: 260,
    items: [["Papelucho", 1]],
    returns: [[256, "Papelucho"]],
  },
  {
    visitor: "Sofía Mendoza",
    daysAgo: 190,
    items: [["Mafalda 1", 1]],
    returns: [[187, "Mafalda 1"]],
  },
  {
    visitor: "Sofía Mendoza",
    daysAgo: 100,
    items: [["Cuentos de la selva", 1]],
    returns: [[97, "Cuentos de la selva"]],
  },
  {
    visitor: "Sofía Mendoza",
    daysAgo: 45,
    items: [["Papelucho en vacaciones", 1]],
    returns: [[40, "Papelucho en vacaciones", "lost"]],
  },
  // Lucía: nueva, vence pronto
  {
    visitor: "Lucía Vega",
    daysAgo: 230,
    items: [["Harry Potter y la cámara secreta", 1]],
    returns: [[225, "Harry Potter y la cámara secreta"]],
  },
  {
    visitor: "Lucía Vega",
    daysAgo: 2,
    items: [
      ["Harry Potter y el prisionero de Azkaban", 1],
      ["Papelucho en vacaciones", 1],
    ],
  },
  // Mateo: vencido con una devolución parcial
  {
    visitor: "Mateo Flores",
    daysAgo: 12,
    items: [
      ["Papelucho", 1],
      ["Mafalda 2", 1],
    ],
    returns: [[9, "Mafalda 2"]],
  },
  // Vence hoy / venció ayer
  { visitor: "Renata Chávez", daysAgo: 7, items: [["El principito", 1]] },
  {
    visitor: "Andrés Cárdenas",
    daysAgo: 8,
    items: [["Cuentos de la selva", 1]],
  },
  // Martín: historial y luego inactivo
  {
    visitor: "Martín Salas",
    daysAgo: 330,
    items: [["La ciudad y los perros", 1]],
    returns: [[326, "La ciudad y los perros"]],
  },
  {
    visitor: "Martín Salas",
    daysAgo: 240,
    items: [["Conversación en La Catedral", 1]],
    returns: [[236, "Conversación en La Catedral"]],
  },
  // Ana: confiable y en el límite de 5 ejemplares
  {
    visitor: "Ana Torres",
    daysAgo: 300,
    items: [
      ["Todas las sangres", 1],
      ["Los ríos profundos", 1],
    ],
    returns: [
      [292, "Todas las sangres"],
      [292, "Los ríos profundos"],
    ],
  },
  {
    visitor: "Ana Torres",
    daysAgo: 220,
    items: [["Tradiciones peruanas", 2]],
    returns: [
      [212, "Tradiciones peruanas"],
      [212, "Tradiciones peruanas"],
    ],
    by: "staff",
  },
  {
    visitor: "Ana Torres",
    daysAgo: 160,
    items: [["Cien años de soledad", 1]],
    returns: [[152, "Cien años de soledad"]],
  },
  {
    visitor: "Ana Torres",
    daysAgo: 3,
    items: [
      ["Cien años de soledad", 2],
      ["La ciudad y los perros", 2],
      ["La casa de los espíritus", 1],
    ],
    notes: "Plan lector de 4.º de secundaria",
  },
  // Luis: regular, con un préstamo abierto parcialmente devuelto
  {
    visitor: "Luis Ramos",
    daysAgo: 270,
    items: [["Breve historia del tiempo", 1]],
    returns: [[262, "Breve historia del tiempo"]],
  },
  {
    visitor: "Luis Ramos",
    daysAgo: 130,
    items: [["Sapiens: de animales a dioses", 1]],
    returns: [[125, "Sapiens: de animales a dioses"]],
  },
  {
    visitor: "Luis Ramos",
    daysAgo: 6,
    items: [
      ["Harry Potter y la piedra filosofal", 1],
      ["Mafalda 1", 2],
      ["El principito", 1],
    ],
    returns: [
      [4, "El principito"],
      [4, "Mafalda 1", "returned_damaged"],
    ],
  },
  // Carmen: abierto, vence en más de una semana
  { visitor: "Carmen Soto", daysAgo: 1, items: [["Canto general", 1]] },
];

const DAY = 86400;
const ago = (days: number) => sql`${days * DAY}`;

async function backdateStock(id: number, days: number) {
  await db
    .update(stockMovement)
    .set({ createdAt: sql`${stockMovement.createdAt} - ${ago(days)}` })
    .where(eq(stockMovement.id, id));
  await db
    .update(stockMovementLine)
    .set({ createdAt: sql`${stockMovementLine.createdAt} - ${ago(days)}` })
    .where(eq(stockMovementLine.movementId, id));
}

async function backdateDamage(copyIds: number[], days: number) {
  if (copyIds.length === 0) return;
  await db
    .update(copy)
    .set({ damagedAt: sql`${copy.damagedAt} - ${ago(days)}` })
    .where(inArray(copy.id, copyIds));
}

async function backdateEntry({ movement, lines }: EntryResult, days: number) {
  await backdateStock(movement.id, days);
  await db
    .update(copy)
    .set({ createdAt: sql`${copy.createdAt} - ${ago(days)}` })
    .where(
      inArray(
        copy.id,
        lines.flatMap((l) => l.copies.map((c) => c.copyId)),
      ),
    );
  const created = lines.filter((l) => l.isNewBook).map((l) => l.bookId);
  if (created.length > 0) {
    await db
      .update(book)
      .set({ createdAt: sql`${book.createdAt} - ${ago(days)}` })
      .where(inArray(book.id, created));
  }
}

async function backdateLoan(id: number, days: number) {
  await db
    .update(loanMovement)
    .set({
      createdAt: sql`${loanMovement.createdAt} - ${ago(days)}`,
      expiresBy: sql`date(${loanMovement.expiresBy}, ${`-${days} days`})`,
    })
    .where(eq(loanMovement.id, id));
  await db
    .update(loanMovementLine)
    .set({ createdAt: sql`${loanMovementLine.createdAt} - ${ago(days)}` })
    .where(eq(loanMovementLine.movementId, id));
}

async function backdateReturn(loanId: number, copyIds: number[], days: number) {
  await db
    .update(loanMovementLine)
    .set({ resolvedAt: sql`${loanMovementLine.resolvedAt} - ${ago(days)}` })
    .where(
      and(
        eq(loanMovementLine.movementId, loanId),
        inArray(loanMovementLine.copyId, copyIds),
      ),
    );
}

const idsByName = (rows: { id: number; name: string }[]) =>
  new Map(rows.map((r) => [r.name, r.id]));

export async function seedDev(): Promise<string> {
  if ((await listBooks({ limit: 1 })).total > 0) {
    return "Ya hay libros: no se hizo nada";
  }

  // Cuentas: las que aún usan la contraseña inicial quedan con 123456
  const accounts = new Map<AccountRole, number>();
  for (const a of await db.select().from(account)) {
    if (a.mustChangePassword) {
      await setInitialPassword(a.id, { newPassword: "123456" });
    }
    accounts.set(a.role, a.id);
  }
  const signer = (role: AccountRole = "admin") => accounts.get(role)!;

  // Catálogo
  const authors = new Map<string, number>();
  for (const [firstName, lastName] of AUTHORS) {
    const a = await createAuthor({ firstName, lastName });
    authors.set([firstName, lastName].filter(Boolean).join(" "), a.id);
  }
  const [anon] = await db
    .select({ id: author.id })
    .from(author)
    .where(eq(author.nameKey, "anonimo"));
  authors.set("Anónimo", anon.id);

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

  const bookInput = ([title, by, cat, sub, year, pages, , x = {}]: Book) => ({
    title,
    omitWords: x.series ? [x.series] : [], // evita etiquetas repetidas
    publisherId: x.pub ? publishers.get(x.pub) : null,
    collectionId: x.col ? collections.get(x.col) : null,
    seriesId: x.series ? series.get(x.series) : null,
    categoryId: cat ? categories.get(cat) : null,
    subcategoryId: sub ? subcategories.get(sub) : null,
    publicationYear: year,
    pageCount: pages,
    collaborators: [
      collab(by, "writer"),
      ...(x.co ? [collab(x.co, "writer")] : []),
      ...(x.ill ? [collab(by, "illustrator")] : []),
      ...(x.tr ? [collab(x.tr, "translator")] : []),
    ],
  });

  const bookLine = (b: Book) => {
    const shelf = shelfOf(b[2], b[3]);
    return {
      quantity: b[6],
      shelfId: shelf ? shelves.get(shelf) : undefined,
      book: bookInput(b),
    };
  };

  // Ejemplares disponibles por título, en el orden en que se toman. Un
  // deteriorado vuelve al frente para que el siguiente préstamo lo lleve.
  const pool = new Map<string, number[]>();
  const bookIds = new Map<string, number>();
  const give = (title: string, ids: number[], front = false) => {
    const list = pool.get(title) ?? [];
    pool.set(title, front ? [...ids, ...list] : [...list, ...ids]);
  };
  const take = (title: string, n: number) => {
    const list = pool.get(title) ?? [];
    if (list.length < n) throw new Error(`Faltan ejemplares de "${title}"`);
    return list.splice(0, n);
  };

  // Línea de tiempo
  const events: { at: number; run: () => Promise<void> }[] = [];
  const on = (at: number, run: () => Promise<void>) => events.push({ at, run });

  const entry = (
    at: number,
    reason: "purchase" | "donation" | "other",
    notes: string,
    lines: (ReturnType<typeof bookLine> | [title: string, n: number])[],
    { label = true, by }: { label?: boolean; by?: AccountRole } = {},
  ) => {
    let copyIds: number[] = [];
    on(at, async () => {
      const result = await registerCopies(signer(by), {
        reason,
        notes,
        lines: lines.map((l) =>
          Array.isArray(l) ? { bookId: bookIds.get(l[0])!, quantity: l[1] } : l,
        ),
      });
      for (const l of result.lines) {
        bookIds.set(l.title, l.bookId);
        give(
          l.title,
          l.copies.map((c) => c.copyId),
        );
      }
      copyIds = result.lines.flatMap((l) => l.copies.map((c) => c.copyId));
      await backdateEntry(result, at);
    });
    if (!label) return;
    // Se etiqueta unos días después; los incompletos quedan pendientes
    on(at - 2, async () => {
      await markCopiesLabeled(signer(by), { copyIds });
      await db
        .update(copy)
        .set({ labeledAt: sql`${copy.labeledAt} - ${ago(at - 2)}` })
        .where(inArray(copy.id, copyIds));
    });
  };

  const exit = async (
    at: number,
    reason: "loss" | "discard",
    copyIds: number[],
    notes: string,
  ) => {
    const { movement } = await exitCopies(signer(), { reason, copyIds, notes });
    await backdateStock(movement.id, at);
  };

  const recover = async (at: number, copyId: number, notes: string) => {
    const { movement } = await recoverCopy(signer(), { copyId, notes });
    await backdateStock(movement.id, at);
  };

  const damage = async (at: number, copyId: number, damaged: boolean) => {
    await setCopyDamaged(signer(), { copyId, damaged });
    if (damaged) await backdateDamage([copyId], at);
  };

  // Entradas de stock
  entry(400, "purchase", "Compra inicial del catálogo", BOOKS.map(bookLine));
  entry(300, "donation", "Donación de la promoción 2025", [
    ["El principito", 2],
    ["Tradiciones peruanas", 3],
    bookLine(DONATED),
  ]);
  entry(
    150,
    "purchase",
    "Reposición de textos escolares y nuevos títulos",
    [
      ["Geografía del Perú", 3], // reocupa el número del perdido por Camila
      ["Ciencias Sociales 3", 3],
      ["Harry Potter y la piedra filosofal", 1],
      ...SECOND.map(bookLine),
    ],
    { by: "librarian" },
  );
  entry(45, "other", "Reposición de un ejemplar", [["Mafalda 1", 1]]);
  entry(
    12,
    "purchase",
    "Compra de fin de año",
    [
      ["Harry Potter y el prisionero de Azkaban", 2],
      ["Rayuela", 1],
      bookLine(LATEST),
    ],
    { label: false, by: "librarian" },
  );

  // Deterioros y salidas manuales. Un deteriorado se aparta hasta repararlo.
  let torn: number[] = [];
  on(200, async () => {
    torn = take("Tradiciones peruanas", 1);
    await damage(200, torn[0], true);
  });
  on(80, async () => {
    await damage(80, torn[0], false);
    give("Tradiciones peruanas", torn);
  });

  let wet: number[] = [];
  on(150, async () => {
    wet = take("Aves sin nido", 1);
    await damage(150, wet[0], true);
  });
  on(90, () =>
    exit(90, "discard", wet, "Deterioro por humedad, irrecuperable"),
  );

  // Recuperable desde la UI: nadie ocupó su número
  on(60, async () => {
    await exit(
      60,
      "loss",
      take("Conversación en La Catedral", 1),
      "No apareció en el inventario anual",
    );
  });

  // Reorganización: El principito pasa del estante general a Literatura
  on(100, async () => {
    const rows = await db
      .select({ id: copy.id })
      .from(copy)
      .where(
        and(
          eq(copy.bookId, bookIds.get("El principito")!),
          notInArray(copy.status, [...RELEASED_STATUSES]),
        ),
      );
    await moveCopies(signer(), {
      shelfId: shelves.get("Literatura")!,
      copyIds: rows.map((r) => r.id),
    });
  });

  // Visitantes
  const visitors = new Map<string, number>();
  const grades = new Map(
    (await listSchoolGrades()).map((g) => [`${g.level}-${g.grade}`, g.id]),
  );
  const people: [string, number | null, number][] = [
    ...TEACHERS.map(([name, since]): [string, null, number] => [
      name,
      null,
      since,
    ]),
    ...STUDENTS.map(([name, level, grade, since]): [string, number, number] => [
      name,
      grades.get(`${level}-${grade}`)!,
      since,
    ]),
  ];
  for (const [name, gradeId, since] of people) {
    const role = gradeId === null ? "teacher" : "student";
    const { id } = await createVisitor({ name, role, gradeId });
    visitors.set(name, id);
    await db
      .update(visitor)
      .set({ createdAt: sql`${visitor.createdAt} - ${ago(since)}` })
      .where(eq(visitor.id, id));
  }

  // Préstamos y devoluciones
  const damaged = new Set<number>();
  const lostOnLoan = new Map<string, number[]>();
  for (const loan of LOANS) {
    const lent: [title: string, copyId: number][] = [];
    let loanId = 0;
    on(loan.daysAgo, async () => {
      for (const [title, n] of loan.items) {
        for (const id of take(title, n)) lent.push([title, id]);
      }
      const { movement } = await lendCopies(signer(loan.by), {
        visitorId: visitors.get(loan.visitor)!,
        copyIds: lent.map(([, id]) => id),
        notes: loan.notes ?? null,
      });
      loanId = movement.id;
      await backdateLoan(loanId, loan.daysAgo);
    });

    const byDay = new Map<number, Return[]>();
    for (const r of loan.returns ?? []) {
      byDay.set(r[0], [...(byDay.get(r[0]) ?? []), r]);
    }
    for (const [at, returns] of byDay) {
      on(at, async () => {
        const items = returns.map(([, title, outcome = "returned"]) => {
          const i = lent.findIndex(([t]) => t === title);
          const [, copyId] = lent.splice(i, 1)[0];
          return { title, copyId, outcome };
        });
        const result = await returnCopies(signer(loan.by), {
          items: items.map(({ copyId, outcome }) => ({ copyId, outcome })),
        });
        await backdateReturn(
          loanId,
          items.map((i) => i.copyId),
          at,
        );
        // Uno que ya volvió deteriorado conserva su fecha de deterioro
        const newlyDamaged = items
          .filter((i) => i.outcome === "returned_damaged")
          .map((i) => i.copyId)
          .filter((id) => !damaged.has(id));
        newlyDamaged.forEach((id) => damaged.add(id));
        await backdateDamage(newlyDamaged, at);
        const exits = [result.lost, result.discarded];
        for (const e of exits.filter((e): e is ExitResult => e !== null)) {
          await backdateStock(e.movement.id, at);
        }
        for (const { title, copyId, outcome } of items) {
          if (outcome === "returned") give(title, [copyId]);
          if (outcome === "returned_damaged") give(title, [copyId], true);
          if (outcome === "lost") {
            lostOnLoan.set(title, [...(lostOnLoan.get(title) ?? []), copyId]);
          }
        }
      });
    }
  }

  // La pérdida de Sofía apareció
  on(25, async () => {
    const [copyId] = lostOnLoan.get("Papelucho en vacaciones")!;
    await recover(25, copyId, "Apareció en el aula de 4.º de primaria");
    give("Papelucho en vacaciones", [copyId]);
  });

  // Bestiario se reclasifica: sus tejuelos pegados quedan desactualizados
  on(10, async () => {
    await updateBook(bookIds.get("Bestiario")!, {
      subcategoryId: subcategories.get(CUE),
    });
  });

  events.sort((a, b) => b.at - a.at);
  for (const { run } of events) await run();

  // Estado final
  for (const b of CATALOG_ONLY) await createBook(bookInput(b));
  // No hay service para dar de baja un libro: solo debe ocultarse
  await db
    .update(book)
    .set({ active: false })
    .where(eq(book.id, bookIds.get("Los heraldos negros")!));
  await updateVisitor(visitors.get("Martín Salas")!, { active: false });

  const bookCount = BOOKS.length + SECOND.length + CATALOG_ONLY.length + 2;
  return `Seed listo: ${bookCount} libros, ${visitors.size} visitantes, ${LOANS.length} préstamos`;
}
