<script setup lang="ts">
import ApiTestTemplate from "@/api/ApiTestTemplate";
import { ref, reactive, onMounted, onUnmounted, nextTick } from "vue";
import { useI18n } from "vue-i18n";
import { message, Modal } from "ant-design-vue";
import { hasPendingUploads, toQuestionPayload } from "@/services/QuestionMediaService";
import dayjs from "dayjs";
import { onBeforeRouteLeave, useRoute, useRouter } from "vue-router";

import type { RequestQuestion } from "@/models/request/question";
import type { ResponseQuestion } from "@/models/response/question";
import QUESTION_TYPE from "@/constants/questionTypes";

import TranferQuestionData from "@/services/TransferQuestionData";
import Validator from "@/services/Validator";
import {
    buildInvalidQuestionContent,
    isQuestionBlank,
    validateQuestions,
} from "@/services/QuestionValidator";

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
    testTemplateId: string;
    name: string;
    description: string;
    createUpdateQuestions: RequestQuestion[];
    deleteQuestionIds: string[];
}

interface TestTemplate {
    testTemplateId: string;
    name: string;
    questions: ResponseQuestion[];
}

//#endregion

//#region get testTemplate detail data
const loading = ref(false);
const testTemplateId = ref(route.params.id as string);
const testTemplate = ref<TestTemplate>({
    testTemplateId: "",
    name: "",
    questions: [],
});
const isDataValid = ref(true); //to mark whether testTemplate is valid to remove guard

const getTestTemplate = async () => {
    try {
        loading.value = true;
        if (!Validator.isValidGuid(testTemplateId.value)) {
            isDataValid.value = false;
            router.push({ name: "404" });
            return;
        }
        await getPermission();

        let result = await ApiTestTemplate.GetById(testTemplateId.value);
        if (!result.data.success) {
            isDataValid.value = false;
            router.push({ name: "404" });
            return;
        }
        testTemplate.value = result.data.data;

        testTemplate.value.questions = result.data.data.questions.map((x: any) => ({
            id: x.questionId,
            ...x,
        }));

        formState.name = testTemplate.value.name;
        formState.description = (result.data.data.description as string | null) ?? "";
        formState.createUpdateQuestions = testTemplate.value.questions.map((x) =>
            TranferQuestionData.transformResponseToRequest(x),
        );

        formState.testTemplateId = testTemplate.value.testTemplateId;

        window.addEventListener("beforeunload", handleBeforeUnload);
    } catch (error) {
        console.log(error);
    } finally {
        loading.value = false;
    }
};
//#endregion

//#region form
const formRef = ref();

const formState = reactive<FormState>({
    testTemplateId: "",
    name: "",
    description: "",
    createUpdateQuestions: [],
    deleteQuestionIds: [],
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
            message: t("message.out_of_range", { max_length: 200 }),
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
    mediaId: null,
    media: null,
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
        nextTick(() => {
            requestAnimationFrame(() => {
                scrollerRef.value?.lastElementChild?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
            });
        });
    });
};

const onRemoveQuestion = (index: number) => {
    if (formState.createUpdateQuestions.length <= 1) {
        message.warning(t("message.minimum_question", { number: 1 }));
        return;
    }
    //add to delete existing question only
    //ignore new question
    const questionId = formState.createUpdateQuestions[index].id;
    if (!questionId.startsWith("new_") && questionId) formState.deleteQuestionIds.push(questionId);

    formState.createUpdateQuestions = [
        ...formState.createUpdateQuestions.slice(0, index),
        ...formState.createUpdateQuestions.slice(index + 1),
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

    const issues = validateQuestions(formState.createUpdateQuestions);
    isInvalid = issues.length > 0;

    if (isInvalid) {
        Modal.error({
            title: t("create_QS.modal.invalid.title"),
            content: buildInvalidQuestionContent(issues, t("create_QS.modal.invalid.content")),
            okText: t("sidebar.buttons.ok"),
            cancelText: t("sidebar.buttons.cancel"),
        });
    } else {
        showModalConfirmation();
    }
};

const showModalConfirmation = () => {
    // file media đang upload/xử lý thì chưa có mediaId -> không cho lưu
    if (hasPendingUploads()) {
        message.warning(t("question_media.wait_for_upload"));
        return;
    }
    Modal.confirm({
        title: t("update_template.modal.valid.title"),
        content: t("create_QS.modal.valid.content"),
        okText: t("sidebar.buttons.ok"),
        cancelText: t("sidebar.buttons.cancel"),
        centered: true,
        onOk: async () => {
            // formState.createUpdateQuestions = formState.createUpdateQuestions.map((x) =>
            //     x.id.startsWith("new_") ? { ...x, id: "" } : x,
            // );

            // let result = await ApiTestTemplate.Update(testTemplate.value.testTemplateId, {
            //     ...formState,
            //     createUpdateQuestions: formState.createUpdateQuestions.map((x) => ({
            //         questionId: x.id,
            //         ...x,
            //     })),
            // });

            let result = await ApiTestTemplate.Update(testTemplate.value.testTemplateId, {
                ...formState,
                createUpdateQuestions: formState.createUpdateQuestions.map((x) => ({
                    questionId: x.id.startsWith("new_") ? null : x.id,
                    ...toQuestionPayload(x),
                })),
            });

            if (result.data.success) {
                message.success(t("message.updated_successfully"));
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
    if (selected.length === 0) return;
    // bỏ câu hỏi mặc định còn trống (chưa nhập gì) trước khi thêm câu hỏi import
    formState.createUpdateQuestions = formState.createUpdateQuestions.filter(
        (q) => !(String(q.id).startsWith("new_") && isQuestionBlank(q)),
    );
    formState.createUpdateQuestions.push(
        ...selected.map((item, i) => ({
            ...item,
            id: `new_${Date.now()}_${i}`,
            questionId: null,
            orderingItems: item.orderingItems?.map((x, index) => ({
                ...x,
                correctOrder: index,
            })),
        })),
    );

    nextTick(() => {
        nextTick(() => {
            requestAnimationFrame(() => {
                scrollerRef.value?.lastElementChild?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
            });
        });
    });

    message.success(`${t("message.imported_question", { number: selected.length })}`);
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

onUnmounted(() => {
    // clearInterval(intervalId.value);
    window.removeEventListener("beforeunload", handleBeforeUnload);
});
//#endregion

//#region permission
const permission = ref({
    canEdit: false,
    canDelete: false,
});
const getPermission = async () => {
    const result = await ApiTestTemplate.GetPermissions(testTemplateId.value);
    if (result.data.success) {
        permission.value = result.data.data;
        if (!permission.value.canEdit) {
            isDataValid.value = false;
            router.push({ name: "404" });
        }
    }
};
//#endregion

import { template, xor } from "lodash";
const scrollerRef = ref<any>(null);

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
                    <RouterLink :to="{ name: 'User_Folder' }">
                        <i class="bx bx-chevron-left navigator-back-button"></i>
                    </RouterLink>
                </a-col>
                <a-col class="main-title" :span="23">
                    <span> {{ $t("update_template.title", { name: formState.name }) }}</span> <br />
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
                                {{ $t("update_QS.buttons.update") }}
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
                    <div ref="scrollerRef" class="question-list">
                        <div
                            v-for="(item, index) in formState.createUpdateQuestions"
                            :key="item.id"
                            class="question-list-item"
                            v-memo="[item, index, item.type]"
                        >
                            <component
                                :is="componentMap[item.type]"
                                :question="item"
                                :index="index + 1"
                                :displayScore="true"
                                @deleteQuestion="onRemoveQuestion(index)"
                                @changeQuestionType="onHandleChangeQuestionType(item)"
                            />
                        </div>
                    </div>
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
        :number-of-question="formState.createUpdateQuestions.length"
        @import="onModalImport"
    />
    <GenerateQSModal
        ref="generateModalRef"
        :title="formState.name"
        @import="onModalImport"
        :number-of-question="formState.createUpdateQuestions.length"
    />
</template>
<style scoped>
.content-item-buttons {
    display: flex;
    flex-direction: row;
}
</style>
