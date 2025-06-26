<script setup>
import {ref, onMounted} from "vue";
import dayjs from "dayjs";
import {useI18n} from "vue-i18n";
const {t} = useI18n();

const quiz_data = ref([
    {
        title: "Introduction to Biology",
        numberOfQuestions: 56,
        compeletedQuestion: 24,
    },
    {
        title: "Basics of Chemistry",
        numberOfQuestions: 40,
        compeletedQuestion: 18,
    },
    {
        title: "Fundamentals of Physics",
        numberOfQuestions: 50,
        compeletedQuestion: 25,
    },
    {
        title: "Introduction to Computer Science",
        numberOfQuestions: 60,
        compeletedQuestion: 54,
    },
    {
        title: "Decrete Mathematic",
        numberOfQuestions: 160,
        compeletedQuestion: 14,
    },
]);

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

const getCaculatedDateString = (date) => {
    const diff = dayjs(date).startOf("day").diff(dayjs().startOf("day"), "days");

    if (diff >= 2) {
        return dayjs(date).format("DD/MM/YYYY - HH:mm");
    } else if (diff === 1) {
        return t("dashboards.list_items.schedule.tomorrow");
    } else if (diff === 0) {
        return t("dashboards.list_items.schedule.today") + " - " + dayjs(date).format("HH:mm");
    } else {
        return dayjs(date).format("DD/MM/YYYY - HH:mm");
    }
};

const getTag = (date) => {
    const diff = dayjs(date).startOf("day").diff(dayjs().startOf("day"), "days");
    if (diff === 0) {
        return t("dashboards.list_items.schedule.today");
    } else if (diff > 0) {
        return t("dashboards.list_items.schedule.upcoming");
    }
    return "Past";
};

const getPercentageComplete = (total, completed) => {
    return Math.floor((completed / total) * 100);
};

const getScheduleTagBorderColor = (date) => {
    return {
        borderColor:
            getTag(date) === t("dashboards.list_items.schedule.today") ? "#58181c" : "#153450",
    };
};

const getScheduleColor = (date) => {
    return getTag(date) === t("dashboards.list_items.schedule.today") ? "error" : "processing";
};
</script>

<template>
    <div class="page-container">
        <div class="title-container">
            <a-row class="w-100">
                <a-col class="main-title" :span="20">
                    <span>{{ $t("dashboards.title") }}</span> <br />
                    <span>{{ $t("dashboards.sub_title", {username: "NguyenTanDuc"}) }}</span>
                </a-col>
                <!-- <a-col class="title-button" :span="4">
                    <button>
                        <i class="bx bx-plus"></i> {{ $t("dashboards.buttons.createNewQuiz") }}
                    </button>
                </a-col> -->
            </a-row>
        </div>
        <div class="content">
            <div class="content-item">
                <div class="content-item-title">
                    <div>
                        <span>{{ $t("dashboards.sections.quiz.title") }}</span>
                        <span>{{ $t("dashboards.sections.quiz.sub_title") }}</span>
                    </div>
                    <RouterLink :to="{}" class="content-item-navigator">
                        <span>{{ $t("dashboards.buttons.viewAll") }}</span>
                        <i class="bx bx-chevron-right"></i>
                    </RouterLink>
                </div>
                <div class="quiz-container">
                    <div class="quiz-item" v-for="quiz in quiz_data">
                        <div class="quiz-item-title">
                            {{ quiz.title }} <i class="bx bx-chevron-right"></i>
                        </div>
                        <div class="quiz-item-info">
                            <i class="bx bx-message-square-edit bx-rotate-270"></i>
                            {{ quiz.numberOfQuestions }}
                            {{ $t("dashboards.list_items.quiz.questions") }}
                        </div>
                        <div class="quiz-item-progress">
                            <span>{{ $t("dashboards.list_items.quiz.learningProgress") }}</span>
                            <a-progress
                                stroke-color="#7C3AED"
                                :percent="
                                    getPercentageComplete(
                                        quiz.numberOfQuestions,
                                        quiz.compeletedQuestion,
                                    )
                                "
                                status="active"
                            />
                        </div>
                    </div>
                    <div class="quiz-item add-button">
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
                                        getScheduleTagBorderColor(schedule.date),
                                    ]"
                                    :color="getScheduleColor(schedule.date)"
                                >
                                    {{ getTag(schedule.date) }}
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
.page-container {
    width: calc(100% - 30px);
    margin-left: 30px;
    overflow-x: hidden;
}

.content {
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.content-item {
    width: calc(100% - 60px);
    margin: 8px;
    padding: 10px;
    background-color: #151518;
    border: 1px solid #27272a;
    color: var(--text-color-white);
    border-radius: 8px;
    overflow-y: hidden;
}

.title-container {
    width: 100%;
    color: var(--text-color-white);
    line-height: normal;
    font-style: normal;
    letter-spacing: -0.293px;
    margin: 15px;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.main-title span:nth-child(1) {
    font-size: 24px;
    font-weight: 600;
}
.main-title span:nth-child(3) {
    color: #a1a1aa;
    font-size: 16px;
    font-weight: 400;
}
/* .title-button button {
    display: flex;
    justify-content: center;
    align-items: center;

    background-color: var(--main-sub-color);
    color: var(--text-color-white);
    padding: 8px 10px;
    border: none;
    border-radius: 5px;
    font-size: 16px;
    font-weight: 500;
    transition: all 0.3s ease-in-out;
}
.title-button button:hover {
    background-color: var(--main-color);
}

.title-button i {
    font-size: 20px;
    margin-right: 5px;
} */

.content-item-title {
    width: 100%;
    color: var(--text-color-white);
    font-size: 24px;
    font-style: normal;
    font-weight: 700;
    line-height: normal;
    display: flex;
    justify-content: space-between;
}
.content-item-title div {
    display: flex;
    flex-direction: column;
}

.content-item-title span:nth-child(2) {
    color: #a1a1aa;
    font-size: 16px;
    font-weight: 400;
}
.content-item-title a {
    font-size: 14px;
    color: var(--text-color-white);
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
    padding: 10px;
    display: flex;
    flex-wrap: wrap;
    color: var(--text-color-white);
}

.quiz-item {
    background-color: #19191b;
    margin: 10px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 10px;
    display: flex;
    flex-direction: column;
    width: calc(100% / 3 - 50px);
    cursor: pointer;
}

.quiz-item:hover {
    border: 1px solid var(--main-sub-color);
}

.quiz-item i {
    font-size: 18px;
}
.quiz-item-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 5px 0px;
}

.quiz-item-info {
    font-size: 14px;
    margin-bottom: 15px;
    color: #a1a1aa;
}
.quiz-item-info i {
    font-size: 14px;
}

.quiz-item-progress {
    font-size: 12px;
    margin-bottom: 0;
}

::v-deep(.ant-progress-text) {
    color: var(--text-color-white) !important;
}
::v-deep(.ant-progress-inner) {
    background-color: #27272a;
}

.add-button {
    display: flex;
    align-items: center;
    border: 1px dashed rgba(255, 255, 255, 0.1);
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
    color: var(--text-color-white);
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
    border-top: 1px solid rgba(255, 255, 255, 0.1);
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
    background-color: #19191b;
    margin: 10px;
    border: 1px solid rgba(255, 255, 255, 0.1);
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
    color: var(--text-color-white);
    font-size: 16px;
    font-weight: 600;
}
.schedule-item-info span {
    margin-right: 20px;
}

.schedule-item-date {
    display: flex;
    align-items: center;
    color: #ccc;
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
    background-color: var(--main-sub-color);
}

.schedule-item-actions button:hover {
    background-color: var(--main-color);
}
</style>
