<script setup lang="ts">
import { ref, reactive, onMounted, computed } from "vue";
import { Form } from "ant-design-vue";

import type { Question } from "@/models/question";
import { useI18n } from "vue-i18n";

import { QuestionCircleOutlined } from "@ant-design/icons-vue";
import { message } from "ant-design-vue";

import Input from "../Common/Input.vue";
import TextArea from "../Common/TextArea.vue";
import Select from "../Common/Select.vue";

//@ts-ignore
import InputEditor from "../Common/InputEditor.vue";

interface Props {
    question: Question;
    index: number;
}

const { t } = useI18n();

const props = defineProps<Props>();

const optionKeys = ["multipleChoice", "matching", "ordering", "shortTexts"];

const addOption = () => {
    if (props.question.multipleChoices.length >= 10) {
        message.warning("Each question must has at most 10 options");
        return;
    }

    props.question.multipleChoices.push({
        id: Date.now().toString(),
        text: "",
        isAnswer: false,
    });
};

const removeOption = (index: number) => {
    if (props.question.multipleChoices.length <= 2) {
        message.warning("Each question must has at least 2 options");
        return;
    }
    if (props.question.multipleChoices[index]) {
        props.question.multipleChoices.splice(index, 1);
    }
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

const haveAnswer = () => {
    const haveAnswer = props.question.multipleChoices.filter((item) => item.isAnswer);
    return haveAnswer.length > 0;
};

const onCheckHaveAnswer = () => {
    const haveAnswer = props.question.multipleChoices.filter((item) => item.isAnswer);
    if (haveAnswer.length === 0) {
        message.error(`Question ${props.index} should have at least 1 correct answer.`);
    }
};
</script>
<template>
    <a-form :layout="'vertical'" :rules="validateInfos" :model="props.question">
        <div class="question-container">
            <div class="question-header">
                <div class="question-info">Question {{ index }}</div>
                <div class="question-functions">
                    <div class="question-function-select">
                        <Select :options="optionKeys" />
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
                        <div class="option-title">Answer options</div>
                        <div
                            :class="[
                                'option-list-container',
                                !haveAnswer() ? 'option-list-container-error' : '',
                            ]"
                        >
                            <div
                                class="option-item"
                                v-for="(option, index) in props.question.multipleChoices"
                                :key="option.id"
                            >
                                <a-checkbox
                                    @change="onCheckHaveAnswer"
                                    class="option-item-checkbox"
                                    v-model:checked="option.isAnswer"
                                ></a-checkbox>
                                <div class="option-item-input">
                                    <TextArea
                                        v-model="option.text"
                                        :placeholder="'Enter option text'"
                                        :isRequired="true"
                                        :maxLength="500"
                                    />
                                </div>
                                <i class="bx bx-minus-circle" @click="removeOption(index)"></i>
                            </div>
                            <div class="add-option" @click="addOption">
                                <i class="bx bx-plus"></i>
                                Add option
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </a-form>
</template>
<style>
.ant-form {
    position: relative !important;
}

.ant-popover-arrow::before {
    background: var(--input-item-background-color) !important;
}

.ant-popover-inner {
    background: var(--input-item-background-color) !important;
    border: 1px solid var(--input-item-border-color);
    border-bottom: none;
}

.ant-popconfirm-message-title {
    color: var(--text-color-white) !important;
}
</style>

<style scoped>
.question-container {
    border: 1px solid var(--main-color);
    border-radius: 8px;
    padding: 10px;
    margin-bottom: 20px;
}

.question-header {
    margin: 20px 0px;
    color: var(--text-color-white);
    display: flex;
    justify-content: end;
}
.question-info {
    margin-left: 10px;
    font-size: 16px;
    font-weight: 500;
    padding: 5px 10px;
    background-color: var(--main-color);
    border: 1px solid var(--main-color);
    border-radius: 5px;
}

.question-functions {
    flex: 1;
    display: flex;
    justify-content: end;
    align-items: center;
}
.question-function-select {
    width: 200px;
}
.question-function-delete {
    font-size: 24px;
    margin: 0px 10px 0px 20px;
    cursor: pointer;
}

.question-body {
    padding: 0px 10px;
    display: flex;
    justify-content: space-between;
    flex-direction: column;
}

.question-description {
    flex: 0.5;
}
.question-description-item {
    margin-bottom: 25px;
}

.option-section {
    flex: 1;
    margin-left: 20px;
}

.question-body-answer {
    flex: 1;
    display: flex;
}

.option-title {
    margin-bottom: 8px;
    font-weight: 500;
    color: var(--text-color-white);
}

.option-list-container {
    padding: 10px;
    height: auto;
    max-height: 300px;
    border-radius: 5px;
    border: 1px solid #878787;
    background: #151518;
    box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
    overflow-y: scroll;
}

.option-list-container-error {
    border-color: #f44336;
}

.option-list-container::-webkit-scrollbar {
    width: 8px;
}

.option-list-container::-webkit-scrollbar-thumb {
    width: 8px;
    background-color: var(--input-item-border-color);
    border-radius: 10px;
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
}

.option-item i {
    font-size: 24px;
    display: flex;
    align-items: center;
    margin-left: 10px;
    cursor: pointer;
    color: #f44336;
}
.add-option {
    border-radius: 8px;
    padding: 5px 10px;
    max-width: 200px !important;
    margin: auto;
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: 500;
    font-size: 14px;
    cursor: pointer;
    color: var(--text-color-white);
    border: 1px dashed var(--text-color-grey);
}
.add-option i {
    font-size: 24px;
}

.add-option:hover {
    border: 1px dashed #aaa;
}
</style>
