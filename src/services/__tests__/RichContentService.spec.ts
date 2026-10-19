import { beforeAll, describe, expect, it } from "vitest";
import {
    clearRenderCache,
    isHTMLContent,
    loadHighlighter,
    markdownToEditorHtml,
    normalizeTextFormat,
    renderContent,
    sanitizeHtml,
} from "@/services/RichContentService";

const parse = (html: string) => {
    const document = new DOMParser().parseFromString(`<body>${html}</body>`, "text/html");
    return document.body;
};

/** Không được còn phần tử/thuộc tính nguy hiểm nào trong HTML đã render */
const expectSafe = (html: string) => {
    const body = parse(html);
    expect(body.querySelector("script, iframe, object, embed, img, svg, style, form, input, link, meta")).toBeNull();
    body.querySelectorAll("*").forEach((element) => {
        Array.from(element.attributes).forEach((attribute) => {
            expect(attribute.name.startsWith("on")).toBe(false);
            if (["href", "src", "action", "formaction"].includes(attribute.name)) {
                expect(attribute.value.trim().toLowerCase().startsWith("javascript:")).toBe(false);
                expect(attribute.value.trim().toLowerCase().startsWith("data:")).toBe(false);
            }
        });
    });
};

const md = (content: string, options = {}) => renderContent(content, "Markdown", options);

describe("normalizeTextFormat", () => {
    it("accepts any casing and returns null for unknown values", () => {
        expect(normalizeTextFormat("Markdown")).toBe("Markdown");
        expect(normalizeTextFormat("MarkDown")).toBe("Markdown");
        expect(normalizeTextFormat("HTML")).toBe("Html");
        expect(normalizeTextFormat("plaintext")).toBe("PlainText");
        expect(normalizeTextFormat("0")).toBeNull();
        expect(normalizeTextFormat("")).toBeNull();
        expect(normalizeTextFormat(undefined)).toBeNull();
    });
});

describe("Markdown rendering", () => {
    beforeAll(async () => {
        await loadHighlighter();
        clearRenderCache();
    });

    it("renders a fenced code block with language, copy button and escaped content", () => {
        const result = md("Đoạn code sau in ra gì?\n```csharp\nint a = 5;\nList<int> xs = new();\n```");
        expect(result.kind).toBe("html");
        const body = parse(result.value);
        expect(body.querySelector("p")?.textContent).toBe("Đoạn code sau in ra gì?");
        expect(body.querySelector(".rc-code-lang")?.textContent).toBe("csharp");
        expect(body.querySelector("pre.rc-pre code.language-csharp")).not.toBeNull();
        expect(body.querySelector("button[data-rc-copy]")).not.toBeNull();
        // không còn ký tự ``` thô và `<int>` không trở thành thẻ
        expect(body.textContent).not.toContain("```");
        expect(body.querySelector("pre code")?.textContent).toContain("List<int> xs = new();");
        expect(body.querySelector("int")).toBeNull();
        expectSafe(result.value);
    });

    it("highlights code once highlight.js is loaded (aliases included)", () => {
        const cs = parse(md("```cs\nint a = 5;\n```").value);
        expect(cs.querySelector(".hljs-keyword, .hljs-built_in, .hljs-type")).not.toBeNull();
        const sql = parse(md("```sql\nSELECT * FROM users;\n```").value);
        expect(sql.querySelector(".hljs-keyword")).not.toBeNull();
        const unknown = parse(md("```brainfuck\n+++\n```").value);
        expect(unknown.querySelector("pre code")?.textContent).toBe("+++");
        const noLanguage = parse(md("```\nplain <b>\n```").value);
        expect(noLanguage.querySelector("pre code")?.textContent).toBe("plain <b>");
    });

    it("renders inline code, emphasis, lists and blockquotes", () => {
        const body = parse(md("`int` là **value type**\n\n- a\n- b\n\n> quote").value);
        expect(body.querySelector("code")?.textContent).toBe("int");
        expect(body.querySelector("strong")?.textContent).toBe("value type");
        expect(body.querySelectorAll("li")).toHaveLength(2);
        expect(body.querySelector("blockquote")).not.toBeNull();
    });

    it("keeps single line breaks (breaks: true)", () => {
        expect(md("line 1\nline 2").value).toContain("<br>");
    });

    it("renders tables inside a scroll wrapper", () => {
        const body = parse(md("| a | b |\n| - | - |\n| 1 | 2 |").value);
        expect(body.querySelector(".rc-table-wrap > table")).not.toBeNull();
        expect(body.querySelectorAll("td")).toHaveLength(2);
    });

    it("linkifies explicit URLs only and opens them in a new tab safely", () => {
        const body = parse(md("see https://example.com/a and [docs](http://example.org) in Program.py System.IO run.sh").value);
        const links = Array.from(body.querySelectorAll("a"));
        expect(links.map((a) => a.getAttribute("href"))).toEqual(["https://example.com/a", "http://example.org"]);
        links.forEach((a) => {
            expect(a.getAttribute("target")).toBe("_blank");
            expect(a.getAttribute("rel")).toBe("noopener noreferrer");
        });
    });

    it("renders markdown images as plain links (no <img>, nothing fetched)", () => {
        const result = md("![logo](https://evil.example/pixel.png)");
        const body = parse(result.value);
        expect(body.querySelector("img")).toBeNull();
        expect(body.querySelector("a.rc-image-link")?.textContent).toBe("logo");
    });

    it("uses the provided labels for the copy button", () => {
        const body = parse(md("```js\nx\n```", { copyLabel: "Sao chép", copiedLabel: "Đã chép" }).value);
        expect(body.querySelector(".rc-copy-label")?.textContent).toBe("Sao chép");
        expect(body.querySelector("button")?.getAttribute("data-copied-label")).toBe("Đã chép");
    });

    it("memoises per (content, format, options)", () => {
        const a = renderContent("**x**", "Markdown");
        expect(renderContent("**x**", "Markdown")).toBe(a);
        expect(renderContent("**x**", "Markdown", { inline: true })).not.toBe(a);
        expect(renderContent("**x**", "PlainText")).not.toBe(a);
    });
});

describe("Markdown inline mode (answer options)", () => {
    it("renders inline code without <p> or block elements", () => {
        const result = md("`a`", { inline: true });
        expect(result.kind).toBe("html");
        expect(result.value).toBe("<code>a</code>");
    });

    it("does not create block elements", () => {
        const result = md("# title\n\n- item\n\n```js\nx\n```", { inline: true });
        const body = parse(result.value);
        expect(body.querySelector("p, h1, ul, pre, .rc-code, table")).toBeNull();
        expect(body.textContent).toContain("# title");
    });

    it("still supports emphasis and links", () => {
        const body = parse(md("**b** and [x](https://e.com)", { inline: true }).value);
        expect(body.querySelector("strong")?.textContent).toBe("b");
        expect(body.querySelector("a")?.getAttribute("href")).toBe("https://e.com");
    });

    it("treats inline content of non-markdown questions as plain text", () => {
        expect(renderContent("`a` <b>x</b>", "Html", { inline: true })).toEqual({
            kind: "text",
            value: "`a` <b>x</b>",
        });
        expect(renderContent("<p>x</p>", "PlainText", { inline: true }).kind).toBe("text");
    });
});

describe("XSS", () => {
    const vectors = [
        "<script>alert(1)</script>",
        "<img src=x onerror=alert(1)>",
        '<a href="javascript:alert(1)">x</a>',
        "[x](javascript:alert(1))",
        "[x](JaVaScRiPt:alert(1))",
        "[x](data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==)",
        '<iframe src="https://evil.example"></iframe>',
        '<svg onload=alert(1)><circle/></svg>',
        '<div style="position:fixed;inset:0" onclick="x()">overlay</div>',
        "![x](javascript:alert(1))",
        "<form action=x><input name=a></form>",
        "`<script>alert(1)</script>`",
        "```html\n<script>alert(1)</script>\n```",
        "<b onmouseover=alert(1)>x</b>",
    ];

    it.each(vectors)("Markdown: %s", (vector) => {
        expectSafe(md(vector).value);
        expectSafe(md(vector, { inline: true }).value);
    });

    it("Markdown never turns raw HTML into elements; it shows the text instead", () => {
        const result = md("before <script>alert(1)</script> after <b>bold?</b>");
        const body = parse(result.value);
        expect(body.querySelector("script")).toBeNull();
        expect(body.querySelector("b")).toBeNull();
        expect(body.textContent).toContain("<script>alert(1)</script>");
        expect(body.textContent).toContain("<b>bold?</b>");
    });

    it("Markdown: onerror payload is text only", () => {
        const body = parse(md("<img src=x onerror=alert(1)>").value);
        expect(body.querySelector("img")).toBeNull();
        expect(body.querySelectorAll("[onerror]")).toHaveLength(0);
        expect(body.textContent).toContain("<img src=x onerror=alert(1)>");
    });

    it("javascript: links are not rendered as links", () => {
        const body = parse(md("[x](javascript:alert(1)) <a href=\"javascript:alert(1)\">y</a>").value);
        expect(body.querySelectorAll("a")).toHaveLength(0);
    });

    it.each(vectors.slice(0, 10))("Html format: %s", (vector) => {
        const result = renderContent(`<p>${vector}</p>`, "Html");
        expect(result.kind).toBe("html");
        expectSafe(result.value);
        expectSafe(renderContent(`<p>${vector}</p>`, "PlainText").value);
        expectSafe(sanitizeHtml(vector));
    });

    it("Html format: removes scripts, handlers, javascript: urls, inline styles, images", () => {
        const html =
            '<p onclick="x()" style="color:red">hi <a href="javascript:alert(1)">l</a> <a href="https://ok.example">ok</a><img src=x onerror=alert(1)><script>alert(1)</script></p>';
        const result = renderContent(html, "Html");
        const body = parse(result.value);
        expect(body.querySelector("script, img")).toBeNull();
        expect(body.querySelector("p")?.getAttribute("onclick")).toBeNull();
        expect(body.querySelector("p")?.getAttribute("style")).toBeNull();
        const hrefs = Array.from(body.querySelectorAll("a")).map((a) => a.getAttribute("href"));
        expect(hrefs).toEqual([null, "https://ok.example"]);
        expect(body.querySelector('a[href="https://ok.example"]')?.getAttribute("rel")).toBe("noopener noreferrer");
    });

    it("Html format cannot smuggle the copy button or data attributes", () => {
        const body = parse(renderContent('<p>x</p><button data-rc-copy type="button">c</button>', "Html").value);
        expect(body.querySelector("button")).toBeNull();
        expect(body.querySelector("[data-rc-copy]")).toBeNull();
    });
});

describe("Html and PlainText (legacy data)", () => {
    it("renders editor html (TipTap output) as sanitized html", () => {
        const result = renderContent("<p>Hello <strong>x</strong></p><ul><li><p>a</p></li></ul>", "Html");
        expect(result.kind).toBe("html");
        expect(result.value).toContain("<strong>x</strong>");
    });

    it("renders editor html even when the data is labelled PlainText (old tests / templates)", () => {
        const result = renderContent("<p>What is <code>int</code>?</p>", "PlainText");
        expect(result.kind).toBe("html");
        expect(result.value).toContain("<code>int</code>");
    });

    it("renders html when the format is missing or unknown (heuristics)", () => {
        expect(renderContent("<p>x</p>", undefined).kind).toBe("html");
        expect(renderContent("<p>x</p>", null).kind).toBe("html");
        expect(renderContent("<p>x</p>", "0").kind).toBe("html");
        expect(renderContent("a <strong>b</strong>", undefined).kind).toBe("html");
    });

    it("keeps text that only looks like tags as text (no closing tag / inside backticks)", () => {
        expect(renderContent("What does <div> do?", "Html")).toEqual({ kind: "text", value: "What does <div> do?" });
        expect(renderContent("Use `<code>x</code>` here", undefined).kind).toBe("text");
    });

    it("strips the outer paragraph of text-only legacy values", () => {
        expect(renderContent("plain & simple", "Html")).toEqual({ kind: "text", value: "plain & simple" });
    });

    it("PlainText is escaped text and keeps newlines (pre-wrap)", () => {
        const result = renderContent("line 1\nline 2 <b>x</b> & `c`", "PlainText");
        expect(result).toEqual({ kind: "text", value: "line 1\nline 2 <b>x</b> & `c`" });
    });

    it("returns empty text for empty content", () => {
        expect(renderContent("", "Markdown")).toEqual({ kind: "text", value: "" });
        expect(renderContent(null, "Html")).toEqual({ kind: "text", value: "" });
        expect(renderContent(undefined, undefined)).toEqual({ kind: "text", value: "" });
    });

    it("isHTMLContent heuristics match the previous behaviour", () => {
        expect(isHTMLContent("<pre>x</pre>")).toBe(true);
        expect(isHTMLContent("<strong>x</strong>")).toBe(true);
        expect(isHTMLContent("a <b>x")).toBe(false);
        expect(isHTMLContent("")).toBe(false);
    });
});

describe("markdownToEditorHtml", () => {
    it("produces sanitized html for TipTap", () => {
        const html = markdownToEditorHtml("**a**\n\n```csharp\nint x;\n```\n\n<script>x</script>");
        expect(html).toContain("<strong>a</strong>");
        expect(html).toContain('<pre><code class="language-csharp">');
        expectSafe(html);
    });
});
