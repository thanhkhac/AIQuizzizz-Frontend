import MarkdownIt, { type MarkdownIt as MarkdownItInstance } from "markdown-it";
import DOMPurify from "dompurify";
import { ref } from "vue";

/**
 * Hiển thị nội dung câu hỏi / giải thích / đáp án theo `textFormat` của backend.
 *  - Markdown : markdown-it (html:false) + highlight.js (tải động) + DOMPurify
 *  - Html     : DOMPurify (nội dung do TipTap sinh ra, hoặc dữ liệu cũ)
 *  - PlainText: văn bản thường (hiển thị pre-wrap)
 * Mọi chuỗi HTML trả ra từ file này đã qua DOMPurify.
 */

export type TextFormat = "PlainText" | "Html" | "Markdown";

export interface RenderedContent {
    /** "html": dùng v-html (đã sanitize). "text": hiển thị dạng text thường (Vue tự escape) */
    kind: "html" | "text";
    value: string;
}

export interface RenderOptions {
    /** Chỉ inline (không <p>, không block) - dùng cho đáp án / item */
    inline?: boolean;
    copyLabel?: string;
    copiedLabel?: string;
}

/** Chấp nhận mọi kiểu viết hoa/thường ("HTML", "MarkDown"...). null = không rõ (dữ liệu cũ) */
export const normalizeTextFormat = (format?: string | null): TextFormat | null => {
    switch ((format ?? "").trim().toLowerCase()) {
        case "markdown":
            return "Markdown";
        case "html":
            return "Html";
        case "plaintext":
            return "PlainText";
        default:
            return null;
    }
};

//#region highlight.js (tải động)
export const highlighterReady = ref(false);

let highlightFn: ((code: string, language: string) => string | null) | null = null;
let highlighterLoading: Promise<void> | null = null;

/** Tải highlight.js (chunk riêng) một lần. Khi xong, mọi nội dung Markdown được render lại có màu */
export const loadHighlighter = (): Promise<void> => {
    if (!highlighterLoading) {
        highlighterLoading = import("./highlighter")
            .then((module) => {
                highlightFn = module.highlightCode;
                renderCache.clear();
                highlighterReady.value = true;
            })
            .catch((error) => {
                // không tải được: code block vẫn hiển thị (không màu)
                console.warn("Cannot load syntax highlighter", error);
            });
    }
    return highlighterLoading;
};
//#endregion

//#region sanitize
const FORBIDDEN_TAGS = [
    "style",
    "script",
    "link",
    "meta",
    "base",
    "iframe",
    "frame",
    "object",
    "embed",
    "img",
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

// DOMPurify là singleton: hook áp dụng cho mọi lần sanitize trong app
DOMPurify.addHook("afterSanitizeAttributes", (node) => {
    if (node.tagName === "A" && node.hasAttribute("href")) {
        node.setAttribute("target", "_blank");
        node.setAttribute("rel", "noopener noreferrer");
    }
});

/** Html do người dùng/legacy: không cho button, data-* */
export const sanitizeHtml = (html: string): string =>
    DOMPurify.sanitize(html, {
        USE_PROFILES: { html: true },
        FORBID_TAGS: [...FORBIDDEN_TAGS, "button"],
        FORBID_ATTR: ["style"],
        ALLOW_DATA_ATTR: false,
    });

/** Html do markdown-it sinh ra: cần giữ nút "Copy" (button + data-*) của code block */
const sanitizeMarkdownHtml = (html: string): string =>
    DOMPurify.sanitize(html, {
        USE_PROFILES: { html: true },
        FORBID_TAGS: FORBIDDEN_TAGS,
        FORBID_ATTR: ["style"],
        ALLOW_DATA_ATTR: true,
    });
//#endregion

//#region nhận diện HTML (dữ liệu cũ)
// TipTap luôn xuất ra block-level ở đầu chuỗi (<p>, <pre>, <ul>...)
const TIPTAP_START = /^\s*<(p|pre|ul|ol|blockquote|h[1-6]|hr)(\s[^>]*)?\/?>/i;
const INLINE_PAIR = /<(pre|code|strong|em|b|i|u|s|ul|ol|li|blockquote)(\s[^>]*)?>[\s\S]*?<\/\1>/i;

/** Dữ liệu do editor (TipTap) sinh ra, kể cả khi bị gắn nhầm nhãn PlainText (test/template cũ) */
export const isEditorHtml = (content: string): boolean => TIPTAP_START.test(content);

/**
 * Heuristic cho dữ liệu cũ gắn nhãn Html: chỉ coi là HTML nếu có thẻ hợp lệ (có cả thẻ đóng),
 * còn lại (vd "What does <div> do?") hiển thị như text.
 */
export const isHTMLContent = (content: string | null | undefined): boolean => {
    if (!content) return false;
    if (isEditorHtml(content)) return true;
    // bỏ phần nằm trong dấu `...` (người dùng viết thẻ HTML như ví dụ)
    const withoutBackticks = content.replace(/`[^`]*`/g, "");
    return INLINE_PAIR.test(withoutBackticks);
};

const stripOuterParagraph = (text: string) => text.replace(/^<p>/i, "").replace(/<\/p>$/i, "");
//#endregion

//#region markdown-it
const escapeHtml = (text: string) =>
    text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

export interface MarkdownEnv {
    copyLabel?: string;
    copiedLabel?: string;
}

const LANGUAGE_ALIASES: Record<string, string> = { "c#": "csharp", "cs": "csharp" };

/** Khối code (có nút Sao chép); dùng chung với trang Hướng dẫn */
export const renderCodeBlock = (code: string, info: string, env: MarkdownEnv): string => {
    const rawLanguage = (info.trim().split(/\s+/)[0] ?? "").toLowerCase();
    const language = LANGUAGE_ALIASES[rawLanguage] ?? rawLanguage;
    const text = code.replace(/\n$/, "");

    let body: string | null = null;
    if (language) {
        // lần đầu gặp code có ngôn ngữ: tải highlight.js (không chặn), render lại khi xong
        if (!highlightFn) void loadHighlighter();
        else body = highlightFn(text, language);
    }
    body ??= escapeHtml(text);

    const className = language.replace(/[^a-z0-9_+#.-]/g, "");
    const copyLabel = escapeHtml(env.copyLabel ?? "Copy");
    const copiedLabel = escapeHtml(env.copiedLabel ?? "Copied");

    return (
        `<div class="rc-code">` +
        `<div class="rc-code-head">` +
        `<span class="rc-code-lang">${escapeHtml(rawLanguage || "text")}</span>` +
        `<button type="button" class="rc-copy" data-rc-copy data-copied-label="${copiedLabel}" aria-label="${copyLabel}">` +
        `<i class="bx bx-copy" aria-hidden="true"></i><span class="rc-copy-label">${copyLabel}</span></button>` +
        `</div>` +
        `<pre class="rc-pre"><code class="hljs${className ? ` language-${className}` : ""}">${body}</code></pre>` +
        `</div>`
    );
};

const createMarkdown = (): MarkdownItInstance => {
    // html:false -> thẻ HTML thô trong markdown được hiển thị như text, không bao giờ thành phần tử
    const md = new MarkdownIt({ html: false, linkify: true, breaks: true, typographer: false });

    // Chỉ tự động tạo link cho http(s)://, mailto:, ... Không đoán "Program.py", "System.IO", "run.sh" là tên miền
    md.linkify.set({ fuzzyLink: false, fuzzyEmail: false, fuzzyIP: false });

    md.renderer.rules.fence = (tokens, idx, _options, env) =>
        renderCodeBlock(
            tokens[idx].content,
            tokens[idx].info ? md.utils.unescapeAll(tokens[idx].info) : "",
            (env ?? {}) as MarkdownEnv,
        );
    md.renderer.rules.code_block = (tokens, idx, _options, env) =>
        renderCodeBlock(tokens[idx].content, "", (env ?? {}) as MarkdownEnv);

    // bảng: bọc để cuộn ngang trong khung, không làm vỡ layout trang
    md.renderer.rules.table_open = () => '<div class="rc-table-wrap"><table>';
    md.renderer.rules.table_close = () => "</table></div>";

    // link mở tab mới, rel an toàn
    const defaultLinkOpen =
        md.renderer.rules.link_open ??
        ((tokens, idx, options, _env, self) => self.renderToken(tokens, idx, options));
    md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
        tokens[idx].attrSet("target", "_blank");
        tokens[idx].attrSet("rel", "noopener noreferrer");
        return defaultLinkOpen(tokens, idx, options, env, self);
    };

    // ảnh trong markdown bị tắt (không tải tài nguyên bên ngoài): hiển thị như link chữ
    md.renderer.rules.image = (tokens, idx) => {
        const token = tokens[idx];
        const src = String(token.attrGet("src") ?? "");
        const label = token.content || src;
        return `<a class="rc-image-link" href="${escapeHtml(src)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`;
    };

    return md;
};

let markdown: MarkdownItInstance | null = null;
const getMarkdown = () => (markdown ??= createMarkdown());

// instance riêng để chuyển Markdown -> HTML cho TipTap (không bọc code block / bảng)
let editorMarkdown: MarkdownItInstance | null = null;
export const markdownToEditorHtml = (source: string): string => {
    editorMarkdown ??= new MarkdownIt({ html: false, linkify: false, breaks: true });
    return sanitizeHtml(editorMarkdown.render(source ?? ""));
};
//#endregion

//#region render + memo
const MAX_CACHE = 500;
const renderCache = new Map<string, RenderedContent>();

const remember = (key: string, value: RenderedContent) => {
    if (renderCache.size >= MAX_CACHE) {
        const oldest = renderCache.keys().next().value;
        if (oldest !== undefined) renderCache.delete(oldest);
    }
    renderCache.set(key, value);
    return value;
};

const renderUncached = (
    content: string,
    format: TextFormat | null,
    options: RenderOptions,
): RenderedContent => {
    if (!content) return { kind: "text", value: "" };

    if (format === "Markdown") {
        const env = { copyLabel: options.copyLabel, copiedLabel: options.copiedLabel } as MarkdownEnv &
            Parameters<MarkdownItInstance["render"]>[1];
        const source = content.replace(/\r\n?/g, "\n");
        const html = options.inline ? getMarkdown().renderInline(source, env) : getMarkdown().render(source, env);
        return { kind: "html", value: sanitizeMarkdownHtml(html) };
    }

    // đáp án / item của câu hỏi không phải Markdown luôn là text thường
    if (options.inline) return { kind: "text", value: content };

    if (format === "PlainText") {
        // test/template cũ lưu nhầm nhãn PlainText cho nội dung HTML của editor
        return isEditorHtml(content)
            ? { kind: "html", value: sanitizeHtml(content) }
            : { kind: "text", value: content };
    }

    // Html hoặc không rõ (dữ liệu cũ)
    return isHTMLContent(content)
        ? { kind: "html", value: sanitizeHtml(content) }
        : { kind: "text", value: stripOuterParagraph(content) };
};

export const renderContent = (
    content: string | null | undefined,
    format?: string | null,
    options: RenderOptions = {},
): RenderedContent => {
    const text = content ?? "";
    const normalized = normalizeTextFormat(format);
    const key = [
        normalized ?? "-",
        options.inline ? "i" : "b",
        options.copyLabel ?? "",
        options.copiedLabel ?? "",
        text,
    ].join("\u0000");

    return renderCache.get(key) ?? remember(key, renderUncached(text, normalized, options));
};

/** Dùng trong test */
export const clearRenderCache = () => renderCache.clear();
//#endregion
