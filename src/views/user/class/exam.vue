<script setup lang="ts">
import ApiClass from "@/api/ApiClass";
import CLASS_SHARE_MODE from "@/constants/classShareMode";

import { ref, onMounted, reactive, computed, onUpdated } from "vue";
import { useI18n } from "vue-i18n";
import dayjs from "dayjs";

import { useRoute, useRouter } from "vue-router";

import Input from "@/shared/components/Common/Input.vue";

const route = useRoute();
const router = useRouter();

const { t } = useI18n();
const emit = defineEmits(["updateSidebar"]);

const exam_data = [
    {
        testId: "123123123",
        name: "Assignment 1",
        numberOfQuestions: 25,
        timeLimit: 30,
        relativeTime: 800,
        numberOfCompletion: 30,
        status: "active",
        date: "2025-07-13T20:00:00.000Z",
    },
    {
        testId: "234234234",
        name: "Quiz 1",
        numberOfQuestions: 10,
        timeLimit: 15,
        relativeTime: 240,
        numberOfCompletion: 10,
        status: "upcoming",
        date: "2025-07-07T20:00:00.000Z",
    },
    {
        testId: "345345345",
        name: "Midterm Exam",
        numberOfQuestions: 40,
        timeLimit: 60,
        relativeTime: 26,
        numberOfCompletion: 25,
        status: "completed",
        date: "2025-07-16T10:00:00.000Z",
    },
    {
        testId: "456456456",
        name: "Final Exam",
        numberOfQuestions: 50,
        timeLimit: 90,
        relativeTime: 24,
        numberOfCompletion: 0,
        status: "upcoming",
        date: "2025-07-16T12:00:00.000Z",
    },
    {
        testId: "567567567",
        name: "Assignment 2",
        numberOfQuestions: 20,
        timeLimit: 25,
        relativeTime: 500,
        numberOfCompletion: 15,
        status: "active",
        date: "2025-06-26T04:00:00.000Z",
    },
    {
        testId: "678678678",
        name: "Pop Quiz",
        numberOfQuestions: 5,
        timeLimit: 50,
        relativeTime: 9000,
        numberOfCompletion: 5,
        status: "completed",
        date: "2024-12-29T12:00:00.000Z",
    },
];

const getFormattedRelativeTime = (hoursAgo: number) => {
    if (hoursAgo < 24) {
        return `${hoursAgo} hour${hoursAgo !== 1 ? "s" : ""} ago`;
    } else if (hoursAgo < 24 * 7) {
        const days = Math.floor(hoursAgo / 24);
        return `${days} day${days !== 1 ? "s" : ""} ago`;
    } else if (hoursAgo < 24 * 30) {
        const weeks = Math.floor(hoursAgo / (24 * 7));
        return `${weeks} week${weeks !== 1 ? "s" : ""} ago`;
    } else if (hoursAgo < 24 * 365) {
        const months = Math.floor(hoursAgo / (24 * 30));
        return `${months} month${months !== 1 ? "s" : ""} ago`;
    } else {
        const years = Math.floor(hoursAgo / (24 * 365));
        return `${years} year${years !== 1 ? "s" : ""} ago`;
    }
};

const getTagColor = (status: string) => {
    switch (status.toLowerCase()) {
        case "completed": {
            return "#3b82f6";
        }
        case "active": {
            return "#22C55E";
        }
        case "upcoming": {
            return "#f59e0b";
        }
    }
};

const optionKeys = ["all", "createdByMe", "sharedWithMe"];

const quiz_credit_options = computed(() =>
    optionKeys.map((key) => ({
        label: t(`question_sets_index.credit.${key}`),
        value: key,
    })),
);

const searchValue = ref("");
const selected_credit_option = ref();

const onFilter = () => {};

onMounted(() => {
    const sidebarActiveItem = "class";
    emit("updateSidebar", sidebarActiveItem);
});
</script>
<template>
    <div class="page-container">
        <div class="title-container">
            <div class="breadcrumb-container">
                <ul>
                    <li class="title-breadcrumb-item">
                        <RouterLink :to="{ name: 'User_Class' }">
                            <span> Class </span>
                        </RouterLink>
                        <i class="bx bx-chevron-right"></i>
                    </li>
                    <li class="title-breadcrumb-item">
                        <RouterLink :to="{ name: '' }" class="breadcrumb-item-class">
                            <span> SEP490 </span>
                            <span class="breadcrumb-item-topic"> Capstone project </span>
                        </RouterLink>
                    </li>
                </ul>
            </div>
        </div>
        <div class="content">
            <div class="content-item">
                <div class="content-item-title">
                    <div>
                        <span>Exam</span>
                        <span>View and manage exams in your class</span>
                    </div>

                    <a-button class="main-color-btn" type="primary" size="large">
                        <i class="me-2 bx bx-list-plus"></i>
                        Assign test
                    </a-button>
                </div>
                <div class="content-item-functions">
                    <div class="content-item-navigators">
                        <div class="navigator-container">
                            <RouterLink class="navigator-item navigator-active" :to="{ name: '' }">
                                Exam
                            </RouterLink>
                            <RouterLink class="navigator-item" :to="{ name: 'User_Class_Quiz' }">
                                Quiz
                            </RouterLink>
                            <RouterLink class="navigator-item" :to="{ name: 'User_Class_Student' }">
                                Student
                            </RouterLink>
                        </div>
                    </div>
                    <a-select
                        v-model:value="selected_credit_option"
                        style="width: 200px"
                        @change="onFilter"
                    >
                        <a-select-option
                            v-for="option in quiz_credit_options"
                            :value="option.value"
                        >
                            {{ option.label }}
                        </a-select-option>
                    </a-select>
                    <div style="width: 300px; padding: 0px">
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
                <div v-if="exam_data.length > 0" class="exam-item-container">
                    <div class="exam-item" v-for="exam in exam_data">
                        <i class="bx bx-book-open exam-item-icon"></i>
                        <div>
                            <div class="exam-item-title">
                                {{ exam.name }}
                                <a-tag :color="getTagColor(exam.status)">
                                    {{ exam.status }}
                                </a-tag>
                            </div>
                            <div class="exam-item-info exam-item-date">
                                <div>
                                    <i class="bx bx-calendar"></i>
                                    {{ dayjs(exam.date).format("DD/MM/YYYY HH:mm A") }}
                                </div>
                            </div>
                            <div class="exam-item-info exam-info-detail">
                                <div class="exam-item-questions">
                                    <i class="bx bx-message-square-edit bx-rotate-270"></i>
                                    {{ exam.numberOfQuestions }}
                                    {{ $t("dashboards.list_items.quiz.questions") }}
                                </div>
                                <div class="exam-item-time">
                                    <i class="bx bx-time-five"></i>
                                    {{ exam.timeLimit }}
                                    min
                                </div>
                                <span class="exam-item-assigned completion">
                                    {{ exam.numberOfCompletion }} completions
                                </span>
                                <span class="exam-item-assigned">
                                    Assigned {{ getFormattedRelativeTime(exam.relativeTime) }}
                                </span>
                            </div>
                        </div>
                        <div class="exam-item-actions">
                            <a-dropdown :trigger="['click']">
                                <i class="bx bx-dots-vertical-rounded ant-dropdown-link"></i>
                                <template #overlay>
                                    <a-menu class="drop-down-container">
                                        <a-menu-item key="0">
                                            <i class="bx bx-info-circle"></i>
                                            {{ $t("question_sets_index.buttons.detail") }}
                                        </a-menu-item>
                                        <a-menu-item key="1">
                                            <i class="bx bx-edit"></i>
                                            {{ $t("question_sets_index.buttons.edit") }}
                                        </a-menu-item>
                                        <a-menu-item key="2">
                                            <i class="bx bx-copy"></i>
                                            {{ $t("question_sets_index.buttons.dublicate") }}
                                        </a-menu-item>
                                        <a-menu-divider style="background-color: #ddd" />
                                        <a-menu-item key="3">
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
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped>
.breadcrumb-container li,
a {
    color: var(--text-color) !important;
    font-size: 24px !important;
}

.navigator-item {
    font-size: 14px !important;
}

.exam-item {
    background-color: var(--content-item-children-background-color);
    margin: 10px 0px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 10px;
    display: flex;
    align-items: center;
    cursor: pointer;
}

.exam-item:hover {
    border: 1px solid var(--main-color);
}

.exam-item i {
    font-size: 18px;
}

.exam-item-icon {
    display: flex;
    width: 35px;
    height: 35px;
    justify-content: center;
    align-items: center;
    flex-shrink: 0;
    aspect-ratio: 1/1;
    font-size: 16px;
    border-radius: 50%;
    background: #221a32;
    color: #7c3aed;
    margin-right: 12px;
}

.exam-item-title {
    font-size: 18px;
    font-weight: 600;
}

.exam-item-info {
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.exam-item-info i {
    font-size: 14px;
}

.exam-item-date {
    font-size: 14px;
    color: #ccc;
}
.exam-info-detail {
    border-top: 1px solid var(--border-color);
    margin-top: 5px;
    padding-top: 5px;
}

.exam-item-time {
    margin: 0px 20px;
}

.exam-item-assigned {
    color: var(--text-color-grey);
}

.exam-item-assigned.completion {
    margin-right: 10px;
}

.exam-item-actions {
    flex: 1;
    display: flex;
    justify-content: end;
    align-items: center;
}
</style>
