<script setup lang="ts">
import { computed, ref, onMounted, shallowRef } from "vue";
import { Form } from "ant-design-vue";

import type { RequestQuestion } from "@/models/request/question";
import { useI18n } from "vue-i18n";

import { QuestionCircleOutlined } from "@ant-design/icons-vue";

import TextArea from "../Common/TextArea.vue";

//@ts-ignore
import InputEditor from "../Common/InputEditor.vue";

import QUESTION_TYPE from "@/constants/questionTypes";

interface Props {
    question: RequestQuestion;
    index: number;
    displayScore: boolean;
}
const { t } = useI18n();

const props = defineProps<Props>();

const questionData = shallowRef(props.question);

const optionKeys = [
    QUESTION_TYPE.MULTIPLE_CHOICE,
    QUESTION_TYPE.MATCHING,
    QUESTION_TYPE.ORDERING,
    QUESTION_TYPE.SHORT_TEXT,
];

const options = computed(() =>
    optionKeys.map((key) => ({
        label: t(`create_QS.type.${key}`),
        value: key,
    })),
);

const pointOptions = [5, 10, 15, 20, 30, 40, 50];

const possibleAnswers = ref<string[]>([]);

const getPossibleAnswers = () => {
    possibleAnswers.value = [];
    const value = props.question.shortAnswer.trim();
    if (!value) return;

    possibleAnswers.value.push('"' + value.toLowerCase() + '" --');
    possibleAnswers.value.push('- "' + value.toUpperCase() + '" --');
    possibleAnswers.value.push(
        '- "' + (value.charAt(0).toUpperCase() + value.slice(1, value.length).toLowerCase()) + '"',
    );
};

onMounted(() => {
    getPossibleAnswers();
});

const { validateInfos } = Form.useForm(props.question, {
    questionText: [
        { required: true, message: t("create_QS.error_msg.required"), trigger: "change" },
        {
            validator: (_rule: string, value: string) => {
                const plainText = value.replace(/<[^>]+>/g, ""); //editor return as html in <p></p>
                if (!plainText) return Promise.reject(t("create_QS.error_msg.required"));
                if (plainText.length > 500) {
                    return Promise.reject(
                        t("create_QS.error_msg.out_of_range", { maxLength: 500 }),
                    );
                }
                return Promise.resolve();
            },
            trigger: "change",
        },
    ],
    explainText: [
        {
            validator: (_rule: string, value: string) => {
                const plainText = value.replace(/<[^>]+>/g, "");
                if (plainText.length > 500) {
                    return Promise.reject(
                        t("create_QS.error_msg.out_of_range", { maxLength: 500 }),
                    );
                }
                return Promise.resolve();
            },
            trigger: "change",
        },
    ],
});
</script>
<template>
    <a-form :layout="'vertical'" :rules="validateInfos" :model="props.question">
        <div class="question-container">
            <div class="question-header">
                <div class="question-info">
                    {{ $t("create_QS.question.question") }} {{ props.index }}
                </div>
                <div class="question-functions">
                    <div v-if="displayScore" class="question-score-select">
                        Score:
                        <a-select v-model:value="questionData.score" style="width: 100px">
                            <a-select-option v-for="option in pointOptions" :value="option">
                                {{ option }}
                            </a-select-option>
                        </a-select>
                    </div>
                    <div class="question-function-select">
                        <a-select v-model:value="questionData.type" style="width: 200px">
                            <a-select-option v-for="option in options" :value="option.value">
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
                    <InputEditor
                        class="question-description-item"
                        v-model="questionData.questionText"
                        v-model:validateStatus="validateInfos.questionText.validateStatus"
                        v-model:help="validateInfos.questionText.help"
                        :name="'questionText'"
                        :label="t('create_QS.question.text')"
                        :placeholder="t('create_QS.question.text_placeholder')"
                        :html="props.question.questionHTML"
                    />
                </div>
                <div class="question-body-answer">
                    <InputEditor
                        style="max-width: 500px"
                        class="explain-section question-description-item"
                        v-model="questionData.explainText"
                        v-model:validateStatus="validateInfos.explainText.validateStatus"
                        v-model:help="validateInfos.explainText.help"
                        :name="'explainText'"
                        :label="t('create_QS.question.explain_text')"
                        :placeholder="t('create_QS.question.explain_text_placeholder')"
                    />
                    <div class="option-section">
                        <div class="option-title">{{ $t("create_QS.question.answer_text") }}</div>
                        <div class="option-item-input">
                            <TextArea
                                @input="getPossibleAnswers"
                                v-model="questionData.shortAnswer"
                                :placeholder="t('create_QS.question.answer_text_placeholder')"
                                :isRequired="true"
                                :maxLength="500"
                            />
                        </div>
                        <div class="option-title">
                            {{ $t("create_QS.question.short_text_valid_answer") }}
                            <span class="option-title-ins">
                                - {{ $t("create_QS.question.short_text_ins") }}
                            </span>
                        </div>
                        <div class="possible-answer-container">
                            <span class="possible-answer" v-for="answer in possibleAnswers">
                                {{ answer }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </a-form>
</template>
<style scoped>
.option-section {
    flex: 1;
    margin-left: 20px;
}

.option-item {
    padding: 5px 10px;
    display: flex;
    background-color: var(--content-item-children-background-color);
    border: 1px solid var(--form-item-border-color);
    margin: 10px 0px;
    border-radius: 5px;
}

.option-item-checkbox {
    margin-right: 10px;
}

.option-item-input {
    flex: 1;
    margin-bottom: 10px;
}

.option-item i {
    font-size: 24px;
    display: flex;
    align-items: center;
    margin-left: 10px;
    cursor: pointer;
    color: #f44336;
}
.possible-answer-container {
    display: flex;
    flex-wrap: wrap;
}
.possible-answer {
    color: var(--text-color);
}
.option-title span {
    font-size: 12px;
    color: var(--text-color-grey);
}
</style>
