<script setup lang="ts">
import ApiQuestionSet from "@/api/ApiQuestionSet";
import type QuestionSetPublicPageParams from "@/models/request/question_set/publicPageParams";
import QUESTION_SET_SORT_CATEGORY from "@/constants/questionSetSortCate";
import type QuestionSet from "@/models/response/question_set/questionSet";
import type QuestionSetPageParams from "@/models/request/question_set/questionSetPageParams";

import { ref, onMounted, reactive } from "vue";
import { useRouter } from "vue-router";

import dayjs from "dayjs";
import Input from "@/shared/components/Common/Input.vue";
import { useI18n } from "vue-i18n";

const emit = defineEmits(["updateSidebar"]);

const { t } = useI18n();
const router = useRouter();

//#region sample data

// const quiz_data = ref([
//     {
//         title: "Introduction to Biology",
//         numberOfQuestions: 56,
//         compeletedQuestion: 24,
//     },
//     {
//         title: "Basics of Chemistry",
//         numberOfQuestions: 40,
//         compeletedQuestion: 18,
//     },
//     {
//         title: "Fundamentals of Physics",
//         numberOfQuestions: 50,
//         compeletedQuestion: 25,
//     },
//     {
//         title: "Introduction to Computer Science",
//         numberOfQuestions: 60,
//         compeletedQuestion: 54,
//     },
//     {
//         title: "Decrete Mathematic",
//         numberOfQuestions: 160,
//         compeletedQuestion: 14,
//     },
// ]);

const schedule_data = ref([
    {
        title: "Science Mid-term Quiz",
        class: "SC101",
        date: "06/26/2025 10:00 AM",
    },
    {
        title: "Math Final Exam",
        class: "MA201",
        date: "06/27/2025 01:30 PM",
    },
    {
        title: "History Pop Quiz",
        class: "HI102",
        date: "06/28/2025 09:00 AM",
    },
    {
        title: "English Literature Quiz",
        class: "EN110",
        date: "06/29/2025 11:15 AM",
    },
    {
        title: "Biology Practical Test",
        class: "BI205",
        date: "06/30/2025 02:45 PM",
    },
    {
        title: "Computer Science Assessment",
        class: "CS150",
        date: "07/01/2025 10:00 AM",
    },
]);
//#endregion

//#region calculate UI
const getPercentageComplete = (total: number, completed: number) => {
    return Math.floor((completed / total) * 100);
};

const getCaculatedDateString = (date: string) => {
    const diff = dayjs(date).startOf("day").diff(dayjs().startOf("day"), "days");

    if (diff >= 2) {
        return dayjs(date).format("DD/MM/YYYY - HH:mm");
    } else if (diff === 1) {
        return t("dashboards.list_items.schedule.tomorrow") + " - " + dayjs(date).format("HH:mm");
    } else if (diff === 0) {
        return t("dashboards.list_items.schedule.today") + " - " + dayjs(date).format("HH:mm");
    } else {
        return dayjs(date).format("DD/MM/YYYY - HH:mm");
    }
};

const getScheduleItemMeta = (date: string) => {
    const diff = dayjs(date).startOf("day").diff(dayjs().startOf("day"), "days");

    const tag =
        diff === 0
            ? t("dashboards.list_items.schedule.today")
            : diff >= 1
              ? t("dashboards.list_items.schedule.upcoming")
              : "";

    return {
        date,
        tag,
        border: {
            borderColor: tag === t("dashboards.list_items.schedule.today") ? "#58181c" : "#153450",
        },
        color: tag === t("dashboards.list_items.schedule.today") ? "error" : "processing",
    };
};
//#endregion

//#region search bar
type SearchResult = {
    id: string;
    name: string;
    numberOfQuestions: number;
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
});
</script>

<template>
    <div class="page-container">
        <div class="title-container">
            <a-row class="w-100">
                <a-col class="main-title" :span="20">
                    <span>{{ $t("dashboards.title") }}</span> <br />
                    <span>{{ $t("dashboards.sub_title", { username: "NguyenTanDuc" }) }}</span>
                </a-col>
            </a-row>
        </div>
        <div class="content">
            <div class="search-bar" ref="searchResultRef">
                <Input
                    @input="getSearchData"
                    v-model="searchPageParams.name"
                    :placeholder="t('class_index.other.search_class_placeholder')"
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
                                    {{ item.numberOfQuestions }}
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
                <div class="quiz-container">
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
                            <span>{{ $t("dashboards.list_items.quiz.learningProgress") }}</span>
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
                    <RouterLink :to="{}" class="content-item-navigator">
                        <span>{{ $t("dashboards.buttons.viewAll") }}</span>
                        <i class="bx bx-chevron-right"></i>
                    </RouterLink>
                </div>
                <div class="schedule-container">
                    <div class="schedule-item" v-for="schedule in schedule_data">
                        <i class="bx bx-calendar-alt schedule-item-icon"></i>
                        <div>
                            <div class="schedule-item-info">
                                <span>{{ schedule.title }}</span>
                                <a-tag
                                    :style="[
                                        'background: transparent',
                                        getScheduleItemMeta(schedule.date).border,
                                    ]"
                                    :color="getScheduleItemMeta(schedule.date).color"
                                >
                                    {{ getScheduleItemMeta(schedule.date).tag }}
                                </a-tag>
                            </div>
                            <div class="schedule-item-date">
                                <i class="bx bx-time-five"></i>
                                {{ getCaculatedDateString(schedule.date) }}
                            </div>
                        </div>
                        <div class="schedule-item-actions">
                            <a-button type="primary">
                                {{ $t("dashboards.buttons.view") }}
                            </a-button>
                        </div>
                    </div>
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
    align-items: center;
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

.schedule-container {
    border-radius: 8px;
    border-top: 1px solid var(--border-color);
    max-height: 300px;
    overflow-y: scroll;
    margin-top: 10px;
}
.schedule-container::-webkit-scrollbar {
    width: 10px;
    margin: 5px 0;
}

.schedule-container::-webkit-scrollbar-track {
    background: var(--background-color);
    border-radius: 10px;
}

.schedule-container::-webkit-scrollbar-thumb {
    border-radius: 10px;
    background: linear-gradient(
        to bottom,
        var(--background-sub-color1),
        var(--background-sub-color2)
    );
    border: 1px solid var(--background-color);
}

.schedule-item {
    background-color: var(--content-item-children-background-color);
    margin: 10px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 10px;
    display: flex;
    width: calc(100% - 50px);
    align-items: center;
    cursor: pointer;
}
.schedule-item:hover {
    border: 1px solid var(--main-sub-color);
}

.schedule-item-icon {
    display: flex;
    width: 30px;
    height: 30px;
    justify-content: center;
    align-items: center;
    flex-shrink: 0;
    aspect-ratio: 1/1;
    font-size: 18px;
    border-radius: 50%;
    background-color: #183826;
    color: #16a34a;
    margin-right: 12px;
}

.schedule-item-info {
    color: var(--text-color);
    font-size: 16px;
    font-weight: 600;
}
.schedule-item-info span {
    margin-right: 20px;
}

.schedule-item-date {
    display: flex;
    align-items: center;
    color: var(--text-color-sub-white);
    font-size: 14px;
    font-weight: 400;
}
.schedule-item-date i {
    font-size: 16px;
    margin-right: 5px;
}

.schedule-item-actions {
    flex: 1;
    display: flex;
    justify-content: end;
}
.schedule-item-actions button {
    background-color: var(--main-color);
}

.schedule-item-actions button:hover {
    background-color: var(--main-sub-color);
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
</style>
