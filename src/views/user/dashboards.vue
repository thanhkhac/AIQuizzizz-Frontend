<script setup lang="ts">
import ApiQuestionSet from "@/api/ApiQuestionSet";
import type QuestionSetPublicPageParams from "@/models/request/question_set/publicPageParams";
import QUESTION_SET_SORT_CATEGORY from "@/constants/questionSetSortCate";
import type QuestionSet from "@/models/response/question_set/questionSet";

import { ref, onMounted, reactive } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/AuthStore";

import Input from "@/shared/components/Common/Input.vue";
import { useI18n } from "vue-i18n";

const emit = defineEmits(["updateSidebar"]);

const { t } = useI18n();
const router = useRouter();
const authStore = useAuthStore();

const user = authStore.getUserInfo();

//#region calculate UI
const getPercentageComplete = (total: number, completed: number) => {
    return Math.floor((completed / total) * 100);
};

//#endregion

//#region search bar
type SearchResult = {
    id: string;
    name: string;
    totalQuestionCount: number;
    ratingAverage: number;
    createBy: string;
};
const search_data = ref<SearchResult[]>([]);
const searchPageParams = reactive<QuestionSetPublicPageParams>({
    pageNumber: 1,
    pageSize: 10,
    name: "",
    tagIds: [],
    sortBy: QUESTION_SET_SORT_CATEGORY.RATING,
});

const getSearchData = async () => {
    const result = await ApiQuestionSet.GetPublicByLimit(searchPageParams);
    if (result.data.success) {
        search_data.value = result.data.data.items;
        lastSearchResult.value = result.data.data.items;
    }
};

/* use this for tracking whether mouse is in search components */
const searchResultRef = ref<HTMLElement | null>(null);

/* use this for temporary when mouse leave */
const lastSearchResult = ref<SearchResult[]>([]);

function handleMouseClickOutside(event: MouseEvent) {
    if (!searchPageParams.name || !searchResultRef.value?.contains(event.target as Node)) {
        search_data.value = [];
    } else {
        search_data.value = [...lastSearchResult.value];
    }
}
//#endregion

//#region quiz
const quiz_data = ref<QuestionSet[]>([]);

const pageParams = reactive({
    pageNumber: 1,
    pageSize: 5,
});

const getData = async () => {
    try {
        let result = await ApiQuestionSet.GetRecentByLimit(
            pageParams as QuestionSetPublicPageParams,
        );
        if (result.data.success) {
            let resultData = result.data.data;
            quiz_data.value = resultData.items;
        }
    } catch (error) {
        console.log("ERROR: GETALLEXAMBYLIMIT class exam: " + error);
    }
};

//#endregion

//#region popular quiz

const public_quiz_data = ref<QuestionSet[]>([]);

const publicPageParams = reactive({
    pageNumber: 1,
    pageSize: 10,
    sortBy: QUESTION_SET_SORT_CATEGORY.RATING,
});

const loading = ref(false);
const getPublicQuizData = async () => {
    try {
        loading.value = true;
        let result = await ApiQuestionSet.GetPublicByLimit(
            publicPageParams as QuestionSetPublicPageParams,
        );
        if (result.data.success) {
            let resultData = result.data.data;
            public_quiz_data.value = resultData.items;
        }
    } catch (error) {
        console.log("ERROR: GETALLEXAMBYLIMIT search qs: " + error);
    } finally {
        loading.value = false;
    }
};

//#endregion

//#region redirect
const onRedirectToDetail = (questionSetId: string) => {
    router.push({ name: "User_QuestionSet_Detail", params: { id: questionSetId } });
};

const onRedirectToCreate = () => {
    router.push({ name: "User_QuestionSet_Create" });
};
//#endregion

onMounted(async () => {
    document.addEventListener("click", handleMouseClickOutside);
    const sidebarActiveItem = "dashboard";
    emit("updateSidebar", sidebarActiveItem);

    await getData();
    await getPublicQuizData();
});
</script>

<template>
    <div class="page-container">
        <div class="title-container">
            <a-row class="w-100">
                <a-col class="main-title" :span="20">
                    <span>{{ $t("dashboards.title") }}</span> <br />
                    <span>{{ $t("dashboards.sub_title", { username: user.fullName }) }}</span>
                </a-col>
            </a-row>
        </div>
        <div class="content">
            <div class="search-bar" ref="searchResultRef">
                <Input
                    @input="getSearchData"
                    v-model="searchPageParams.name"
                    :placeholder="t('class_question_set.other.search_placeholder')"
                >
                    <template #icon>
                        <i class="bx bx-search"></i>
                    </template>
                </Input>
                <div v-if="search_data.length > 0" :class="['search-result-container']">
                    <div class="search-result">
                        <div
                            class="search-result-item"
                            v-for="item in search_data"
                            @click="onRedirectToDetail(item.id)"
                        >
                            <div class="result-item-title">
                                {{ item.name }} ({{ item.ratingAverage }}⭐️)
                            </div>
                            <div class="result-item-description">
                                <span class="result-item-noq">
                                    {{ item.totalQuestionCount }}
                                    {{ $t("dashboards.list_items.quiz.questions") }}
                                </span>
                                {{ $t("detail_QS.other.created_by", { username: item.createBy }) }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="content-item">
                <div class="content-item-title">
                    <div>
                        <span>{{ $t("dashboards.sections.quiz.title") }}</span>
                        <span>{{ $t("dashboards.sections.quiz.sub_title") }}</span>
                    </div>
                    <RouterLink :to="{ name: 'User_Library' }" class="content-item-navigator">
                        <span>{{ $t("dashboards.buttons.viewAll") }}</span>
                        <i class="bx bx-chevron-right"></i>
                    </RouterLink>
                </div>
                <template v-if="loading">
                    <a-skeleton :loading="loading"></a-skeleton>
                    <a-skeleton :loading="loading"></a-skeleton>
                </template>
                <div e-else class="quiz-container">
                    <div
                        class="quiz-item"
                        v-for="quiz in quiz_data"
                        @click="onRedirectToDetail(quiz.id)"
                    >
                        <div class="quiz-item-title">
                            {{ quiz.name }} <i class="bx bx-chevron-right"></i>
                        </div>
                        <div class="quiz-item-info">
                            <i class="bx bx-message-square-edit bx-rotate-270"></i>
                            {{ quiz.totalQuestionCount }}
                            {{ $t("dashboards.list_items.quiz.questions") }}
                        </div>
                        <div class="quiz-item-progress">
                            <div>{{ $t("dashboards.list_items.quiz.learningProgress") }}</div>
                            <a-progress
                                stroke-color="var(--main-color)"
                                :percent="
                                    getPercentageComplete(
                                        quiz.totalQuestionCount,
                                        quiz.completedQuestionCount,
                                    )
                                "
                                status="active"
                            />
                        </div>
                    </div>
                    <div class="quiz-item add-button" @click="onRedirectToCreate">
                        <i class="bx bx-plus add-button-icon"></i>
                        <div class="add-button-context">
                            <span>{{ $t("dashboards.buttons.createNewQuiz") }}</span>
                            <span>{{ $t("dashboards.buttons.add_button_ins") }}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="content-item">
                <div class="content-item-title">
                    <div>
                        <span>{{ $t("dashboards.sections.schedule.title") }}</span>
                        <span>{{ $t("dashboards.sections.schedule.sub_title") }}</span>
                    </div>
                    <RouterLink
                        :to="{ name: 'User_QuestionSet_Search' }"
                        class="content-item-navigator"
                    >
                        <span>{{ $t("dashboards.buttons.viewAll") }}</span>
                        <i class="bx bx-chevron-right"></i>
                    </RouterLink>
                </div>
                <div class="popular-quiz-container">
                    <template v-if="loading">
                        <a-skeleton :loading="loading"></a-skeleton>
                        <a-skeleton :loading="loading"></a-skeleton>
                    </template>
                    <template v-else>
                        <div
                            v-for="quiz in public_quiz_data"
                            class="popular-quiz-item"
                            @click="onRedirectToDetail(quiz.id)"
                        >
                            <div class="p-quiz-item-info">
                                <div class="p-quiz-item-title">{{ quiz.name }}</div>
                                <!-- <div class="p-quiz-item-description">{{ quiz.description }}</div> -->
                            </div>
                            <div class="p-quiz-item-rating">
                                <div class="p-quiz-item-question-count">
                                    {{ quiz.totalQuestionCount }}
                                    {{ $t("dashboards.list_items.quiz.questions") }}
                                </div>
                                <div class="p-quiz-item-question-rate">
                                    {{ quiz.ratingAverage }}⭐️ ({{ quiz.ratingCount }}
                                    {{ $t("detail_QS.other.reviews") }})
                                </div>
                            </div>
                            <div class="p-quiz-item-credit">
                                <span><i class="bx bx-user"></i> {{ quiz.createBy }}</span>
                            </div>
                        </div>
                    </template>
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped>
.content-item-title a {
    font-size: 14px;
    color: var(--text-color);
    text-decoration: none;
    display: flex;
    align-items: center;
    justify-content: center;
}
.content-item-title i {
    font-size: 28px;
    transition: all 0.2s ease-in-out;
    transform: translateY(1px);
}

.content-item-title a:hover i {
    /* 1px for that Y above */
    transform: translate(5px, 1px);
}

.quiz-container {
    display: flex;
    flex-wrap: wrap;
    color: var(--text-color);
}

.quiz-item {
    background-color: var(--content-item-children-background-color);
    margin: 10px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 10px;
    display: flex;
    flex-direction: column;
    align-items: start;
    width: calc(100% / 3 - 50px);
    max-width: calc(100% / 3 - 50px);
    height: 200px;
    max-height: 200px;
    cursor: pointer;
}

.quiz-item:hover {
    border: 1px solid var(--main-color);
}

.quiz-item i {
    font-size: 18px;
}
.quiz-item-title {
    width: 100%;
    display: flex;
    justify-content: space-between;
    margin: 5px 0px;
}

.quiz-item-info {
    font-size: 14px;
    margin-bottom: 15px;
    color: var(--text-color-sub-white);
}
.quiz-item-info i {
    font-size: 14px;
}

.quiz-item-progress {
    width: 100%;
    font-size: 12px;
    margin-bottom: 0;
    flex: 1;
    display: flex;
    align-items: start;
    flex-direction: column;
    justify-content: end;
}

::v-deep(.ant-progress-text) {
    color: var(--text-color) !important;
}
::v-deep(.ant-progress-inner) {
    background-color: var(--content-item-border-color);
}

.add-button {
    display: flex;
    align-items: center;
    border: 1px dashed var(--border-color);
    cursor: pointer;
}
.add-button:hover {
    border: 1px dashed var(--main-sub-color);
}

.add-button-icon {
    display: flex;
    width: 50px;
    height: 50px;
    justify-content: center;
    align-items: center;
    flex-shrink: 0;
    aspect-ratio: 1/1;
    font-size: 25px !important;
    border-radius: 50%;
    background: #261544;
    color: #5c00ff;
}

.add-button-context {
    color: var(--text-color);
    display: flex;
    flex: 1;
    flex-direction: column;
    align-items: center;
    text-align: center;
    justify-content: center;
    font-size: 16px;
}
.add-button-context span:nth-child(2) {
    font-size: 14px;
}

.search-bar {
    width: 95%;
    margin-left: 10px;
}

.search-result-container {
    position: relative;
    color: var(--text-color);
}

.search-result::-webkit-scrollbar {
    width: 10px;
}
.search-result::-webkit-scrollbar-thumb {
    background-color: var(--form-item-border-color);
}

.search-result {
    background-color: var(--form-item-background-color);
    border: 1px solid var(--form-item-border-color);
    position: absolute;
    top: 0px;
    z-index: 10;
    width: 100%;
    margin: 0px;
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;
    overflow-y: scroll;
    box-shadow: 1px 0px 10px 1px var(--border-color);
    height: 300px;
    padding: 10px;
}

.search-result-item {
    margin: 5px 0px;
    padding: 10px;
    color: var(--text-color);
    border: 1px solid var(--form-item-border-color);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
}

.search-result-item:hover {
    border-color: var(--main-color);
}

.result-item-title {
    font-weight: 500;
}

.result-item-description {
    display: flex;
    color: var(--text-color-grey);
    font-size: 14px;
    margin-top: 5px;
}

::v-deep(.ant-input-affix-wrapper) {
    height: 50px;
}

.result-item-noq {
    font-size: 14px;
    color: var(--text-color);
    padding: 0px 10px;
    background-color: var(--main-color);
    border-radius: 50px;
    width: 110px;
    display: flex;
    align-items: center;
    margin-right: 10px;
}

.popular-quiz-container {
    display: flex;
    overflow-x: scroll;
    overflow-y: hidden;
    flex-wrap: nowrap;
    padding: 10px 0px;
    gap: 16px;
}

.popular-quiz-container::-webkit-scrollbar {
    height: 10px;
}

.popular-quiz-container::-webkit-scrollbar-thumb {
    height: 10px;
    background-color: var(--main-color);
    border-radius: 10px;
}

.popular-quiz-item {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--main-color);
    border-radius: 8px;
    padding: 10px;
    flex: 0 0 calc(33.3333% - 16px);
    height: 200px;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
}

.popular-quiz-item:hover {
    background-color: var(--content-item-border-color);
}

.popular-quiz-item:hover .p-quiz-item-title {
    color: var(--main-color);
}

.p-quiz-item-title {
    font-size: 20px;
    font-weight: 500;
    color: var(--text-color);
    transition: all 0.2s ease-in-out;
}

.p-quiz-item-description {
    font-size: 14px;
    color: var(--text-color-grey);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: 200px;
}

.p-quiz-item-rating {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 15px;
}

.p-quiz-item-question-count {
    font-size: 12px;
    font-weight: 500;
    padding: 0px 15px;
    background-color: var(--main-color);
    color: var(--text-color-contrast);
    display: flex;
    align-items: center;
    height: fit-content;
    border-radius: 20px;
}
.p-quiz-item-credit {
    flex: 1;
    display: flex;
    align-items: end;
}
.p-quiz-item-credit span {
    display: flex;
    align-items: center;
}
.p-quiz-item-credit i {
    font-size: 20px;
    margin-right: 10px;
}
</style>
