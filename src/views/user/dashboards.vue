<script setup>
import {ref, onMounted} from "vue";
import dayjs from "dayjs";

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
        date: "06/25/2025 10:00 AM",
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
        return "Tomorrow";
    } else if (diff === 0) {
        return "Today - " + dayjs(date).format("HH:mm");
    } else {
        return dayjs(date).format("DD/MM/YYYY - HH:mm");
    }
};

const getTag = (date) => {
    const diff = dayjs(date).startOf("day").diff(dayjs().startOf("day"), "days");
    if (diff === 0) {
        return "Today";
    } else if (diff > 0) {
        return "Upcoming";
    }
    return "Past";
};

const getPercentageComplete = (noq, completed) => {
    return Math.floor((completed / noq) * 100);
};
</script>

<template>
    <div class="page-container">
        <div class="title-container">
            <a-row class="w-100">
                <a-col class="main-title" :span="20">
                    <span>Dashboard</span> <br />
                    <span>Welcome back, {username} Here's what's happening with your quizzes</span>
                </a-col>
                <a-col class="title-button" :span="4">
                    <button><i class="bx bx-plus"></i> Create New Set</button>
                </a-col>
            </a-row>
        </div>
        <div class="content">
            <div class="content-item">
                <div class="content-item-title">
                    <span>Recent Quizzes</span>
                    <span>Your recently activities</span>
                </div>
                <div class="quiz-container">
                    <div class="quiz-item" v-for="quiz in quiz_data">
                        <div class="quiz-item-title">
                            {{ quiz.title }} <i class="bx bx-chevron-right"></i>
                        </div>
                        <div class="quiz-item-info">
                            <i class="bx bx-message-square-edit bx-rotate-270"></i>
                            {{ quiz.numberOfQuestions }} questions
                        </div>
                        <div class="quiz-item-progress">
                            <span>Learning progress</span>
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
                            <span>Create New Quiz</span>
                            <span>Add questions, set time limits and more</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="content-item">
                <div class="content-item-title">
                    <span>Up comming activities</span>
                    <span>Assignment and test schedules</span>
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
                                        getTag(schedule.date) === 'Today'
                                            ? 'border-color: #58181c'
                                            : 'border-color: #153450',
                                    ]"
                                    :color="
                                        getTag(schedule.date) === 'Today' ? 'error' : 'processing'
                                    "
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
                            <a-button type="primary">View</a-button>
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
.title-button button {
    background-color: var(--main-sub-color);
    color: var(--text-color-white);
    align-items: center;
    display: flex;
    padding: 8px 10px;
    border: none;
    border-radius: 5px;
    justify-content: space-between;
    align-items: center;
    font-size: 16px;
    font-weight: 500;
    transition: all 0.3s ease-in-out;
}
.title-button button:hover {
    background-color: var(--main-color);
}

.title-button i {
    font-size: 20px;
    margin-right: 0px;
}

.content-item-title {
    color: var(--text-color-white);
    font-size: 24px;
    font-style: normal;
    font-weight: 700;
    line-height: normal;
    display: flex;
    flex-direction: column;
}

.content-item-title span:nth-child(2) {
    color: #a1a1aa;
    font-size: 16px;
    font-weight: 400;
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
    width: 30px;
    height: 30px;
    justify-content: center;
    align-items: center;
    flex-shrink: 0;
    aspect-ratio: 1/1;
    font-size: 20px;
    border-radius: 50%;
    background: #261544;
    color: #5c00ff;
}

.add-button-context {
    color: var(--text-color-white);
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
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
