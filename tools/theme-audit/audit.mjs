// AIQuizzizz theme + responsive audit (Playwright). See docs/THEME-AND-RESPONSIVE.md
// Run the dev server first:  VITE_API_BASE_URL=<api> npx vite --port 5173 --host 127.0.0.1   (open as http://localhost:5173)
// Needs playwright-core (npm i --no-save playwright-core) and Chrome (CHROME_PATH env, default Windows path).
// Usage: node audit.mjs [--base http://localhost:5173] [--themes dark,light] [--vp 1440x900,768x1024,375x812]
//        [--routes substr1,substr2] [--no-interact] [--out out-dir] [--shots] [--seed seed.json] [--accent purple,blue,...]
import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
const opt = (n, d) => {
    const i = args.indexOf("--" + n);
    return i < 0 ? d : args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : true;
};
const BASE = opt("base", "http://localhost:5173");
const THEMES = String(opt("themes", "dark,light")).split(",");
const VPS = String(opt("vp", "1440x900,768x1024,375x812"))
    .split(",")
    .map((s) => s.split("x").map(Number));
const ROUTE_FILTER = opt("routes", "") ? String(opt("routes")).split(",") : null;
const INTERACT = !args.includes("--no-interact");
const SHOTS = args.includes("--shots");
const OUT = path.resolve(String(opt("out", "out")));
// seed.json: { "T": {"email","password"}, "qsId", "clId", "testId" }  (a normal user that owns a question set, a class and a test)
const SEED = JSON.parse(
    fs.readFileSync(String(opt("seed", path.join(path.dirname(fileURLToPath(import.meta.url)), "seed.json"))), "utf8"),
);
const ACCENTS = opt("accent", "") ? String(opt("accent")).split(",") : [null];
const CHROME = process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";
fs.mkdirSync(OUT, { recursive: true });

const id = { qs: SEED.qsId, cl: SEED.clId, t: SEED.testId };
const PUBLIC = ["/", "/login", "/register", "/verify-email", "/forgot-password", "/reset-password", "/404", "/not-allowed"];
const USER = [
    "/user/dashboards",
    "/user/library",
    `/user/question-set/${id.qs}`,
    "/user/question-set/create",
    `/user/question-set/${id.qs}/update`,
    `/user/question-set/learn/${id.qs}`,
    `/user/question-set/practice-test/${id.qs}`,
    "/user/question-set/search",
    "/user/folder",
    "/user/test-template",
    "/user/test-template/create",
    "/user/class",
    `/user/class/${id.cl}/student`,
    `/user/class/${id.cl}/exam`,
    `/user/class/${id.cl}/quiz`,
    `/user/class/${id.cl}/test/create`,
    `/user/test/${id.t}/update`,
    `/user/test/${id.t}/attempt`,
    `/user/class/${id.cl}/exam/${id.t}/result`,
    "/user/schedule",
    "/user/settings?tab=profile",
    "/user/settings?tab=security",
    "/user/settings?tab=appearance",
    "/user/settings?tab=subscription",
    "/user/settings?tab=billing",
];
const ADMIN = ["/admin/account-manager", "/admin/account-subscription", "/admin/system-settings"];
let ROUTES = [
    ...PUBLIC.map((r) => ({ r, role: null })),
    ...USER.map((r) => ({ r, role: "T" })),
    ...ADMIN.map((r) => ({ r, role: "A" })),
];
// optional student routes (need seed.S + liveTestId = a test open right now + reviewAttemptId = a submitted attempt)
if (SEED.S && SEED.liveTestId) ROUTES.push({ r: `/user/test/${SEED.liveTestId}/attempt`, role: "S" });
if (SEED.S && SEED.reviewAttemptId) ROUTES.push({ r: `/user/attempt/${SEED.reviewAttemptId}/review`, role: "S" });
if (ROUTE_FILTER) ROUTES = ROUTES.filter((x) => ROUTE_FILTER.some((f) => x.r.includes(f)));

const OVERLAY =
    ".ant-modal-root,.ant-drawer,.ant-dropdown,.ant-select-dropdown,.ant-popover,.ant-tooltip,.ant-picker-dropdown,.ant-message,.ant-notification,.modal.show,.ant-modal-confirm,.ant-popconfirm";

/* ---------------- in-page audit (serialised into the page) ---------------- */
function pageAudit({ roots, th }) {
    const cv = document.createElement("canvas");
    cv.width = cv.height = 1;
    const cx = cv.getContext("2d", { willReadFrequently: true });
    const parse = (c) => {
        const m = c.match(/rgba?\(([^)]+)\)/);
        if (m && !/\//.test(m[1])) {
            const p = m[1].split(",").map((s) => parseFloat(s));
            return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1];
        }
        if (c === "transparent") return [0, 0, 0, 0];
        const draw = (bg) => {
            cx.clearRect(0, 0, 1, 1);
            cx.fillStyle = bg;
            cx.fillRect(0, 0, 1, 1);
            cx.fillStyle = c;
            cx.fillRect(0, 0, 1, 1);
            return cx.getImageData(0, 0, 1, 1).data;
        };
        const b = draw("#000"),
            w = draw("#fff");
        const a = 1 - (w[0] - b[0]) / 255;
        if (a <= 0.001) return [0, 0, 0, 0];
        return [b[0] / a, b[1] / a, b[2] / a, a];
    };
    const over = (top, bot) => {
        const a = top[3] + bot[3] * (1 - top[3]);
        if (a === 0) return [0, 0, 0, 0];
        return [0, 1, 2].map((i) => (top[i] * top[3] + bot[i] * bot[3] * (1 - top[3])) / a).concat(a);
    };
    const lin = (v) => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    };
    const lum = (c) => 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);
    const ratio = (a, b) => {
        const l1 = lum(a),
            l2 = lum(b);
        return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    };
    const sel = (el) => {
        const parts = [];
        let e = el;
        for (let i = 0; i < 3 && e && e.nodeType === 1; i++, e = e.parentElement) {
            let s = e.tagName.toLowerCase();
            if (e.id) s += "#" + e.id;
            else if (e.classList.length)
                s +=
                    "." +
                    [...e.classList]
                        .filter((c) => !/^(data-v|css-)/.test(c))
                        .slice(0, 2)
                        .join(".");
            parts.unshift(s);
            if (e.id) break;
        }
        return parts.join(" > ");
    };
    const visible = (el, r, cs) => r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && cs.display !== "none";
    const chainOpacity = (el) => {
        let o = 1;
        for (let e = el; e && e.nodeType === 1; e = e.parentElement) {
            const cs = getComputedStyle(e);
            o *= parseFloat(cs.opacity);
            if (cs.display === "none" || cs.visibility === "hidden") return 0;
        }
        return o;
    };
    const isDisabled = (el) =>
        !!el.closest(':disabled,[aria-disabled="true"],[class*="disabled"],.ant-btn-loading,[disabled]');
    const bgOf = (el) => {
        if (el instanceof SVGElement && el.ownerSVGElement) {
            const bgr = el.ownerSVGElement.querySelector("rect.highcharts-background");
            if (bgr) {
                const c = parse(getComputedStyle(bgr).fill);
                if (c[3] > 0) return { c: [c[0], c[1], c[2], 1], needSample: false };
            }
        }
        let stack = [];
        let needSample = false;
        for (let e = el; e && e.nodeType === 1; e = e.parentElement) {
            const cs = getComputedStyle(e);
            const bc = parse(cs.backgroundColor);
            if (cs.backgroundImage !== "none") {
                needSample = true;
                break;
            }
            if (bc[3] > 0) {
                stack.push(bc);
                if (bc[3] >= 0.999) break;
            }
        }
        let base = [255, 255, 255, 1];
        if (!needSample && !(stack.length && stack[stack.length - 1][3] >= 0.999)) {
            const bodyBg = parse(getComputedStyle(document.documentElement).backgroundColor);
            if (bodyBg[3] > 0) base = over(bodyBg, base);
        }
        let c = base;
        for (let i = stack.length - 1; i >= 0; i--) c = over(stack[i], c);
        return { c, needSample };
    };
    const inRoots = (el) =>
        !roots ||
        roots.some((rs) => {
            const l = document.querySelectorAll(rs);
            for (const r of l) if (r.contains(el)) return true;
            return false;
        });
    const results = [],
        pending = [];
    const seen = new Set();
    const push = (el, kind, text, fg, bgr, th_, rect, extra) => {
        const key = kind + sel(el) + text.slice(0, 20);
        if (seen.has(key)) return;
        seen.add(key);
        const item = {
            kind,
            selector: sel(el),
            text: text.slice(0, 40),
            fg: fg.map((x, i) => (i < 3 ? Math.round(x) : +x.toFixed(2))),
            bg: bgr.c.map((x, i) => (i < 3 ? Math.round(x) : +x.toFixed(2))),
            th: th_,
            disabled: isDisabled(el),
            ...extra,
        };
        if (bgr.needSample) {
            pending.push({ item, rect: { x: rect.x, y: rect.y, w: rect.width, h: rect.height }, fg: fg });
        } else {
            item.ratio = +ratio(over(fg, bgr.c), bgr.c).toFixed(2);
            results.push(item);
        }
    };
    const all = document.querySelectorAll("body *");
    for (const el of all) {
        if (!inRoots(el)) continue;
        if (el.closest(".vue-devtools__panel,#vue-devtools-anchor,.vue-devtools__anchor") || el.classList.contains("highcharts-text-outline")) continue;
        if (/^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE|CANVAS|PATH|G|DEFS|TITLE)$/i.test(el.tagName)) continue;
        const cs = getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        if (!visible(el, rect, cs)) continue;
        const op = chainOpacity(el);
        if (op === 0) continue;
        const fs = parseFloat(cs.fontSize),
            bold = parseInt(cs.fontWeight) >= 700;
        const large = fs >= 24 || (fs >= 18.66 && bold);
        let txt = "";
        for (const n of el.childNodes) if (n.nodeType === 3) txt += n.textContent;
        txt = txt.trim();
        const isIconEl =
            (el.tagName === "I" && /\b(bx|bxs|bxl|anticon)/.test(el.className + "")) ||
            (el.tagName === "SPAN" && el.classList.contains("anticon"));
        const tf = cs.webkitTextFillColor;
        const clipText = cs.backgroundClip === "text" || cs.webkitBackgroundClip === "text";
        if (clipText) {
            if (txt && el.parentElement) {
                const stops = [...cs.backgroundImage.matchAll(/rgba?([^)]+)/g)].map((m) => parse(m[0]));
                const bgr = bgOf(el.parentElement);
                let worst = null, wr = 99;
                for (const st of stops) { st[3] *= op; const r = ratio(over(st, bgr.c), bgr.c); if (r < wr) { wr = r; worst = st; } }
                if (worst) push(el, "gradient-text", txt, worst, bgr, th, rect, { large, fs });
            }
            continue;
        }
        if (
            (el.tagName === "INPUT" || el.tagName === "TEXTAREA") &&
            !["checkbox", "radio", "hidden", "file", "range", "color"].includes(el.type)
        ) {
            const bg = bgOf(el);
            if (el.value) {
                let fg = parse(tf && tf !== cs.color ? tf : cs.color);
                fg[3] *= op;
                push(el, "input-value", el.value, fg, bg, th, rect, { large, fs });
            }
            if (el.placeholder) {
                const pcs = getComputedStyle(el, "::placeholder");
                let fg = parse(pcs.color);
                fg[3] *= op * parseFloat(pcs.opacity || 1);
                push(el, "placeholder", el.placeholder, fg, bg, th, rect, { large, fs });
            }
        } else if (txt && !isIconEl) {
            if (/^rgba\(0, 0, 0, 0\)/.test(tf) && !/^rgba\(0, 0, 0, 0\)/.test(cs.color)) continue;
            const inSvg = el instanceof SVGElement;
            let fg = parse(inSvg ? cs.fill : tf && tf !== cs.color && !/^rgba\(0, 0, 0, 0\)/.test(tf) ? tf : cs.color);
            fg[3] *= op * (inSvg ? parseFloat(cs.fillOpacity || 1) : 1);
            push(el, "text", txt, fg, bgOf(el), th, rect, { large, fs });
        }
        if (isIconEl) {
            let fg = parse(cs.color);
            fg[3] *= op;
            push(el, "icon", (el.className + "").split(" ").slice(0, 2).join(" "), fg, bgOf(el), th, rect, {
                large: true,
                fs,
            });
        }
        if (el instanceof SVGElement && el.tagName.toLowerCase() === "svg" && rect.width < 80) {
            let c = cs.fill && cs.fill !== "none" ? cs.fill : cs.stroke && cs.stroke !== "none" ? cs.stroke : cs.color;
            if (c === "currentcolor") c = cs.color;
            let fg = parse(c);
            fg[3] *= op;
            if (fg[3] > 0) push(el, "svg", "svg", fg, bgOf(el), th, rect, { large: true, fs });
        }
    }
    const L = {};
    if (!roots) {
        L.hOverflow = document.documentElement.scrollWidth > innerWidth + 1 || document.body.scrollWidth > innerWidth + 1;
        L.scrollWidth = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
        L.innerWidth = innerWidth;
        const clipped = [],
            off = [],
            tap = [],
            cutoff = [];
        const hiddenAnc = (el) => {
            for (let e = el.parentElement; e && e !== document.documentElement; e = e.parentElement) {
                const cs = getComputedStyle(e);
                if ((cs.overflowX === "hidden" || cs.overflowX === "clip") && e.getBoundingClientRect().width > 0) return e;
                if (cs.overflowX === "auto" || cs.overflowX === "scroll") return null;
            }
            return null;
        };
        const clipsX = (el) => {
            for (let e = el.parentElement; e && e !== document.documentElement; e = e.parentElement) {
                const o = getComputedStyle(e).overflowX;
                if (o !== "visible") {
                    const r = e.getBoundingClientRect();
                    if (r.width > 0) return true;
                }
            }
            return false;
        };
        let n = 0;
        for (const el of document.querySelectorAll("body *")) {
            if (n > 4000) break;
            n++;
            const cs = getComputedStyle(el);
            if (cs.display === "none" || cs.visibility === "hidden") continue;
            const r = el.getBoundingClientRect();
            if (r.width === 0 || r.height === 0) continue;
            if (/^(HTML|BODY|SCRIPT|STYLE|PATH|SVG|G)$/i.test(el.tagName)) continue;
            if (
                cs.position !== "fixed" &&
                cs.position !== "sticky" &&
                !el.closest(
                    ".ant-select-dropdown,.ant-dropdown,.ant-tooltip,.ant-popover,.ant-picker-dropdown,.ant-modal-wrap,.ant-drawer,.ant-message,.ant-notification,.eclipse,.background-eclipse-container",
                ) &&
                (r.right > innerWidth + 2 || r.left < -2) &&
                !clipsX(el) &&
                el.children.length === 0
            )
                if (off.length < 15)
                    off.push({
                        selector: sel(el),
                        left: Math.round(r.left),
                        right: Math.round(r.right),
                        text: (el.textContent || "").trim().slice(0, 25),
                    });
            let fixedAnc = false;
            for (let e = el; e && e !== document.body; e = e.parentElement) if (getComputedStyle(e).position === "fixed") { fixedAnc = true; break; }
            if (el.children.length === 0 && cutoff.length < 25 && !fixedAnc && !el.closest(".ant-modal-wrap,.ant-drawer,.ant-select-dropdown,.eclipse,.background-eclipse-container,svg")) {
                const a = hiddenAnc(el);
                if (a) {
                    const ar = a.getBoundingClientRect();
                    if (r.right > ar.right + 3 || r.left < ar.left - 3) cutoff.push({ selector: sel(el), by: sel(a), over: Math.round(Math.max(r.right - ar.right, ar.left - r.left)), text: (el.textContent || el.placeholder || "").trim().slice(0, 25) });
                }
            }
            if (
                (cs.overflowX === "hidden" || cs.overflow === "hidden") &&
                el.scrollWidth > el.clientWidth + 2 &&
                cs.textOverflow !== "ellipsis" &&
                el.clientWidth > 0 &&
                (el.textContent || "").trim() &&
                clipped.length < 15
            )
                clipped.push({ selector: sel(el), sw: el.scrollWidth, cw: el.clientWidth, text: (el.textContent || "").trim().slice(0, 25) });
            if (
                innerWidth <= 480 &&
                /^(A|BUTTON|INPUT|SELECT|TEXTAREA)$/.test(el.tagName) &&
                el.type !== "hidden" &&
                (r.height < 36 || r.width < 36) &&
                !(el.tagName === "A" && cs.display === "inline") &&
                tap.length < 40 &&
                r.top < innerHeight * 3
            )
                tap.push({ selector: sel(el), w: Math.round(r.width), h: Math.round(r.height), text: (el.textContent || el.placeholder || "").trim().slice(0, 20) });
        }
        L.offscreen = off;
        L.clipped = clipped;
        L.cutoff = cutoff;
        L.tap = tap;
        L.bodyFont = document.body ? parseFloat(getComputedStyle(document.body).fontSize) : 0;
        const small = [];
        for (const it of results.concat(pending.map((p) => p.item)))
            if (it.kind === "text" && it.fs < 14 && innerWidth <= 480 && small.length < 15)
                small.push({ selector: it.selector, fs: it.fs, text: it.text });
        L.smallText = small;
    }
    return { results, pending, L };
}

/* ---------------- sampling for gradient/image backgrounds ---------------- */
async function sample(page, pending) {
    if (!pending.length) return [];
    const h = await page.addStyleTag({
        content:
            "*,*::before,*::after{color:transparent!important;-webkit-text-fill-color:transparent!important;text-shadow:none!important;caret-color:transparent!important} ::placeholder{color:transparent!important} svg{visibility:hidden!important} img,video{visibility:hidden!important}",
    });
    await page.waitForTimeout(80);
    const buf = await page.screenshot();
    await h.evaluate((n) => n.remove());
    const b64 = buf.toString("base64");
    const out = await page.evaluate(
        async ({ b64, pending }) => {
            const img = new Image();
            img.src = "data:image/png;base64," + b64;
            await img.decode();
            const c = document.createElement("canvas");
            c.width = img.width;
            c.height = img.height;
            const x = c.getContext("2d", { willReadFrequently: true });
            x.drawImage(img, 0, 0);
            const lin = (v) => {
                v /= 255;
                return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
            };
            const lum = (c) => 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);
            return pending.map((p) => {
                const r = p.rect;
                if (r.x + r.w < 0 || r.y + r.h < 0 || r.x > img.width || r.y > img.height) return { ratio: null };
                const x0 = Math.max(0, r.x),
                    y0 = Math.max(0, r.y),
                    x1 = Math.min(img.width - 1, r.x + r.w),
                    y1 = Math.min(img.height - 1, r.y + r.h);
                const px = [];
                for (let i = 0; i < 6; i++)
                    for (let j = 0; j < 3; j++) {
                        const d = x.getImageData(
                            Math.floor(x0 + ((x1 - x0) * (i + 0.5)) / 6),
                            Math.floor(y0 + ((y1 - y0) * (j + 0.5)) / 3),
                            1,
                            1,
                        ).data;
                        px.push([d[0], d[1], d[2]]);
                    }
                px.sort((a, b) => lum(a) - lum(b));
                const med = px[Math.floor(px.length / 2)];
                const f = p.fg;
                const a = f[3];
                const fgc = [0, 1, 2].map((k) => f[k] * a + med[k] * (1 - a));
                const l1 = lum(fgc),
                    l2 = lum(med);
                return { ratio: +((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)).toFixed(2), bg: med };
            });
        },
        { b64, pending: pending.map((p) => ({ rect: p.rect, fg: p.fg })) },
    );
    return pending
        .map((p, i) => {
            if (out[i].ratio == null) return null;
            p.item.ratio = out[i].ratio;
            p.item.bg = out[i].bg;
            p.item.sampled = true;
            return p.item;
        })
        .filter(Boolean);
}

const thresholdOf = (it) => (it.kind === "icon" || it.kind === "svg" || it.large ? 3 : 4.5);

async function login(browser, user, file) {
    if (fs.existsSync(file) && Date.now() - fs.statSync(file).mtimeMs < 20 * 60 * 1000) return;
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await ctx.newPage();
    await p.goto(BASE + "/login");
    await p.locator('input:not([type=password]):not([type=hidden]):not([type=checkbox])').first().fill(user.email);
    await p.fill('input[type="password"]', user.password);
    await p.click(".ant-btn-primary");
    await p.waitForURL(/\/(user|admin)/, { timeout: 25000 });
    await ctx.storageState({ path: file });
    await ctx.close();
}

const browser = await chromium.launch({ executablePath: CHROME, headless: true });
// admin account comes from the environment (never commit credentials): AUDIT_ADMIN_EMAIL / AUDIT_ADMIN_PASSWORD
const users = { T: SEED.T, S: SEED.S, A: { email: process.env.AUDIT_ADMIN_EMAIL || "", password: process.env.AUDIT_ADMIN_PASSWORD || "" } };
const stateFile = (role) => path.join(OUT, `state-${role}.json`);
if (!users.A.email) ROUTES = ROUTES.filter((x) => x.role !== "A"); // admin routes need AUDIT_ADMIN_* env vars
for (const role of ["T", "S", "A"]) if (ROUTES.some((x) => x.role === role)) await login(browser, users[role], stateFile(role));

const report = [];
const layoutReport = [];
const counts = {};
const safeName = (s) => s.replace(/[^a-z0-9]+/gi, "_").slice(0, 60);

for (const accent of ACCENTS)
    for (const th of THEMES)
        for (const [w, h] of VPS) {
            const key = `${th}@${w}x${h}${accent ? "+" + accent : ""}`;
            counts[key] = {};
            for (const { r, role } of ROUTES) {
                const ctx = await browser.newContext({
                    viewport: { width: w, height: h },
                    colorScheme: th === "dark" ? "dark" : "light",
                    hasTouch: w <= 768,
                    isMobile: w <= 480,
                    storageState: role ? stateFile(role) : undefined,
                });
                await ctx.addInitScript(
                    ({ th, accent }) => {
                        try {
                            localStorage.setItem("theme", "theme-" + th);
                            document.addEventListener("DOMContentLoaded", () => { const st = document.createElement("style"); st.textContent = ".vue-devtools__panel,#vue-devtools-anchor,.vue-devtools__anchor{display:none!important} *,*::before,*::after{transition:none!important;animation:none!important}"; document.head.appendChild(st); });
                            if (accent) localStorage.setItem("accent_color", accent);
                        } catch {}
                    },
                    { th, accent },
                );
                const p = await ctx.newPage();
                const errs = [];
                p.on("pageerror", (e) => errs.push(e.message.slice(0, 120)));
                try {
                    await p.goto(BASE + r, { waitUntil: "domcontentloaded", timeout: 30000 });
                    await p.waitForLoadState("networkidle", { timeout: 8000 }).catch(() => {});
                    await p.waitForTimeout(900);
                    const finalPath = new URL(p.url()).pathname;
                    const base = async (roots, ctxLabel) => {
                        const { results, pending, L } = await p.evaluate(pageAudit, { roots, th });
                        const sampled = await sample(p, pending).catch(() => []);
                        const bad = results
                            .concat(sampled)
                            .filter((it) => it.ratio < thresholdOf(it))
                            .map((it) => ({ ...it, route: r, finalPath, vp: `${w}x${h}`, theme: th, accent, ctx: ctxLabel }));
                        return { bad, L };
                    };
                    const { bad, L } = await base(null, "page");
                    for (const b of bad) report.push(b);
                    layoutReport.push({ route: r, finalPath, vp: `${w}x${h}`, theme: th, accent, ...L, errs });
                    if (SHOTS) {
                        const f = path.join(OUT, "shots", `${safeName(r)}-${th}-${w}${accent ? "-" + accent : ""}.png`);
                        fs.mkdirSync(path.dirname(f), { recursive: true });
                        await p.screenshot({ path: f });
                    }
                    if (INTERACT && (w === 1440 || w === 375)) {
                        const trig = await p.evaluate(() => {
                            const out = [];
                            const els = [
                                ...document.querySelectorAll(
                                    "button,[role=button],.ant-select,.ant-picker,.ant-dropdown-trigger,.ant-dropdown-link,a.main-color-btn,.sidebar-viewButton,.menu-toggle",
                                ),
                            ];
                            els.forEach((e, i) => {
                                const rc = e.getBoundingClientRect();
                                const cs = getComputedStyle(e);
                                if (rc.width < 10 || rc.height < 10 || cs.visibility === "hidden" || e.disabled || e.closest("[disabled]")) return;
                                if (rc.top > innerHeight || rc.bottom < 0) return;
                                const t = (e.textContent || "").trim();
                                e.setAttribute("data-audit-i", i);
                                out.push({ i, t: t.slice(0, 20), cls: (e.className + "").slice(0, 40) });
                            });
                            return out.slice(0, 14);
                        });
                        for (const t of trig) {
                            const el = p.locator(`[data-audit-i="${t.i}"]`).first();
                            try {
                                await el.click({ timeout: 1500 });
                                await p.waitForTimeout(450);
                                if (new URL(p.url()).pathname !== finalPath.split("?")[0]) {
                                    await p.goto(BASE + r, { waitUntil: "domcontentloaded" });
                                    await p.waitForTimeout(700);
                                    continue;
                                }
                                const open = await p.evaluate((o) => document.querySelectorAll(o).length, OVERLAY);
                                if (open) {
                                    const rr = await base([OVERLAY], `overlay after click "${t.t || t.cls}"`);
                                    for (const b of rr.bad) report.push(b);
                                    if (SHOTS) {
                                        const f = path.join(OUT, "shots", `${safeName(r)}-${th}-${w}-ov-${safeName(t.t || t.cls)}.png`);
                                        await p.screenshot({ path: f });
                                    }
                                }
                                await p.keyboard.press("Escape");
                                await p.keyboard.press("Escape");
                                await p.waitForTimeout(250);
                                await p.evaluate(() =>
                                    document.querySelectorAll(".ant-modal-wrap,.ant-drawer").forEach((e) => {
                                        const b = e.querySelector(".ant-modal-close,.ant-drawer-close");
                                        b && b.click();
                                    }),
                                );
                                await p.waitForTimeout(250);
                            } catch {}
                        }
                    }
                } catch (e) {
                    layoutReport.push({ route: r, vp: `${w}x${h}`, theme: th, error: String(e).slice(0, 150) });
                }
                await ctx.close();
            }
            const rs = report.filter((x) => x.vp === `${w}x${h}` && x.theme === th && x.accent === accent);
            const lr = layoutReport.filter((x) => x.vp === `${w}x${h}` && x.theme === th && x.accent === accent);
            counts[key] = {
                text: rs.filter((x) => !x.disabled && x.kind !== "icon" && x.kind !== "svg").length,
                icon: rs.filter((x) => !x.disabled && (x.kind === "icon" || x.kind === "svg")).length,
                disabledExempt: rs.filter((x) => x.disabled).length,
                hOverflowPages: lr.filter((x) => x.hOverflow).length,
                offscreenPages: lr.filter((x) => x.offscreen?.length).length,
                clippedPages: lr.filter((x) => x.clipped?.length).length,
                cutoffPages: lr.filter((x) => x.cutoff?.length).length,
                loadErrors: lr.filter((x) => x.error).length,
            };
            console.log(key, JSON.stringify(counts[key]));
        }
await browser.close();
fs.writeFileSync(path.join(OUT, "contrast.json"), JSON.stringify(report, null, 1));
fs.writeFileSync(path.join(OUT, "layout.json"), JSON.stringify(layoutReport, null, 1));
fs.writeFileSync(path.join(OUT, "counts.json"), JSON.stringify(counts, null, 1));
const g = {};
for (const b of report.filter((x) => !x.disabled)) {
    const k = `${b.kind}|${b.selector}|${b.theme}|${b.fg.join(",")}|${b.bg.join(",")}`;
    (g[k] ||= { n: 0, ratio: b.ratio, text: b.text, routes: new Set() }).n++;
    g[k].routes.add(b.route + "@" + b.vp);
}
const lines = Object.entries(g)
    .sort((a, b) => b[1].n - a[1].n)
    .map(([k, v]) => `${v.n}x r=${v.ratio} ${k} "${v.text}" [${[...v.routes].slice(0, 3).join(" ")}]`);
fs.writeFileSync(path.join(OUT, "summary.txt"), lines.join("\n"));
console.log("done. unique:", lines.length);
