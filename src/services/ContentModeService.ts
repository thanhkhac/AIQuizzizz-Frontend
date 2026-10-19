import type { RequestQuestion } from "@/models/request/question";
import {
    isHTMLContent,
    markdownToEditorHtml,
    normalizeTextFormat,
} from "@/services/RichContentService";

/**
 * Chuyển đổi nội dung giữa chế độ "Rich text" (HTML của TipTap) và "Markdown" trong editor câu hỏi.
 * Chuyển HTML -> Markdown là best-effort: chỉ hỗ trợ p, br, strong/b, em/i, s, code, pre, ul/ol/li, a,
 * blockquote, h1-h6, hr (định dạng khác như gạch chân sẽ mất, phần chữ vẫn giữ).
 */

export type EditorMode = "rich" | "markdown";

export const isMarkdownFormat = (format?: string | null): boolean =>
    normalizeTextFormat(format) === "Markdown";

export const modeOf = (format?: string | null): EditorMode =>
    isMarkdownFormat(format) ? "markdown" : "rich";

/** Giá trị textFormat gửi lên API khi chọn một chế độ (giữ nguyên PlainText/Html cũ nếu vẫn ở rich text) */
export const formatForMode = (mode: EditorMode, current?: string | null): string => {
    if (mode === "markdown") return "Markdown";
    const normalized = normalizeTextFormat(current);
    return normalized && normalized !== "Markdown" ? normalized : "Html";
};

/** Câu hỏi mới mặc định là Rich text, trừ khi cả danh sách (không rỗng) đều là Markdown */
export const defaultNewQuestionFormat = (
    questions: ReadonlyArray<Pick<RequestQuestion, "textFormat">> = [],
): string =>
    questions.length > 0 && questions.every((q) => isMarkdownFormat(q.textFormat))
        ? "Markdown"
        : "Html";

//#region HTML -> Markdown
const escapeInline = (text: string) => text.replace(/([\\`*_[\]])/g, "\\$1");

// ký tự đầu dòng có thể bị hiểu thành cú pháp block (#, >, -, +, "1.")
const escapeLineStarts = (text: string) =>
    text
        .split("\n")
        .map((line) =>
            line.replace(/^(\s*)([#>+-]|\d+[.)])(\s|$)/, (_m, space, marker, rest) => {
                const escaped = /^\d/.test(marker) ? marker.replace(/([.)])$/, "\\$1") : `\\${marker}`;
                return `${space}${escaped}${rest}`;
            }),
        )
        .join("\n");

const indent = (text: string, prefix: string) =>
    text
        .split("\n")
        .map((line) => (line.length > 0 ? prefix + line : line))
        .join("\n");

const safeHref = (href: string | null) =>
    href && /^(https?:|mailto:)/i.test(href.trim()) ? href.trim() : null;

const codeSpan = (text: string) => {
    const longest = Math.max(0, ...(text.match(/`+/g) ?? []).map((x) => x.length));
    const fence = "`".repeat(longest + 1);
    const pad = text.startsWith("`") || text.endsWith("`") ? " " : "";
    return `${fence}${pad}${text}${pad}${fence}`;
};

const inlineToMarkdown = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) return escapeInline(node.textContent ?? "");
    if (node.nodeType !== Node.ELEMENT_NODE) return "";

    const element = node as HTMLElement;
    const children = () => Array.from(element.childNodes).map(inlineToMarkdown).join("");
    switch (element.tagName.toLowerCase()) {
        case "br":
            return "\n";
        case "strong":
        case "b": {
            const inner = children();
            return inner.trim() ? `**${inner}**` : inner;
        }
        case "em":
        case "i": {
            const inner = children();
            return inner.trim() ? `*${inner}*` : inner;
        }
        case "s":
        case "del":
        case "strike": {
            const inner = children();
            return inner.trim() ? `~~${inner}~~` : inner;
        }
        case "code":
            return codeSpan(element.textContent ?? "");
        case "a": {
            const href = safeHref(element.getAttribute("href"));
            const inner = children();
            return href && inner.trim() ? `[${inner}](${href})` : inner;
        }
        default:
            // u, span, ... : bỏ định dạng, giữ chữ
            return children();
    }
};

const blockToMarkdown = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent ?? "";
        return text.trim() ? escapeLineStarts(escapeInline(text)) + "\n\n" : "";
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return "";

    const element = node as HTMLElement;
    const tag = element.tagName.toLowerCase();
    const childrenBlocks = () => Array.from(element.childNodes).map(blockToMarkdown).join("");
    const inline = () =>
        escapeLineStarts(Array.from(element.childNodes).map(inlineToMarkdown).join("")).trim();

    switch (tag) {
        case "p": {
            const text = inline();
            return text ? `${text}\n\n` : "\n";
        }
        case "h1":
        case "h2":
        case "h3":
        case "h4":
        case "h5":
        case "h6":
            return `${"#".repeat(Number(tag[1]))} ${inline()}\n\n`;
        case "pre": {
            const code = element.querySelector("code");
            const language = /(?:^|\s)language-([\w#+.-]+)/.exec(code?.className ?? "")?.[1] ?? "";
            const text = (code ?? element).textContent ?? "";
            const longest = Math.max(0, ...(text.match(/`{3,}/g) ?? []).map((x) => x.length));
            const fence = "`".repeat(Math.max(3, longest + 1));
            return `${fence}${language}\n${text.replace(/\n$/, "")}\n${fence}\n\n`;
        }
        case "ul":
        case "ol": {
            const ordered = tag === "ol";
            const start = Number(element.getAttribute("start")) || 1;
            const items = Array.from(element.children).filter((x) => x.tagName.toLowerCase() === "li");
            const lines = items.map((li, index) => {
                const marker = ordered ? `${start + index}. ` : "- ";
                const body = Array.from(li.childNodes)
                    .map((child) => {
                        const childTag = (child as HTMLElement).tagName?.toLowerCase();
                        // <li><p>text</p></li> (TipTap): bỏ khoảng trống giữa p và list lồng nhau
                        return childTag === "ul" || childTag === "ol" || childTag === "pre"
                            ? blockToMarkdown(child)
                            : childTag === "p"
                              ? blockToMarkdown(child).trimEnd() + "\n"
                              : blockToMarkdown(child).trimEnd() + (childTag ? "\n" : "");
                    })
                    .join("")
                    .trim();
                return marker + indent(body, " ".repeat(marker.length)).trimStart();
            });
            return lines.join("\n") + "\n\n";
        }
        case "blockquote":
            return indent(childrenBlocks().trim(), "> ").replace(/^(\s*)$/gm, ">") + "\n\n";
        case "hr":
            return "---\n\n";
        case "br":
            return "\n";
        default:
            // div, section, span...: đi tiếp vào con
            return childrenBlocks();
    }
};

export const htmlToMarkdown = (html: string | null | undefined): string => {
    const source = (html ?? "").replace(/\r\n?/g, "\n");
    if (!source.trim()) return "";
    // văn bản thường (vd markdown thô do import) -> giữ nguyên, không escape
    if (!isHTMLContent(source) && !/<\/?[a-z][^>]*>/i.test(source)) return source;

    const document = new DOMParser().parseFromString(source, "text/html");
    return Array.from(document.body.childNodes)
        .map(blockToMarkdown)
        .join("")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
};
//#endregion

/** Văn bản dùng để kiểm tra rỗng / độ dài: Markdown = văn bản thô, Rich text = bỏ thẻ HTML của editor */
export const plainTextOf = (value: string | null | undefined, format?: string | null): string =>
    isMarkdownFormat(format) ? (value ?? "").trim() : (value ?? "").replace(/<[^>]+>/g, "");

/** Nội dung có "mất định dạng" khi đổi chế độ không (dùng để quyết định có hỏi xác nhận) */
export const hasContent = (text?: string | null) => (text ?? "").replace(/<[^>]*>/g, "").trim().length > 0;

/** Chuyển một đoạn nội dung sang chế độ mới */
export const convertContent = (text: string | null | undefined, to: EditorMode): string => {
    const value = text ?? "";
    if (!value.trim()) return "";
    return to === "markdown" ? htmlToMarkdown(value) : markdownToEditorHtml(value);
};

/**
 * Đổi chế độ cho cả câu hỏi: chuyển questionText + explainText, đồng bộ questionHTML (giá trị khởi tạo của TipTap).
 * Đáp án / item giữ nguyên (luôn là text thường, ở Markdown được hiểu là inline markdown).
 */
export const switchQuestionMode = (question: RequestQuestion, to: EditorMode) => {
    if (modeOf(question.textFormat) === to) return;
    question.questionText = convertContent(question.questionText, to);
    question.explainText = convertContent(question.explainText, to);
    question.questionHTML = question.questionText;
    question.textFormat = formatForMode(to, question.textFormat);
};
