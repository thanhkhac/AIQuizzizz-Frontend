<script setup lang="ts">
import { computed } from "vue";
import QUESTION_TYPE from "@/constants/questionTypes";
import type { ResponseQuestion } from "@/models/response/question";
import FlashcardBack from "./FlashcardBack.vue";

/**
 * Mặt sau của thẻ hiện sau khi trả lời ở trang học / luyện tập.
 * Backend dựng thẻ LanguageFlashcard thành MultipleChoice (originalType = "LanguageFlashcard") kèm questionData.flashcard.
 */
const props = defineProps<{ question: ResponseQuestion }>();

const card = computed(() =>
    props.question?.originalType === QUESTION_TYPE.LANGUAGE_FLASHCARD
        ? (props.question.questionData?.flashcard ?? null)
        : null,
);
</script>
<template>
    <div v-if="card" class="flashcard-answer-card">
        <div class="flashcard-answer-card-title">{{ $t("flashcard.card_back") }}</div>
        <FlashcardBack :card="card" />
    </div>
</template>
<style scoped>
.flashcard-answer-card {
    margin-top: 16px;
    padding: 12px 14px;
    border: 1px solid var(--form-item-border-color);
    border-left: 4px solid var(--main-color);
    border-radius: 8px;
    background-color: var(--content-item-children-background-color);
}

.flashcard-answer-card-title {
    margin-bottom: 6px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--text-color-grey);
}
</style>
