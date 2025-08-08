<script setup lang="ts">
import user_image from "@/assets/user.png";

import ApiTestTemplate from "@/api/ApiTestTemplate";
import ApiFolder from "@/api/ApiFolder";
import type { TestTemplate } from "@/models/response/testTemplate/testTemplate";

import type { RequestQuestion } from "@/models/request/question";
import type QuestionSet from "@/models/response/question_set/questionSet";
import QUESTION_TYPE from "@/constants/questionTypes";

import { ref, reactive, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

import Input from "@/shared/components/Common/Input.vue";
import { message, Modal } from "ant-design-vue";
import TransferQuestionData from "@/services/TransferQuestionData";
import Validator from "@/services/Validator";

import { useI18n } from "vue-i18n";
import dayjs from "dayjs";

const { t } = useI18n();

const route = useRoute();
const router = useRouter();

//#region init data
const loading = ref(false);
const question_set_id = ref(route.params.id);

const quiz = ref<TestTemplate>({
    testTemplateId: "",
    name: "",
    createdBy: "",
    numberOfQuestion: 0,
    dateCreated: 0,
});

const quiz_questions = ref<RequestQuestion[]>([]);
const questions = ref<RequestQuestion[]>([]);

const optionKeys = [
    "All",
    QUESTION_TYPE.MULTIPLE_CHOICE,
    QUESTION_TYPE.MATCHING,
    QUESTION_TYPE.ORDERING,
    QUESTION_TYPE.SHORT_TEXT,
];

const question_type_options = computed(() =>
    optionKeys.map((key) => ({
        label: t(`create_QS.type.${key}`),
        value: key,
    })),
);

const selected_type_option = ref(question_type_options.value[0].value);
const searchValue = ref("");

const getData = async () => {
    try {
        loading.value = true;
        if (!Validator.isValidGuid(question_set_id.value.toString())) router.push({ name: "404" });

        const result = await ApiTestTemplate.GetById(question_set_id.value.toString());

        if (!result.data.success) router.push({ name: "User_Library" });

        quiz.value = result.data.data;
        // quiz.value.createdBy = question_set_result.data.data.createdBy.fullName;

        quiz_questions.value = result.data.data.questions.map((x: ResponseQuestion) =>
            TransferQuestionData.transformResponseToRequest(x),
        );
        questions.value = quiz_questions.value;

        await getPermission();
    } catch (error) {
        console.log(error);
    } finally {
        loading.value = false;
    }
};

//preview uploaded content
const toggleDisplayAnswer = (index: number, button: EventTarget) => {
    let $button = $(button);

    $button.toggleClass("bx-chevron-up bx-chevron-down");

    const answer = $(`#question-item-answer-${index}`);
    if (answer) $(answer).slideToggle();
};

//#endregion

//#region share modal

import ShareModal from "@/shared/modals/ShareModal.vue";
import type { ResponseQuestion } from "@/models/response/question";
import VISIBILITY from "@/constants/visibility";
const shareModalRef = ref<InstanceType<typeof ShareModal> | null>(null);

const onOpenShareModal = () => {
    shareModalRef.value?.openModal();
};
//#endregion

//#region folder modal
import ShareToFolder from "@/shared/modals/ShareToFolder.vue";
import ERROR from "@/constants/errors";
import type { Folder } from "@/models/response/folder/folder";
const shareToFolderModalRef = ref<InstanceType<typeof ShareToFolder> | null>(null);
const openFolderModal = () => {
    shareToFolderModalRef.value?.openModal();
};

const onAddToFolder = (folder: Folder) => {
    Modal.confirm({
        title: "Are your sure to perform this action?",
        content: `Add test template ${quiz.value.name} into folder ${folder.name}`,
        centered: true,
        onOk: async () => {
            const result = await ApiFolder.AddTestTemplate(
                folder.folderTestId,
                quiz.value.testTemplateId,
            );
            if (
                !result.data.success &&
                Object.keys(result.data.errors).includes(
                    ERROR.TEST_TEMPLATE_ALREADY_EXISTS_IN_FOLDER,
                )
            ) {
                message.error(t("mesage.TEST_TEMPLATE_ALREADY_EXISTS_IN_FOLDER"));
                return;
            }
            message.success(t("message.added_successfully"));
            shareToFolderModalRef.value?.closeModal();
        },
    });
};
//#endregion

//#region  redirect

const onRedirectToEdit = () => {
    router.push({ name: "User_TestTemplate_Update", params: { id: quiz.value.testTemplateId } });
};
//#endregion

//#region permission
const permission = ref({
    canEdit: false,
    canDelete: false,
});
const getPermission = async () => {
    const result = await ApiTestTemplate.GetPermissions(quiz.value.testTemplateId);
    if (result.data.success) {
        permission.value = result.data.data;
    }
};
//#endregion

const onDelete = () => {
    Modal.confirm({
        title: "Are you sure to delete this question set from class?",
        content: "Please double check for important resources!",
        onOk: async () => {
            const result = await ApiTestTemplate.Delete(quiz.value.testTemplateId);
            if (!result.data.success) {
                message.error(t("message.deleted_failed"));
                return;
            }
            message.success(t("message.deleted_successfully"));
            router.push("User_Library");
        },
    });
};

const onFilter = () => {
    let filtered = quiz_questions.value;
    filtered = quiz_questions.value.filter((x) => {
        const matches = x.questionText.includes(searchValue.value);

        const correctType =
            selected_type_option.value === "All" || selected_type_option.value === x.type;

        return matches && correctType;
    });
    questions.value = filtered;
};

onMounted(async () => {
    //get api quiz + check visibility to current user
    //format url
    await getData();
});
</script>
<template>
    <div class="content">
        <RouterLink
            class="navigator-back-link d-flex align-items-center p-2"
            :to="{ name: 'User_TestTemplate' }"
        >
            <i class="me-1 bx bx-chevron-left"></i>
            {{ $t("detail_QS.other.library") }}
        </RouterLink>
        <div class="content-item">
            <div v-if="loading">
                <a-skeleton :loading="loading" active></a-skeleton>
                <a-skeleton :loading="loading" active></a-skeleton>
            </div>
            <div v-else>
                <div class="content-item-title">
                    <div>
                        <span> Mẫu đề thi: {{ quiz.name }}</span>
                    </div>
                    <div
                        v-if="permission.canEdit || permission.canDelete"
                        class="d-flex flex-row align-items-center justify-content-between quiz-header-functions"
                    >
                        <!-- <a-dropdown :trigger="['click']" :placement="'bottomRight'">
                            <i class="bx bx-dots-horizontal-rounded ant-dropdown-link"></i>
                            <template #overlay>
                                <a-menu class="drop-down-container">
                                    <a-menu-item
                                        v-if="permission.canEdit"
                                        key="1"
                                        @click="onRedirectToEdit"
                                    >
                                        <i class="bx bx-edit"></i>
                                        {{ $t("question_sets_index.buttons.edit") }}
                                    </a-menu-item>
                                    <a-menu-divider style="background-color: #ddd" />
                                    <a-menu-item
                                        v-if="permission.canDelete"
                                        key="2"
                                        @click="onDelete"
                                    >
                                        <span class="d-flex align-items-center">
                                            <i class="bx bx-trash-alt"></i>
                                            {{ $t("question_sets_index.buttons.delete") }}
                                        </span>
                                    </a-menu-item>
                                </a-menu>
                            </template>
                        </a-dropdown> -->
                        <i
                            v-if="permission.canEdit"
                            class="bx bx-edit"
                            @click="onRedirectToEdit"
                        ></i>
                        <i
                            v-if="permission.canDelete"
                            class="text-danger bx bx-trash-alt"
                            @click="onDelete"
                        ></i>
                    </div>
                </div>
                <div class="quiz-credit">
                    <div class="share-btn-container">
                        <a-button
                            type="primary"
                            class="me-3 main-color-btn share-btn"
                            size="large"
                            @click="openFolderModal"
                        >
                            <i class="bx bx-plus"></i>
                            Add to folder
                        </a-button>
                    </div>
                    <div class="share-btn-container">
                        <a-button
                            type="primary"
                            class="main-color-btn share-btn"
                            size="large"
                            @click="onOpenShareModal"
                        >
                            <i class="bx bx-share-alt"></i>
                            {{ $t("detail_QS.buttons.share_quiz") }}
                        </a-button>
                    </div>
                </div>
            </div>
        </div>
        <div class="content-item">
            <div class="content-item-title">
                <div>
                    <span>{{
                        $t("detail_QS.other.questions", { number: quiz_questions.length })
                    }}</span>
                </div>
            </div>
            <div class="content-item-functions">
                <a-select
                    class="me-3"
                    v-model:value="selected_type_option"
                    style="width: 200px"
                    @change="onFilter"
                >
                    <a-select-option v-for="option in question_type_options" :value="option.value">
                        {{ option.label }}
                    </a-select-option>
                </a-select>

                <div style="width: 300px; padding: 0">
                    <Input
                        @input="onFilter"
                        v-model="searchValue"
                        :placeholder="t('question_sets_index.search_placeholder')"
                    >
                        <template #icon>
                            <i class="bx bx-search"></i>
                        </template>
                    </Input>
                </div>
            </div>
            <div v-if="loading">
                <a-skeleton :loading="loading" active></a-skeleton>
                <a-skeleton :loading="loading" active></a-skeleton>
                <a-skeleton :loading="loading" active></a-skeleton>
                <a-skeleton :loading="loading" active></a-skeleton>
                <a-skeleton :loading="loading" active></a-skeleton>
            </div>
            <div v-else class="preview-question-container">
                <div class="preview-question-item" v-for="(question, index) in questions">
                    <div class="question-item-content">
                        <div class="d-flex pb-2">
                            <div class="question-index">{{ index + 1 }}</div>
                            <div
                                v-if="question.questionHTML"
                                class="question-html"
                                v-html="question.questionHTML"
                            ></div>
                            <div v-else class="question-text">
                                {{ question.questionText }}
                            </div>
                        </div>
                        <div
                            class="question-item-answer"
                            :id="`question-item-answer-${index}`"
                            style="display: none"
                        >
                            <template v-if="question.type === QUESTION_TYPE.MULTIPLE_CHOICE">
                                <div class="multiple-choice-answer">
                                    <ul>
                                        <li v-for="option in question.multipleChoices">
                                            {{ option.text }}
                                            <span class="text-success" v-if="option.isAnswer">
                                                ({{ option.isAnswer }})
                                            </span>
                                        </li>
                                    </ul>
                                </div>
                            </template>
                            <template v-if="question.type === QUESTION_TYPE.MATCHING">
                                <div class="pair-answer" v-for="option in question.matchingPairs">
                                    <span class="pair-answer-item">
                                        {{ option.leftItem }}
                                    </span>
                                    <i class="bx bx-right-arrow-alt"></i>
                                    <span class="pair-answer-item">
                                        {{ option.rightItem }}
                                    </span>
                                </div>
                            </template>
                            <template v-if="question.type === QUESTION_TYPE.ORDERING">
                                <div class="ordering-answer">
                                    <div class="ordering-answer-item">
                                        <div v-for="option in question.orderingItems">
                                            {{ option.text }}
                                        </div>
                                    </div>
                                    <i class="bx bx-right-arrow-alt"></i>
                                    <div class="ordering-answer-item">
                                        <div
                                            class="ordering-answer-item"
                                            v-for="(option, index) in question.orderingItems.sort(
                                                (a, b) => a.correctOrder - b.correctOrder,
                                            )"
                                        >
                                            <span>#{{ index + 1 }}</span> -
                                            {{ option.text }}
                                        </div>
                                    </div>
                                </div>
                            </template>
                            <template v-if="question.type === QUESTION_TYPE.SHORT_TEXT">
                                <span>Answer:</span>
                                <div class="short-text-answer">
                                    {{ question.shortAnswer }}
                                </div>
                            </template>
                        </div>
                    </div>
                    <div class="question-item-toogle-btn">
                        <i
                            class="bx bx-chevron-down"
                            @click="toggleDisplayAnswer(index, $event.currentTarget!)"
                        ></i>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <ShareModal
        ref="shareModalRef"
        :id="quiz.testTemplateId"
        :name="quiz.name"
        :mode="'template'"
        :options="[VISIBILITY.PRIVATE]"
        :visibility="''"
    />

    <ShareToFolder ref="shareToFolderModalRef" @add-to-folder="onAddToFolder" />
</template>

<style scoped>
.content-item {
    margin-left: 30px;
}

.navigator-back-link {
    margin-left: 30px;
    color: var(--text-color);
    text-decoration: none;
    font-size: 16px;
}

.navigator-back-link i {
    font-size: 24px;
    transform: translateY(1px);
    transition: all 0.2s ease-in-out;
}

.navigator-back-link:hover i {
    transform: translate(-3px, 1px);
}

.quiz-header-functions i {
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    margin-left: 10px;
}

.quiz-header-functions i:nth-child(1):hover {
    font-size: 26px;
}

.quiz-info {
    margin-bottom: 30px;
}

.quiz-rating {
    width: fit-content;
    margin: 10px 0px;
    padding: 5px 10px;
    border: 1px solid transparent;
    border-radius: 8px;
    color: var(--text-color-grey);
    transition: all 0.2s ease-in-out;
    cursor: pointer;
}

.quiz-rating:hover {
    border-color: var(--main-color);
    color: var(--text-color);
}

.quiz-tag-container {
    display: flex;
    flex-wrap: wrap;
}

.quiz-tag-item {
    margin-right: 10px;
    padding: 5px 10px;
    font-size: 12px;
    border: 2px solid var(--border-color);
    border-radius: 100px;
    color: var(--text-color-grey);
    cursor: pointer;
    transition: all 0.2s ease-in-out;
}
.quiz-tag-item:hover {
    border-color: var(--main-color);
    color: var(--text-color);
}

.quiz-credit {
    display: flex;
    justify-content: end;
    align-items: center;
    margin-bottom: 30px;
}

.credit-user {
    display: flex;
    align-items: center;
}

.user-image {
    width: 40px;
    height: 40px;
    background-color: var(--background-color-contrast);
    border-radius: 50%;
    margin-right: 10px;
    object-fit: contain;
    padding: 3px;
}

.credit-user-info {
    display: flex;
    flex-direction: column;
    font-size: 14px;
    color: var(--text-color-grey);
}

.action-container {
    display: flex;
    justify-content: space-between;
}

.action-item {
    width: 300px;
    margin: 0px 10px;
    padding: 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border: 1px solid var(--main-color);
    border-radius: 8px;
    font-size: 16px;
    font-weight: 500;
    color: var(--text-color);
    transition: all 0.2s ease-in-out;
    cursor: pointer;
}

.action-item i {
    font-size: 26px;
}

.action-item:hover {
    background-color: var(--main-color);
}

.content-item-title {
    display: flex;
    align-items: center;
}

.content-item-functions {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: end;
    flex-direction: row;
}

::v-deep(.ant-form-item-control-input-content) {
    width: 100%;
}

.share-btn {
    display: flex;
    align-items: center;
}

.share-btn i {
    margin-right: 10px;
    font-size: 20px;
    transform: translateY(2px);
}
.modal-rate-container {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}

::v-deep(.ant-rate-star-second) {
    color: var(--border-color);
}

.question-index {
    font-weight: 500;
    margin-right: 10px;
    border: 1px solid var(--form-item-border-color);
    border-radius: 5px;
    background-color: var(--main-color);
    padding: 3px 8px;
    color: var();
}
</style>
