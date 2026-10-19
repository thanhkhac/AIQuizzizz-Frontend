<script setup lang="ts">
import { normalizeScore } from "@/services/QuestionValidator";
import { computed, shallowRef } from "vue";
import { useI18n } from "vue-i18n";

import { QuestionCircleOutlined } from "@ant-design/icons-vue";

import type { RequestQuestion } from "@/models/request/question";
import QUESTION_TYPE from "@/constants/questionTypes";
import {
    FLASHCARD_LIMITS,
    createEmptyMeaning,
    isHttpsUrl,
    normalizeFlashcard,
} from "@/services/FlashcardService";

import TextArea from "../Common/TextArea.vue";
import FlashcardAudioButton from "../Flashcard/FlashcardAudioButton.vue";
import FlashcardSourceInfo from "../Flashcard/FlashcardSourceInfo.vue";

interface Props {
    question: RequestQuestion;
    index: number;
    displayScore: boolean;
    // đồng bộ với các editor khác (LanguageFlashcard chỉ có ở bộ câu hỏi nên luôn được chọn)
    allowFlashcard?: boolean;
}
const { t } = useI18n();

const props = defineProps<Props>();

const questionData = shallowRef(props.question);

// mặt trước luôn là chữ thuần; mặt sau luôn là mảng nghĩa hợp lệ (giữ nguyên lang / source / lookup / v của extension)
props.question.textFormat = "PlainText";
props.question.flashcard = normalizeFlashcard(props.question.flashcard);

const card = computed(() => props.question.flashcard!);
const meanings = computed(() => card.value.back.meanings);

const optionKeys = [
    QUESTION_TYPE.MULTIPLE_CHOICE,
    QUESTION_TYPE.MATCHING,
    QUESTION_TYPE.ORDERING,
    QUESTION_TYPE.SHORT_TEXT,
    QUESTION_TYPE.LANGUAGE_FLASHCARD,
];

const options = computed(() =>
    optionKeys.map((key) => ({
        label: t(`create_QS.type.${key}`),
        value: key,
    })),
);

const canAddMeaning = computed(() => meanings.value.length < FLASHCARD_LIMITS.maxMeanings);

const addMeaning = () => {
    if (!canAddMeaning.value) return;
    meanings.value.push(createEmptyMeaning());
};

const removeMeaning = (index: number) => {
    meanings.value.splice(index, 1);
};

const addExample = (meaningIndex: number) => {
    const meaning = meanings.value[meaningIndex];
    meaning.examples ??= [];
    if (meaning.examples.length >= FLASHCARD_LIMITS.maxExamples) return;
    meaning.examples.push("");
};

const removeExample = (meaningIndex: number, exampleIndex: number) => {
    meanings.value[meaningIndex].examples?.splice(exampleIndex, 1);
};

// URL đã lưu mà không phải https thì backend sẽ từ chối: cho xoá để lưu được
const audioUrl = computed(() => (card.value.back.audioUrl ?? "").trim());
const hasInvalidAudio = computed(() => audioUrl.value.length > 0 && !isHttpsUrl(audioUrl.value));
const sourceUrl = computed(() => (card.value.source?.url ?? "").trim());
const hasInvalidSource = computed(() => sourceUrl.value.length > 0 && !isHttpsUrl(sourceUrl.value));

const clearAudio = () => {
    card.value.back.audioUrl = "";
};

const clearSourceUrl = () => {
    if (card.value.source) card.value.source.url = "";
};
</script>
<template>
    <a-form :layout="'vertical'" :model="props.question">
        <div class="question-container">
            <div class="question-header">
                <div class="question-info">
                    {{ $t("create_QS.question.question") }} {{ props.index }}
                </div>
                <div class="question-functions">
                    <div v-if="displayScore" class="question-score-select">
                        {{ $t("create_QS.question.score") }}:
                        <a-input-number
                            v-model:value="questionData.score"
                            :min="0"
                            :max="999"
                            :step="1"
                            style="width: 100px"
                            @blur="questionData.score = normalizeScore(questionData.score)"
                        />
                    </div>
                    <div class="question-function-select">
                        <a-select
                            v-model:value="questionData.type"
                            style="width: 200px"
                            @change="$emit('changeQuestionType')"
                        >
                            <a-select-option
                                v-for="option in options"
                                :key="option.value"
                                :value="option.value"
                            >
                                {{ option.label }}
                            </a-select-option>
                        </a-select>
                    </div>
                    <a-popconfirm
                        class="pop-confirm-delete"
                        :title="$t('create_QS.quiz.confirm')"
                        @confirm="$emit('deleteQuestion')"
                    >
                        <template #icon><QuestionCircleOutlined style="color: red" /></template>
                        <i class="bx bx-trash text-danger question-function-delete"></i>
                    </a-popconfirm>
                </div>
            </div>
            <div class="question-body">
                <div class="question-description">
                    <TextArea
                        class="question-description-item"
                        v-model="questionData.questionText"
                        :name="'questionText'"
                        :label="t('flashcard.front_label')"
                        :placeholder="t('flashcard.front_placeholder')"
                        :isRequired="true"
                        :maxLength="FLASHCARD_LIMITS.maxFrontLength"
                    />
                </div>
                <div class="flashcard-back-editor">
                    <div class="option-title flashcard-back-title">
                        {{ $t("flashcard.back_title") }}
                        <span class="option-title-ins">- {{ $t("flashcard.back_ins") }}</span>
                    </div>
                    <div class="flashcard-phonetic-row">
                        <label class="flashcard-field-label">{{ $t("flashcard.phonetic") }}</label>
                        <a-input
                            v-model:value="card.back.phonetic"
                            :maxlength="FLASHCARD_LIMITS.maxTextLength"
                            :placeholder="t('flashcard.phonetic_placeholder')"
                            class="flashcard-phonetic-input"
                        />
                        <FlashcardAudioButton :url="audioUrl" />
                        <a-button v-if="hasInvalidAudio" size="small" danger @click="clearAudio">
                            {{ $t("flashcard.remove_invalid_audio") }}
                        </a-button>
                    </div>

                    <div class="flashcard-meanings-title">
                        {{ $t("flashcard.meanings") }}
                        <span class="option-title-ins">
                            ({{ meanings.length }}/{{ FLASHCARD_LIMITS.maxMeanings }})
                        </span>
                    </div>
                    <div v-if="meanings.length === 0" class="flashcard-no-meaning">
                        {{ $t("flashcard.no_meanings_ins") }}
                    </div>
                    <div
                        class="option-item flashcard-meaning-item"
                        v-for="(meaning, mIndex) in meanings"
                        :key="mIndex"
                    >
                        <div class="flashcard-meaning-body">
                            <div class="flashcard-meaning-head">
                                <span class="flashcard-meaning-number">
                                    {{ $t("flashcard.meaning_number", { number: mIndex + 1 }) }}
                                </span>
                                <a-input
                                    v-model:value="meaning.pos"
                                    :maxlength="FLASHCARD_LIMITS.maxTextLength"
                                    :placeholder="t('flashcard.pos_placeholder')"
                                    class="flashcard-pos-input"
                                    :aria-label="t('flashcard.pos')"
                                />
                            </div>
                            <TextArea
                                v-model="meaning.definition"
                                :label="t('flashcard.definition')"
                                :placeholder="t('flashcard.definition_placeholder')"
                                :maxLength="FLASHCARD_LIMITS.maxTextLength"
                            />
                            <TextArea
                                class="flashcard-translation-input"
                                v-model="meaning.translation"
                                :label="t('flashcard.translation')"
                                :placeholder="t('flashcard.translation_placeholder')"
                                :maxLength="FLASHCARD_LIMITS.maxTextLength"
                            />
                            <div class="flashcard-examples-editor">
                                <label class="flashcard-field-label">
                                    {{ $t("flashcard.examples") }}
                                    ({{ meaning.examples?.length ?? 0 }}/{{
                                        FLASHCARD_LIMITS.maxExamples
                                    }})
                                </label>
                                <div
                                    class="flashcard-example-row"
                                    v-for="(_example, eIndex) in meaning.examples"
                                    :key="eIndex"
                                >
                                    <a-input
                                        v-model:value="meaning.examples![eIndex]"
                                        :maxlength="FLASHCARD_LIMITS.maxTextLength"
                                        :placeholder="t('flashcard.example_placeholder')"
                                    />
                                    <button
                                        type="button"
                                        class="flashcard-icon-btn"
                                        :aria-label="t('flashcard.remove_example')"
                                        @click="removeExample(mIndex, eIndex)"
                                    >
                                        <i class="bx bx-x"></i>
                                    </button>
                                </div>
                                <a-button
                                    v-if="(meaning.examples?.length ?? 0) < FLASHCARD_LIMITS.maxExamples"
                                    size="small"
                                    @click="addExample(mIndex)"
                                >
                                    <i class="bx bx-plus"></i> {{ $t("flashcard.add_example") }}
                                </a-button>
                            </div>
                            <div
                                v-if="(meaning.synonyms ?? []).length > 0"
                                class="flashcard-synonyms-readonly"
                            >
                                <span class="flashcard-field-label">
                                    {{ $t("flashcard.synonyms") }}:
                                </span>
                                <span
                                    class="flashcard-synonym-chip"
                                    v-for="(synonym, sIndex) in meaning.synonyms"
                                    :key="sIndex"
                                >
                                    {{ synonym }}
                                </span>
                            </div>
                        </div>
                        <i
                            class="bx bx-minus-circle"
                            role="button"
                            tabindex="0"
                            :aria-label="t('flashcard.remove_meaning')"
                            @click="removeMeaning(mIndex)"
                            @keydown.enter="removeMeaning(mIndex)"
                        ></i>
                    </div>
                    <div
                        class="add-option"
                        :class="{ 'add-option-disabled': !canAddMeaning }"
                        @click="addMeaning"
                    >
                        <i class="bx bx-plus"></i>
                        {{ $t("flashcard.add_meaning") }}
                    </div>
                    <div v-if="!canAddMeaning" class="flashcard-limit-hint">
                        {{ $t("flashcard.max_meanings", { max: FLASHCARD_LIMITS.maxMeanings }) }}
                    </div>

                    <FlashcardSourceInfo :card="card" />
                    <a-button
                        v-if="hasInvalidSource"
                        class="mt-2"
                        size="small"
                        danger
                        @click="clearSourceUrl"
                    >
                        {{ $t("flashcard.remove_invalid_source") }}
                    </a-button>
                </div>
            </div>
        </div>
    </a-form>
</template>
<style scoped>
.flashcard-back-editor {
    margin-top: 16px;
}

.option-title-ins {
    font-size: 12px;
    font-weight: 400;
    color: var(--text-color-grey);
}

.flashcard-field-label {
    display: block;
    margin-bottom: 4px;
    font-size: 14px;
    font-weight: 500;
    color: var(--text-color);
}

.flashcard-phonetic-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
    margin-bottom: 12px;
}

.flashcard-phonetic-row .flashcard-field-label {
    margin-bottom: 0;
}

.flashcard-phonetic-input {
    max-width: 260px;
}

.flashcard-meanings-title {
    margin-bottom: 4px;
    font-weight: 500;
    color: var(--text-color);
}

.flashcard-no-meaning {
    color: var(--text-color-grey);
    font-size: 13px;
    font-style: italic;
}

.flashcard-meaning-item {
    margin: 10px 0px;
    padding: 10px;
    display: flex;
    align-items: flex-start;
    background-color: var(--form-item-background-color);
    border: 1px solid var(--form-item-border-color);
    border-radius: 5px;
}

.flashcard-meaning-body {
    flex: 1;
    min-width: 0;
}

.flashcard-meaning-head {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;
}

.flashcard-meaning-number {
    font-weight: 600;
    color: var(--text-color);
}

.flashcard-pos-input {
    max-width: 200px;
}

.flashcard-translation-input {
    margin-top: 8px;
}

.flashcard-examples-editor {
    margin-top: 8px;
}

.flashcard-example-row {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 6px;
}

.flashcard-icon-btn {
    display: inline-flex;
    align-items: center;
    padding: 0;
    border: none;
    background: transparent;
    color: #f44336;
    cursor: pointer;
}

.flashcard-icon-btn i {
    font-size: 22px;
}

.flashcard-synonyms-readonly {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
    margin-top: 8px;
}

.flashcard-synonyms-readonly .flashcard-field-label {
    margin-bottom: 0;
}

.flashcard-synonym-chip {
    padding: 0 8px;
    border: 1px solid var(--form-item-border-color);
    border-radius: 100px;
    font-size: 12px;
    color: var(--text-color-grey);
}

.flashcard-meaning-item > i {
    font-size: 24px;
    margin-left: 10px;
    cursor: pointer;
    color: #f44336;
}

.add-option-disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.flashcard-limit-hint {
    margin-top: 4px;
    text-align: center;
    font-size: 12px;
    color: var(--text-color-grey);
}
</style>
