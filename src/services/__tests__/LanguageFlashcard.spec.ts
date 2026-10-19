import { describe, expect, it } from "vitest";
import type { RequestQuestion } from "@/models/request/question";
import type { ResponseQuestion } from "@/models/response/question";
import type { Flashcard } from "@/models/flashcard";
import { isQuestionBlank, validateQuestions } from "@/services/QuestionValidator";
import { toQuestionPayload } from "@/services/QuestionMediaService";
import ChangeQuestionType, { htmlToPlainText, plainTextToHtml } from "@/services/ChangeQuestionType";
import TransferQuestionData from "@/services/TransferQuestionData";
import {
    createEmptyFlashcard,
    isHttpsUrl,
    meaningLabel,
    normalizeFlashcard,
    safeHttpsUrl,
    toFlashcardPayload,
    validateFlashcardBack,
} from "@/services/FlashcardService";

const extensionCard = (): Flashcard => ({
    v: 1,
    back: {
        meanings: [
            {
                pos: "adjective",
                definition: "lasting for a very short time",
                translation: "phù du",
                examples: ["Fame is ephemeral."],
                synonyms: ["fleeting"],
            },
        ],
        phonetic: "/ɪˈfem(ə)rəl/",
        audioUrl: "https://example.com/ephemeral.mp3",
    },
    lang: { from: "en", to: "vi" },
    source: {
        url: "https://example.com/page",
        title: "Example",
        context: "An ephemeral joy.",
        capturedAt: "2026-10-19T09:23:20Z",
    },
    lookup: { provider: "dictionaryapi.dev", status: "found" },
});

const question = (overrides: Partial<RequestQuestion> = {}): RequestQuestion => ({
    id: "1",
    type: "LanguageFlashcard",
    textFormat: "PlainText",
    questionText: "ephemeral",
    questionHTML: "ephemeral",
    explainText: "",
    score: 10,
    multipleChoices: [],
    matchingPairs: [],
    orderingItems: [],
    shortAnswer: "",
    flashcard: createEmptyFlashcard(),
    ...overrides,
});

describe("FlashcardService", () => {
    it("chỉ nhận https", () => {
        expect(isHttpsUrl("https://a.com/x.mp3")).toBe(true);
        expect(isHttpsUrl("  HTTPS://a.com ")).toBe(true);
        expect(isHttpsUrl("http://a.com")).toBe(false);
        expect(isHttpsUrl("javascript:alert(1)")).toBe(false);
        expect(isHttpsUrl("data:audio/mp3;base64,AAAA")).toBe(false);
        expect(isHttpsUrl("//a.com")).toBe(false);
        expect(isHttpsUrl("https://")).toBe(false);
        expect(isHttpsUrl("")).toBe(false);
        expect(safeHttpsUrl("http://a.com")).toBeNull();
        expect(safeHttpsUrl(" https://a.com ")).toBe("https://a.com");
    });

    it("normalizeFlashcard luôn có back.meanings và giữ lang / source / lookup / v", () => {
        const empty = normalizeFlashcard(null);
        expect(empty.back.meanings).toEqual([]);
        expect(normalizeFlashcard({ v: 1 } as unknown as Flashcard).back.meanings).toEqual([]);

        const card = extensionCard();
        const normalized = normalizeFlashcard(card);
        expect(normalized).toEqual(card);
        // bản sao, không dùng chung mảng với dữ liệu gốc
        expect(normalized.back.meanings[0].examples).not.toBe(card.back.meanings[0].examples);
    });

    it("toFlashcardPayload cắt khoảng trắng, bỏ ví dụ rỗng, giữ nguyên dữ liệu extension", () => {
        const card = extensionCard();
        card.back.meanings[0].examples = ["  Fame is ephemeral. ", "   ", ""];
        card.back.meanings[0].definition = "  lasting for a very short time  ";
        const payload = toFlashcardPayload(card);
        expect(payload.back.meanings[0].examples).toEqual(["Fame is ephemeral."]);
        expect(payload.back.meanings[0].definition).toBe("lasting for a very short time");
        expect(payload.back.meanings[0].synonyms).toEqual(["fleeting"]);
        expect(payload.lang).toEqual({ from: "en", to: "vi" });
        expect(payload.source).toEqual(extensionCard().source);
        expect(payload.lookup).toEqual({ provider: "dictionaryapi.dev", status: "found" });
        expect(payload.v).toBe(1);
    });

    it("meaningLabel: bản dịch nếu có, không thì định nghĩa", () => {
        expect(meaningLabel({ definition: "d", translation: "t" })).toBe("t");
        expect(meaningLabel({ definition: "d", translation: "  " })).toBe("d");
    });

    it("validateFlashcardBack khớp giới hạn backend", () => {
        expect(validateFlashcardBack(createEmptyFlashcard())).toEqual([]);
        expect(validateFlashcardBack(extensionCard())).toEqual([]);

        const tooMany = createEmptyFlashcard();
        tooMany.back.meanings = Array.from({ length: 6 }, () => ({ definition: "d" }));
        expect(validateFlashcardBack(tooMany)).toContain("flashcard_too_many_meanings");
        tooMany.back.meanings = Array.from({ length: 5 }, () => ({ definition: "d" }));
        expect(validateFlashcardBack(tooMany)).toEqual([]);

        const blank = createEmptyFlashcard();
        blank.back.meanings = [{ pos: "noun", definition: "  ", translation: "" }];
        expect(validateFlashcardBack(blank)).toContain("flashcard_blank_meaning");

        const examples = createEmptyFlashcard();
        examples.back.meanings = [{ definition: "d", examples: ["a", "b", "c", "d"] }];
        expect(validateFlashcardBack(examples)).toContain("flashcard_too_many_examples");
        examples.back.meanings = [{ definition: "d", examples: ["a", "b", "c", " "] }];
        expect(validateFlashcardBack(examples)).toEqual([]);

        const long = createEmptyFlashcard();
        long.back.meanings = [{ definition: "a".repeat(1000) }];
        expect(validateFlashcardBack(long)).toEqual([]);
        long.back.meanings = [{ definition: "a".repeat(1001) }];
        expect(validateFlashcardBack(long)).toContain("flashcard_text_too_long");
        long.back.meanings = [{ translation: "x", examples: ["a".repeat(1001)] }];
        expect(validateFlashcardBack(long)).toContain("flashcard_text_too_long");
    });

    it("audioUrl và source.url chỉ nhận https (hoặc rỗng)", () => {
        const card = extensionCard();
        card.back.audioUrl = "http://example.com/a.mp3";
        expect(validateFlashcardBack(card)).toContain("flashcard_invalid_url");
        card.back.audioUrl = "";
        expect(validateFlashcardBack(card)).toEqual([]);
        card.source!.url = "javascript:alert(1)";
        expect(validateFlashcardBack(card)).toContain("flashcard_invalid_url");
        card.source!.url = "";
        expect(validateFlashcardBack(card)).toEqual([]);
    });
});

describe("validateQuestions với LanguageFlashcard", () => {
    it("thẻ nháp (không có nghĩa) hợp lệ", () => {
        expect(validateQuestions([question()])).toHaveLength(0);
    });

    it("mặt trước bắt buộc, tối đa 5000 ký tự, kiểm tra trên chữ thuần", () => {
        expect(validateQuestions([question({ questionText: "   " })])).toHaveLength(1);
        expect(validateQuestions([question({ questionText: "a".repeat(5000) })])).toHaveLength(0);
        expect(validateQuestions([question({ questionText: "a".repeat(5001) })])).toHaveLength(1);
        // chữ thuần có thể chứa "<p>" thật, không bị coi là thẻ HTML của editor
        expect(validateQuestions([question({ questionText: "<p></p>" })])).toHaveLength(0);
    });

    it("báo lỗi mặt sau không hợp lệ", () => {
        const card = createEmptyFlashcard();
        card.back.meanings = [{ pos: "noun" }];
        expect(validateQuestions([question({ flashcard: card })])).toEqual([
            expect.objectContaining({ index: 1 }),
        ]);
    });

    it("không ảnh hưởng 4 loại cũ", () => {
        const shortText = question({
            type: "ShortText",
            textFormat: "Html",
            questionText: "<p>Q</p>",
            shortAnswer: "a",
            flashcard: null,
        });
        expect(validateQuestions([shortText])).toHaveLength(0);
        expect(validateQuestions([{ ...shortText, shortAnswer: "" }])).toHaveLength(1);
    });

    it("isQuestionBlank", () => {
        expect(isQuestionBlank(question({ questionText: "" }))).toBe(true);
        expect(isQuestionBlank(question({ questionText: "x" }))).toBe(false);
        const card = createEmptyFlashcard();
        card.back.meanings = [{ definition: "d" }];
        expect(isQuestionBlank(question({ questionText: "", flashcard: card }))).toBe(false);
    });
});

describe("ChangeQuestionType với LanguageFlashcard", () => {
    it("đổi sang thẻ: giữ mặt trước dạng chữ thuần, flashcard mặc định rỗng hợp lệ", () => {
        const q = question({
            type: "LanguageFlashcard",
            textFormat: "Html",
            questionText: "<p>ephemeral &amp; brief</p><p>line 2</p>",
            flashcard: null,
        });
        ChangeQuestionType.onChangeQuestionType(q);
        expect(q.textFormat).toBe("PlainText");
        expect(q.questionText).toBe("ephemeral & brief\nline 2");
        expect(q.flashcard).toEqual(createEmptyFlashcard());
        expect(validateQuestions([q])).toHaveLength(0);
    });

    it("Markdown -> thẻ giữ nguyên văn bản", () => {
        const q = question({ textFormat: "Markdown", questionText: "`code` word", flashcard: undefined });
        ChangeQuestionType.onChangeQuestionType(q);
        expect(q.textFormat).toBe("PlainText");
        expect(q.questionText).toBe("`code` word");
    });

    it("đổi ra khỏi thẻ: chữ thuần được escape thành HTML, giữ flashcard để đổi lại không mất dữ liệu", () => {
        const q = question({ questionText: "a <b> & c", flashcard: extensionCard() });
        q.type = "MultipleChoice";
        ChangeQuestionType.onChangeQuestionType(q);
        expect(q.textFormat).toBe("Html");
        expect(q.questionText).toBe("<p>a &lt;b&gt; &amp; c</p>");
        expect(q.multipleChoices).toHaveLength(4);
        expect(q.flashcard).toEqual(extensionCard());

        q.type = "LanguageFlashcard";
        ChangeQuestionType.onChangeQuestionType(q);
        expect(q.textFormat).toBe("PlainText");
        expect(q.questionText).toBe("a <b> & c");
        expect(q.flashcard).toEqual(extensionCard());
    });

    it("câu PlainText cũ không có flashcard không bị đổi khi đổi loại cũ", () => {
        const q = question({
            type: "ShortText",
            textFormat: "PlainText",
            questionText: "<p>legacy</p>",
            flashcard: null,
        });
        ChangeQuestionType.onChangeQuestionType(q);
        expect(q.textFormat).toBe("PlainText");
        expect(q.questionText).toBe("<p>legacy</p>");
        expect(q.shortAnswer).toBe("");
    });

    it("htmlToPlainText / plainTextToHtml", () => {
        expect(htmlToPlainText("<p>a</p><p>b<br>c</p>")).toBe("a\nb\nc");
        expect(htmlToPlainText("&lt;b&gt; &amp;lt;")).toBe("<b> &lt;");
        expect(plainTextToHtml("a\n<b>")).toBe("<p>a</p><p>&lt;b&gt;</p>");
        expect(plainTextToHtml("  ")).toBe("");
    });
});

describe("toQuestionPayload với LanguageFlashcard", () => {
    it("luôn PlainText, gửi flashcard đã chuẩn hoá và giữ lang / source / lookup / v", () => {
        const card = extensionCard();
        card.back.meanings[0].examples = ["x", " "];
        const payload = toQuestionPayload(question({ textFormat: "Html", flashcard: card }));
        expect(payload.textFormat).toBe("PlainText");
        expect(payload.type).toBe("LanguageFlashcard");
        expect(payload.flashcard?.back.meanings[0].examples).toEqual(["x"]);
        expect(payload.flashcard?.lang).toEqual({ from: "en", to: "vi" });
        expect(payload.flashcard?.source?.context).toBe("An ephemeral joy.");
        expect(payload.flashcard?.lookup?.status).toBe("found");
        expect(payload.flashcard?.v).toBe(1);
    });

    it("thẻ chưa có flashcard vẫn gửi mặt sau rỗng hợp lệ", () => {
        const payload = toQuestionPayload(question({ flashcard: null }));
        expect(payload.flashcard).toEqual({ v: 1, back: { meanings: [], phonetic: "", audioUrl: "" } });
    });

    it("loại khác không gửi flashcard", () => {
        const payload = toQuestionPayload(
            question({ type: "ShortText", textFormat: "Html", flashcard: extensionCard() }),
        );
        expect("flashcard" in payload).toBe(false);
        expect(payload.textFormat).toBe("Html");
    });
});

describe("TransferQuestionData với LanguageFlashcard", () => {
    const response = (overrides: Partial<ResponseQuestion> = {}): ResponseQuestion => ({
        id: "q1",
        type: "LanguageFlashcard",
        originalType: null,
        questionSetId: "s1",
        textFormat: "PlainText",
        questionText: "ephemeral",
        explainText: "",
        score: 10,
        scoreGraded: 0,
        correctMultipleChoiceCount: 0,
        questionData: {
            multipleChoice: null,
            matching: null,
            ordering: null,
            shortText: "",
            flashcard: extensionCard(),
        },
        ...overrides,
    });

    it("map flashcard sang request, không làm mất dữ liệu extension khi sửa + lưu", () => {
        const request = TransferQuestionData.transformResponseToRequest(response());
        expect(request.type).toBe("LanguageFlashcard");
        expect(request.textFormat).toBe("PlainText");
        expect(request.flashcard).toEqual(extensionCard());

        request.flashcard!.back.meanings[0].translation = "thoáng qua";
        const payload = toQuestionPayload(request);
        expect(payload.flashcard?.back.meanings[0].translation).toBe("thoáng qua");
        expect(payload.flashcard?.source).toEqual(extensionCard().source);
        expect(payload.flashcard?.lookup).toEqual(extensionCard().lookup);
        expect(payload.flashcard?.lang).toEqual(extensionCard().lang);
    });

    it("thẻ thiếu flashcard từ API vẫn có mặt sau rỗng", () => {
        const request = TransferQuestionData.transformResponseToRequest(
            response({ questionData: { multipleChoice: null, matching: null, ordering: null, shortText: "" } }),
        );
        expect(request.flashcard).toEqual(createEmptyFlashcard());
    });

    it("loại cũ không có flashcard", () => {
        const request = TransferQuestionData.transformResponseToRequest(
            response({ type: "ShortText", textFormat: "Html" }),
        );
        expect(request.flashcard).toBeNull();
        expect(request.textFormat).toBe("Html");
    });

    it("request -> response mang theo flashcard", () => {
        const request = TransferQuestionData.transformResponseToRequest(response());
        const back = TransferQuestionData.transformRequestToResponse(request, "s1");
        expect(back.questionData.flashcard).toEqual(extensionCard());
        expect(back.textFormat).toBe("PlainText");
    });
});
