<script setup lang="ts">
import { message } from "ant-design-vue";
import { ref, reactive, onMounted } from "vue";
import { useI18n } from "vue-i18n";

import type { Question } from "@/models/question";

import Input from "@/shared/components/Common/Input.vue";
import TextArea from "@/shared/components/Common/TextArea.vue";

import MultipleChoice from "@/shared/components/Questions/MultipleChoice.vue";
import Matching from "@/shared/components/Questions/Matching.vue";
import Ordering from "@/shared/components/Questions/Ordering.vue";
import ShortText from "@/shared/components/Questions/ShortText.vue";

interface FormState {
    title: string;
    description: string;
    tags: string[];
    questions: Question[]; // or specify the type if you know it
}

const { t } = useI18n();

const formRef = ref();

const formState = reactive<FormState>({
    title: "",
    description: "",
    tags: [],
    questions: [],
});

const rules = {
    title: [
        {
            required: "true",
            message: "This field is required",
            trigger: "change",
        },
        {
            length: 100,
            message: "Limit 100",
            trigger: "change",
        },
    ],
    description: [
        {
            length: 200,
            message: "Limit 200",
            trigger: "change",
        },
    ],
    tags: [
        {
            validator: (rule: string, value: []) => {
                if (value && value.length > 5) {
                    return Promise.reject("You can only add up to 5 tags.");
                }
                return Promise.resolve();
            },
            trigger: "change",
        },
    ],
    questions: [
        {
            validator: (rule: string, value: []) => {
                if (value && value.length > 500) {
                    return Promise.reject("You can only add up to 5 questions.");
                }
                return Promise.resolve();
            },
            trigger: "change",
        },
    ],
};

const question_data_raw = [
    {
        type: "MultipleChoice",
        questionText: "2 + 3 bằng bao nhiêu?",
        explainText: "Cộng hai số 2 và 3 sẽ cho kết quả là 5.",
        score: 10,
        multipleChoices: [
            { text: "5", isAnswer: true },
            { text: "6", isAnswer: false },
            { text: "7", isAnswer: false },
        ],
        matchingPairs: [],
        orderingItems: [],
        shortAnswer: "",
    },
    {
        type: "Matching",
        questionText: "Nối các thành phố với quốc gia của chúng",
        explainText: "Mỗi thành phố thuộc một quốc gia duy nhất.",
        score: 15,
        multipleChoices: [],
        matchingPairs: [
            { leftItem: "Hà Nội", rightItem: "Việt Nam" },
            { leftItem: "Paris", rightItem: "Pháp" },
        ],
        orderingItems: [],
        shortAnswer: "",
    },
    {
        type: "Ordering",
        questionText: "Sắp xếp các mùa trong năm theo thứ tự bắt đầu từ đầu năm",
        explainText: "Thứ tự dựa trên chu kỳ tự nhiên của các mùa.",
        score: 20,
        multipleChoices: [],
        matchingPairs: [],
        orderingItems: [
            { text: "Mùa xuân", correctOrder: 0 },
            { text: "Mùa hè", correctOrder: 1 },
            { text: "Mùa thu", correctOrder: 2 },
            { text: "Mùa đông", correctOrder: 3 },
        ],
        shortAnswer: "",
    },
    {
        type: "ShortText",
        questionText: "Thủ đô của Việt Nam là gì?",
        explainText: "Thủ đô là trung tâm hành chính của một quốc gia.",
        score: 10,
        multipleChoices: [],
        matchingPairs: [],
        orderingItems: [],
        shortAnswer: "Hà Nội",
    },
];

const tagContent = ref("");
const addTag = () => {
    if (formState.tags.length >= 5) {
        message.warning("Limit : 5 tags");
        return;
    }
    if (tagContent.value) {
        formState.tags.push(tagContent.value);
        tagContent.value = "";
    }
};

const removeTag = (index: number) => {
    console.log(index);
    formState.tags.splice(index, 1);
};

const createMultipleChoiceQuestionTemplate = (): Question => ({
    id: Date.now().toString(),
    type: "MultipleChoice",
    questionText: "",
    explainText: "",
    score: 10,
    multipleChoices: [
        { id: (Date.now() + 1).toString(), text: "", isAnswer: true },
        { id: (Date.now() + 2).toString(), text: "", isAnswer: false },
        { id: (Date.now() + 3).toString(), text: "", isAnswer: false },
        { id: (Date.now() + 4).toString(), text: "", isAnswer: false },
    ],
    matchingPairs: [],
    orderingItems: [],
    shortAnswer: "",
});

const createMatchingQuestionTemplate = (): Question => ({
    id: Date.now().toString(),
    type: "Matching",
    questionText: "",
    explainText: "",
    score: 10,
    multipleChoices: [],
    matchingPairs: [
        { id: (Date.now() + 1).toString(), leftItem: "", rightItem: "" },
        { id: (Date.now() + 2).toString(), leftItem: "", rightItem: "" },
    ],
    orderingItems: [],
    shortAnswer: "",
});

onMounted(() => {
    formState.questions.push(createMultipleChoiceQuestionTemplate());
    formState.questions.push(createMatchingQuestionTemplate());
});

const onAddQuestion = () => {
    if (formState.questions.length >= 10) {
        message.warning("Each question set could have at most 100 questions");
        return;
    }

    formState.questions.push(createMultipleChoiceQuestionTemplate());
};

const onRemoveQuestion = (index: number) => {
    if (formState.questions.length <= 1) {
        message.warning("Each question set must have at least 1 questions");
        return;
    }

    formState.questions.splice(index, 1);
};

const check = () => {
    console.log(formState.questions);
};

const componentMap = {
    MultipleChoice,
    Matching,
    Ordering,
    ShortText,
};
</script>
<template>
    <div class="page-container">
        <div class="title-container">
            <a-row class="w-100 d-flex align-items-center">
                <a-col :span="1">
                    <RouterLink :to="{ name: 'User_Library' }">
                        <i class="bx bx-chevron-left navigator-back-button"></i>
                    </RouterLink>
                </a-col>
                <a-col class="main-title" :span="23">
                    <span> {{ $t("question_sets_index.title") }}</span> <br />
                    <span>
                        {{ $t("question_sets_index.sub_title") }}
                    </span>
                </a-col>
            </a-row>
        </div>
        <div class="content">
            <div class="content-item">
                <div class="content-item-title">
                    <div>
                        <span>{{ $t("question_sets_index.sections.quiz.title") }}</span>
                        <span>{{ $t("question_sets_index.sections.quiz.sub_title") }}</span>
                    </div>
                </div>
                <div class="content-item-body"></div>
            </div>
            <a-form layout="vertical" v-model="formState" :rules="rules" ref="formRef">
                <div class="content-item">
                    <Input
                        class="question-input-item"
                        v-model="formState.title"
                        :isRequired="true"
                        :placeholder="t('question_sets_index.search_placeholder')"
                        :label="'Quiz title'"
                    >
                        <template #icon>
                            <i class="bx bx-search"></i>
                        </template>
                    </Input>
                    <div class="d-flex">
                        <TextArea
                            class="question-input-item"
                            :label="'Description'"
                            v-model="formState.description"
                            placeholder="textarea with clear icon"
                            :max-length="500"
                        />
                        <div class="form-item">
                            <label>#Tag</label>
                            <div class="tag-container">
                                <div
                                    class="tag-item"
                                    v-for="(tag, index) in formState.tags"
                                    :key="index"
                                >
                                    {{ tag }}
                                    <i class="bx bx-x" @click="removeTag(index)"></i>
                                </div>
                            </div>
                            <div class="tag-inputter">
                                <Input
                                    v-model="tagContent"
                                    :placeholder="t('question_sets_index.search_placeholder')"
                                >
                                    <template #icon>
                                        <i class="bx bx-purchase-tag-alt"></i>
                                    </template>
                                </Input>
                                <i class="bx bx-plus tag-inputter-button" @click="addTag"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="content-item">
                    <div class="content-item-title">
                        <div>
                            <span>{{ $t("question_sets_index.sections.quiz.title") }}</span>
                            <span>{{ $t("question_sets_index.sections.quiz.sub_title") }}</span>
                        </div>
                        <div class="content-item-buttons">
                            <RouterLink class="import-button" :to="{ name: '' }">
                                Import <i class="bx bx-download"></i>
                            </RouterLink>
                            <RouterLink class="import-button" :to="{ name: '' }">
                                ✨ Generate with AI <i class="bx bx-upload"></i>
                            </RouterLink>
                            <div class="import-button" @click="check">Create</div>
                            <div class="import-button">Total: {{ formState.questions.length }}</div>
                        </div>
                    </div>
                    <div class="list-question-container">
                        <div v-for="(question, index) in formState.questions" :key="question.id">
                            <component
                                :is="componentMap[question.type]"
                                :question="question"
                                :index="index + 1"
                                @deleteQuestion="onRemoveQuestion(index)"
                            />
                        </div>
                        <div class="add-question-btn" @click="onAddQuestion">
                            <i class="bx bx-plus"></i>
                            Add Question
                        </div>
                    </div>
                </div>
            </a-form>
        </div>
    </div>
</template>
<style scoped>
.page-container {
    overflow-y: scroll;
    scroll-behavior: smooth;
}

.page-container::-webkit-scrollbar {
    width: 8px;
}

.page-container::-webkit-scrollbar-thumb {
    background-color: var(--input-item-border-color) !important;
    border-radius: 10px;
}

.navigator-back-button {
    padding: 5px;
    font-size: 30px;
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 5px;
    color: var(--text-color-white);
    transition: all 0.2s ease-in-out;
}
.navigator-back-button:hover {
    background-color: var(--main-color);
}

.content-item-buttons {
    display: flex;
    flex-direction: row;
    align-items: center;
}

.import-button {
    padding: 8px 16px;
    border: 2px solid #878787;
    border-radius: 8px;
    margin: 0px 10px;
    font-size: 16px;
    color: var(--text-color-white);
    text-decoration: none;
    display: flex;
    align-items: center;
    transition: all 0.2s ease-in-out;
}
.import-button i {
    font-size: 22px;
    margin-left: 10px;
}

.import-button:first-child:hover {
    background-color: var(--main-color);
    border: 2px solid var(--main-color);
}

.import-button:nth-child(2) {
    background: var(--background-color-gradient);
    border: 2px solid var(--main-color);
}

.import-button:nth-child(3) {
    border: 2px solid var(--main-color);
}

.form-item {
    width: 100%;
    display: flex;
    flex-direction: column;
    padding: 5px 20px;
}

.tag-container {
    height: 100px;
    max-height: 150px;
    display: flex;
    justify-content: start;
    flex-wrap: wrap;
    padding: 5px;
    margin-bottom: 16px;
    background-color: #101010 !important;
    overflow-y: scroll;
    border: 1px solid #27272a;
    border-radius: 5px;
}

.tag-item {
    padding: 0px 1px 0px 6px;
    border: 1px solid #a1a1aa;
    border-radius: 120px;
    height: 22px;
    font-size: 14px;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 2px;
}

.tag-item i {
    background-color: #f44336;
    padding: 2px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    margin-left: 10px;
}

.tag-inputter {
    display: flex;
}

.tag-inputter-button {
    padding: 9px;
    font-size: 26px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--main-color);
    border-radius: 5px;
    margin-left: 10px;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
}

.tag-inputter-button:hover {
    background-color: var(--main-sub-color);
}

.list-question-container {
    padding: 10px;
}

.question-input-item {
    margin-bottom: 10px;
}

.add-question-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px dashed var(--main-color);
    padding: 10px;
    border-radius: 5px;
    font-size: 16px;
    font-weight: 600;
    transition: all 0.2s ease-in-out;
}

.add-question-btn i {
    font-size: 24px;
    margin-right: 10px;
    transform: translateY(2px);
}

.add-question-btn:hover {
    background-color: var(--main-color);
    border: 2px solid var(--main-color);
    cursor: pointer;
}
</style>
