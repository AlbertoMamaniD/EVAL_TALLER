## Contexto del proyecto
Aplicación web de gestión de tareas por proyecto. Trabajo final Unidad 1.
Debe implementar ABM (Alta, Baja, Modificación) EN MEMORIA para dos áreas
relacionadas: Proyectos y Tareas. Sin base de datos externa.

## Stack tecnológico (no cambiar sin confirmar con el usuario)
- Backend: Node.js + Express + TypeScript. Almacenamiento en memoria
  (arrays en un módulo "store", NO base de datos).
- Frontend: React + TypeScript con Vite.
- Tests: Vitest (backend y frontend).
- Lint/formato: ESLint + Prettier.
- Comunicación frontend-backend: API REST (fetch), JSON.

## Estructura esperada del repositorio
/backend
  /src
    /routes
    /models
    /store       (datos en memoria)
    /services
  package.json
/frontend
  /src
    /components
    /pages
    /services    (llamadas a la API)
  package.json
README.md
.gitignore

## Reglas de trabajo
1. Trabajar SIEMPRE en la rama que el usuario indique en el prompt. Nunca
   hacer commit directo a main o develop salvo que se pida explícitamente.
2. Cada funcionalidad se implementa completa y aislada: backend (rutas +
   validación + lógica) y frontend (UI conectada a la API real, no mocks).
3. Validar datos de entrada (campos obligatorios, tipos, longitudes,
   fechas válidas) tanto en backend como en frontend, con mensajes de
   error claros.
4. IDs de entidades: generarlos en el store (uuid o contador incremental).
5. Mantener el código simple, legible, y consistente con el código ya
   existente en el repositorio (mismos nombres, mismo estilo).
6. Mensajes de commit en español, formato Conventional Commits:
   "feat: agrega ABM de proyectos", "fix: valida fecha límite".
7. No agregar dependencias nuevas sin justificarlo brevemente en la
   respuesta.
8. Al terminar una funcionalidad: correr lint y tests, y confirmar que
   pasan antes de dar la tarea por finalizada.
9. Cuando se te pida corregir observaciones de revisión de código (Qodo /
   GitHub): leer cada comentario del PR, aplicar el fix correspondiente,
   y responder con un resumen breve de qué cambiaste y por qué.
10. No borrar ni reescribir funcionalidades de features anteriores salvo
    que se pida explícitamente.