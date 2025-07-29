<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick } from "vue";
import { useI18n } from "vue-i18n";
import { message, Modal } from "ant-design-vue";

import { onBeforeRouteLeave } from "vue-router";
import dayjs, { Dayjs } from "dayjs";

import type { RequestQuestion } from "@/models/request/question";
import type { ResponseQuestion } from "@/models/response/question";
import type { Folder } from "@/models/response/folder/folder";

import QUESTION_TYPE from "@/constants/questionTypes";
import TEST_GRADE_ATTEMPT_METHOD from "@/constants/testGradeAttempMethod";
import TEST_GRADE_QUESTION_METHOD from "@/constants/testGradeQuestionMethod";

import Input from "@/shared/components/Common/Input.vue";
import TextArea from "@/shared/components/Common/TextArea.vue";

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

//#region formState

interface FormState {
    name: string;
    classId: string;
    timeLimit: number;
    startTime: string;
    endTime: string;
    gradeAttemptMethod: string;
    gradeQuestionMethod: string;
    isShowCorrectAnswerInReview: boolean;
    isAllowReviewAfterSubmit: boolean;
    shuffle: number;
    maxAttempt: number;
    passingScore: number;
    questions: RequestQuestion[]; // Define this interface below
}

const formRef = ref();
const formState = reactive<FormState>({
    name: "",
    classId: "",
    timeLimit: 60,
    startTime: "",
    endTime: "",
    gradeAttemptMethod: TEST_GRADE_ATTEMPT_METHOD.HIGHEST_SCORE,
    gradeQuestionMethod: TEST_GRADE_QUESTION_METHOD.PARTIAL,
    isShowCorrectAnswerInReview: true,
    isAllowReviewAfterSubmit: true,
    shuffle: 2,
    maxAttempt: 2,
    passingScore: 50,
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

//#endregion

//#region crud question
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

//#endregion

//#region finish validator
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
const onOpenTestTemplate = async (testTemplateId: string) => {
    chosenTestTemplateId.value = testTemplateId;
    testTemplateModalRef.value?.closeModal();
    await nextTick();
    openQuestionModal();
};

//#endregion

//#region choose question from test template
import ChooseQuestionModal from "@/shared/modals/ChooseQuestionModal.vue";
import TransferQuestionData from "@/services/TransferQuestionData";
const questionModalRef = ref<InstanceType<typeof ChooseQuestionModal> | null>(null);
const openQuestionModal = () => {
    questionModalRef.value?.openModal();
};

const onBackToFolderTestTemplate = (folder: Folder) => {
    chosenFolder.value = folder;
    openFolderTestTemplateModal();
};

const onBackToTestTemplate = () => {
    openTestTemplateModal();
};

//#endregion

//use for both modal import event
const onModalImport = (selected: ResponseQuestion[]) => {
    message.success(`Imported ${selected.length} questions`);
    const importQuestions = selected.map((x) => TransferQuestionData.transformResponseToRequest(x));
    formState.questions.push(...importQuestions);
};

//#region leave guard
onBeforeRouteLeave((to, from, next) => {
    Modal.confirm({
        title: "Leave already?",
        content: "You have unsaved changes.",
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

onMounted(() => {
    formState.questions.push(createQuestionTemplate());
    window.addEventListener("beforeunload", handleBeforeUnload);
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
                    <span>Assign new test for class SEP490</span><br />
                    <span>Add questions, set answers and configure test settings</span>
                </a-col>
            </a-row>
        </div>
        <div class="content">
            <a-form layout="vertical" :model="formState" :rules="rules" ref="formRef">
                <div class="content-item">
                    <div class="content-item-title">
                        <div>
                            <span>Test questions</span>
                            <span>Create and manage your test questions</span>
                        </div>
                        <div class="content-item-buttons">
                            <RouterLink
                                class="import-button"
                                :to="{ name: '' }"
                                @click="openFolderModal"
                            >
                                Choose from folder test
                            </RouterLink>
                            <div class="import-button">
                                {{
                                    $t("create_QS.quiz.total", {
                                        number: formState.questions.length
                                            .toString()
                                            .padStart(3, "0"),
                                    })
                                }}
                            </div>
                            <a-button type="primary" class="main-color-btn" size="large"
                                >Next</a-button
                            >
                        </div>
                    </div>
                    <div class="list-question-container">
                        <div v-for="(question, index) in formState.questions" :key="question.id">
                            <component
                                :is="componentMap[question.type]"
                                :question="question"
                                :index="index + 1"
                                :displayScore="true"
                                @deleteQuestion="onRemoveQuestion(index)"
                            />
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

    <SettingTestModal ref="settingModalRef" :class-name="'SEP490'" :form-state="formState" />
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
