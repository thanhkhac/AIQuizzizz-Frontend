import { describe, expect, it } from "vitest";
import type { RequestQuestion } from "@/models/request/question";
import {
    convertContent,
    defaultNewQuestionFormat,
    formatForMode,
    hasContent,
    htmlToMarkdown,
    modeOf,
    switchQuestionMode,
} from "@/services/ContentModeService";
import { renderContent } from "@/services/RichContentService";

const question = (overrides: Partial<RequestQuestion> = {}): RequestQuestion => ({
    id: "1",
    type: "MultipleChoice",
    textFormat: "Html",
    questionText: "",
    questionHTML: "",
    explainText: "",
    score: 10,
    multipleChoices: [],
    matchingPairs: [],
    orderingItems: [],
    shortAnswer: "",
    ...overrides,
});

describe("htmlToMarkdown", () => {
    it("converts paragraphs, bold, italic and inline code", () => {
        expect(htmlToMarkdown("<p>Hello <strong>big</strong> <em>world</em> <code>int</code></p>")).toBe(
            "Hello **big** *world* `int`",
        );
    });

    it("separates paragraphs with a blank line and keeps hard breaks", () => {
        expect(htmlToMarkdown("<p>a</p><p>b<br>c</p>")).toBe("a\n\nb\nc");
    });

    it("converts code blocks with language", () => {
        const html = '<p>Output?</p><pre><code class="language-csharp">int a = 5;\nConsole.WriteLine(a);</code></pre>';
        expect(htmlToMarkdown(html)).toBe("Output?\n\n```csharp\nint a = 5;\nConsole.WriteLine(a);\n```");
    });

    it("does not escape the content of code", () => {
        expect(htmlToMarkdown("<pre><code>a * b _c_ `d`</code></pre>")).toBe("```\na * b _c_ `d`\n```");
        expect(htmlToMarkdown("<p><code>a`b</code></p>")).toBe("``a`b``");
    });

    it("converts bullet and ordered lists (TipTap puts <p> inside <li>)", () => {
        expect(htmlToMarkdown("<ul><li><p>a</p></li><li><p>b</p></li></ul>")).toBe("- a\n- b");
        expect(htmlToMarkdown("<ol><li><p>a</p></li><li><p>b</p></li></ol>")).toBe("1. a\n2. b");
    });

    it("converts nested lists", () => {
        expect(
            htmlToMarkdown("<ul><li><p>a</p><ul><li><p>a1</p></li></ul></li><li><p>b</p></li></ul>"),
        ).toBe("- a\n  - a1\n- b");
    });

    it("converts links, headings, blockquote and rule; drops unsafe link targets", () => {
        expect(htmlToMarkdown('<p><a href="https://e.com">x</a></p>')).toBe("[x](https://e.com)");
        expect(htmlToMarkdown('<p><a href="javascript:alert(1)">x</a></p>')).toBe("x");
        expect(htmlToMarkdown("<h2>T</h2><p>a</p>")).toBe("## T\n\na");
        expect(htmlToMarkdown("<blockquote><p>q</p></blockquote>")).toBe("> q");
        expect(htmlToMarkdown("<p>a</p><hr><p>b</p>")).toBe("a\n\n---\n\nb");
    });

    it("keeps the text of unsupported formatting (underline)", () => {
        expect(htmlToMarkdown("<p><u>under</u> line</p>")).toBe("under line");
    });

    it("escapes markdown syntax that appears as plain text", () => {
        expect(htmlToMarkdown("<p>2 * 3 = 6 and snake_case [x]</p>")).toBe("2 \\* 3 = 6 and snake\\_case \\[x\\]");
        expect(htmlToMarkdown("<p># not a heading</p>")).toBe("\\# not a heading");
        expect(htmlToMarkdown("<p>1. not a list</p>")).toBe("1\\. not a list");
    });

    it("keeps '<' text that came from html entities", () => {
        expect(htmlToMarkdown("<p>a &lt; b &amp;&amp; c &gt; d</p>")).toBe("a < b && c > d");
    });

    it("leaves plain (non-html) text untouched, e.g. raw markdown imported into an html question", () => {
        const raw = "Đoạn code sau in ra gì?\n```csharp\nint a = 5;\n```";
        expect(htmlToMarkdown(raw)).toBe(raw);
    });

    it("handles empty input", () => {
        expect(htmlToMarkdown("")).toBe("");
        expect(htmlToMarkdown(null)).toBe("");
        expect(htmlToMarkdown("<p></p>")).toBe("");
    });

    it("round-trips through the renderer", () => {
        const html =
            '<p>Output of <code>a</code>?</p><pre><code class="language-sql">SELECT 1;</code></pre><ul><li><p>one</p></li></ul>';
        const rendered = renderContent(htmlToMarkdown(html), "Markdown").value;
        expect(rendered).toContain("<code>a</code>");
        expect(rendered).toContain("language-sql");
        expect(rendered).toContain("<li>one</li>");
    });
});

describe("convertContent", () => {
    it("Markdown -> rich html (sanitized)", () => {
        const html = convertContent("**a** `b`\n\n```js\nx<1\n```\n<script>x</script>", "rich");
        expect(html).toContain("<strong>a</strong>");
        expect(html).toContain("<code>b</code>");
        expect(html).toContain('<code class="language-js">x&lt;1\n</code>');
        expect(html).not.toContain("<script");
    });

    it("rich -> Markdown", () => {
        expect(convertContent("<p><strong>a</strong></p>", "markdown")).toBe("**a**");
    });

    it("returns an empty string for blank content", () => {
        expect(convertContent("   ", "markdown")).toBe("");
        expect(convertContent(undefined, "rich")).toBe("");
    });
});

describe("modes and formats", () => {
    it("modeOf / formatForMode", () => {
        expect(modeOf("Markdown")).toBe("markdown");
        expect(modeOf("MarkDown")).toBe("markdown");
        expect(modeOf("Html")).toBe("rich");
        expect(modeOf("PlainText")).toBe("rich");
        expect(modeOf(undefined)).toBe("rich");

        expect(formatForMode("markdown", "Html")).toBe("Markdown");
        expect(formatForMode("rich", "Markdown")).toBe("Html");
        expect(formatForMode("rich", "PlainText")).toBe("PlainText");
        expect(formatForMode("rich", undefined)).toBe("Html");
    });

    it("defaultNewQuestionFormat is Html unless the whole list is Markdown", () => {
        expect(defaultNewQuestionFormat([])).toBe("Html");
        expect(defaultNewQuestionFormat([{ textFormat: "Html" }])).toBe("Html");
        expect(defaultNewQuestionFormat([{ textFormat: "Markdown" }, { textFormat: "Html" }])).toBe("Html");
        expect(defaultNewQuestionFormat([{ textFormat: "Markdown" }, { textFormat: "markdown" }])).toBe("Markdown");
    });

    it("hasContent ignores tags and whitespace", () => {
        expect(hasContent("<p></p>")).toBe(false);
        expect(hasContent(" ")).toBe(false);
        expect(hasContent("<p>x</p>")).toBe(true);
    });
});

describe("switchQuestionMode", () => {
    it("Rich -> Markdown converts question and explanation and sets the format", () => {
        const q = question({
            questionText: "<p>Q <code>a</code></p>",
            questionHTML: "<p>Q <code>a</code></p>",
            explainText: "<p><strong>why</strong></p>",
            multipleChoices: [{ id: "1", text: "`a`", isAnswer: true }],
        });
        switchQuestionMode(q, "markdown");
        expect(q.textFormat).toBe("Markdown");
        expect(q.questionText).toBe("Q `a`");
        expect(q.questionHTML).toBe("Q `a`");
        expect(q.explainText).toBe("**why**");
        expect(q.multipleChoices[0].text).toBe("`a`");
    });

    it("Markdown -> Rich converts back to editor html and sets Html", () => {
        const q = question({ textFormat: "Markdown", questionText: "Q `a`", explainText: "**why**" });
        switchQuestionMode(q, "rich");
        expect(q.textFormat).toBe("Html");
        expect(q.questionText).toBe("<p>Q <code>a</code></p>\n");
        expect(q.questionHTML).toBe(q.questionText);
        expect(q.explainText).toBe("<p><strong>why</strong></p>\n");
    });

    it("does nothing when the mode is unchanged", () => {
        const q = question({ textFormat: "Markdown", questionText: "x" });
        switchQuestionMode(q, "markdown");
        expect(q.questionText).toBe("x");
        expect(q.textFormat).toBe("Markdown");
    });
});
