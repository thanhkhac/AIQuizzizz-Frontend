<script setup lang="ts">
import ApiQuestionSet from "@/api/ApiQuestionSet";
import type { RequestQuestion } from "@/models/request/question";
import type QuestionSet from "@/models/response/question_set/questionSet";
import type Tag from "@/models/response/tag/tag";
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

const quiz = ref<QuestionSet>({
    id: "",
    name: "",
    description: "",
    totalQuestionCount: 0,
    completedQuestionCount: 0,
    ratingCount: 0,
    ratingAverage: 0,
    createBy: "",
    createdAt: "",
    createdById: "",
    tags: [],
    lastAccessByMe: "",
    visibilityMode: "",
});
const quiz_questions = ref<RequestQuestion[]>([]);

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
    loading.value = true;
    if (!Validator.isValidGuid(question_set_id.value.toString())) router.push({ name: "404" });

    const question_set_result = await ApiQuestionSet.GetDetailById(
        question_set_id.value.toString(),
    );

    const question_result = await ApiQuestionSet.GetQuestionById(question_set_id.value.toString());

    if (!question_set_result.data.success || !question_result.data.success)
        router.push({ name: "User_Library" });

    quiz.value = question_set_result.data.data;
    quiz.value.createBy = question_set_result.data.data.createdBy.fullName;
    quiz_questions.value = question_result.data.data.map((x: ResponseQuestion) =>
        TransferQuestionData.transformResponseToRequest(x),
    );
    loading.value = false;
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

//share quiz
import ShareModal from "@/shared/modals/ShareModal.vue";
import type { ResponseQuestion } from "@/models/response/question";
const shareModalRef = ref<InstanceType<typeof ShareModal> | null>(null);

const onOpenShareModal = () => {
    shareModalRef.value?.openModal();
};
//#endregion

//#region  redirect
const onRedirectToLearn = () => {
    router.push({ name: "User_QuestionSet_Learn", params: { id: quiz.value.id } });
};

const onRedirectToTest = () => {
    router.push({ name: "User_QuestionSet_Test", params: { id: quiz.value.id } });
};

const onRedirectToEdit = () => {
    router.push({ name: "User_QuestionSet_Update", params: { id: quiz.value.id } });
};
//#endregion

//#region  rating
const modal_rate_open = ref(false);
const rateValue = ref(0);

//#endregion

const onDelete = () => {
    Modal.confirm({
        title: "Are you sure to delete this question set from class?",
        content: "Please double check for important resources!",
        onOk: async () => {
            const result = await ApiQuestionSet.Delete(quiz.value.id);
            if (!result.data.success) return;
            message.success("Delete successfully.");
            router.push("User_Library");
        },
    });
};

onMounted(() => {
    //get api quiz + check visibility to current user
    //format url
    getData();
});
</script>
<template>
    <div class="content">
        <RouterLink class="navigator-back-link d-flex align-items-center p-2" :to="{ name: '' }">
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
                        <span>{{ quiz.name }}</span>
                        <span>{{ quiz.description }}</span>
                    </div>
                    <div class="d-flex flex-row align-items-center quiz-header-functions">
                        <a-dropdown :trigger="['click']" :placement="'bottomRight'">
                            <i class="bx bx-dots-horizontal-rounded ant-dropdown-link"></i>
                            <template #overlay>
                                <a-menu class="drop-down-container">
                                    <a-menu-item key="1" @click="onRedirectToEdit">
                                        <i class="bx bx-edit"></i>
                                        {{ $t("question_sets_index.buttons.edit") }}
                                    </a-menu-item>
                                    <a-menu-divider style="background-color: #ddd" />
                                    <a-menu-item key="2" @click="onDelete">
                                        <span class="d-flex align-items-center">
                                            <i class="bx bx-trash-alt"></i>
                                            {{ $t("question_sets_index.buttons.delete") }}
                                        </span>
                                    </a-menu-item>
                                </a-menu>
                            </template>
                        </a-dropdown>
                    </div>
                </div>
                <div class="quiz-info">
                    <div class="quiz-rating" @click="modal_rate_open = true">
                        {{ quiz.ratingAverage }} ⭐️ ({{ quiz.ratingCount }}
                        {{ $t("detail_QS.other.reviews") }})
                    </div>
                    <div class="quiz-tag-container">
                        <div class="quiz-tag-item" v-for="tag in quiz.tags">
                            {{ tag.name }}
                        </div>
                    </div>
                </div>
                <div class="quiz-credit">
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
                <div class="action-container">
                    <div class="credit-user">
                        <div class="user-image" alt=""></div>
                        <div class="credit-user-info">
                            <span>
                                {{
                                    $t("detail_QS.other.created_by", {
                                        username: quiz.createBy,
                                    })
                                }}
                            </span>
                            <span>{{ dayjs(quiz.createdAt).format("DD/MM/YYYY") }}</span>
                        </div>
                    </div>
                    <div class="d-flex">
                        <div class="action-item" @click="onRedirectToLearn">
                            {{ $t("detail_QS.buttons.learn") }}
                            <i class="bx bx-analyse"></i>
                        </div>
                        <div class="action-item" @click="onRedirectToTest">
                            {{ $t("detail_QS.buttons.test") }}
                            <i class="bx bx-detail"></i>
                        </div>
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
                <a-select class="me-3" v-model:value="selected_type_option" style="width: 200px">
                    <a-select-option v-for="option in question_type_options" :value="option.value">
                        {{ option.label }}
                    </a-select-option>
                </a-select>

                <div style="width: 300px; padding: 0">
                    <Input
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
                <div class="preview-question-item" v-for="(question, index) in quiz_questions">
                    <div class="question-item-content">
                        <div
                            v-if="question.questionHTML"
                            class="question-html"
                            v-html="question.questionHTML"
                        ></div>
                        <div v-else class="question-text">
                            {{ question.questionText }}
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
                                            v-for="(option, index) in question.orderingItems"
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

    <ShareModal ref="shareModalRef" :id="quiz.id" />
    <a-modal wrap-class-name="medium-modal" :visible="modal_rate_open">
        <div class="title-container">
            <a-row class="w-100 d-flex align-items-center justify-content-between">
                <a-col :span="1">
                    <div @click="modal_rate_open = false">
                        <i class="bx bx-chevron-left navigator-back-button"></i>
                    </div>
                </a-col>
                <a-col class="main-title" :span="20">
                    <span>Rate the question set</span> <br />
                </a-col>
            </a-row>
        </div>
        <div class="modal-rate-container">
            <a-rate v-model:value="rateValue" style="font-size: 40px" />
        </div>
        <template #footer>
            <a-button type="primary" class="main-color-btn">Send</a-button>
        </template>
    </a-modal>
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
</style>
