<script setup lang="ts">
import { computed } from "vue";
import { Form, message } from "ant-design-vue";

import type { Question } from "@/models/question";
import { useI18n } from "vue-i18n";

import { QuestionCircleOutlined } from "@ant-design/icons-vue";

import TextArea from "../Common/TextArea.vue";

//@ts-ignore
import InputEditor from "../Common/InputEditor.vue";

import QUESTION_TYPE from "@/constants/questionTypes";

interface Props {
    question: Question;
    index: number;
}

const { t } = useI18n();

const props = defineProps<Props>();

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

const addOption = () => {
    if (props.question.matchingPairs.length >= 10) {
        message.warning(t("create_QS.error_msg.maximum_options"));
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
        message.warning(t("create_QS.error_msg.minimum_options"));
    }
    if (props.question.matchingPairs[index]) {
        props.question.matchingPairs.splice(index, 1);
    }
};

const { validateInfos } = Form.useForm(props.question, {
    questionText: [
        { required: true, message: t("create_QS.error_msg.required"), trigger: "change" },
        {
            validator: (_rule: string, value: string) => {
                const plainText = value.replace(/<[^>]+>/g, ""); //editor return as html in <p></p>
                if (!plainText) {
                    return Promise.reject(t("create_QS.error_msg.required"));
                }
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
                <div class="question-info">
                    {{ $t("create_QS.question.question") }} {{ props.index }}
                </div>
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
                        v-model="props.question.questionText"
                        v-model:validateStatus="validateInfos.questionText.validateStatus"
                        v-model:help="validateInfos.questionText.help"
                        :name="'questionText'"
                        :label="t('create_QS.question.text')"
                        :placeholder="t('create_QS.question.text_placeholder')"
                    />
                    <InputEditor
                        class="explain-section question-description-item"
                        v-model="props.question.explainText"
                        v-model:validateStatus="validateInfos.explainText.validateStatus"
                        v-model:help="validateInfos.explainText.help"
                        :name="'explainText'"
                        :label="t('create_QS.question.explain_text')"
                        :placeholder="t('create_QS.question.explain_text_placeholder')"
                    />
                </div>
                <div class="question-body-answer">
                    <div class="option-section">
                        <div class="option-title">{{ $t("create_QS.question.answer_option") }}</div>
                        <div :class="['option-list-container']">
                            <div
                                class="pair-item"
                                v-for="(option, index) in props.question.matchingPairs"
                                :key="option.id"
                            >
                                <div class="pair-item-input">
                                    <TextArea
                                        v-model="option.leftItem"
                                        :placeholder="
                                            t('create_QS.question.answer_option_placeholder')
                                        "
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
                                {{ $t("create_QS.buttons.add_pair") }}
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
