import QUESTION_TYPE from "@/constants/questionTypes";
import type { RequestQuestion } from "@/models/request/question";
import { createEmptyFlashcard, normalizeFlashcard } from "@/services/FlashcardService";
import { isEditorHtml, normalizeTextFormat } from "@/services/RichContentService";
import { isMarkdownFormat } from "@/services/ContentModeService";

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'", nbsp: " " };

/** HTML của editor -> chữ thuần: hết đoạn / <br> thành xuống dòng, bỏ thẻ, giải mã entity cơ bản */
export const htmlToPlainText = (html: string | null | undefined): string =>
    (html ?? "")
        .replace(/<\/(p|div|li|h[1-6]|pre|blockquote)>/gi, "\n")
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<[^>]+>/g, "")
        .replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (_m, name: string) => ENTITIES[name])
        .replace(/\n{3,}/g, "\n\n")
        .trim();

const escapeHtml = (text: string) =>
    text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Chữ thuần -> HTML của editor (mỗi dòng một đoạn, đã escape) */
export const plainTextToHtml = (text: string | null | undefined): string => {
    const value = (text ?? "").trim();
    if (!value) return "";
    return value
        .split(/\r?\n/)
        .map((line) => `<p>${escapeHtml(line)}</p>`)
        .join("");
};


class ChangeQuestionType {
    defaultMultipleChoices = () => [
        { id: (Date.now() + 1).toString(), text: "", isAnswer: true },
        { id: (Date.now() + 2).toString(), text: "", isAnswer: false },
        { id: (Date.now() + 3).toString(), text: "", isAnswer: false },
        { id: (Date.now() + 4).toString(), text: "", isAnswer: false },
    ];
    
    defaultMatchingPairs = () => [
        { id: (Date.now() + 1).toString(), leftItem: "", rightItem: "" },
        { id: (Date.now() + 2).toString(), leftItem: "", rightItem: "" },
    ];

    defaultOrderingItems = () => [
        { id: (Date.now() + 1).toString(), text: "", correctOrder: 0 },
        { id: (Date.now() + 2).toString(), text: "", correctOrder: 1 },
        { id: (Date.now() + 3).toString(), text: "", correctOrder: 2 },
        { id: (Date.now() + 4).toString(), text: "", correctOrder: 3 },
    ];

    /** Đổi sang LanguageFlashcard: mặt trước giữ questionText nhưng thành chữ thuần (PlainText); mặt sau mặc định rỗng hợp lệ */
    private toFlashcard = (question: RequestQuestion) => {
        if (normalizeTextFormat(question.textFormat) !== "PlainText") {
            question.questionText = isMarkdownFormat(question.textFormat)
                ? (question.questionText ?? "").trim()
                : htmlToPlainText(question.questionText);
            question.questionHTML = question.questionText;
            question.textFormat = "PlainText";
        }
        question.flashcard = question.flashcard ? normalizeFlashcard(question.flashcard) : createEmptyFlashcard();
    };

    /** Đổi từ LanguageFlashcard sang loại khác: chữ thuần được escape thành HTML của editor (Rich text). Giữ flashcard để đổi lại không mất dữ liệu */
    private fromFlashcard = (question: RequestQuestion) => {
        if (!question.flashcard || normalizeTextFormat(question.textFormat) !== "PlainText") return;
        // dữ liệu cũ nhãn PlainText nhưng nội dung đã là HTML của editor thì giữ nguyên
        if (!isEditorHtml(question.questionText ?? ""))
            question.questionText = plainTextToHtml(question.questionText);
        question.questionHTML = question.questionText;
        question.textFormat = "Html";
    };

    onChangeQuestionType = (question: RequestQuestion) => {
        if (question.type !== QUESTION_TYPE.LANGUAGE_FLASHCARD) this.fromFlashcard(question);
        switch (question.type) {
            case QUESTION_TYPE.MULTIPLE_CHOICE:
                if (!question.multipleChoices || question.multipleChoices?.length === 0)
                    question.multipleChoices = this.defaultMultipleChoices();
                break;
            case QUESTION_TYPE.MATCHING:
                if (!question.matchingPairs || question.matchingPairs?.length === 0)
                    question.matchingPairs = this.defaultMatchingPairs();
                break;
            case QUESTION_TYPE.ORDERING:
                if (!question.orderingItems || question.orderingItems?.length === 0)
                    question.orderingItems = this.defaultOrderingItems();
                break;
            case QUESTION_TYPE.SHORT_TEXT:
                question.shortAnswer ??= "";
                break;
            case QUESTION_TYPE.LANGUAGE_FLASHCARD:
                this.toFlashcard(question);
                break;
        }
    };
}

export default new ChangeQuestionType();
