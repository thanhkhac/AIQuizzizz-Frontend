import { describe, expect, it } from "vitest";
import type { RequestQuestion } from "@/models/request/question";
import { isQuestionBlank, validateQuestions } from "@/services/QuestionValidator";

const question = (overrides: Partial<RequestQuestion> = {}): RequestQuestion => ({
    id: "1",
    type: "ShortText",
    textFormat: "Html",
    questionText: "<p>Q</p>",
    questionHTML: "",
    explainText: "",
    score: 10,
    multipleChoices: [],
    matchingPairs: [],
    orderingItems: [],
    shortAnswer: "a",
    ...overrides,
});

describe("validateQuestions with Markdown", () => {
    it("checks blank on the raw markdown text", () => {
        expect(validateQuestions([question({ textFormat: "Markdown", questionText: "   " })])).toHaveLength(1);
        expect(validateQuestions([question({ textFormat: "Markdown", questionText: "`a`" })])).toHaveLength(0);
        // "<p></p>" là rỗng với Rich text nhưng là văn bản thật với Markdown
        expect(validateQuestions([question({ questionText: "<p></p>" })])).toHaveLength(1);
        expect(validateQuestions([question({ textFormat: "Markdown", questionText: "<p></p>" })])).toHaveLength(0);
    });

    it("limits the raw markdown text to 5000 characters", () => {
        expect(validateQuestions([question({ textFormat: "Markdown", questionText: "a".repeat(5000) })])).toHaveLength(0);
        expect(validateQuestions([question({ textFormat: "Markdown", questionText: "a".repeat(5001) })])).toHaveLength(1);
        expect(
            validateQuestions([question({ textFormat: "Markdown", explainText: "a".repeat(5001) })]),
        ).toHaveLength(1);
    });

    it("counts html tags for rich text as before", () => {
        expect(validateQuestions([question({ questionText: "<p>" + "a".repeat(4990) + "</p>" })])).toHaveLength(0);
    });

    it("isQuestionBlank uses raw markdown", () => {
        expect(isQuestionBlank(question({ textFormat: "Markdown", questionText: "", shortAnswer: "" }))).toBe(true);
        expect(isQuestionBlank(question({ textFormat: "Markdown", questionText: "x", shortAnswer: "" }))).toBe(false);
    });
});
