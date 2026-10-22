import MarkdownIt, { type MarkdownIt as MarkdownItInstance } from "markdown-it";
import DOMPurify from "dompurify";
import { GUIDE_ENTRIES, type GuideEntry } from "@/guide/manifest";
import { renderCodeBlock, type MarkdownEnv } from "@/services/RichContentService";

/**
 * Trang Hướng dẫn sử dụng (/guide): nạp file Markdown tĩnh trong src/guide/<locale>/<group>/<page>.md,
 * render bằng markdown-it (html:false) + DOMPurify. Nội dung do dự án viết, nhưng vẫn sanitize như nội dung người dùng.
 *  - H2/H3 có id (neo cho cột "Trên trang này")
 *  - Callout: blockquote có dòng đầu [!TIP] / [!NOTE] / [!WARNING]
 *  - Link /guide/... là link nội bộ (data-guide-link, trang tự chuyển bằng router)
 *  - Ảnh chỉ hiển thị khi nằm trong /guide/img/ (thư mục public), còn lại hiển thị như link chữ
 */

export const GUIDE_LOCALE = "vn";

export interface GuideHeading {
    id: string;
    text: string;
    level: 2 | 3;
}

export interface RenderedGuide {
    html: string;
    headings: GuideHeading[];
    /** số phút đọc ước tính (>= 1) */
    readingMinutes: number;
}

export interface GuideSearchResult {
    entry: GuideEntry;
    snippet: string;
}

interface GuideEnv extends MarkdownEnv {
    headings: GuideHeading[];
    usedIds: Map<string, number>;
}

//#region nạp file
// mỗi file .md là một chunk riêng, chỉ tải khi mở trang đó
const loaders = import.meta.glob("/src/guide/*/*/*.md", { query: "?raw", import: "default" }) as Record<
    string,
    () => Promise<string>
>;

const fileKey = (path: string, locale = GUIDE_LOCALE) => `/src/guide/${locale}/${path}.md`;

export const hasGuideFile = (path: string, locale = GUIDE_LOCALE) => fileKey(path, locale) in loaders;

/** path = "group/page". null nếu không có file */
export const loadGuideMarkdown = async (path: string, locale = GUIDE_LOCALE): Promise<string | null> => {
    const load = loaders[fileKey(path, locale)];
    return load ? await load() : null;
};

/** Dùng trong test: các file .md đang có */
export const listGuideFiles = (locale = GUIDE_LOCALE): string[] =>
    Object.keys(loaders)
        .filter((key) => key.startsWith(`/src/guide/${locale}/`))
        .map((key) => key.slice(`/src/guide/${locale}/`.length, -".md".length));
//#endregion

//#region chuẩn hoá chữ (bỏ dấu tiếng Việt)
export const foldText = (text: string): string =>
    text
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        .toLowerCase();

export const slugify = (text: string): string =>
    foldText(text)
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "muc";
//#endregion

//#region markdown-it
const escapeHtml = (text: string) =>
    text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const CALLOUTS: Record<string, { title: string; icon: string }> = {
    TIP: { title: "Mẹo", icon: "bx-bulb" },
    NOTE: { title: "Ghi chú", icon: "bx-info-circle" },
    WARNING: { title: "Lưu ý", icon: "bx-error" },
};
const CALLOUT_MARKER = /^\[!(TIP|NOTE|WARNING)\][ \t]*\n?/;

type Token = ReturnType<MarkdownItInstance["parse"]>[number];

const inlineText = (inline: Token | undefined): string =>
    (inline?.children ?? [])
        .filter((child) => child.type === "text" || child.type === "code_inline")
        .map((child) => child.content)
        .join("")
        .trim();

const createGuideMarkdown = (): MarkdownItInstance => {
    const md = new MarkdownIt({ html: false, linkify: true, breaks: false, typographer: false });
    md.linkify.set({ fuzzyLink: false, fuzzyEmail: false, fuzzyIP: false });

    // callout: chạy trước bước parse inline để bỏ dòng [!TIP] khỏi nội dung
    md.core.ruler.after("block", "guide_callout", (state) => {
        const tokens = state.tokens;
        for (let i = 0; i < tokens.length; i++) {
            if (tokens[i].type !== "blockquote_open") continue;
            const paragraph = tokens[i + 1];
            const inline = tokens[i + 2];
            if (paragraph?.type !== "paragraph_open" || inline?.type !== "inline") continue;
            const match = CALLOUT_MARKER.exec(inline.content);
            if (!match) continue;

            tokens[i].meta = { callout: match[1] };
            inline.content = inline.content.slice(match[0].length);
            if (!inline.content.trim()) {
                // dòng [!TIP] đứng riêng một đoạn: ẩn đoạn rỗng
                paragraph.hidden = true;
                inline.content = "";
                if (tokens[i + 3]?.type === "paragraph_close") tokens[i + 3].hidden = true;
            }
        }
    });

    // id cho heading (sau khi parse inline để lấy đúng chữ, bỏ ký hiệu markdown)
    md.core.ruler.push("guide_heading_ids", (state) => {
        const env = state.env as unknown as GuideEnv;
        const tokens = state.tokens;
        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            if (token.type !== "heading_open") continue;
            const text = inlineText(tokens[i + 1]);
            const base = slugify(text);
            const seen = env.usedIds.get(base) ?? 0;
            env.usedIds.set(base, seen + 1);
            const id = seen ? `${base}-${seen + 1}` : base;
            token.attrSet("id", id);
            if (token.tag === "h2" || token.tag === "h3") {
                env.headings.push({ id, text, level: token.tag === "h2" ? 2 : 3 });
            }
        }
    });

    md.renderer.rules.blockquote_open = (tokens, idx) => {
        const kind = tokens[idx].meta?.callout as string | undefined;
        if (!kind) return "<blockquote>";
        const key = kind.toLowerCase();
        return (
            `<blockquote class="guide-callout guide-callout-${key}">` +
            `<p class="guide-callout-title"><i class="bx ${CALLOUTS[kind].icon}" aria-hidden="true"></i>${escapeHtml(CALLOUTS[kind].title)}</p>`
        );
    };

    md.renderer.rules.fence = (tokens, idx, _options, env) =>
        renderCodeBlock(
            tokens[idx].content,
            tokens[idx].info ? md.utils.unescapeAll(tokens[idx].info) : "",
            (env ?? {}) as MarkdownEnv,
        );
    md.renderer.rules.code_block = (tokens, idx, _options, env) =>
        renderCodeBlock(tokens[idx].content, "", (env ?? {}) as MarkdownEnv);

    md.renderer.rules.table_open = () => '<div class="rc-table-wrap"><table>';
    md.renderer.rules.table_close = () => "</table></div>";

    const defaultLinkOpen =
        md.renderer.rules.link_open ??
        ((tokens, idx, options, _env, self) => self.renderToken(tokens, idx, options));
    md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
        const href = String(tokens[idx].attrGet("href") ?? "");
        if (href.startsWith("/guide/") || href.startsWith("#")) {
            tokens[idx].attrSet("data-guide-link", "");
        } else {
            tokens[idx].attrSet("target", "_blank");
            tokens[idx].attrSet("rel", "noopener noreferrer");
        }
        return defaultLinkOpen(tokens, idx, options, env, self);
    };

    md.renderer.rules.image = (tokens, idx) => {
        const token = tokens[idx];
        const src = String(token.attrGet("src") ?? "");
        const alt = token.content;
        if (src.startsWith("/guide/img/") && !src.includes("..")) {
            return `<img class="guide-img" src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" loading="lazy" />`;
        }
        return `<a class="rc-image-link" href="${escapeHtml(src)}" target="_blank" rel="noopener noreferrer">${escapeHtml(alt || src)}</a>`;
    };

    return md;
};

let guideMarkdown: MarkdownItInstance | null = null;
const getGuideMarkdown = () => (guideMarkdown ??= createGuideMarkdown());

const GUIDE_FORBIDDEN_TAGS = [
    "style",
    "script",
    "link",
    "meta",
    "base",
    "iframe",
    "frame",
    "object",
    "embed",
    "picture",
    "video",
    "audio",
    "source",
    "svg",
    "math",
    "form",
    "input",
    "textarea",
    "select",
    "option",
];

const sanitizeGuideHtml = (html: string): string =>
    DOMPurify.sanitize(html, {
        USE_PROFILES: { html: true },
        FORBID_TAGS: GUIDE_FORBIDDEN_TAGS,
        FORBID_ATTR: ["style"],
        ALLOW_DATA_ATTR: true,
    });

const WORDS_PER_MINUTE = 200;

export const renderGuide = (
    source: string,
    labels: { copyLabel?: string; copiedLabel?: string } = {},
): RenderedGuide => {
    const env: GuideEnv = { ...labels, headings: [], usedIds: new Map() };
    const text = (source ?? "").replace(/\r\n?/g, "\n");
    const html = sanitizeGuideHtml(getGuideMarkdown().render(text, env as unknown as Parameters<MarkdownItInstance["render"]>[1]));
    const words = text.split(/\s+/).filter(Boolean).length;
    return { html, headings: env.headings, readingMinutes: Math.max(1, Math.round(words / WORDS_PER_MINUTE)) };
};
//#endregion

//#region tìm kiếm (phía client, ~30 trang)
/** Markdown -> chữ thường để tìm kiếm / trích đoạn */
export const markdownToPlainText = (source: string): string =>
    source
        .replace(/```[\s\S]*?```/g, " ")
        .replace(/^\s*>\s?\[!(TIP|NOTE|WARNING)\]\s*$/gm, " ")
        .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
        .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
        .replace(/^[ \t]*(#{1,6}|>|[-*+]|\d+\.)[ \t]+/gm, "")
        .replace(/[*_`|]/g, "")
        .replace(/\s+/g, " ")
        .trim();

interface SearchDoc {
    entry: GuideEntry;
    text: string;
    folded: string;
    /** tiêu đề nhóm + trang, đã bỏ dấu */
    title: string;
    /** các heading H2/H3, đã bỏ dấu */
    headings: string[];
}

let searchIndex: Promise<SearchDoc[]> | null = null;

const buildSearchIndex = () =>
    (searchIndex ??= Promise.all(
        GUIDE_ENTRIES.map(async (entry) => {
            const source = ((await loadGuideMarkdown(entry.path)) ?? "").normalize("NFC");
            const text = markdownToPlainText(source);
            const headings = [...source.matchAll(/^#{2,3} +(.+)$/gm)].map((m) => foldText(markdownToPlainText(m[1])));
            return { entry, text, folded: foldText(text), title: foldText(`${entry.group.title} ${entry.page.title}`), headings };
        }),
    ));

const SNIPPET_RADIUS = 60;

/**
 * Tìm theo tiêu đề và nội dung, không phân biệt hoa thường / có dấu. Mọi từ khoá phải có mặt.
 * Thứ hạng: khớp nguyên cụm ở tiêu đề trang > ở heading > từng từ ở tiêu đề > nguyên cụm trong nội dung.
 */
export const searchGuide = async (query: string, limit = 8): Promise<GuideSearchResult[]> => {
    const terms = foldText(query).split(/\s+/).filter(Boolean);
    if (!terms.length) return [];

    const index = await buildSearchIndex();
    const results: (GuideSearchResult & { score: number })[] = [];
    const phrase = terms.join(" ");
    for (const { entry, text, folded, title, headings } of index) {
        if (!terms.every((term) => title.includes(term) || folded.includes(term))) continue;

        const titleHits = terms.filter((term) => title.includes(term)).length;
        const score =
            (foldText(entry.page.title).includes(phrase) ? 40 : 0) +
            (headings.some((heading) => heading.includes(phrase)) ? 25 : 0) +
            titleHits * 10 +
            (folded.includes(phrase) ? 5 : 0);
        // text là NFC: mỗi chữ có dấu fold thành đúng 1 ký tự, nên vị trí trong `folded` dùng được cho `text`
        const phraseAt = folded.indexOf(phrase);
        const at = phraseAt >= 0 ? phraseAt : folded.indexOf(terms[0]);
        const start = Math.max(0, (at < 0 ? 0 : at) - SNIPPET_RADIUS);
        const snippet =
            (start > 0 ? "…" : "") +
            text.slice(start, start + SNIPPET_RADIUS * 2 + phrase.length).trim() +
            (start + SNIPPET_RADIUS * 2 < text.length ? "…" : "");
        results.push({ entry, snippet, score: score - (at < 0 ? 0 : at / 10000) });
    }
    return results
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(({ entry, snippet }) => ({ entry, snippet }));
};
//#endregion
