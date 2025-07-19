<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

import { message } from "ant-design-vue";
import { useI18n } from "vue-i18n";
import Input from "@/shared/components/Common/Input.vue";

import type { Question } from "@/models/request/question";
import QUESTION_TYPE from "@/constants/questionTypes";

const { t } = useI18n();

const route = useRoute();
const router = useRouter();

const quiz = ref({
    id: "123456",
    title: "Introduction to Biology",
    description: "Basic knowledges about generic, biologic, and so on ...",
    rating: {
        value: 5.0,
        reviews: 15,
    },
    tags: [
        { id: 1, content: "Scienece" },
        { id: 2, content: "Basic knowledge" },
        { id: 3, content: "Biology" },
        { id: 4, content: "ToLearn" },
    ],
    questions: [
        {
            id: "q1",
            type: "MultipleChoice",
            questionText: "What is the capital of France ?",
            questionHTML: `<p><strong>What</strong> is <br/> the <em>capital</em> of <u>France</u>? <code>// geography</code></p>`,
            explainText: "Paris is the capital city of France.",
            score: 1,
            multipleChoices: [
                { id: "1", text: "Paris", isAnswer: true },
                { id: "2", text: "London", isAnswer: false },
                { id: "3", text: "Berlin", isAnswer: false },
            ],
            matchingPairs: [],
            orderingItems: [],
            shortAnswer: "",
        },
        {
            id: "q2",
            type: "Matching",
            questionText: "Match the countries to their capitals.",
            questionHTML: `<p><u>Match</u> the <strong>countries</strong> to their <em>capitals</em>. <code>// matching task</code></p>`,
            explainText: "Each country must be paired with its capital.",
            score: 2,
            multipleChoices: [],
            matchingPairs: [
                { id: "1", leftItem: "Japan", rightItem: "Tokyo" },
                { id: "2", leftItem: "Italy", rightItem: "Rome" },
                { id: "3", leftItem: "Vietnam", rightItem: "Hanoi" },
            ],
            orderingItems: [],
            shortAnswer: "",
        },
        {
            id: "q3",
            type: "Ordering",
            questionText: "Arrange the steps of the water cycle in the correct order.",
            questionHTML: `<p><strong>Arrange</strong> the steps of the <u>water cycle</u> in the <em>correct order</em>. <code>// science</code></p>`,
            explainText:
                "The correct order is: Evaporation → Condensation → Precipitation → Collection.",
            score: 2,
            multipleChoices: [],
            matchingPairs: [],
            orderingItems: [
                { id: "1", text: "Evaporation", correctOrder: 1 },
                { id: "2", text: "Condensation", correctOrder: 2 },
                { id: "3", text: "Precipitation", correctOrder: 3 },
                { id: "4", text: "Collection", correctOrder: 4 },
            ],
            shortAnswer: "",
        },
        {
            id: "q4",
            type: "ShortText",
            questionText: "What is the chemical symbol for water?",
            questionHTML: `<p><em>What</em> is the chemical <strong>symbol</strong> for <u>water</u>? <code>H2O</code></p>`,
            explainText: "H2O is the formula for water.",
            score: 1,
            multipleChoices: [],
            matchingPairs: [],
            orderingItems: [],
            shortAnswer: "H2O",
        },
        {
            id: "q5",
            type: "MultipleChoice",
            questionText: "Which planet is known as the Red Planet?",
            questionHTML: `<p>Which <strong>planet</strong> is known as the <em>Red Planet</em>? <u>Mars</u> <pre><code>// astronomy</code></pre></p>`,
            explainText: "Mars is often called the Red Planet due to its reddish appearance.",
            score: 1,
            multipleChoices: [
                { id: "1", text: "Mars", isAnswer: true },
                { id: "2", text: "Venus", isAnswer: false },
                { id: "3", text: "Jupiter", isAnswer: false },
            ],
            matchingPairs: [],
            orderingItems: [],
            shortAnswer: "",
        },
    ],
    createdBy: {
        id: 1234,
        fullName: "NguyenTanDuc",
        image: "",
    },
    createdAt: "05/07/2025",
    isBookMarked: false,
});

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

const onAddBookMark = () => {
    quiz.value.isBookMarked = !quiz.value.isBookMarked;
};

//preview uploaded content
const toggleDisplayAnswer = (index: number, button: EventTarget) => {
    let $button = $(button);

    $button.toggleClass("bx-chevron-up bx-chevron-down");

    const answer = $(`#question-item-answer-${index}`);
    if (answer) $(answer).slideToggle();
};

const questionsToBeRendered = ref<Question[]>([]);
const onFilter = () => {
    const filteredQuestions = quiz.value.questions.filter((x) => {
        let matches = x.questionText.includes(searchValue.value.toLowerCase().trim());
        if (!matches) return false;

        switch (selected_type_option.value) {
            case QUESTION_TYPE.MULTIPLE_CHOICE: {
                return x.type === QUESTION_TYPE.MULTIPLE_CHOICE;
            }
            case QUESTION_TYPE.MATCHING: {
                return x.type === QUESTION_TYPE.MATCHING;
            }
            case QUESTION_TYPE.ORDERING: {
                return x.type === QUESTION_TYPE.ORDERING;
            }
            case QUESTION_TYPE.SHORT_TEXT: {
                return x.type === QUESTION_TYPE.SHORT_TEXT;
            }
            default: {
                return true;
            }
        }
    });
    questionsToBeRendered.value = filteredQuestions as Question[];
};

//share quiz
import ShareModal from "@/shared/modals/ShareModal.vue";
const shareModalRef = ref<InstanceType<typeof ShareModal> | null>(null);

const onOpenShareModal = () => {
    shareModalRef.value?.openModal();
};

const onRedirectToLearn = () => {
    router.push({ name: "User_QuestionSet_Learn", params: { id: quiz.value.id } });
};

const triggerPrint = () => {
    window.print();
};

onMounted(() => {
    //get api quiz + check visibility to current user
    //format url

    questionsToBeRendered.value = quiz.value.questions as Question[];
});
</script>
<template>
    <div class="content">
        <RouterLink class="navigator-back-link d-flex align-items-center p-2" :to="{ name: '' }">
            <i class="me-1 bx bx-chevron-left"></i>
            {{ $t("detail_QS.other.library") }}
        </RouterLink>
        <div class="content-item">
            <div class="content-item-title">
                <div>
                    <span>{{ quiz.title }}</span>
                    <span>{{ quiz.description }}</span>
                </div>
                <div class="d-flex flex-row align-items-center quiz-header-functions">
                    <i
                        :class="['bx', quiz.isBookMarked ? 'bxs-bookmark' : 'bx-bookmark']"
                        @click="onAddBookMark"
                    ></i>

                    <a-dropdown :trigger="['click']" :placement="'bottomRight'">
                        <i class="bx bx-dots-horizontal-rounded ant-dropdown-link"></i>
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
            <div class="quiz-info">
                <div class="quiz-rating">
                    {{ quiz.rating.value }} ⭐️ ({{ quiz.rating.reviews }}
                    {{ $t("detail_QS.other.reviews") }})
                </div>
                <div class="quiz-tag-container">
                    <div class="quiz-tag-item" v-for="tag in quiz.tags">
                        {{ tag.content }}
                    </div>
                </div>
            </div>
            <div class="quiz-credit">
                <div class="credit-user">
                    <img class="user-image" :src="quiz.createdBy.image" alt="" />
                    <div class="credit-user-info">
                        <span>
                            {{
                                $t("detail_QS.other.created_by", {
                                    username: quiz.createdBy.fullName,
                                })
                            }}
                        </span>
                        <span>{{ quiz.createdAt }}</span>
                    </div>
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
            <div class="action-container">
                <div class="action-item" @click="onRedirectToLearn">
                    {{ $t("detail_QS.buttons.learn") }}
                    <i class="bx bx-analyse"></i>
                </div>
                <div class="action-item">
                    {{ $t("detail_QS.buttons.test") }}
                    <i class="bx bx-detail"></i>
                </div>
                <div class="action-item">
                    {{ $t("detail_QS.buttons.assign_to_class") }}
                    <i class="bx bx-calendar-exclamation"></i>
                </div>
                <div class="action-item" @click="triggerPrint">
                    {{ $t("detail_QS.buttons.download") }}
                    <i class="bx bx-download"></i>
                </div>
            </div>
        </div>
        <div class="content-item">
            <div class="content-item-title">
                <div>
                    <span>{{
                        $t("detail_QS.other.questions", { number: quiz.questions.length })
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

            <div class="preview-question-container">
                <div
                    class="preview-question-item"
                    v-for="(question, index) in questionsToBeRendered"
                >
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

    <ShareModal ref="shareModalRef" />
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

.quiz-header-functions i:nth-child(1) {
    color: var(--main-color);
    margin-right: 20px;
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
    justify-content: space-between;
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
    font-weight: 500;
}

.action-container {
    display: flex;
    justify-content: space-between;
}

.action-item {
    flex: 1;
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
</style>
