<script setup lang="ts">
import ApiTest from "@/api/ApiTest";
import QUESTION_TYPE from "@/constants/questionTypes";
import TEST_STATUS from "@/constants/testStatus";
import type { RequestQuestion } from "@/models/request/question";
import type UserAnswerDTO from "@/models/response/test/userAnswerDTO";
import type { ResponseQuestion } from "@/models/response/question";

import Validator from "@/services/Validator";
import TransferQuestionData from "@/services/TransferQuestionData";
import TransferUserAnswerData from "@/services/TransferUserAnswerData";

import { ref, onMounted, computed } from "vue";

import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import dayjs from "dayjs";

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const loading = ref(false);

//#region sample
const reviewData = ref({
    attemptId: "",
    name: "",
    studentName: "NguyenTanDuc",
    timeStart: "",
    timeEnd: "",
    score: 0,
    status: "",
    questions: [],
});

//#endregion

//#region calculate UI

//preview uploaded content
const toggleDisplayAnswer = (index: number, button: EventTarget) => {
    let $button = $(button);

    $button.toggleClass("bx-chevron-up bx-chevron-down");

    const answer = $(`#question-item-answer-${index}`);
    if (answer) $(answer).slideToggle();
};

//calculate user answer
const getUserAnswerMultipleChoice = (questionId: string, userData: any[]) => {
    if (!userData) return [];
    const question = questionData.value.find((x: any) => x.id === questionId);
    if (!question) return [];

    const result =
        question.questionData.multipleChoice
            .filter((x: any) => userData.includes(x.id))
            .map((x: any) => ({
                id: x.id,
                text: x.text,
                isCorrect: x.isAnswer,
            })) ?? [];

    return result;
};

const getMatchingOption = (matchingData: any) => {
    if (!matchingData) return;

    const matchingPairs = matchingData.matches?.map((x: any) => ({
        leftItem: matchingData.leftItems.find((l: any) => l.id === x.leftId)?.text,
        rightItem: matchingData.rightItems.find((r: any) => r.id === x.rightId)?.text,
    }));

    return matchingPairs;
};

const getUserAnswerMatching = (questionId: string, userData: any) => {
    if (!userData) return [];
    const question = questionData.value.find((x: any) => x.id === questionId);
    if (!question) return [];

    const matches = question.questionData.matching.matches;
    const leftItems = question.questionData.matching.leftItems;
    const rightItems = question.questionData.matching.rightItems;

    const result =
        userData.map((x: any) => ({
            leftId: x.leftId,
            rightId: x.rightId,
            leftItem: leftItems.find((l: any) => l.id === x.leftId)?.text,
            rightItem: rightItems.find((r: any) => r.id === x.rightId)?.text,
            isCorrect: matches.some((m: any) => m.leftId === x.leftId && m.rightId === x.rightId),
        })) ?? [];

    return result;
};

const getUserAnswerOrdering = (questionId: string, userData: any) => {
    if (!userData) return [];
    const question = questionData.value.find((x: any) => x.id === questionId);
    if (!question) return [];

    const ordering = question.questionData.ordering;
    const result =
        userData.map((x: any) => ({
            itemId: x.itemId,
            order: x.order,
            text: ordering.find((o: any) => o.id === x.itemId)?.text,
            isCorrect: ordering.some((o: any) => o.id === x.itemId && o.correctOrder === x.order),
        })) ?? [];

    return result;
};

const getTagColor = (status: string) => {
    switch (status) {
        case TEST_STATUS.PASSED: {
            return "#22C55E";
        }
        case TEST_STATUS.FAILED: {
            return "#cd201f";
        }
        default: {
            return "#F59E0B";
        }
    }
};

//#endregion

const attemptId = ref<string>(route.params.id as string);

const questionData = ref<any>([]);

const getData = async () => {
    try {
        loading.value = true;

        if (!Validator.isValidGuid(attemptId.value)) {
            router.push({ name: "404" });
            return;
        }

        const result = await ApiTest.GetAttemptReview(attemptId.value);
        if (result.data.success) {
            reviewData.value = result.data.data;
        }
    } catch (error: any) {
        console.error("Error fetching review data:", error);
        if (error.response && !error.response.data.success) {
            router.push({ name: "404" });
        }
    } finally {
        loading.value = false;
    }
};
const emit = defineEmits(["updateSidebar"]);

onMounted(async () => {
    const sidebarActiveItem = "class";
    emit("updateSidebar", sidebarActiveItem);
    // questionData.value = reviewData.value.questions.map((x) => {
    //     const tranformedQuestion = TransferQuestionData.transformResponseToRequest({
    //         id: x.id,
    //         type: x.type as "ShortText" | "MultipleChoice" | "Matching" | "Ordering",
    //         questionSetId: "",
    //         textFormat: x.textFormat,
    //         questionText: x.questionText,
    //         explainText: "",
    //         score: x.score,
    //         scoreGraded: x.score,
    //         correctMultipleChoiceCount: 0,
    //         questionData: x.questionData,
    //     } as ResponseQuestion);

    //     return {
    //         ...tranformedQuestion,
    //         userAnswerDTO: x.userAnswerDataDto ?? null,
    //     };
    // });
    await getData();
    questionData.value = reviewData.value.questions;
});
</script>
<template>
    <div class="page-container">
        <div class="content-item">
            <div class="content-item-title">
                <span>Attempt info</span>
            </div>
            <div v-if="loading">
                <a-skeleton :loading="loading" active></a-skeleton>
                <a-skeleton :loading="loading" active></a-skeleton>
            </div>
            <template v-else>
                <a-row class="mb-2 d-flex align-items-center justify-content-between">
                    <a-col :span="12" class="test-info-item">
                        <div class="d-flex justify-content-between">
                            <span> Student name:</span>
                            <span>
                                {{ reviewData.studentName }}
                            </span>
                        </div>
                    </a-col>
                </a-row>
                <a-row class="mb-2 d-flex align-items-center justify-content-between">
                    <a-col :span="12" class="test-info-item">
                        <div class="d-flex justify-content-between">
                            <span> StartTime:</span>
                            <span>
                                {{ dayjs(reviewData.timeStart).format("DD/MM/YYYY HH:mm:ss A") }}
                            </span>
                        </div>
                        <div class="d-flex justify-content-between">
                            <span> EndTime:</span>
                            <span>
                                {{ dayjs(reviewData.timeEnd).format("DD/MM/YYYY HH:mm:ss A") }}
                            </span>
                        </div>
                    </a-col>
                </a-row>
                <a-row class="mb-2 d-flex align-items-center justify-content-between">
                    <a-col :span="12" class="test-info-item">
                        <div class="d-flex justify-content-between">
                            <span>Score:</span>
                            <span>
                                {{ reviewData.score }}
                            </span>
                        </div>
                    </a-col>
                </a-row>
                <a-row class="mb-2 d-flex align-items-center justify-content-between">
                    <a-col :span="12" class="test-info-item">
                        <div class="d-flex justify-content-between">
                            <span>Status:</span>
                            <a-tag :color="getTagColor(reviewData.status)">
                                {{ reviewData.status }}
                            </a-tag>
                        </div>
                    </a-col>
                </a-row>
            </template>
        </div>
        <div class="content-item">
            <div class="content-item-title">
                <div>
                    <span>{{
                        $t("detail_QS.other.questions", { number: questionData.length })
                    }}</span>
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
                <div class="preview-question-item" v-for="(question, index) in questionData">
                    <div class="d-flex align-items-center">
                        <div class="question-index">{{ index + 1 }}</div>
                    </div>
                    <div class="question-item-content">
                        <div class="d-flex align-items-center">
                            <div class="question-text" v-html="question.questionText"></div>
                        </div>
                        <div class="question-item-answer" :id="`question-item-answer-${index}`">
                            <template v-if="question.type === QUESTION_TYPE.MULTIPLE_CHOICE">
                                <div class="question-data">
                                    <div class="question-data-option">
                                        <div>Options:</div>
                                        <ul>
                                            <li
                                                v-for="option in question.questionData
                                                    .multipleChoice"
                                                :class="[option.isAnswer ? 'result-correct' : '']"
                                            >
                                                {{ option.text }}
                                            </li>
                                        </ul>
                                    </div>
                                    <div class="question-data-option user-answer">
                                        <div>User answer:</div>
                                        <ul v-if="question.userAnswerDataDto?.multipleChoice">
                                            <li
                                                v-for="option in getUserAnswerMultipleChoice(
                                                    question.id,
                                                    question.userAnswerDataDto?.multipleChoice,
                                                )"
                                                :class="[
                                                    option.isCorrect
                                                        ? 'result-correct'
                                                        : 'result-incorrect',
                                                ]"
                                            >
                                                {{ option.text }}
                                            </li>
                                        </ul>
                                        <div v-else class="result-skipped">No answer</div>
                                    </div>
                                </div>
                            </template>
                            <template v-if="question.type === QUESTION_TYPE.MATCHING">
                                <div class="question-data">
                                    <div class="question-data-option">
                                        <div>Options:</div>
                                        <div
                                            class="pair-answer"
                                            v-for="option in getMatchingOption(
                                                question.questionData.matching,
                                            )"
                                        >
                                            <span class="pair-answer-item">
                                                {{ option.leftItem }}
                                            </span>
                                            <i class="bx bx-right-arrow-alt"></i>
                                            <span class="pair-answer-item">
                                                {{ option.rightItem }}
                                            </span>
                                        </div>
                                    </div>
                                    <div class="question-data-option user-answer">
                                        <div>User answer:</div>
                                        <template v-if="question.userAnswerDataDto?.matching">
                                            <div
                                                :class="[
                                                    'pair-answer',
                                                    !option.isCorrect
                                                        ? 'pair-answer-incorrect'
                                                        : '',
                                                ]"
                                                v-for="option in getUserAnswerMatching(
                                                    question.id,
                                                    question.userAnswerDataDto?.matching,
                                                )"
                                            >
                                                <span class="pair-answer-item">
                                                    {{ option.leftItem }}
                                                </span>
                                                <i class="bx bx-right-arrow-alt"></i>
                                                <span class="pair-answer-item">
                                                    {{ option.rightItem }}
                                                </span>
                                            </div>
                                        </template>
                                        <div v-else class="result-skipped">No answer</div>
                                    </div>
                                </div>
                            </template>
                            <template v-if="question.type === QUESTION_TYPE.ORDERING">
                                <div class="question-data">
                                    <div class="question-data-option">
                                        <div>Options:</div>
                                        <div class="ordering-answer">
                                            <div class="ordering-answer-item">
                                                <div
                                                    class="ordering-answer-item"
                                                    v-for="(
                                                        option, index
                                                    ) in question.questionData.ordering?.sort(
                                                        (
                                                            a: { correctOrder: number },
                                                            b: { correctOrder: number },
                                                        ) => a.correctOrder - b.correctOrder,
                                                    )"
                                                >
                                                    <span class="result-correct"
                                                        >#{{ index + 1 }}</span
                                                    >
                                                    -
                                                    {{ option.text }}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="question-data-option">
                                        <div>User answer:</div>
                                        <div
                                            v-if="question.userAnswerDataDto?.ordering"
                                            class="ordering-answer"
                                        >
                                            <div class="ordering-answer-item">
                                                <div
                                                    v-for="(option, index) in getUserAnswerOrdering(
                                                        question.id,
                                                        question.userAnswerDataDto?.ordering,
                                                    )"
                                                    :class="[
                                                        'ordering-answer-item',
                                                        option.isCorrect
                                                            ? 'result-correct'
                                                            : 'result-incorrect',
                                                    ]"
                                                >
                                                    <span>#{{ index + 1 }}</span>
                                                    -
                                                    {{ option.text }}
                                                </div>
                                            </div>
                                        </div>
                                        <div v-else class="result-skipped">No answer</div>
                                    </div>
                                </div>
                            </template>
                            <template v-if="question.type === QUESTION_TYPE.SHORT_TEXT">
                                <div class="question-data">
                                    <div class="question-data-option">
                                        <div>Option:</div>
                                        <div class="short-text-answer">
                                            {{ question.questionData.shortText }}
                                        </div>
                                    </div>
                                    <div class="question-data-option">
                                        <div>User answer:</div>
                                        <div
                                            v-if="question.questionDataDto?.shortText"
                                            class="short-text-answer"
                                        >
                                            {{ question.userAnswerDataDto?.shortText }}
                                        </div>
                                        <div v-else class="result-skipped">No answer</div>
                                    </div>
                                </div>
                            </template>
                        </div>
                        <div>
                            Score:
                            <span
                                :class="[
                                    question.score > 0 ? 'result-correct' : 'result-incorrect',
                                ]"
                            >
                                {{ question.score }}
                            </span>
                        </div>
                    </div>
                    <div class="question-item-toogle-btn">
                        <i
                            class="bx bx-chevron-up"
                            @click="toggleDisplayAnswer(index, $event.currentTarget!)"
                        ></i>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped>
.content-item {
    width: auto;
}

.question-item-answer {
    margin: 5px 0px;
    border-top: 1px solid;
    border-bottom: 1px solid;
    border-color: var(--form-item-border-color);
    padding: 10px 0px;
}

.question-data {
    display: flex;
}

.question-data-option {
    margin-right: 50px;
}

.preview-question-item {
}
.preview-question-item .question-item-result {
    font-size: 20px;
}

.pair-answer .pair-answer-item {
    border-color: var(--correct-answer-color);
}

.pair-answer i {
    color: var(--correct-answer-color);
}

.pair-answer-incorrect .pair-answer-item {
    border-color: var(--incorrect-answer-color);
}

.pair-answer-incorrect i {
    color: var(--incorrect-answer-color);
}
</style>
