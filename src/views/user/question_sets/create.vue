<script setup lang="ts">
import ApiQuestionSet from "@/api/ApiQuestionSet";
import type { RequestQuestion } from "@/models/request/question";

import { ref, reactive, onMounted, onUnmounted, computed } from "vue";
import { useI18n } from "vue-i18n";
import { message, Modal } from "ant-design-vue";

import dayjs from "dayjs";
import { onBeforeRouteLeave } from "vue-router";

import Input from "@/shared/components/Common/Input.vue";
import TextArea from "@/shared/components/Common/TextArea.vue";

import MultipleChoice from "@/shared/components/Questions/MultipleChoice.vue";
import Matching from "@/shared/components/Questions/Matching.vue";
import Ordering from "@/shared/components/Questions/Ordering.vue";
import ShortText from "@/shared/components/Questions/ShortText.vue";

import { useVirtualList } from "@vueuse/core";

interface FormState {
    name: string;
    description: string;
    tags: string[];
    questions: RequestQuestion[]; // or specify the type if you know it
}

const { t } = useI18n();

const formRef = ref();

const formState = reactive<FormState>({
    name: "",
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

const componentMap = {
    MultipleChoice,
    Matching,
    Ordering,
    ShortText,
};

const question_data_raw = [
    {
        id: "q1",
        type: "MultipleChoice",
        questionText: "What is the capital of France ?",
        questionHTML: `<p><strong>What</strong> is <br/> the <em>capital</em> of <u>France</u>? <code>// geography</code></p>`,
        explainText: "Paris is the capital city of France.",
        score: 10,
        multipleChoices: [
            { id: "1", text: "Paris", isAnswer: true },
            { id: "2", text: "London", isAnswer: false },
            { id: "3", text: "Berlin", isAnswer: false },
        ],
        matchingPairs: [],
        orderingItems: [],
        shortAnswer: "",
    },
    {
        id: "q2",
        type: "Matching",
        questionText: "Match the countries to their capitals.",
        questionHTML: `<p><u>Match</u> the <strong>countries</strong> to their <em>capitals</em>. <code>// matching task</code></p>`,
        explainText: "Each country must be paired with its capital.",
        score: 10,
        multipleChoices: [],
        matchingPairs: [
            { id: "1", leftItem: "Japan", rightItem: "Tokyo" },
            { id: "2", leftItem: "Italy", rightItem: "Rome" },
            { id: "3", leftItem: "Vietnam", rightItem: "Hanoi" },
        ],
        orderingItems: [],
        shortAnswer: "",
    },
    {
        id: "q3",
        type: "Ordering",
        questionText: "Arrange the steps of the water cycle in the correct order.",
        questionHTML: `<p><strong>Arrange</strong> the steps of the <u>water cycle</u> in the <em>correct order</em>. <code>// science</code></p>`,
        explainText:
            "The correct order is: Evaporation → Condensation → Precipitation → Collection.",
        score: 10,
        multipleChoices: [],
        matchingPairs: [],
        orderingItems: [
            { id: "1", text: "Evaporation", correctOrder: 0 },
            { id: "2", text: "Condensation", correctOrder: 1 },
            { id: "3", text: "Precipitation", correctOrder: 2 },
            { id: "4", text: "Collection", correctOrder: 3 },
        ],
        shortAnswer: "",
    },
    {
        id: "q4",
        type: "ShortText",
        questionText: "What is the chemical symbol for water?",
        questionHTML: `<p><em>What</em> is the chemical <strong>symbol</strong> for <u>water</u>? <code>H2O</code></p>`,
        explainText: "H2O is the formula for water.",
        score: 10,
        multipleChoices: [],
        matchingPairs: [],
        orderingItems: [],
        shortAnswer: "H2O",
    },
    {
        id: "q5",
        type: "MultipleChoice",
        questionText: "Which planet is known as the Red Planet?",
        questionHTML: `<p>Which <strong>planet</strong> is known as the <em>Red Planet</em>? <u>Mars</u> <pre><code>// astronomy</code></pre></p>`,
        explainText: "Mars is often called the Red Planet due to its reddish appearance.",
        score: 10,
        multipleChoices: [
            { id: "1", text: "Mars", isAnswer: true },
            { id: "2", text: "Venus", isAnswer: false },
            { id: "3", text: "Jupiter", isAnswer: false },
        ],
        matchingPairs: [],
        orderingItems: [],
        shortAnswer: "",
    },
];

//tag
const tagContent = ref("");
const addTag = () => {
    if (formState.tags.length >= 5) {
        message.warning("Limit : 5 tags");
        return;
    }
    if (tagContent.value && tagContent.value.trim().length <= 50) {
        formState.tags.push(tagContent.value);
        tagContent.value = "";
    } else {
        message.warning("Invalid tag content");
    }
};

const removeTag = (index: number) => {
    formState.tags.splice(index, 1);
};

const createQuestionTemplate = (): RequestQuestion => ({
    id: Date.now().toString(),
    type: "MultipleChoice",
    questionText: "",
    questionHTML: "",
    explainText: "",
    score: 10,
    multipleChoices: [
        { id: (Date.now() + 1).toString(), text: "", isAnswer: true },
        { id: (Date.now() + 2).toString(), text: "", isAnswer: false },
        { id: (Date.now() + 3).toString(), text: "", isAnswer: false },
        { id: (Date.now() + 4).toString(), text: "", isAnswer: false },
    ],
    matchingPairs: [
        { id: (Date.now() + 1).toString(), leftItem: "", rightItem: "" },
        { id: (Date.now() + 2).toString(), leftItem: "", rightItem: "" },
    ],
    orderingItems: [
        { id: (Date.now() + 1).toString(), text: "", correctOrder: 0 },
        { id: (Date.now() + 2).toString(), text: "", correctOrder: 1 },
        { id: (Date.now() + 3).toString(), text: "", correctOrder: 2 },
        { id: (Date.now() + 4).toString(), text: "", correctOrder: 3 },
    ],
    shortAnswer: "",
});

const onAddQuestion = () => {
    if (formState.questions.length >= 10) {
        message.warning("Each question set could have at most 100 questions");
        return;
    }

    formState.questions.push(createQuestionTemplate());
};

const onRemoveQuestion = (index: number) => {
    if (formState.questions.length <= 1) {
        message.warning("Each question set must have at least 1 questions");
        return;
    }

    formState.questions.splice(index, 1);
};

const onFinish = () => {
    let isInvalid = false;
    let msg = "Invalid question.";
    let invalidQuestion = new Set<RequestQuestion>();

    if (formState.name.trim().length > 100 || formState.name.trim().length === 0) {
        isInvalid = true;
        msg = "Invalid title.";
        message.error(msg);
        return;
    }

    if (formState.description.trim().length > 250) {
        isInvalid = true;
        msg = "Invalid description.";
        message.error(msg);
        return;
    }

    const validation: RequestQuestion[][] = [
        //invalid question text
        formState.questions.filter((x) => {
            const questionText = x.questionText
                .replace(/^<p>/, "") //replace <p> at the start
                .replace(/<\/p>$/, "") //replace </p> at the end
                .trim();

            return 0 === questionText.length || questionText.length >= 500;
        }),

        //invalid explain text
        formState.questions.filter((x) => {
            const explainText = x.explainText
                ? x.explainText
                      .replace(/^<p>/, "")
                      .replace(/<\/p>$/, "")
                      .trim()
                : "";

            return explainText.length >= 500;
        }),

        //invalid multiplechoice
        formState.questions.filter(
            (x) =>
                x.type === QUESTION_TYPE.MULTIPLE_CHOICE &&
                (x.multipleChoices.some(
                    (x) => x.text.trim().length === 0 || x.text.trim().length > 500,
                ) ||
                    x.multipleChoices.filter((x) => x.isAnswer).length === 0),
        ),

        //invalid matching
        formState.questions.filter(
            (x) =>
                x.type === QUESTION_TYPE.MATCHING &&
                (x.matchingPairs.some(
                    (x) => x.leftItem.trim().length === 0 || x.leftItem.trim().length > 500,
                ) ||
                    x.matchingPairs.some(
                        (x) => x.rightItem.trim().length === 0 || x.rightItem.trim().length > 500,
                    )),
        ),

        //invalid ordering
        formState.questions.filter(
            (x) =>
                x.type === QUESTION_TYPE.ORDERING &&
                x.orderingItems.some(
                    (x) => x.text.trim().length === 0 || x.text.trim().length > 500,
                ),
        ),

        //invalid short text
        formState.questions.filter(
            (x) =>
                x.type === QUESTION_TYPE.SHORT_TEXT &&
                (x.shortAnswer.trim().length === 0 || x.shortAnswer.trim().length > 500),
        ),
    ];

    validation.forEach((x) => {
        if (x.length > 0) {
            isInvalid = true;
            x.forEach((y) => invalidQuestion.add(y));
        }
    });

    let indexes = Array.from(invalidQuestion).map((x) => formState.questions.indexOf(x) + 1);

    if (isInvalid) {
        Modal.error({
            title: "Cannot create new question set!",
            content: "There are errors at questions: " + indexes.sort().join(", "),
        });
    } else {
        showModalConfirmation();
    }
};

const showModalConfirmation = () => {
    Modal.confirm({
        title: "Create new quiz!",
        content: "Make sure to review your contents before proceeding.",
        centered: true,
        onOk: async () => {
            //logic here
            let result = await ApiQuestionSet.Create(formState);
            if (result.data.success) {
                message.success(result.data.data);
            }
            // localStorage.removeItem(storage_draft_key);
        },
    });
};

//import modal
import ImportQSModal from "@/shared/modals/ImportQSModal.vue";
const importModalRef = ref<InstanceType<typeof ImportQSModal> | null>(null);

const onOpenImportModal = () => {
    importModalRef.value?.openImportModal();
};

//generate modal
import GenerateQSModal from "@/shared/modals/GenerateQSModal.vue";
import QUESTION_TYPE from "@/constants/questionTypes";
const generateModalRef = ref<InstanceType<typeof GenerateQSModal> | null>(null);

const openGenerateAIModal = () => {
    generateModalRef.value?.openGenerateAIModal();
};

//use for both modal import event
const onModalImport = (selected: RequestQuestion[]) => {
    formState.questions.push(...selected);
    message.success(`Imported ${selected.length} questions.`);
};

/* auto-save */
// const storage_draft_key = `create_QS_draft_${dayjs().valueOf()}`;
// const intervalId = ref<number>();

// const saveDraft = () => {
//     localStorage.setItem(storage_draft_key, JSON.stringify(formState));
//     message.info("Auto saved");
// };

onBeforeRouteLeave((to, from, next) => {
    Modal.confirm({
        title: "Leave already?",
        content: "You have unsaved changes.",
        onOk: () => {
            next();
        },
        onCancel: () => next(false),
    });
});

function handleBeforeUnload(e: BeforeUnloadEvent) {
    e.preventDefault();
    e.returnValue = "";
}
const { list, containerProps, wrapperProps } = useVirtualList(formState.questions, {
    itemHeight: 600,
    overscan: 20,
});

const handleScroll = (event: Event) => {
    requestAnimationFrame(() => {
        const container = event.target as HTMLElement;
        if (container) {
            container.style.transform = "translateZ(0)";
        }
    });
};

onMounted(() => {
    formState.questions.push(...(question_data_raw as RequestQuestion[]));
    // intervalId.value = setInterval(saveDraft, 60_000); //save each 60s
    window.addEventListener("beforeunload", handleBeforeUnload);
});

onUnmounted(() => {
    window.removeEventListener("beforeunload", handleBeforeUnload);
});
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
                    <span> {{ $t("create_QS.title") }}</span> <br />
                    <span>
                        {{ $t("create_QS.sub_title") }}
                    </span>
                </a-col>
            </a-row>
        </div>
        <div class="content">
            <a-form layout="vertical" v-model="formState" :rules="rules" ref="formRef">
                <div class="content-item">
                    <div class="content-item-title">
                        <div>
                            <span>{{ $t("create_QS.quiz.question_detail_title") }}</span>
                            <span>{{ $t("create_QS.quiz.question_detail_sub_title") }}</span>
                        </div>
                    </div>
                    <Input
                        class="question-input-item"
                        v-model="formState.name"
                        :isRequired="true"
                        :placeholder="t('question_sets_index.search_placeholder')"
                        :label="t('create_QS.quiz.title')"
                        :max-length="100"
                    />
                    <div class="d-flex">
                        <TextArea
                            class="question-input-item"
                            v-model="formState.description"
                            placeholder="textarea with clear icon"
                            :max-length="250"
                            :label="t('create_QS.quiz.description')"
                        />
                        <div class="form-item">
                            <label>{{ $t("create_QS.quiz.tag") }}</label>
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
                                    :max-length="50"
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
                            <span>{{ $t("create_QS.quiz.question_question_title") }}</span>
                            <span>{{ $t("create_QS.quiz.question_question_sub_title") }}</span>
                        </div>
                        <div class="content-item-buttons">
                            <RouterLink
                                @click="onOpenImportModal"
                                class="import-button"
                                :to="{ name: '' }"
                            >
                                {{ $t("create_QS.buttons.import") }} <i class="bx bx-download"></i>
                            </RouterLink>
                            <RouterLink
                                @click="openGenerateAIModal"
                                class="import-button"
                                :to="{ name: '' }"
                            >
                                {{ $t("create_QS.buttons.generated_by_ai") }}
                                <i class="bx bx-upload"></i>
                            </RouterLink>
                            <div class="import-button" @click="onFinish">
                                {{ $t("create_QS.buttons.create") }}
                            </div>
                            <div class="import-button">
                                {{
                                    $t("create_QS.quiz.total", {
                                        number: formState.questions.length
                                            .toString()
                                            .padStart(3, "0"),
                                    })
                                }}
                            </div>
                        </div>
                    </div>
                    <div class="list-question-container">
                        <!-- <div v-for="(question, index) in formState.questions" :key="question.id">
                            <component
                                :is="componentMap[question.type]"
                                :question="question"
                                :index="index + 1"
                                :displayScore="false"
                                @deleteQuestion="onRemoveQuestion(index)"
                            />
                        </div> -->
                        <div
                            v-bind="containerProps"
                            class="virtual-container"
                            @scroll="handleScroll"
                        >
                            <div v-bind="wrapperProps">
                                <div v-for="(question, index) in list" :key="question.data.id">
                                    <component
                                        :is="componentMap[question.data.type]"
                                        :question="question.data"
                                        :index="question.index + 1"
                                        :displayScore="false"
                                        @deleteQuestion="onRemoveQuestion(question.index)"
                                    />
                                </div>
                            </div>
                        </div>
                        <div class="add-question-btn" @click="onAddQuestion">
                            <i class="bx bx-plus"></i>
                            {{ $t("create_QS.buttons.add_question") }}
                        </div>
                    </div>
                </div>
            </a-form>
        </div>
    </div>

    <ImportQSModal ref="importModalRef" :title="formState.name" @import="onModalImport" />
    <GenerateQSModal ref="generateModalRef" :title="formState.name" @import="onModalImport" />
</template>

<style scoped>
.virtual-container {
    height: 100vh;
    overflow-y: auto;
    border: 1px solid var(--content-item-border-color);
    border-radius: 5px;
    padding: 0px 10px;

    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;

    will-change: scroll-position;
    transform: translateZ(0);
}

.virtual-container::-webkit-scrollbar {
    width: 10px;
    background-color: var(--form-item-border-color);
}
.virtual-container::-webkit-scrollbar-thumb {
    height: 100px;
    background-color: var(--main-color);
    border-radius: 10px;
}
.virtual-container::-webkit-scrollbar-thumb:hover {
    background-color: var(--main-sub-color);
}

.content-item-title {
    margin-bottom: 20px;
}

.page-container {
    overflow-y: scroll;
    scroll-behavior: smooth;
}

.page-container::-webkit-scrollbar {
    width: 8px;
}

.page-container::-webkit-scrollbar-thumb {
    background-color: var(--form-item-border-color) !important;
    border-radius: 10px;
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
    color: var(--text-color);
    text-decoration: none;
    display: flex;
    align-items: center;
    transition: all 0.2s ease-in-out;
    cursor: pointer;
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

.import-button:nth-child(3):hover {
    background-color: var(--main-color);
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
    background-color: var(--content-item-children-background-color) !important;
    overflow-y: scroll;
    border: 1px solid var(--content-item-border-color);
    border-radius: 5px;
}

.tag-item {
    padding: 0px 1px 0px 6px;
    border: 1px solid var(--border-color-contrast);
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
