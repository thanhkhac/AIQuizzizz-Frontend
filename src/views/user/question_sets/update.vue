<script setup lang="ts">
import ApiQuestionSet from "@/api/ApiQuestionSet";
import { ref, reactive, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import { message, Modal } from "ant-design-vue";
import dayjs from "dayjs";
import { onBeforeRouteLeave, useRoute, useRouter } from "vue-router";

import type { RequestQuestion } from "@/models/request/question";
import type { ResponseQuestion } from "@/models/response/question";
import QUESTION_TYPE from "@/constants/questionTypes";

import TranferQuestionData from "@/services/TransferQuestionData";
import Validator from "@/services/Validator";

import Input from "@/shared/components/Common/Input.vue";
import TextArea from "@/shared/components/Common/TextArea.vue";

import MultipleChoice from "@/shared/components/Questions/MultipleChoice.vue";
import Matching from "@/shared/components/Questions/Matching.vue";
import Ordering from "@/shared/components/Questions/Ordering.vue";
import ShortText from "@/shared/components/Questions/ShortText.vue";

const { t } = useI18n();
const router = useRouter();
const route = useRoute();

//#region interface
interface FormState {
    name: string;
    description: string;
    createUpdateQuestions: RequestQuestion[];
    deleteQuestionIds: string[];

    createUpdateTags: Tag[];
    deleteTagIds: string[];
}

interface Tag {
    id: string;
    text: string;
}

interface QuestionSetDetail {
    id: string;
    name: string;
    description: string;
    tags: Tag[];
}

//#endregion

//#region get question set detail data
const loading = ref(false);
const questionSetId = ref(route.params.id as string);
const questionSetDetail = ref<QuestionSetDetail>({
    id: "",
    name: "",
    description: "",
    tags: [],
});

const questionSetQuestions = ref<ResponseQuestion[]>([]);

const isDataValid = ref(true); //to mark whether question set is valid to remove guard

const getTestTemplate = async () => {
    loading.value = true;

    if (!Validator.isValidGuid(questionSetId.value)) {
        isDataValid.value = false;
        router.push({ name: "404" });
        return;
    }

    let detail_result = await ApiQuestionSet.GetDetailById(questionSetId.value);
    let question_result = await ApiQuestionSet.GetQuestionById(questionSetId.value);

    if (!detail_result.data.success || !question_result.data.success) {
        isDataValid.value = false;
        router.push({ name: "404" });
        return;
    }

    questionSetDetail.value = detail_result.data.data;
    questionSetQuestions.value = question_result.data.data;

    formState.name = questionSetDetail.value.name;
    formState.createUpdateQuestions = questionSetQuestions.value.map((x) =>
        TranferQuestionData.transformResponseToRequest(x),
    );

    formState.createUpdateTags = questionSetDetail.value.tags;
    loading.value = false;
    window.addEventListener("beforeunload", handleBeforeUnload);
};
//#endregion

//#region form
const formRef = ref();

const formState = reactive<FormState>({
    name: "",
    description: "",
    createUpdateQuestions: [],
    deleteQuestionIds: [],

    createUpdateTags: [],
    deleteTagIds: [],
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
//#endregion

//#region logic edit question
const createQuestionTemplate = (): RequestQuestion => ({
    id: "", //new question has no id
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
    if (formState.createUpdateQuestions.length >= 100) {
        message.warning("Each question set could have at most 100 questions");
        return;
    }

    formState.createUpdateQuestions.push(createQuestionTemplate());
};

const onRemoveQuestion = (index: number) => {
    if (formState.createUpdateQuestions.length <= 1) {
        message.warning("Each question set must have at least 1 questions");
        return;
    }
    //add to delete existing question only
    //ignore new question
    const questionId = formState.createUpdateQuestions[index].id;
    if (questionId) formState.deleteQuestionIds.push(questionId);

    formState.createUpdateQuestions.splice(index, 1);
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
                : "";

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
            let result = await ApiQuestionSet.Update(questionSetId.value, formState);
            if (result.data.success) {
                message.success(result.data.data);
            }
            // localStorage.removeItem(storage_draft_key);
        },
    });
};
//#endregion

//#region logic edit tag
//tag
const tagContent = ref("");
const addTag = () => {
    if (formState.createUpdateTags.length >= 5) {
        message.warning("Limit : 5 tags");
        return;
    }
    if (tagContent.value && tagContent.value.trim().length <= 50) {
        formState.createUpdateTags.push({
            id: "",
            text: tagContent.value,
        });
        tagContent.value = "";
    } else {
        message.warning("Invalid tag content");
    }
};

const removeTag = (index: number) => {
    formState.createUpdateTags.splice(index, 1);
    const tagId = formState.createUpdateTags[index].id;
    formState.deleteTagIds.push(tagId);
};
//#endregion

//#region import modal
import ImportQSModal from "@/shared/modals/ImportQSModal.vue";
const importModalRef = ref<InstanceType<typeof ImportQSModal> | null>(null);

const onOpenImportModal = () => {
    importModalRef.value?.openImportModal();
};

//#endregion

//#region generate modal
import GenerateQSModal from "@/shared/modals/GenerateQSModal.vue";
const generateModalRef = ref<InstanceType<typeof GenerateQSModal> | null>(null);

const openGenerateAIModal = () => {
    generateModalRef.value?.openGenerateAIModal();
};
//use for both modal import event
const onModalImport = (selected: RequestQuestion[]) => {
    formState.createUpdateQuestions.push(...selected);
};
//#endregion

//#region auto save
// const storage_draft_key = `create_QS_draft_${dayjs().valueOf()}`;
// const intervalId = ref<number>();

// const saveDraft = () => {
//     // localStorage.setItem(storage_draft_key, JSON.stringify(formState));
//     message.info("Auto saved");
// };
//#endregion

//#region  safe guard before leave
function handleBeforeUnload(e: BeforeUnloadEvent) {
    e.preventDefault();
    e.returnValue = "";
}

onBeforeRouteLeave((to, from, next) => {
    if (!isDataValid.value) {
        next();
        return;
    }

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

onUnmounted(() => {
    // clearInterval(intervalId.value);
    window.removeEventListener("beforeunload", handleBeforeUnload);
});
//#endregion

onMounted(async () => {
    // intervalId.value = setInterval(saveDraft, 60_000); //save each 60s
    await getTestTemplate();
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
                                    v-for="(tag, index) in formState.createUpdateTags"
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
                                        number: formState.createUpdateQuestions.length
                                            .toString()
                                            .padStart(3, "0"),
                                    })
                                }}
                            </div>
                        </div>
                    </div>
                    <div v-if="loading">
                        <a-skeleton :loading="loading" active></a-skeleton>
                        <a-skeleton :loading="loading" active></a-skeleton>
                        <a-skeleton :loading="loading" active></a-skeleton>
                        <a-skeleton :loading="loading" active></a-skeleton>
                        <a-skeleton :loading="loading" active></a-skeleton>
                    </div>
                    <div v-else class="list-question-container">
                        <div
                            v-for="(question, index) in formState.createUpdateQuestions"
                            :key="question.id"
                        >
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

    <ImportQSModal ref="importModalRef" :title="formState.name" @import="onModalImport" />
    <GenerateQSModal ref="generateModalRef" :title="formState.name" @import="onModalImport" />
</template>

<style scoped>
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
