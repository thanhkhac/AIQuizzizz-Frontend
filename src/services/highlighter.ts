// Chỉ được import ĐỘNG từ RichContentService (loadHighlighter) để highlight.js nằm ngoài bundle chính.
// Chỉ đăng ký các ngôn ngữ cần dùng (không import "highlight.js" bản đầy đủ ~1MB).
import hljs from "highlight.js/lib/core";
import csharp from "highlight.js/lib/languages/csharp";
import java from "highlight.js/lib/languages/java";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import sql from "highlight.js/lib/languages/sql";
import json from "highlight.js/lib/languages/json";
import yaml from "highlight.js/lib/languages/yaml";
import bash from "highlight.js/lib/languages/bash";
import xml from "highlight.js/lib/languages/xml";
import css from "highlight.js/lib/languages/css";
import python from "highlight.js/lib/languages/python";
import go from "highlight.js/lib/languages/go";
import dockerfile from "highlight.js/lib/languages/dockerfile";
import kotlin from "highlight.js/lib/languages/kotlin";
import plaintext from "highlight.js/lib/languages/plaintext";

hljs.registerLanguage("csharp", csharp); // alias: cs, c#
hljs.registerLanguage("java", java);
hljs.registerLanguage("javascript", javascript); // alias: js
hljs.registerLanguage("typescript", typescript); // alias: ts
hljs.registerLanguage("sql", sql);
hljs.registerLanguage("json", json);
hljs.registerLanguage("yaml", yaml); // alias: yml
hljs.registerLanguage("bash", bash); // alias: sh, zsh
hljs.registerLanguage("xml", xml); // alias: html, xhtml, svg...
hljs.registerLanguage("css", css);
hljs.registerLanguage("python", python); // alias: py
hljs.registerLanguage("go", go); // alias: golang
hljs.registerLanguage("dockerfile", dockerfile); // alias: docker
hljs.registerLanguage("kotlin", kotlin); // alias: kt
hljs.registerLanguage("plaintext", plaintext); // alias: text, txt

/** Trả về HTML đã escape + bọc span.hljs-*, hoặc null nếu không hỗ trợ ngôn ngữ */
export const highlightCode = (code: string, language: string): string | null => {
    if (!hljs.getLanguage(language)) return null;
    try {
        return hljs.highlight(code, { language, ignoreIllegals: true }).value;
    } catch {
        return null;
    }
};
