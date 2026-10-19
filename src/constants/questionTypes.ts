const QUESTION_TYPE = {
    MULTIPLE_CHOICE: "MultipleChoice",
    MATCHING: "Matching",
    ORDERING: "Ordering",
    SHORT_TEXT: "ShortText",
    LANGUAGE_FLASHCARD: "LanguageFlashcard",
};

// 4 loại dùng được ở bài kiểm tra / đề mẫu / sinh bằng AI (LanguageFlashcard chỉ có ở bộ câu hỏi)
export const CLASSIC_QUESTION_TYPES = [
    QUESTION_TYPE.MULTIPLE_CHOICE,
    QUESTION_TYPE.MATCHING,
    QUESTION_TYPE.ORDERING,
    QUESTION_TYPE.SHORT_TEXT,
];

export default QUESTION_TYPE;
