<script setup lang="ts">
import { computed, ref } from "vue";
import { Form } from "ant-design-vue";

import type { Question } from "@/models/question";
import { useI18n } from "vue-i18n";

import { QuestionCircleOutlined } from "@ant-design/icons-vue";

import TextArea from "../Common/TextArea.vue";

//@ts-ignore
import InputEditor from "../Common/InputEditor.vue";

interface Props {
    question: Question;
    index: number;
}

const { t } = useI18n();

const props = defineProps<Props>();

const optionKeys = ["MultipleChoice", "Matching", "Ordering", "ShortText"];
const options = computed(() =>
    optionKeys.map((key) => ({
        label: key,
        value: key,
    })),
);

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

const { validateInfos } = Form.useForm(props.question, {
    questionText: [
        { required: true, message: "Explanation text is required", trigger: "change" },
        {
            validator: (_rule: string, value: string) => {
                const plainText = value.replace(/<[^>]+>/g, ""); //editor return as html in <p></p>
                if (!plainText) {
                    return Promise.reject("Question text is required");
                }
                if (plainText.length > 500) {
                    return Promise.reject("Question text must be less than 500 characters");
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
                    return Promise.reject("Explanation text must be less than 500 characters");
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
                <div class="question-info">Question {{ index }}</div>
                <div class="question-functions">
                    <div class="question-function-select">
                        <a-select v-model:value="props.question.type" style="width: 200px">
                            <a-select-option v-for="option in options" :value="option.value">
                                {{ option.label }}
                            </a-select-option>
                        </a-select>
                    </div>
                    <a-popconfirm
                        class="pop-confirm-delete"
                        title="Are you sure ?"
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
                        v-model="props.question.questionText"
                        v-model:validateStatus="validateInfos.questionText.validateStatus"
                        v-model:help="validateInfos.questionText.help"
                        :label="'Question Text'"
                        :name="'questionText'"
                        :placeholder="'Enter question title/text...'"
                    />
                </div>
                <div class="question-body-answer">
                    <InputEditor
                        style="max-width: 500px"
                        class="explain-section question-description-item"
                        v-model="props.question.explainText"
                        v-model:validateStatus="validateInfos.explainText.validateStatus"
                        v-model:help="validateInfos.explainText.help"
                        :label="'Explain Text'"
                        :name="'explainText'"
                        :placeholder="'Enter explain text...'"
                    />
                    <div class="option-section">
                        <div class="option-title">Answer text</div>
                        <div class="option-item-input">
                            <TextArea
                                @input="getPossibleAnswers"
                                v-model="props.question.shortAnswer"
                                :placeholder="'Enter option text'"
                                :isRequired="true"
                                :maxLength="500"
                            />
                        </div>
                        <div class="option-title">
                            Valid answers
                            <span class="option-title-ins">
                                - These might be correct answers base on user input
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
    background-color: #1f1f20;
    border: 1px solid var(--content-item-border-color);
    margin: 10px 0px;

    border-radius: 5px;
    border: 1px solid #27272a;
    background: #1f1f20;
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
    color: var(--text-color-white);
}
.option-title span {
    font-size: 12px;
    color: var(--text-color-grey);
}
</style>
