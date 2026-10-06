# theme-audit

Playwright script that audits every route in light/dark theme and several viewports: WCAG contrast (text 4.5:1, large text / icons 3:1, gradient text, overlays such as modals / dropdowns / popovers / messages), horizontal overflow, clipped or cut-off elements, small tap targets (<= 480px).

Quick start: run the dev server (`VITE_API_BASE_URL=<api> npx vite --port 5173 --host 127.0.0.1`), copy `seed.example.json` to `seed.json`, install `playwright-core` outside package.json (`npm i --no-save playwright-core`), then `node tools/theme-audit/audit.mjs --out out/audit --shots` and `node tools/theme-audit/todo.mjs out/audit/<run>`. Full details in `docs/THEME-AND-RESPONSIVE.md`.
