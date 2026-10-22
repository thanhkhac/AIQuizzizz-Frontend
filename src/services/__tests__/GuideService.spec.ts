import { describe, expect, it } from "vitest";
import { GUIDE, GUIDE_ENTRIES, findGuideEntry } from "@/guide/manifest";
import {
    foldText,
    listGuideFiles,
    loadGuideMarkdown,
    markdownToPlainText,
    renderGuide,
    searchGuide,
    slugify,
} from "@/services/GuideService";

const parse = (html: string) => new DOMParser().parseFromString(`<body>${html}</body>`, "text/html").body;

describe("manifest + file nội dung", () => {
    it("slug nhóm và slug trang trong nhóm không trùng", () => {
        const groups = GUIDE.map((g) => g.slug);
        expect(new Set(groups).size).toBe(groups.length);
        for (const group of GUIDE) {
            const pages = group.pages.map((p) => p.slug);
            expect(new Set(pages).size, group.slug).toBe(pages.length);
            expect(pages.length, group.slug).toBeGreaterThan(0);
        }
    });

    it("mỗi trang trong manifest có file .md và không có file thừa", () => {
        const files = listGuideFiles().sort();
        expect(files).toEqual(GUIDE_ENTRIES.map((e) => e.path).sort());
    });

    it("file .md: không có H1, có ít nhất một H2, link /guide/... trỏ tới trang có thật", async () => {
        const problems: string[] = [];
        for (const entry of GUIDE_ENTRIES) {
            const source = (await loadGuideMarkdown(entry.path)) ?? "";
            const withoutCode = source.replace(/```[\s\S]*?```/g, "");
            if (/^#\s/m.test(withoutCode)) problems.push(`${entry.path}: có H1`);
            if (!/^##\s/m.test(withoutCode)) problems.push(`${entry.path}: thiếu H2`);
            if (/^####/m.test(withoutCode)) problems.push(`${entry.path}: có H4+`);
            for (const [, target] of withoutCode.matchAll(/\]\((\/guide\/[^)\s#]*)(#[^)\s]*)?\)/g)) {
                const [group, page] = target.replace(/^\/guide\//, "").split("/");
                if (!findGuideEntry(group, page)) problems.push(`${entry.path}: link hỏng ${target}`);
            }
        }
        expect(problems).toEqual([]);
    });
});

describe("renderGuide", () => {
    it("gán id cho H2/H3 (bỏ dấu, không trùng) và trả danh sách mục", () => {
        const { html, headings } = renderGuide("## Các bước thực hiện\n\n### Bước **1**\n\n## Các bước thực hiện");
        expect(headings).toEqual([
            { id: "cac-buoc-thuc-hien", text: "Các bước thực hiện", level: 2 },
            { id: "buoc-1", text: "Bước 1", level: 3 },
            { id: "cac-buoc-thuc-hien-2", text: "Các bước thực hiện", level: 2 },
        ]);
        const body = parse(html);
        expect(body.querySelector("h2#cac-buoc-thuc-hien")).not.toBeNull();
        expect(body.querySelector("h2#cac-buoc-thuc-hien-2")).not.toBeNull();
    });

    it("callout [!TIP] / [!WARNING] có tiêu đề, bỏ dòng đánh dấu", () => {
        const body = parse(renderGuide("> [!TIP]\n> Dùng nút **Nhập**.\n\n> [!WARNING]\n>\n> Cẩn thận.").html);
        const tip = body.querySelector("blockquote.guide-callout-tip");
        expect(tip?.querySelector(".guide-callout-title")?.textContent).toBe("Mẹo");
        expect(tip?.textContent).toContain("Dùng nút Nhập.");
        expect(tip?.textContent).not.toContain("[!TIP]");
        const warning = body.querySelector("blockquote.guide-callout-warning");
        expect(warning?.querySelector(".guide-callout-title")?.textContent).toBe("Lưu ý");
        expect(warning?.textContent).toContain("Cẩn thận.");
        // blockquote thường giữ nguyên
        expect(parse(renderGuide("> trích dẫn").html).querySelector("blockquote:not(.guide-callout)")).not.toBeNull();
    });

    it("link nội bộ có data-guide-link, link ngoài mở tab mới", () => {
        const body = parse(renderGuide("[A](/guide/question-sets/create) [B](#muc) [C](https://example.com)").html);
        const [a, b, c] = Array.from(body.querySelectorAll("a"));
        expect(a.hasAttribute("data-guide-link")).toBe(true);
        expect(b.hasAttribute("data-guide-link")).toBe(true);
        expect(c.hasAttribute("data-guide-link")).toBe(false);
        expect(c.getAttribute("rel")).toBe("noopener noreferrer");
    });

    it("chỉ hiển thị ảnh trong /guide/img/, ảnh ngoài thành link chữ", () => {
        const body = parse(renderGuide("![ok](/guide/img/a.png) ![x](https://evil.example/a.png) ![y](/guide/img/../x.png)").html);
        const images = body.querySelectorAll("img");
        expect(images).toHaveLength(1);
        expect(images[0].getAttribute("src")).toBe("/guide/img/a.png");
        expect(body.querySelectorAll("a.rc-image-link")).toHaveLength(2);
    });

    it("không cho HTML thô / javascript: link", () => {
        const html = renderGuide('<script>alert(1)</script> <img src=x onerror="alert(1)"> [x](javascript:alert(1))').html;
        const body = parse(html);
        expect(body.querySelector("script, img")).toBeNull();
        // markdown-it không tạo link cho javascript: (chỉ còn là chữ)
        expect(body.querySelector('a[href^="javascript"]')).toBeNull();
    });

    it("khối code dùng chung giao diện có nút Sao chép", () => {
        const body = parse(renderGuide("```json\n{}\n```", { copyLabel: "Sao chép" }).html);
        expect(body.querySelector(".rc-code [data-rc-copy]")?.textContent).toContain("Sao chép");
    });

    it("ước tính số phút đọc tối thiểu 1", () => {
        expect(renderGuide("ngắn").readingMinutes).toBe(1);
        expect(renderGuide(Array(1000).fill("từ").join(" ")).readingMinutes).toBe(5);
    });
});

describe("chữ + tìm kiếm", () => {
    it("foldText / slugify bỏ dấu tiếng Việt", () => {
        expect(foldText("Đăng ký & Đăng nhập")).toBe("dang ky & dang nhap");
        expect(slugify("Đăng ký & đăng nhập")).toBe("dang-ky-dang-nhap");
        expect(slugify("???")).toBe("muc");
    });

    it("markdownToPlainText bỏ ký hiệu markdown và code", () => {
        expect(markdownToPlainText("## Tiêu đề\n\n> [!TIP]\n> **Đậm** [link](/guide/a/b)\n\n```js\nx\n```\n1. Một")).toBe(
            "Tiêu đề Đậm link Một",
        );
    });

    it("tìm không dấu ra trang có dấu, trang khớp tiêu đề xếp trước", async () => {
        const results = await searchGuide("tao bo cau hoi");
        expect(results.length).toBeGreaterThan(0);
        expect(results[0].entry.path).toBe("question-sets/create");
        expect(await searchGuide("   ")).toEqual([]);
    });

    it("khớp nguyên cụm ở heading xếp trên trang chỉ khớp từng từ", async () => {
        // "Đổi mật khẩu" là một mục (H2) của Cài đặt > Tài khoản
        const results = await searchGuide("doi mat khau");
        expect(results[0].entry.path).toBe("settings/account");
        expect(foldText(results[0].snippet)).toContain("doi mat khau");
    });
});
