# Sistema de Gestión Bibliotecaria

Sistema de gestión bibliotecaria para tabletas Android, pensado para bibliotecas
escolares.

Se desarrolló como parte de un programa que renueva bibliotecas escolares en
colegios de bajos recursos y les entrega herramientas para facilitar su gestión.
La aplicación permite manejar el inventario, catalogar y ordenar los libros, 
realizar un seguimiento de los usuarios y registrar préstamos.

## Contexto

En muchos lugares el acceso a internet todavía no es una realidad, por lo que la
aplicación funciona de manera completamente local: la base de datos, las
cuentas, los reportes y los tejuelos se generan sin un servidor.

Además, muchos colegios públicos no cuentan con los recursos para contratar a un
bibliotecólogo que se encargue de administrar la biblioteca. Por eso la
aplicación busca hacerse cargo de esos procesos: prioriza que las tareas
habituales se entiendan por sí solas y deja poco espacio para errores complejos.

## Funcionalidades

### Catálogo e inventario

Cada libro se registra una sola vez, con sus autores, editorial, colección,
serie y clasificación, y se le asocian los ejemplares físicos que tenga la
biblioteca. Cada ejemplar tiene un número, un estante y un estado.

Los ejemplares pueden ingresar por compra o donación, ya sea uno por uno o desde
una plantilla Excel que el sistema revisa antes de guardar. Las bajas por
pérdida o descarte quedan registradas como movimientos firmados por un
administrador, y los ejemplares perdidos o deteriorados se pueden recuperar.

### Tejuelos

El tejuelo de cada libro se genera a partir de su categoría, su autor, su
subcategoría y su título. Por ejemplo, *Doce cuentos peregrinos* de García
Márquez, clasificado como Literatura / Cuento, queda como `800-GAR-CUE-DOC`.

Si dos libros generarían el mismo tejuelo, el sistema propone una alternativa.
Cuando se edita un libro que ya tenía tejuelos impresos, sus ejemplares quedan
marcados como desactualizados para reimprimirlos. Las etiquetas se imprimen en
hojas A4 de 24 tejuelos.

### Préstamos

Los estudiantes pueden llevarse libros por 7 días y los docentes por 10, con un
máximo de 5 ejemplares a la vez. Quien acumula 3 préstamos vencidos no puede
pedir más hasta ponerse al día. Al devolver, se registra si el libro volvió a
tiempo, tarde, dañado o si se perdió.

### Reputación de lectores

A partir del historial de préstamos, el sistema clasifica a cada lector como
nuevo, confiable, regular o con incidencias. Cada tipo de incidente pesa
distinto: un retraso cuenta menos que un daño, y un daño menos que una pérdida.
El puntaje se calcula en proporción a la cantidad de préstamos, así que un
retraso pesa más para quien pidió dos libros que para quien pidió cuarenta. Los
retrasos de hasta 3 días no se cuentan.

### Panel principal

La pantalla de inicio muestra lo que requiere atención: préstamos vencidos o por
vencer, ejemplares sin tejuelo o con tejuelo desactualizado, el estado general
de la colección y la cantidad de préstamos por mes.

### Cuentas

Hay tres cuentas, una por rol: Administrador, Bibliotecario y Auxiliar. El
administrador es el equipo del programa que realiza la configuración inicial, el
bibliotecario es el encargado principal de cada biblioteca y el auxiliar son los
ayudantes, que suelen rotar con el tiempo. Solo el administrador y el
bibliotecario pueden registrar entradas y salidas de inventario.

Cada cuenta puede restablecer la contraseña de las cuentas por debajo de ella, y
quien entra con la contraseña inicial debe elegir una nueva. Si se olvida la
contraseña del administrador, se recupera con el código que se muestra al
terminar la configuración inicial.

## Aspectos técnicos

La aplicación está hecha con React Native y Expo, en TypeScript. Los datos se
guardan en SQLite a través de Drizzle ORM. Las migraciones se aplican al iniciar
la aplicación, así que una tableta con una versión anterior se actualiza sola.

Las reglas importantes también están en la base de datos, con restricciones
`CHECK` e índices únicos. Las operaciones de varios pasos, como registrar una
entrada con muchos ejemplares o un préstamo, corren dentro de una transacción.

El código se organiza por área (`catalog`, `inventory`, `loans`, `dashboard`,
`account`). En cada una, `internal/` contiene los repositorios, los servicios y
las validaciones con Zod, y `ui/` contiene las pantallas.

La interfaz está pensada para tableta, con un diseño responsivo para cuando se
usa en vertical. Los estilos se manejan con NativeWind, los PDF de tejuelos se
generan con pdf-lib y la importación de plantillas usa xlsx.

## Ejecutar el proyecto

Requiere Node, pnpm y el SDK de Android. El repositorio también incluye un
`flake.nix` para usuarios de Nix.

    pnpm install
    pnpm android

En el primer inicio se crean la base de datos, los datos de referencia
(categorías, reglas de préstamo, grados escolares) y las cuentas iniciales.
