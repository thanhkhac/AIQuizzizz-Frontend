<script setup lang="ts">
import { computed } from "vue";
import { Form } from "ant-design-vue";

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
    if (props.question.matchingPairs.length >= 10) {
        message.warning("Each question must has at most 10 options");
        return;
    }

    props.question.matchingPairs.push({
        id: Date.now().toString(),
        leftItem: "",
        rightItem: "",
    });
};

const removeOption = (index: number) => {
    if (props.question.matchingPairs.length <= 2) {
        message.warning("Each question must has at least 2 options");
        return;
    }
    if (props.question.matchingPairs[index]) {
        props.question.matchingPairs.splice(index, 1);
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

const onSwitchItem = (index: number, leftItem: string, rightItem: string) => {
    let temp = leftItem;
    props.question.matchingPairs[index].leftItem = rightItem;
    props.question.matchingPairs[index].rightItem = temp;
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
                    <InputEditor
                        class="explain-section question-description-item"
                        v-model="props.question.explainText"
                        v-model:validateStatus="validateInfos.explainText.validateStatus"
                        v-model:help="validateInfos.explainText.help"
                        :label="'Explain Text'"
                        :name="'explainText'"
                        :placeholder="'Enter explain text...'"
                    />
                </div>
                <div class="question-body-answer">
                    <div class="option-section">
                        <div class="option-title">Answer options</div>
                        <div
                            :class="[
                                'option-list-container',
                                !haveAnswer() ? 'option-list-container-error' : '',
                            ]"
                        >
                            <div
                                class="pair-item"
                                v-for="(option, index) in props.question.matchingPairs"
                                :key="option.id"
                            >
                                <div class="pair-item-input">
                                    <TextArea
                                        v-model="option.leftItem"
                                        :placeholder="'Enter option text'"
                                        :isRequired="true"
                                        :maxLength="500"
                                    />
                                </div>
                                <i
                                    class="bx bx-transfer pair-icon"
                                    @click="onSwitchItem(index, option.leftItem, option.rightItem)"
                                ></i>
                                <div class="pair-item-input">
                                    <TextArea
                                        v-model="option.rightItem"
                                        :placeholder="'Enter option text'"
                                        :isRequired="true"
                                        :maxLength="500"
                                    />
                                </div>
                                <i
                                    class="bx bx-minus-circle remove-btn"
                                    @click="removeOption(index)"
                                ></i>
                            </div>
                            <div class="add-option" @click="addOption">
                                <i class="bx bx-plus"></i>
                                Add pair
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </a-form>
</template>
<style scoped>
.question-description {
    display: flex;
    justify-content: space-between;
}

.question-description-item:first-child {
    flex: 2;
    margin-right: 20px;
}

.option-section {
    flex: 1;
}

.pair-item {
    padding: 5px 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #1f1f20;
    border: 1px solid var(--content-item-border-color);
    margin: 10px 0px;

    border-radius: 5px;
    border: 1px solid #27272a;
    background: #1f1f20;
}

.pair-item-input {
    flex: 1;
}

.pair-icon {
    color: var(--text-color-grey);
    font-size: 40px;
    margin: 0px 20px;
    transition: all 0.2s ease-in-out;
    cursor: pointer;
}

.pair-icon:hover {
    color: var(--text-color-white);
}

.remove-btn {
    font-size: 24px;
    display: flex;
    align-items: center;
    margin-left: 10px;
    cursor: pointer;
    color: #f44336;
}
</style>
