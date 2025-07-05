<script setup>
import { onMounted, ref, computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import { DownOutlined } from "@ant-design/icons-vue";
import Input from "@/shared/components/Common/Input.vue";

const { t } = useI18n();

const emit = defineEmits(["updateSidebar"]);

const getPercentageComplete = (total, completed) => {
    return Math.floor((completed / total) * 100);
};

const getTagColor = (visibility) => {
    return t("question_sets_index.visibility.public") === visibility ? "#22C55E" : "#C52225";
};

const getTag = (visibility) => {
    return t("question_sets_index.visibility.public") === visibility
        ? t("question_sets_index.visibility.public")
        : t("question_sets_index.visibility.private");
};

const quiz_data = ref([]);

const quiz_data_raw = ref([
    {
        title: "Introduction to Biology",
        numberOfQuestions: 56,
        compeletedQuestion: 24,
        createdBy: "me",
        visibility: "Private",
    },
    {
        title: "Fundamental programming",
        numberOfQuestions: 76,
        compeletedQuestion: 0,
        createdBy: "qwerty",
        visibility: "Public",
    },
    {
        title: "World History Basics",
        numberOfQuestions: 40,
        compeletedQuestion: 15,
        createdBy: "historyFan99",
        visibility: "Public",
    },
    {
        title: "Advanced Mathematics",
        numberOfQuestions: 100,
        compeletedQuestion: 88,
        createdBy: "mathMaster",
        visibility: "Private",
    },
    {
        title: "Chemistry 101",
        numberOfQuestions: 50,
        compeletedQuestion: 25,
        createdBy: "me",
        visibility: "Private",
    },
    {
        title: "English Grammar Essentials",
        numberOfQuestions: 30,
        compeletedQuestion: 10,
        createdBy: "teacherJane",
        visibility: "Public",
    },
    {
        title: "Introduction to Psychology",
        numberOfQuestions: 60,
        compeletedQuestion: 0,
        createdBy: "qwerty",
        visibility: "Private",
    },
]);

const optionKeys = ["all", "createdByMe", "sharedWithMe"];

const quiz_credit_options = computed(() =>
    optionKeys.map((key) => ({
        label: t(`question_sets_index.credit.${key}`),
        value: key,
    })),
);

const searchValue = ref("");
const selected_credit_option = ref(quiz_credit_options.value[0]);

const onFilter = () => {
    const filtered_data = quiz_data_raw.value.filter((quiz) => {
        const matchesSearch = quiz.title.toLowerCase().includes(searchValue.value.toLowerCase());

        if (!matchesSearch) return false;

        switch (selected_credit_option.value) {
            case "createdByMe":
                return quiz.createdBy === "me";
            case "sharedWithMe":
                return quiz.createdBy !== "me";
            default:
                return true;
        }
    });

    quiz_data.value = filtered_data;
};

onMounted(() => {
    const sidebarActiveItem = "library";
    emit("updateSidebar", sidebarActiveItem);
    quiz_data.value = quiz_data_raw.value;
});
</script>
<template>
    <div class="page-container">
        <div class="title-container">
            <a-row class="w-100">
                <a-col class="main-title" :span="20">
                    <span>{{ $t("question_sets_index.title") }}</span> <br />
                    <span>
                        {{ $t("question_sets_index.sub_title") }}
                    </span>
                </a-col>
            </a-row>
        </div>
        <div class="content">
            <div class="content-item">
                <div class="content-item-title">
                    <div>
                        <span>{{ $t("question_sets_index.sections.quiz.title") }}</span>
                        <span>{{ $t("question_sets_index.sections.quiz.sub_title") }}</span>
                    </div>

                    <RouterLink class="content-item-button" :to="{ name: 'User_QuestionSet_Create' }">
                        {{ $t("dashboards.buttons.createNewQuiz") }}
                        <i class="bx bx-plus"></i>
                    </RouterLink>
                </div>
                <div class="content-item-functions">
                    <div class="content-item-navigators">
                        <div class="navigator-container">
                            <RouterLink class="navigator-item active" :t="{ name: '' }">
                                {{ $t("question_sets_index.navigators.quiz") }}
                            </RouterLink>
                            <RouterLink class="navigator-item" :t="{ name: '' }">
                                {{ $t("question_sets_index.navigators.test") }}
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
                <div v-if="quiz_data.length > 0" class="quiz-item-container">
                    <div class="quiz-item" v-for="quiz in quiz_data">
                        <i class="bx bx-book-open quiz-item-icon"></i>
                        <div>
                            <div class="quiz-item-title">
                                {{ quiz.title }}
                            </div>
                            <div class="quiz-item-info">
                                <div>
                                    <i class="bx bx-message-square-edit bx-rotate-270"></i>
                                    {{ quiz.numberOfQuestions }}
                                    {{ $t("dashboards.list_items.quiz.questions") }}
                                </div>
                                <div class="quiz-item-progress">
                                    <a-progress
                                        stroke-color="#7C3AED"
                                        status="active"
                                        :percent="
                                            getPercentageComplete(
                                                quiz.numberOfQuestions,
                                                quiz.compeletedQuestion,
                                            )
                                        "
                                    />
                                </div>
                            </div>
                            <div class="quiz-item-credit">
                                <a-tag :color="getTagColor(quiz.visibility)">
                                    {{ getTag(quiz.visibility) }}
                                </a-tag>
                                <span>
                                    |
                                    {{
                                        $t("question_sets_index.credit.createdBy", {
                                            user: quiz.createdBy,
                                        })
                                    }}
                                </span>
                            </div>
                        </div>
                        <div class="quiz-item-actions">
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
                <a-empty v-else>
                    <template #description>
                        <span>{{ $t("question_sets_index.empty_description") }}</span>
                    </template>
                </a-empty>
            </div>
        </div>
    </div>
</template>
<style scoped>
.content-item {
    width: 100%;
    overflow-y: hidden;
}

.content-item-button {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--main-color);
    border: none;
    border-radius: 5px;
    padding: 8px 10px;
    font-size: 16px;
    color: var(--text-color);
    transition: all 0.2s ease-in-out;
    margin-right: 20px;
    height: 40px;
    text-decoration: none;
}

.content-item-button:hover {
    background-color: var(--main-sub-color);
}

.content-item-button i {
    font-size: 24px;
    margin-left: 10px;
    transform: translateY(1px);
}

.quiz-container {
    padding: 10px;
    display: flex;
    flex-wrap: wrap;
    color: var(--text-color);
}

.quiz-item {
    background-color: var(--content-item-children-background-color);
    margin: 10px 0px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 10px;
    display: flex;
    align-items: center;
    width: calc(100% - 50px);
    cursor: pointer;
}

.quiz-item:hover {
    border: 1px solid var(--main-color);
}

.quiz-item i {
    font-size: 18px;
}

.quiz-item-icon {
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

.quiz-item-title {
    font-size: 16px;
    font-weight: 600;
}

.quiz-item-info {
    font-size: 14px;
    color: var(--text-color-sub-white);
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 3px 0px;
}
.quiz-item-info i {
    font-size: 14px;
}

.quiz-item-progress {
    font-size: 12px;
    margin-bottom: 0 !important;
    min-width: 250px;
    margin-left: 10px;
}
.quiz-item-credit {
    color: var(--text-color-sub-white);
    font-size: 12px;
    font-weight: 400;
    display: flex;
    align-items: center;
}

.quiz-item-actions {
    flex: 1;
    display: flex;
    justify-content: end;
    align-items: center;
}
.quiz-item-actions button {
    background-color: var(--main-color);
}

.quiz-item-actions button:hover {
    background-color: var(--main-color);
}

::v-deep(.ant-progress) {
    margin: 0 !important;
}

::v-deep(.ant-progress-text) {
    color: var(--text-color) !important;
}
::v-deep(.ant-progress-inner) {
    background-color: #27272a;
}
::v-deep(.ant-tag) {
    font-size: 14px !important;
    font-weight: 500 !important;
}

.ant-dropdown-link {
    padding: 6px;
    border-radius: 8px;
    border: 1px solid var(--border-color);
}

.drop-down-container {
    background: #101010 !important;
    border: 1px solid var(--main-color);
}

::v-deep(.ant-dropdown-menu-item) {
    color: var(--text-color) !important;
    font-weight: 400 !important;
}

::v-deep(.ant-dropdown-menu-item):last-child {
    color: red !important;
}

::v-deep(.ant-dropdown-menu-item) i {
    margin-right: 5px;
}

::v-deep(.ant-dropdown-menu-item):hover {
    background-color: var(--main-color) !important;
    color: var(--text-color) !important;
}

::v-deep(.ant-dropdown-menu-item):last-child:hover {
    color: red !important;
    background-color: #2a1215 !important;
}

.content-item-functions {
    margin: 10px 0px;
    display: flex;
    align-items: end;
    justify-content: end;
    margin-right: 50px;
}

::v-deep(.ant-select) {
    margin-right: 10px !important;
}

::v-deep(.ant-select-selector) {
    height: 35px !important;
}

.content-item-navigators {
    flex: 1;
    justify-content: start;
    display: flex;
}
.navigator-container {
    height: 40px;
    border-radius: 8px;
    background-color: var(--content-item-children-background-color);
    border: 1px solid var(--content-item-border-color);
    display: flex;
}
.navigator-item {
    color: var(--text-color);
    text-decoration: none;
    height: 100%;
    width: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
}
.navigator-item:first-child {
    border-top-left-radius: 8px;
    border-bottom-left-radius: 8px;
    margin-right: 2px;
}

.navigator-item:last-child {
    border-top-right-radius: 8px;
    border-bottom-right-radius: 8px;
}

.navigator-item:hover {
    background-color: var(--main-color);
}

.active {
    background-color: var(--main-color);
}
</style>
