<script setup lang="ts">
import { computed } from "vue";
import { Form } from "ant-design-vue";

import { VueDraggable } from "vue-draggable-plus";
import type { SortableEvent } from "vue-draggable-plus";

import type { Question } from "@/models/question";
import { useI18n } from "vue-i18n";

import { QuestionCircleOutlined } from "@ant-design/icons-vue";
import { message } from "ant-design-vue";

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

const addOption = () => {
    if (props.question.orderingItems.length >= 10) {
        message.warning("Each question must has at most 10 options");
        return;
    }

    props.question.orderingItems.push({
        id: Date.now().toString(),
        text: "",
        correctOrder: props.question.orderingItems.length + 1,
    });
};

const removeOption = (index: number) => {
    if (props.question.orderingItems.length <= 2) {
        message.warning("Each question must has at least 2 options");
        return;
    }
    if (props.question.orderingItems[index]) {
        props.question.orderingItems.splice(index, 1);
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
                        <div class="option-title">
                            Answer options
                            <span class="option-title-ins">
                                - Hold & drag these option to the correct order you want
                            </span>
                        </div>

                        <div
                            :class="[
                                'option-list-container',
                                !haveAnswer() ? 'option-list-container-error' : '',
                            ]"
                        >
                            <VueDraggable v-model="props.question.orderingItems">
                                <div
                                    class="option-item"
                                    v-for="(option, index) in props.question.orderingItems"
                                    :key="option.id"
                                >
                                    <div class="option-item-order">
                                        <i class="bx bx-hash"></i>
                                        {{ option.correctOrder }}
                                    </div>
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
                            </VueDraggable>
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
}

.option-item i {
    font-size: 24px;
    display: flex;
    align-items: center;
    margin-left: 10px;
    cursor: pointer;
    color: #f44336;
}

.option-item-order {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-color-grey);
    font-size: 26px;
    font-weight: 600;
    margin-right: 10px;
    cursor: pointer;
}
.option-item-order i {
    color: var(--text-color-grey);
    font-size: 26px;
    margin: 0;
    transform: translateY(2px);
}

.option-title span {
    font-size: 12px;
    color: var(--text-color-grey);
}
</style>
