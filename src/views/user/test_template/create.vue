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
const isDataValid = ref(true);

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

//#endregion

//#region logic edit question
import ChangeQuestionType from "@/services/ChangeQuestionType";
const createQuestionTemplate = (): RequestQuestion => ({
    id: "new_" + Date.now().toString(),
    type: "MultipleChoice",
    questionText: "",
    questionHTML: "",
    explainText: "",
    score: 10,
    multipleChoices: ChangeQuestionType.defaultMultipleChoices(),
    matchingPairs: ChangeQuestionType.defaultMatchingPairs(),
    orderingItems: ChangeQuestionType.defaultOrderingItems(),
    shortAnswer: "",
});

const onHandleChangeQuestionType = (question: RequestQuestion) => {
    ChangeQuestionType.onChangeQuestionType(question);
};

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

            return 0 === questionText.length || questionText.length >= 5000;
        }),

        //invalid explain text
        formState.questions.filter((x) => {
            const explainText = x.explainText
                ? x.explainText
                      .replace(/^<p>/, "")
                      .replace(/<\/p>$/, "")
                      .trim()
                : "";

            return explainText.length >= 5000;
        }),

        //invalid multiplechoice
        formState.questions.filter(
            (x) =>
                x.type === QUESTION_TYPE.MULTIPLE_CHOICE &&
                (x.multipleChoices.some(
                    (x) => x.text.trim().length === 0 || x.text.trim().length > 1000,
                ) ||
                    x.multipleChoices.filter((x) => x.isAnswer).length === 0 ||
                    x.multipleChoices.length < 2),
        ),

        //invalid matching
        formState.questions.filter(
            (x) =>
                x.type === QUESTION_TYPE.MATCHING &&
                (x.matchingPairs.some(
                    (x) => x.leftItem.trim().length === 0 || x.leftItem.trim().length > 1000,
                ) ||
                    x.matchingPairs.some(
                        (x) => x.rightItem.trim().length === 0 || x.rightItem.trim().length > 1000,
                    ) ||
                    x.matchingPairs.length < 2),
        ),

        //invalid ordering
        formState.questions.filter(
            (x) =>
                x.type === QUESTION_TYPE.ORDERING &&
                (x.orderingItems.some(
                    (x) => x.text.trim().length === 0 || x.text.trim().length > 1000,
                ) ||
                    x.orderingItems.length < 2),
        ),

        //invalid short text
        formState.questions.filter(
            (x) =>
                x.type === QUESTION_TYPE.SHORT_TEXT &&
                (x.shortAnswer.trim().length === 0 || x.shortAnswer.trim().length > 1000),
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
            formState.questions = formState.questions.map((x) =>
                x.id.startsWith("new_") ? { ...x, questionId: null } : x,
            );

            let result = await ApiTestTemplate.Create(formState);
            if (result.data.success) {
                message.success(t("message.created_successfully"));
                isDataValid.value = false;
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
    formState.questions.unshift(
        ...selected.map((item, i) => ({
            ...item,
            id: `new_${formState.questions.length + i}`,
            orderingItems: item.orderingItems.map((x, index) => ({
                ...x,
                correctOrder: index,
            })),
        })),
    );

    nextTick(() => {
        scrollerRef.value?.forceUpdate?.();
        nextTick(() => {
            const lastIndex = formState.questions.length;
            requestAnimationFrame(() => {
                scrollerRef.value?.scrollToItem(lastIndex);
            });
        });
    });

    message.success(`${t("message.imported_question", { number: selected.length })}`);
};

//#region leave guard

onBeforeRouteLeave((to, from, next) => {
    if (!isDataValid.value) {
        next();
        return;
    }
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
                        :placeholder="t('create_QS.other.title_placeholder')"
                        :label="t('create_QS.quiz.title')"
                        :max-length="100"
                    />
                    <div class="d-flex">
                        <TextArea
                            class="question-input-item"
                            v-model="formState.description"
                            :placeholder="t('create_QS.other.description_placeholder')"
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
                                    :index="
                                        formState.questions.findIndex((q) => q.id === item.id) + 1
                                    "
                                    :displayScore="false"
                                    @deleteQuestion="onRemoveQuestion(index)"
                                    @changeQuestionType="onHandleChangeQuestionType(item)"
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
