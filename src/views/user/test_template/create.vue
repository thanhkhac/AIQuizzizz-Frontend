<script setup lang="ts">
import ApiTestTemplate from "@/api/ApiTestTemplate";

import { ref, reactive, onMounted, onUnmounted, nextTick } from "vue";
import { useI18n } from "vue-i18n";
import { message, Modal } from "ant-design-vue";

import dayjs from "dayjs";
import { onBeforeRouteLeave, useRouter } from "vue-router";

import type { RequestQuestion } from "@/models/request/question";

import Input from "@/shared/components/Common/Input.vue";
import TextArea from "@/shared/components/Common/TextArea.vue";

import MultipleChoice from "@/shared/components/Questions/MultipleChoice.vue";
import Matching from "@/shared/components/Questions/Matching.vue";
import Ordering from "@/shared/components/Questions/Ordering.vue";
import ShortText from "@/shared/components/Questions/ShortText.vue";

interface FormState {
    name: string;
    description: string;
    questions: RequestQuestion[]; // or specify the type if you know it
}

const { t } = useI18n();
const router = useRouter();

//#region init data
const formRef = ref();

const formState = reactive<FormState>({
    name: "",
    description: "",
    questions: [],
});

const rules = {
    title: [
        {
            required: "true",
            message: t("message.required"),

            trigger: "change",
        },
        {
            length: 100,
            message: t("message.out_of_range", { max_length: 100 }),
            trigger: "change",
        },
    ],
    description: [
        {
            length: 200,
            message: t("message.out_of_range", { max_length: 100 }),
            trigger: "change",
        },
    ],
    questions: [
        {
            validator: (rule: string, value: []) => {
                if (value && value.length > 500) {
                    return Promise.reject(t("message.maximum_tag.limit_question", { number: 500 }));
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
        score: 20,
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
        score: 30,
        multipleChoices: [
            { id: "1", text: "Mars", isAnswer: true },
            { id: "2", text: "Venus", isAnswer: false },
            { id: "3", text: "Jupiter", isAnswer: false },
        ],
        matchingPairs: [],
        orderingItems: [],
        shortAnswer: "",
    },
    {
        id: "q6",
        type: "MultipleChoice",
        questionText: "Which language is primarily used for web development?",
        questionHTML: `<p>Which <strong>language</strong> is primarily used for <em>web development</em>? <code>// programming</code></p>`,
        explainText: "JavaScript is the most commonly used language for web development.",
        score: 20,
        multipleChoices: [
            { id: "1", text: "JavaScript", isAnswer: true },
            { id: "2", text: "Python", isAnswer: false },
            { id: "3", text: "C++", isAnswer: false },
        ],
        matchingPairs: [],
        orderingItems: [],
        shortAnswer: "",
    },
    {
        id: "q7",
        type: "Matching",
        questionText: "Match the authors to their famous works.",
        questionHTML: `<p>Match the <strong>authors</strong> to their <em>famous works</em>. <code>// literature</code></p>`,
        explainText: "Each author is known for a specific famous book.",
        score: 15,
        multipleChoices: [],
        matchingPairs: [
            { id: "1", leftItem: "George Orwell", rightItem: "1984" },
            { id: "2", leftItem: "J.K. Rowling", rightItem: "Harry Potter" },
            { id: "3", leftItem: "Leo Tolstoy", rightItem: "War and Peace" },
        ],
        orderingItems: [],
        shortAnswer: "",
    },
    {
        id: "q8",
        type: "Ordering",
        questionText: "Arrange the historical periods in chronological order.",
        questionHTML: `<p><strong>Arrange</strong> the <em>historical periods</em> in <u>chronological</u> order. <code>// history</code></p>`,
        explainText: "The order is: Ancient → Medieval → Renaissance → Modern.",
        score: 10,
        multipleChoices: [],
        matchingPairs: [],
        orderingItems: [
            { id: "1", text: "Ancient", correctOrder: 0 },
            { id: "2", text: "Medieval", correctOrder: 1 },
            { id: "3", text: "Renaissance", correctOrder: 2 },
            { id: "4", text: "Modern", correctOrder: 3 },
        ],
        shortAnswer: "",
    },
    {
        id: "q9",
        type: "ShortText",
        questionText: "What is the square root of 144?",
        questionHTML: `<p>What is the <strong>square root</strong> of <em>144</em>? <code>// math</code></p>`,
        explainText: "The square root of 144 is 12.",
        score: 10,
        multipleChoices: [],
        matchingPairs: [],
        orderingItems: [],
        shortAnswer: "12",
    },
    {
        id: "q10",
        type: "MultipleChoice",
        questionText: "Which gas do plants absorb from the atmosphere?",
        questionHTML: `<p>Which <strong>gas</strong> do <u>plants</u> absorb from the <em>atmosphere</em>? <code>// biology</code></p>`,
        explainText: "Plants absorb carbon dioxide (CO₂) during photosynthesis.",
        score: 20,
        multipleChoices: [
            { id: "1", text: "Oxygen", isAnswer: false },
            { id: "2", text: "Carbon Dioxide", isAnswer: true },
            { id: "3", text: "Nitrogen", isAnswer: false },
        ],
        matchingPairs: [],
        orderingItems: [],
        shortAnswer: "",
    },
];

//#endregion

//#region logic edit question
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
    if (formState.questions.length >= 500) {
        message.warning(t("message.limit_question", { number: 500 }));
        return;
    }

    formState.questions = [...formState.questions, createQuestionTemplate()];

    nextTick(() => {
        scrollerRef.value?.forceUpdate?.();
        nextTick(() => {
            const lastIndex = formState.questions.length;
            requestAnimationFrame(() => {
                scrollerRef.value?.scrollToItem(lastIndex);
            });
        });
    });
};

const onRemoveQuestion = (index: number) => {
    if (formState.questions.length <= 1) {
        message.warning(t("message.minimum_question", { number: 1 }));
        return;
    }

    formState.questions = [
        ...formState.questions.slice(0, index),
        ...formState.questions.slice(index + 1),
    ];
};

const onFinish = () => {
    let isInvalid = false;
    let msg = t("message.invalid_question");
    let invalidQuestion = new Set<RequestQuestion>();

    if (formState.name.trim().length > 100 || formState.name.trim().length === 0) {
        isInvalid = true;
        msg = t("message.invalid_title");
        message.error(msg);
        return;
    }

    if (formState.description.trim().length > 250) {
        isInvalid = true;
        msg = t("message.invalid_description");
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
            const questionText = x.explainText
                .replace(/^<p>/, "")
                .replace(/<\/p>$/, "")
                .trim();

            return questionText.length >= 500;
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
            title: t("create_QS.modal.invalid.title"),
            content: t("create_QS.modal.invalid.content") + indexes.sort().join(", "),
            okText: t("sidebar.buttons.ok"),
            cancelText: t("sidebar.buttons.cancel"),
        });
    } else {
        showModalConfirmation();
    }
};

const showModalConfirmation = () => {
    Modal.confirm({
        title: t("create_template.modal.valid.title"),
        content: t("create_QS.modal.valid.content"),
        okText: t("sidebar.buttons.ok"),
        cancelText: t("sidebar.buttons.cancel"),
        centered: true,
        onOk: async () => {
            //logic here
            //remove draft
            let result = await ApiTestTemplate.Create(formState);
            if (result.data.success) {
                message.success(t("message.created_successfully"));
                router.push({
                    name: "User_TestTemplate_Detail",
                    params: { id: result.data.data },
                });
            }
            // localStorage.removeItem(storage_draft_key);
        },
    });
};
//#endregion

//#region import modal
//import modal
import ImportQSModal from "@/shared/modals/ImportQSModal.vue";
const importModalRef = ref<InstanceType<typeof ImportQSModal> | null>(null);

const onOpenImportModal = () => {
    importModalRef.value?.openImportModal();
};
//#endregion

//#region generate modal
//generate modal
import GenerateQSModal from "@/shared/modals/GenerateQSModal.vue";
import QUESTION_TYPE from "@/constants/questionTypes";
const generateModalRef = ref<InstanceType<typeof GenerateQSModal> | null>(null);

const openGenerateAIModal = () => {
    generateModalRef.value?.openGenerateAIModal();
};
//#endregion

//use for both modal import event
const onModalImport = (selected: RequestQuestion[]) => {
    formState.questions.push(
        ...selected.map((item, i) => ({
            ...item,
            id: `new_${formState.questions.length + i}`,
        })),
    );
    message.success(`${t("message.imported_question", { number: selected.length })}`);
};

//#region leave guard
/* auto-save */
// const storage_draft_key = `create_QS_draft_${dayjs().valueOf()}`;
// const intervalId = ref<number>();

// const saveDraft = () => {
//     // localStorage.setItem(storage_draft_key, JSON.stringify(formState));
//     message.info("Auto saved");
// };

onBeforeRouteLeave((to, from, next) => {
    Modal.confirm({
        title: t("create_QS.modal.leave.title"),
        content: t("create_QS.modal.leave.content"),
        okText: t("sidebar.buttons.ok"),
        cancelText: t("sidebar.buttons.cancel"),
        onOk: () => {
            // localStorage.removeItem(storage_draft_key);
            next();
        },
        onCancel: () => next(false),
    });
});

function handleBeforeUnload(e: BeforeUnloadEvent) {
    e.preventDefault();
    e.returnValue = "";
}
onUnmounted(() => {
    // clearInterval(intervalId.value);
    window.removeEventListener("beforeunload", handleBeforeUnload);
});
//#endregion

// @ts-ignore
import { DynamicScroller, DynamicScrollerItem } from "vue-virtual-scroller";
const scrollerRef = ref<any>(null);

const handleScroll = () => {
    nextTick(() => {
        scrollerRef.value?.forceUpdate?.();
    });
};

onMounted(() => {
    formState.questions.push(createQuestionTemplate());
    // intervalId.value = setInterval(saveDraft, 60_000); //save each 60s
    window.addEventListener("beforeunload", handleBeforeUnload);
});
</script>
<template>
    <div class="page-container">
        <div class="title-container">
            <a-row class="w-100 d-flex align-items-center">
                <a-col :span="1">
                    <RouterLink :to="{ name: 'User_TestTemplate' }">
                        <i class="bx bx-chevron-left navigator-back-button"></i>
                    </RouterLink>
                </a-col>
                <a-col class="main-title" :span="23">
                    <span> {{ $t("create_template.title") }}</span> <br />
                    <span>
                        {{ $t("create_QS.sub_title") }}
                    </span>
                </a-col>
            </a-row>
        </div>
        <div class="content">
            <a-form layout="vertical" :model="formState" :rules="rules" ref="formRef">
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
                    <DynamicScroller
                        ref="scrollerRef"
                        class="scroller"
                        key-field="id"
                        :items="formState.questions"
                        :min-item-size="650"
                        :buffer="800"
                        :prerender="10"
                        @scroll="handleScroll"
                    >
                        <template
                            #default="{ item, index }: { item: RequestQuestion; index: number }"
                        >
                            <DynamicScrollerItem :item="item" :key="item.id">
                                <component
                                    :is="componentMap[item.type]"
                                    :question="item"
                                    :index="index + 1"
                                    :displayScore="false"
                                    @deleteQuestion="onRemoveQuestion(index)"
                                />
                            </DynamicScrollerItem>
                        </template>
                    </DynamicScroller>
                    <div class="add-question-btn" @click="onAddQuestion">
                        <i class="bx bx-plus"></i>
                        {{ $t("create_QS.buttons.add_question") }}
                    </div>
                </div>
            </a-form>
        </div>
    </div>

    <ImportQSModal
        ref="importModalRef"
        :title="formState.name"
        :number-of-question="formState.questions.length"
        @import="onModalImport"
    />
    <GenerateQSModal
        ref="generateModalRef"
        :title="formState.name"
        @import="onModalImport"
        :number-of-question="formState.questions.length"
    />
</template>
<style scoped>
.content-item-buttons {
    display: flex;
    flex-direction: row;
}
</style>
