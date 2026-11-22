/**
 * Archivo hoja (sin imports): lo usan Sidebar y useLayoutMode. Si viviera en
 * Sidebar.tsx, useLayoutMode importaría el Sidebar -> SidebarItem -> barrel de
 * components -> Header -> useLayoutMode, y se forma un ciclo.
 */
export const SIDEBAR_WIDTH = 70;
