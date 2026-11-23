# Security & Defensive Coding Standards

## Secrets & Environment Variables
- Never read, open, reference, or output contents from `.env` or `.env.*` files.
- Treat all environment variables as placeholders unless explicitly provided in the prompt.
- Never hardcode API keys, tokens, database URIs, or credentials in code or comments.
- Always load secrets via environment variables (`import.meta.env.VITE_*` on the client, `process.env.*` on the server).
- Never expose server-side secrets or private keys inside `VITE_` prefixed variables.

## XSS & Frontend Safety (Vue / TypeScript)
- Never use `v-html`, `innerHTML`, or `dangerouslySetInnerHTML` with unsanitized user input. If raw HTML rendering is strictly required, sanitize it first with `DOMPurify`.
- Validate and sanitize all URL parameters and query strings before rendering or redirecting (prevent Open Redirects).
- Never use `eval()`, `new Function()`, or dynamic string execution.