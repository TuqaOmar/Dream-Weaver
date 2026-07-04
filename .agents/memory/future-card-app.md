---
name: Future Card app
description: Key lessons from building the Future Card react-vite + api-server app
---

**Express 5 params typing**: `req.params.*` resolves to `string | string[]` in Express 5 type definitions. Always cast with `String(req.params.id)` before passing to Drizzle `eq()` or `path.basename()`. Without the cast, TS2769 "no overload matches" errors appear on every route handler.

**Why:** Drizzle's `eq()` overloads don't accept `string | string[]`; strict mode catches this everywhere.

**How to apply:** Any time a route uses `req.params` with Drizzle ORM or path utilities, wrap with `String(...)` immediately.

---

**Orval multipart/form-data codegen**: Including `multipart/form-data` upload endpoints in `lib/api-spec/openapi.yaml` causes Orval to emit `zod.instanceof(File)` and `Blob` type references that fail in Node.js typecheck context (TS2304: Cannot find name 'File'/'Blob'), plus a TS2308 barrel re-export collision (`UploadPhotoBody` duplicated). Remove file upload endpoints from the OpenAPI spec entirely; implement them as raw Express routes with multer instead.

**Why:** Orval's Zod output targets the browser environment for File/Blob types; the lib/api-zod package typechecks under Node.js.

**How to apply:** Never put multipart/form-data endpoints in openapi.yaml. Use multer routes directly in the api-server and call them with raw `fetch(new FormData())` from the frontend.

---

**Profession ID casing**: Frontend stores profession IDs as lowercase slugs (`doctor`, `pilot`, `astronaut`). Backend generation map must use the same lowercase keys. Mismatched casing causes all professions to fall through to the fallback image.

**How to apply:** Always normalize profession value with `.toLowerCase()` before looking up in any map in the backend.
