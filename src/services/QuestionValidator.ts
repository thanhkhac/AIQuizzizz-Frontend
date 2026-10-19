import { h, type VNode } from "vue";
import type { RequestQuestion } from "@/models/request/question";
import QUESTION_TYPE from "@/constants/questionTypes";
import { translate } from "@/services/i18n";
import { isMarkdownFormat } from "@/services/ContentModeService";

export interface QuestionIssue {
    /** Số thứ tự câu hỏi (bắt đầu từ 1) */
    index: number;
    /** Lý do không hợp lệ (đã dịch) */
    reasons: string[];
}

const stripParagraph = (html: string | undefined | null) =>
    (html ?? "")
        .replace(/^<p>/, "") //replace <p> at the start
        .replace(/<\/p>$/, "") //replace </p> at the end
        .trim();

// Markdown: kiểm tra trên chính văn bản markdown (không có <p> bao quanh); Rich text/PlainText: bỏ <p> ngoài cùng
const contentText = (text: string | undefined | null, format?: string | null) =>
    isMarkdownFormat(format) ? (text ?? "").trim() : stripParagraph(text);

const reason = (key: string) => translate(`create_QS.modal.invalid.reasons.${key}`);

/**
 * Kiểm tra danh sách câu hỏi ở editor, trả về từng câu không hợp lệ kèm LÝ DO.
 * Quy tắc khớp với validator của backend (CreateUpdateQuestionDto.QuestionCreateDtoValidator).
 */
export const validateQuestions = (questions: RequestQuestion[]): QuestionIssue[] => {
    const issues: QuestionIssue[] = [];

    questions.forEach((question, position) => {
        const reasons: string[] = [];

        const markdown = isMarkdownFormat(question.textFormat);
        // giới hạn backend: tối đa 5000 ký tự (Markdown tính trên văn bản thô)
        const maxLength = markdown ? 5000 : 4999;

        const questionText = contentText(question.questionText, question.textFormat);
        if (questionText.length === 0) reasons.push(reason("blank_question"));
        else if (questionText.length > maxLength) reasons.push(reason("question_too_long"));

        if (contentText(question.explainText, question.textFormat).length > maxLength)
            reasons.push(reason("explain_too_long"));

        const score = Number(question.score);
        if (!Number.isFinite(score) || score < 0 || score > 999) reasons.push(reason("invalid_score"));

        switch (question.type) {
            case QUESTION_TYPE.MULTIPLE_CHOICE: {
                const options = question.multipleChoices ?? [];
                const texts = options.map((x) => (x.text ?? "").trim());
                if (options.length < 2) reasons.push(reason("too_few_options"));
                if (texts.some((x) => x.length === 0)) reasons.push(reason("blank_option"));
                if (texts.some((x) => x.length > 1000)) reasons.push(reason("option_too_long"));
                if (options.filter((x) => x.isAnswer).length === 0)
                    reasons.push(reason("no_correct_answer"));

                // trùng nội dung đúng từng ký tự (đã trim, PHÂN BIỆT hoa thường: `a` khác `A`); bỏ qua ô trống vì đã báo riêng
                const nonBlank = texts.filter((x) => x.length > 0);
                if (new Set(nonBlank).size !== nonBlank.length)
                    reasons.push(reason("duplicate_options"));
                break;
            }
            case QUESTION_TYPE.MATCHING: {
                const pairs = question.matchingPairs ?? [];
                if (pairs.length < 2) reasons.push(reason("too_few_pairs"));
                if (
                    pairs.some(
                        (x) => (x.leftItem ?? "").trim().length === 0 || (x.rightItem ?? "").trim().length === 0,
                    )
                )
                    reasons.push(reason("blank_pair"));
                if (
                    pairs.some(
                        (x) => (x.leftItem ?? "").trim().length > 1000 || (x.rightItem ?? "").trim().length > 1000,
                    )
                )
                    reasons.push(reason("option_too_long"));
                break;
            }
            case QUESTION_TYPE.ORDERING: {
                const items = question.orderingItems ?? [];
                if (items.length < 2) reasons.push(reason("too_few_items"));
                if (items.some((x) => (x.text ?? "").trim().length === 0))
                    reasons.push(reason("blank_item"));
                if (items.some((x) => (x.text ?? "").trim().length > 1000))
                    reasons.push(reason("option_too_long"));
                break;
            }
            case QUESTION_TYPE.SHORT_TEXT: {
                const answer = (question.shortAnswer ?? "").trim();
                if (answer.length === 0) reasons.push(reason("blank_short_answer"));
                else if (answer.length > 1000) reasons.push(reason("option_too_long"));
                break;
            }
        }

        if (reasons.length > 0) issues.push({ index: position + 1, reasons });
    });

    // đã theo thứ tự tăng dần theo số (không sort kiểu chuỗi)
    return issues.sort((a, b) => a.index - b.index);
};

/** Nội dung modal lỗi: danh sách "Câu N: lý do" */
export const buildInvalidQuestionContent = (issues: QuestionIssue[], prefix: string): VNode =>
    h("div", [
        h("div", prefix.trim()),
        h(
            "ul",
            { style: "margin: 8px 0 0; padding-left: 20px; max-height: 260px; overflow-y: auto;" },
            issues.map((issue) =>
                h(
                    "li",
                    translate("create_QS.modal.invalid.question_reason", {
                        number: issue.index,
                        reasons: issue.reasons.join("; "),
                    }),
                ),
            ),
        ),
    ]);

/** Điểm hợp lệ: 0..999, tối đa 1 chữ số thập phân; rỗng/NaN -> 10 (mặc định) */
export const normalizeScore = (value: unknown): number => {
    const score = Number(value);
    if (value === null || value === undefined || value === "" || !Number.isFinite(score)) return 10;
    return Math.min(999, Math.max(0, Math.round(score * 10) / 10));
};

/** Câu hỏi mặc định chưa được nhập gì (nội dung, đáp án, giải thích, media đều trống) */
export const isQuestionBlank = (question: RequestQuestion): boolean => {
    if (contentText(question.questionText, question.textFormat).length > 0) return false;
    if (contentText(question.explainText, question.textFormat).length > 0) return false;
    if (question.mediaId || question.media) return false;

    switch (question.type) {
        case QUESTION_TYPE.MULTIPLE_CHOICE:
            return (question.multipleChoices ?? []).every((x) => (x.text ?? "").trim().length === 0);
        case QUESTION_TYPE.MATCHING:
            return (question.matchingPairs ?? []).every(
                (x) => (x.leftItem ?? "").trim().length === 0 && (x.rightItem ?? "").trim().length === 0,
            );
        case QUESTION_TYPE.ORDERING:
            return (question.orderingItems ?? []).every((x) => (x.text ?? "").trim().length === 0);
        case QUESTION_TYPE.SHORT_TEXT:
            return (question.shortAnswer ?? "").trim().length === 0;
        default:
            return false;
    }
};

/** Hiển thị điểm: làm tròn tối đa 2 chữ số thập phân (2.3299999 -> 2.33); null/NaN -> "" */
export const formatScore = (value: unknown): string => {
    if (value === null || value === undefined || value === "") return "";
    const n = Number(value);
    if (!Number.isFinite(n)) return "";
    return String(Math.round(n * 100) / 100);
};
