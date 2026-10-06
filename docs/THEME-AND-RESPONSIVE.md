# Theme (light / dark / accent) and responsive layout

## How the theme works

- `localStorage.theme` = `theme-dark` | `theme-light` | `theme-system`; `src/main.ts` (and `views/user/settings/appearance.vue`) put the
  resolved class `theme-dark` / `theme-light` on `<html>`.
- `localStorage.accent_color` = `purple | blue | green | red | amber | pink`; the same files put that class on `<html>`.
- CSS files, in load order (`src/main.ts`):
  1. `assets/main.css` (+ `base.css`): legacy variables and page-level styles.
  2. bootstrap / bootstrap-vue-3 / boxicons CSS.
  3. `assets/theme-overrides.css`: re-themes Ant Design Vue, bootstrap-vue, Highcharts, TipTap and legacy hard-coded colours with the semantic tokens.
  4. `assets/responsive.css`: breakpoints and mobile layout (uses `!important` on purpose to beat scoped `[data-v]` selectors).
  `theme-overrides.css` and `responsive.css` MUST stay after bootstrap, otherwise `body { background }` etc. are overridden again.

## Semantic tokens (`assets/base.css`, end of file)

All tokens exist for both themes and all six accents and are verified by the audit (WCAG AA). Use them in new code.

| Token | Dark | Light | Use |
| --- | --- | --- | --- |
| `--c-page` | `#000` | `#e5e7eb` | page background (`--background-color`) |
| `--c-surface` | `#151518` | `#f8f8fa` | cards / panels (`--content-item-background-color`) |
| `--c-surface-raised` | `#1f1f20` | `#fff` | inputs, dropdowns, popovers, modals, messages |
| `--c-border` / `--c-border-strong` | `#27272a` / `#424242` | `#d4d4d8` / `#a1a1aa` | dividers / input borders |
| `--c-text` | `#fff` | `#27272a` | body text |
| `--c-text-muted` | `#a1a1aa` | `#52525b` | secondary text (also `--text-color-grey`) |
| `--c-placeholder` | `#8e8e98` | `#6b6b75` | placeholders (all inputs, selects, pickers, TipTap) |
| `--c-disabled-text` | `#9a9aa4` | `#5f5f68` | disabled controls (kept legible) |
| `--c-primary` / `--c-primary-hover` | `--main-color` / `--main-sub-color` | same | accent as a BACKGROUND / border |
| `--c-on-primary` | `#fff` (purple), `#0b0b0f` (blue, green, red, amber, pink) | same | text / icon ON `--main-color`; `--text-color-contrast` now points to it |
| `--c-primary-text` | accent lightened (`#a78bfa`, `#60a5fa`, `#4ade80`, `#f87171`, `#fbbf24`, `#f472b6`) | accent darkened (`#6d28d9`, `#1d4ed8`, `#166534`, `#b91c1c`, `#92400e`, `#be185d`) | accent used AS TEXT / icon colour on a surface |
| `--c-success` / `--c-success-text` | `#19e580` / `#4ade80` | `#15803d` / `#166534` | status colour / status text |
| `--c-danger` / `--c-danger-text` | `#e74c3c` / `#f87171` | `#c81e3a` / `#b91c1c` | |
| `--c-warning` / `--c-warning-text` | `#f39c12` / `#fbbf24` | `#b45309` / `#92400e` | |
| `--c-solid-danger` + `#fff` | `#c52225` | `#c52225` | solid red backgrounds with white text |
| `--c-on-status` | `#0b0b0f` | `#0b0b0f` | text on solid green / amber / blue |
| `--c-focus-ring` | accent @ 55% | accent @ 45% | `:focus-visible` outline |
| `--brand-gradient-text` | `#a78bfa -> #fb923c` | `#5813c1 -> #b3361f` | gradient text (logo, hero) |

Rules of thumb: never write `color: var(--main-color)` (use `--c-primary-text`); never put `--text-color` / white text on `--main-color`
(use `--c-on-primary`); never hard-code `#fff` / `#000` on a theme surface; Highcharts reads tokens through
`views/admin/charts/chartTheme.ts` (`getChartTheme()` + `observeTheme()`).

## Responsive layout

Breakpoints (Bootstrap 5 values, `max-width` overrides in `assets/responsive.css`):

| Width | Behaviour |
| --- | --- |
| >= 1200px | full layout, sidebar 240px (desktop unchanged) |
| 992 - 1199px | sidebar auto-collapses to the 85px mini variant (user can still expand it); attempt / practice question list becomes a sticky horizontal strip |
| < 992px | sidebar is an off-canvas drawer (`.sidebar-container.drawer`, hamburger in `Header.vue`, backdrop, closes on navigation / backdrop / Esc); state in `shared/composables/useSidebar.ts`; auth brand panel hidden; two-column pages stack; Ant tables scroll horizontally inside their card; dashboards 2 per row |
| < 768px | single column, toolbars wrap, filter / search inputs full width, modals `calc(100vw - 16px)`, question editor rows stack, matching stacks, back-arrow + title stay on one row |
| < 576px | 16px inputs (no iOS zoom), >= 40px controls, 14px minimum text for meta lines |
| < 360px | smaller logo / titles / pagination |

`index.html` uses `width=device-width, initial-scale=1`.

## Audit tool

`tools/theme-audit/audit.mjs` (Playwright; see `tools/theme-audit/README.md`). It loads every route x theme x viewport, then:

- walks all text nodes, input values, placeholders, `<i class="bx...">` / `.anticon` icons, SVG icons and gradient text; composes the effective
  background through ancestors (alpha), samples a screenshot where a gradient / image is behind the text, and reports contrast < 4.5
  (< 3 for large text >= 24px, bold >= 18.66px, icons);
- opens modals, drawers, dropdowns, selects, pickers, popconfirms, messages and re-audits the portals (viewports 1440 and 375);
- reports horizontal page overflow, elements outside the viewport, text clipped by `overflow:hidden`, content cut off by an
  `overflow:hidden` ancestor, tap targets < 36px and text < 14px at <= 480px;
- `--shots` saves PNGs, `--accent purple,blue,...` runs every accent colour.

```
VITE_API_BASE_URL=<api> npx vite --port 5173 --host 127.0.0.1        # open as http://localhost:5173 (API CORS)
cp tools/theme-audit/seed.example.json tools/theme-audit/seed.json    # fill a real user + ids (do not commit)
AUDIT_ADMIN_EMAIL=... AUDIT_ADMIN_PASSWORD=... node tools/theme-audit/audit.mjs --themes dark,light --vp 1440x900,768x1024,375x812 --shots --out out/audit
node tools/theme-audit/todo.mjs out/audit        # layout problems per route
```

On Git Bash set `MSYS_NO_PATHCONV=1` before passing `--routes /user/...`. `contrast.json`, `layout.json`, `counts.json`, `summary.txt` are written to `--out`.

### Intentional exceptions

- Disabled controls are exempt from WCAG 1.4.3; they are reported separately as `disabledExempt` and still use `--c-disabled-text`.
- Text inside the closed off-canvas sidebar and horizontally scrollable Ant tab strips / tables is "cut off" by design (reachable by scrolling or the hamburger).
- Highcharts credits and the Vue devtools overlay (dev only) are ignored.
