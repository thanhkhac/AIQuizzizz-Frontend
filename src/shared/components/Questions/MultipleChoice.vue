<script setup lang="ts">
import { ref, reactive, onMounted, computed } from "vue";
import { QuestionCircleOutlined } from "@ant-design/icons-vue";
import type { Question } from "@/models/question";
import { useI18n } from "vue-i18n";

import Input from "../Common/Input.vue";
import TextArea from "../Common/TextArea.vue";
import Select from "../Common/Select.vue";

interface Props {
    question: Question;
    index: number;
}

const { t } = useI18n();
const props = defineProps<Props>();

const optionKeys = ["multipleChoice", "matching", "ordering", "shortTexts"];
</script>
<template>
    <div class="question-container">
        <div class="question-header">
            <div class="question-info">Question {{ index }}</div>
            <div class="question-functions">
                <div class="question-function-select">
                    <Select :options="optionKeys" />
                </div>
                <a-popconfirm class="pop-confirm-delete" title="Are you sure？">
                    <template #icon><QuestionCircleOutlined style="color: red" /></template>
                    <i class="bx bx-trash text-danger question-function-delete"></i>
                </a-popconfirm>
            </div>
        </div>
        <div class="question-body">
            <div class="question-description">
                <TextArea
                    v-model="props.question.questionText"
                    class="question-description-item"
                    :label="'Question Text'"
                    :placeholder="'Enter question title/text...'"
                />
                <TextArea
                    v-model="props.question.explainText"
                    class="question-description-item"
                    :label="'Explain Text'"
                    :placeholder="'Enter explain text...'"
                />
            </div>
            <div class="option-section">
                <div class="option-title">Answer options</div>
                <div class="option-list-container">
                    <div
                        class="option-item"
                        v-for="(option, index) in props.question.multipleChoices"
                    >
                        <a-checkbox
                            class="option-item-checkbox"
                            v-model:checked="option.isAnswer"
                        ></a-checkbox>
                        <div class="option-item-input">
                            <Input v-model="option.text" :placeholder="'Enter option text'" />
                        </div>
                        <i class="bx bx-minus-circle"></i>
                    </div>
                    <div class="add-option">
                        <i class="bx bx-plus"></i>
                        Add option
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<style>
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
}
.question-functions {
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
.question-header {
    margin-bottom: 20px;
}
.question-body {
    padding: 0px 10px;
    display: flex;
    justify-content: space-between;
}

.question-description {
    flex: 0.5;
    margin-right: 30px;
}
.question-description-item {
    margin-bottom: 25px;
}

.option-section {
    flex: 1;
}

.option-title {
    margin-bottom: 10px;
    font-weight: 500;
}

.option-list-container {
    padding: 10px;
    height: 252.5px;
    border-radius: 5px;
    border: 1px solid #878787;
    background: #151518;
    box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
    overflow-y: scroll;
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
    border: 1px dashed #aaa;
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
}
.add-option i {
    font-size: 24px;
}
</style>
