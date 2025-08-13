<script setup lang="ts">
import ApiClass from "@/api/ApiClass";
import ApiTest from "@/api/ApiTest";

import { ref, reactive, onMounted, onUnmounted, nextTick } from "vue";
import { useI18n } from "vue-i18n";
import { message, Modal } from "ant-design-vue";

import { onBeforeRouteLeave, useRoute, useRouter } from "vue-router";

import type { RequestQuestion } from "@/models/request/question";
import type { ResponseQuestion } from "@/models/response/question";
import type { Folder } from "@/models/response/folder/folder";
import type { Class } from "@/models/response/class/class";

import QUESTION_TYPE from "@/constants/questionTypes";
import TEST_GRADE_ATTEMPT_METHOD from "@/constants/testGradeAttempMethod";
import TEST_GRADE_QUESTION_METHOD from "@/constants/testGradeQuestionMethod";

import MultipleChoice from "@/shared/components/Questions/MultipleChoice.vue";
import Matching from "@/shared/components/Questions/Matching.vue";
import Ordering from "@/shared/components/Questions/Ordering.vue";
import ShortText from "@/shared/components/Questions/ShortText.vue";
const componentMap = {
    MultipleChoice,
    Matching,
    Ordering,
    ShortText,
};

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

//#region  check class
const classData = ref<Class>();
const getClassData = async () => {
    if (!Validator.isValidGuid(formState.classId)) {
        isDataValid.value = false;
        router.push({ name: "404" });
        return;
    }

    const result = await ApiClass.GetById(formState.classId);
    if (!result.data.success) {
        isDataValid.value = false;
        router.push({ name: "404" });
        return;
    }
    classData.value = result.data.data;
};
//#endregion

//#region formState

interface FormState {
    testId: string;
    name: string;
    classId: string;
    timeLimit: number;
    startTime: string;
    endTime: string;
    gradeAttemptMethod: string;
    gradeQuestionMethod: string;
    isShowCorrectAnswerInReview: boolean;
    isAllowReviewAfterSubmit: boolean;
    numberOfShuffles: number;
    maxAttempt: number;
    passingScore: number;
    createUpdateQuestions: RequestQuestion[];
    deleteQuestionIds: string[];
}

const formRef = ref();
const formState = reactive<FormState>({
    testId: route.params.id?.toString() || "",
    name: "",
    classId: "",
    timeLimit: 60,
    startTime: "",
    endTime: "",
    gradeAttemptMethod: TEST_GRADE_ATTEMPT_METHOD.HIGHEST_SCORE,
    gradeQuestionMethod: TEST_GRADE_QUESTION_METHOD.PARTIAL,
    isShowCorrectAnswerInReview: true,
    isAllowReviewAfterSubmit: true,
    numberOfShuffles: 2,
    maxAttempt: 2,
    passingScore: 50,
    createUpdateQuestions: [],
    deleteQuestionIds: [],
});

const rules = {
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

//#endregion

//#region init data
const loading = ref(false);
const isDataValid = ref(true); //to mark whether testTemplate is valid to remove guard
const getData = async () => {
    try {
        loading.value = true;
        if (!Validator.isValidGuid(formState.testId)) {
            isDataValid.value = false;
            router.push({ name: "404" });
            return;
        }

        const result = await ApiTest.GetById(formState.testId);
        if (!result.data.success) {
            isDataValid.value = false;
            router.push({ name: "404" });
            return;
        }

        formState.classId = result.data.data.classId;
        formState.testId = result.data.data.testId;
        formState.name = result.data.data.name;
        formState.startTime = result.data.data.startTime;
        formState.endTime = result.data.data.endTime;
        formState.gradeAttemptMethod = result.data.data.gradeAttemptMethod;
        formState.gradeQuestionMethod = result.data.data.gradeQuestionMethod;
        formState.isAllowReviewAfterSubmit = result.data.data.isAllowReviewAfterSubmit;
        formState.isShowCorrectAnswerInReview = result.data.data.isShowCorrectAnswerInReview;
        formState.maxAttempt = result.data.data.maxAttempt;
        formState.numberOfShuffles = result.data.data.numberOfShuffles;
        formState.passingScore = result.data.data.passingScore;
        formState.timeLimit = result.data.data.timeLimit;

        formState.createUpdateQuestions = result.data.data.questions.map((x: ResponseQuestion) =>
            TransferQuestionData.transformResponseToRequest(x),
        );
        //clear redundant
    } catch (error: any) {
        if (error.response.data.success === false) {
            isDataValid.value = false;
            router.push({ name: "404" });
            return;
        }
    } finally {
        loading.value = false;
    }
};
//#endregion

//#region crud question
import ChangeQuestionType from "@/services/ChangeQuestionType";
const createQuestionTemplate = (): RequestQuestion => ({
    id: Date.now().toString(),
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
    if (formState.createUpdateQuestions.length >= 500) {
        message.warning(t("message.limit_question", { number: 500 }));
        return;
    }

    formState.createUpdateQuestions = [
        ...formState.createUpdateQuestions,
        createQuestionTemplate(),
    ];

    nextTick(() => {
        scrollerRef.value?.forceUpdate?.();
        nextTick(() => {
            const lastIndex = formState.createUpdateQuestions.length;
            requestAnimationFrame(() => {
                scrollerRef.value?.scrollToItem(lastIndex);
            });
        });
    });
};

const onRemoveQuestion = (index: number) => {
    if (formState.createUpdateQuestions.length <= 1) {
        message.warning(t("message.minimum_question", { number: 1 }));
        return;
    }
    const questionId = formState.createUpdateQuestions[index].id;
    if (!questionId.startsWith("new_") && questionId) formState.deleteQuestionIds.push(questionId);

    formState.createUpdateQuestions = [
        ...formState.createUpdateQuestions.slice(0, index),
        ...formState.createUpdateQuestions.slice(index + 1),
    ];
};

//#endregion

//#region finish validator
const onFinish = async () => {
    await formRef.value?.validate();
    let isInvalid = false;
    let msg = t("message.invalid_question");
    let invalidQuestion = new Set<RequestQuestion>();

    if (formState.name.trim().length > 100 || formState.name.trim().length === 0) {
        isInvalid = true;
        msg = t("message.invalid_title");
        message.error(msg);
        openSettingModal();
        return;
    }

    const validation: RequestQuestion[][] = [
        //invalid question text
        formState.createUpdateQuestions.filter((x) => {
            const questionText = x.questionText
                .replace(/^<p>/, "") //replace <p> at the start
                .replace(/<\/p>$/, "") //replace </p> at the end
                .trim();

            return 0 === questionText.length || questionText.length >= 500;
        }),

        //invalid explain text
        formState.createUpdateQuestions.filter((x) => {
            const explainText = x.explainText
                ? x.explainText
                      .replace(/^<p>/, "")
                      .replace(/<\/p>$/, "")
                      .trim()
                : ""; // fallback to empty string

            return explainText.length >= 500;
        }),

        //invalid multiplechoice
        formState.createUpdateQuestions.filter(
            (x) =>
                x.type === QUESTION_TYPE.MULTIPLE_CHOICE &&
                (x.multipleChoices.some(
                    (x) => x.text.trim().length === 0 || x.text.trim().length > 500,
                ) ||
                    x.multipleChoices.filter((x) => x.isAnswer).length === 0),
        ),

        //invalid matching
        formState.createUpdateQuestions.filter(
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
        formState.createUpdateQuestions.filter(
            (x) =>
                x.type === QUESTION_TYPE.ORDERING &&
                x.orderingItems.some(
                    (x) => x.text.trim().length === 0 || x.text.trim().length > 500,
                ),
        ),

        //invalid short text
        formState.createUpdateQuestions.filter(
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

    let indexes = Array.from(invalidQuestion).map(
        (x) => formState.createUpdateQuestions.indexOf(x) + 1,
    );

    if (isInvalid) {
        Modal.error({
            title: t("update_test.modal.invalid.title"),
            content: t("update_test.modal.invalid.content") + indexes.sort().join(", "),
            okText: t("sidebar.buttons.ok"),
            cancelText: t("sidebar.buttons.cancel"),
        });
    } else {
        showModalConfirmation();
    }
};

const showModalConfirmation = () => {
    Modal.confirm({
        title: t("update_test.modal.valid.title"),
        content: t("update_test.modal.valid.content"),
        okText: t("sidebar.buttons.ok"),
        cancelText: t("sidebar.buttons.cancel"),
        centered: true,
        onOk: async () => {
            formState.createUpdateQuestions = formState.createUpdateQuestions.map((x) =>
                x.id.startsWith("new_") ? { ...x, id: "" } : x,
            ); //remove new question id

            //const result = await ApiTest.Update(formState);
            let result = await ApiTest.Update({
                ...formState,
                createUpdateQuestions: formState.createUpdateQuestions.map((x) => ({
                    ...x,
                    questionId: x.id.startsWith("new_") ? null : x.id,
                })),
            });

            if (result.data.success) {
                isDataValid.value = false; //disable safe guard
                message.success("Updated successfully!");
            }
        },
    });
};
//#endregion

//#region setting modal
import SettingTestModal from "@/shared/modals/SettingTestModal.vue";
const settingModalRef = ref<InstanceType<typeof SettingTestModal> | null>(null);
const openSettingModal = () => {
    settingModalRef.value?.openTestSettingModal();
};

//#endregion

//#region choose from folder modal
import ChooseFolderModal from "@/shared/modals/ChooseFolderModal.vue";
const folderModalRef = ref<InstanceType<typeof ChooseFolderModal> | null>(null);
const openFolderModal = () => {
    folderModalRef.value?.openModal();
};

const onSwitchToTestTemplate = () => {
    chosenFolder.value = null;
    folderModalRef.value?.closeModal();
    openTestTemplateModal();
};

const onOpenFolder = (folder: Folder) => {
    chosenFolder.value = folder;
    folderModalRef.value?.closeModal();
    openFolderTestTemplateModal();
};

//#endregion

//#region choose test template from folder modals
const chosenFolder = ref<Folder | null>(null);
const chosenTestTemplateId = ref("");

import ChooseFolderTestTemplateModal from "@/shared/modals/ChooseFolderTestTemplateModal.vue";
const folderTestTemplateModalRef = ref<InstanceType<typeof ChooseFolderTestTemplateModal> | null>(
    null,
);
const openFolderTestTemplateModal = () => {
    folderTestTemplateModalRef.value?.openModal();
};

const onBackToFolderModal = () => {
    chosenFolder.value = null;
    openFolderModal();
};

//#endregion

//#region choose from test template modal
import ChooseTestTemplateModal from "@/shared/modals/ChooseTestTemplateModal.vue";
const testTemplateModalRef = ref<InstanceType<typeof ChooseTestTemplateModal> | null>(null);
const openTestTemplateModal = () => {
    testTemplateModalRef.value?.openModal();
};

const onSwitchToFolder = () => {
    chosenFolder.value = null;
    testTemplateModalRef.value?.closeModal();
    openFolderModal();
};

//use for both case
const onOpenTestTemplate = async (testTemplateId: string, folder: Folder | null) => {
    chosenTestTemplateId.value = testTemplateId;
    testTemplateModalRef.value?.closeModal();
    chosenFolder.value = folder;
    await nextTick();
    openQuestionModal();
};

//#endregion

//#region choose question from test template
import ChooseQuestionModal from "@/shared/modals/ChooseQuestionModal.vue";
import TransferQuestionData from "@/services/TransferQuestionData";
import Validator from "@/services/Validator";
const questionModalRef = ref<InstanceType<typeof ChooseQuestionModal> | null>(null);
const openQuestionModal = () => {
    questionModalRef.value?.openModal();
};

const onBackToFolderTestTemplate = async (folder: Folder) => {
    chosenFolder.value = folder;
    await nextTick();
    openFolderTestTemplateModal();
};

const onBackToTestTemplate = () => {
    openTestTemplateModal();
};

//#endregion

//use for both modal import event
const onModalImport = (selected: ResponseQuestion[]) => {
    const importQuestions = selected
        .map((x) => TransferQuestionData.transformResponseToRequest(x))
        .map((item, i) => ({
            ...item,
            id: `new_${formState.createUpdateQuestions.length + i}`,
        }));

    folderModalRef.value?.closeModal();
    formState.createUpdateQuestions = [...formState.createUpdateQuestions, ...importQuestions];

    nextTick(() => {
        scrollerRef.value?.forceUpdate?.();
        nextTick(() => {
            const lastIndex = formState.createUpdateQuestions.length;
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

onMounted(async () => {
    await getData();
    await getClassData();
    window.addEventListener("beforeunload", handleBeforeUnload);

    await nextTick();
    openSettingModal();
});
</script>
<template>
    <div class="page-container">
        <div class="title-container">
            <a-row class="w-100 d-flex align-items-center">
                <a-col :span="1">
                    <RouterLink :to="{ name: '' }" @click="openSettingModal">
                        <i class="bx bx-chevron-left navigator-back-button"></i>
                    </RouterLink>
                </a-col>
                <a-col class="main-title" :span="23">
                    <span> {{ $t("update_test.title", { test_name: formState.name }) }} </span
                    ><br />
                    <span>{{ $t("update_test.sub_title") }} </span>
                </a-col>
            </a-row>
        </div>
        <div class="content">
            <a-form layout="vertical" :model="formState" :rules="rules" ref="formRef">
                <div class="content-item">
                    <div class="content-item-title">
                        <div>
                            <span>
                                {{ $t("assign_test.test_question.title") }}
                            </span>
                            <span>{{ $t("assign_test.test_question.sub_title") }} </span>
                        </div>
                        <div class="content-item-buttons">
                            <RouterLink
                                class="import-button"
                                :to="{ name: '' }"
                                @click="openFolderModal"
                            >
                                {{ $t("assign_test.buttons.choose_from_folder") }}
                            </RouterLink>
                            <div class="import-button">
                                {{
                                    $t("create_QS.quiz.total", {
                                        number: formState.createUpdateQuestions.length
                                            .toString()
                                            .padStart(3, "0"),
                                    })
                                }}
                            </div>
                            <a-button
                                type="primary"
                                class="main-color-btn"
                                size="large"
                                @click="onFinish"
                            >
                                {{ $t("assign_test.buttons.next") }}
                            </a-button>
                        </div>
                    </div>
                    <div v-if="loading">
                        <a-skeleton :loading="loading" active></a-skeleton>
                        <a-skeleton :loading="loading" active></a-skeleton>
                        <a-skeleton :loading="loading" active></a-skeleton>
                        <a-skeleton :loading="loading" active></a-skeleton>
                        <a-skeleton :loading="loading" active></a-skeleton>
                    </div>
                    <DynamicScroller
                        v-else
                        ref="scrollerRef"
                        class="scroller"
                        key-field="id"
                        :items="formState.createUpdateQuestions"
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
                                        formState.createUpdateQuestions.findIndex((q) => q.id === item.id) + 1
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

    <SettingTestModal
        ref="settingModalRef"
        :form-ref="formRef"
        :class-name="classData?.name!"
        :form-state="formState"
    />
    <ChooseFolderModal
        ref="folderModalRef"
        @switch-to-test-template="onSwitchToTestTemplate"
        @open-folder="onOpenFolder"
    />
    <ChooseFolderTestTemplateModal
        ref="folderTestTemplateModalRef"
        :folder="chosenFolder"
        @back-to-folder-modal="onBackToFolderModal"
        @open-test-template="onOpenTestTemplate"
    />
    <ChooseTestTemplateModal
        ref="testTemplateModalRef"
        @switch-to-folder="onSwitchToFolder"
        @open-test-template="onOpenTestTemplate"
    />
    <ChooseQuestionModal
        ref="questionModalRef"
        :test-template-id="chosenTestTemplateId"
        :folder="chosenFolder"
        @back-to-folder-test-template-modal="onBackToFolderTestTemplate"
        @back-to-test-template-modal="onBackToTestTemplate"
        @import="onModalImport"
    />
</template>
<style></style>

<style scoped>
.content-item-buttons {
    flex-direction: row;
    padding-right: 10px;
}

.import-button:first-child:hover {
    background: transparent;
    border: 2px solid var(--main-color);
    color: var(--text-color);
}

.import-button:nth-child(2) {
    background: transparent;
    border: 2px solid var(--main-color);
    cursor: default;
}
</style>
