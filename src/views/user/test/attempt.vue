<script setup lang="ts">
import ApiTest from "@/api/ApiTest";

import { ref, computed, onMounted, nextTick, onUnmounted } from "vue";
import QUESTION_TYPE from "@/constants/questionTypes";
import type { ResponseQuestion } from "@/models/response/question";

import type UserAnswerDTO from "@/models/response/test/userAnswerDTO";

import type { UserAnswerData } from "@/models/response/test/userAnswer";
import type UserAnswerSubmit from "@/models/response/test/userAnswer";

import TransferUserAnswerData from "@/services/TransferUserAnswerData";

import TextArea from "@/shared/components/Common/TextArea.vue";
import { VueDraggable } from "vue-draggable-plus";
import { HolderOutlined } from "@ant-design/icons-vue";
import Validator from "@/services/Validator";

import { useI18n } from "vue-i18n";
import { Modal, message } from "ant-design-vue";
import { useRoute, useRouter } from "vue-router";

import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

interface AttemptData {
    attemptId: string;
    name: string;
    questionCount: number;
    timeStart: string;
    timeEnd: string;
    timeLimit: number;
    timeRemaining: number;
    questions: { questionData: ResponseQuestion; userAnswerDataDto: UserAnswerSubmit }[];
}

const QUESTION_FORMAT = {
    HTML: "HTML",
    PLAIN_TEXT: "PlainText",
};

const quiz = ref<ResponseQuestion[]>([]);
const userAnswer = ref<UserAnswerDTO[]>([]);

const currentQuestion = ref<ResponseQuestion>({
    id: "",
    explainText: "",
    questionSetId: "",
    questionText: "",
    score: 0,
    scoreGraded: 0,
    textFormat: "0",
    type: "MultipleChoice",
    questionData: {
        matching: null,
        multipleChoice: null,
        ordering: null,
        shortText: "",
    },
});

const currentQuestionInstruction = ref("");
const currentQuestionIsSkipped = ref(false);
const isSubmitted = ref(false);

const userAnswerMultipleChoice = ref<string[]>([]);

const userAnswerMatchingLeft = ref<any[]>([]);
const userAnswerMatchingRight = ref<any[]>([]);

const userAnswerOrdering = ref<any[]>([]);
const userAnswerShortText = ref<string>("");

//#region init data
const isDataValid = ref(true); //to mark whether testTemplate is valid to remove guard
const testId = ref<string>(route.params.id.toString());
const attemptData = ref<AttemptData>({
    attemptId: "",
    name: "",
    questionCount: 0,
    timeStart: "",
    timeEnd: "",
    timeLimit: 0,
    timeRemaining: 0,
    questions: [],
});
const loading = ref(false);
const getAttemptData = async () => {
    try {
        loading.value = true;
        if (!Validator.isValidGuid(testId.value)) {
            isDataValid.value = false;
            router.push({ name: "404" });
            return;
        }

        const result = await ApiTest.Attempt(testId.value);
        attemptData.value = result.data.data;

        quiz.value = [...result.data.data.questions.map((x: any) => ({ id: x.questionId, ...x }))];

        userAnswer.value = TransferUserAnswerData.transferFromUserAnswerSubmit(
            result.data.data.questions.map((x: any) => x.userAnswerDataDto),
        );

        currentQuestion.value = quiz.value[0] as ResponseQuestion;
    } catch (error: any) {
        if (!error.response.data.success) {
            isDataValid.value = false;
            router.push({ name: "404" });
            return;
        }
        console.log(error);
    } finally {
        loading.value = false;
    }
};

//#endregion

//#region logic complete question
/* handle logic complete question */
const updateUserAnswer = (index: number, newAnswer: UserAnswerDTO) => {
    if (index === -1) {
        userAnswer.value.push(newAnswer);
    } else {
        userAnswer.value[index] = newAnswer;
    }
};

//track change when user perform actions on questions
const onUserAnswerChange = () => {
    const index = userAnswer.value.findIndex((x) => x.questionId === currentQuestion.value.id);

    switch (currentQuestion.value.type) {
        case QUESTION_TYPE.MULTIPLE_CHOICE: {
            if (userAnswerMultipleChoice.value.length > 0) {
                updateUserAnswer(index, {
                    questionId: currentQuestion.value.id,
                    type: currentQuestion.value.type,
                    multipleChoices: [...userAnswerMultipleChoice.value],
                    matchingLeft: null,
                    matchingRight: null,
                    ordering: null,
                    shortText: "",
                });
            } else if (index !== -1) {
                userAnswer.value.splice(index, 1);
            }
            break;
        }
        case QUESTION_TYPE.MATCHING: {
            updateUserAnswer(index, {
                questionId: currentQuestion.value.id,
                type: currentQuestion.value.type,
                multipleChoices: null,
                matchingLeft: [...userAnswerMatchingLeft.value],
                matchingRight: [...userAnswerMatchingRight.value],
                // matchingLeft: userAnswerMatchingLeft.value.map((x) => x),
                // matchingRight: userAnswerMatchingRight.value.map((x) => x),
                ordering: null,
                shortText: "",
            });
            break;
        }
        case QUESTION_TYPE.ORDERING: {
            updateUserAnswer(index, {
                questionId: currentQuestion.value.id,
                type: currentQuestion.value.type,
                multipleChoices: null,
                matchingLeft: null,
                matchingRight: null,
                ordering: [...userAnswerOrdering.value],
                // ordering: userAnswerOrdering.value.map((x) => x),
                shortText: "",
            });
            break;
        }
        case QUESTION_TYPE.SHORT_TEXT: {
            if (userAnswerShortText.value.trim()) {
                updateUserAnswer(index, {
                    questionId: currentQuestion.value.id,
                    type: currentQuestion.value.type,
                    multipleChoices: null,
                    matchingLeft: null,
                    matchingRight: null,
                    ordering: null,
                    shortText: userAnswerShortText.value.trim(),
                });
            } else if (index !== -1) {
                userAnswer.value.splice(index, 1);
            }
            break;
        }
    }
};

const onSubmit = () => {
    Modal.confirm({
        title: "Are you sure to submit your test?",
        content: "Please double check your answer before submitting!",
        centered: true,
        onOk: async () => {
            //call api
            const answerObject = TransferUserAnswerData.transferToUserAnswerSubmit(
                userAnswer.value,
            );
            const result = await ApiTest.Submit({
                attemptId: attemptData.value.attemptId,
                userAnswers: answerObject,
            });

            if (!result.data.success) {
                message.error("Submit failed!");
                return;
            }
            message.info("Submit successfully!");
            // router.push({ name: "" });
        },
    });
};

const onLoadCurrentQuestion = (index: number) => {
    syncMatchingHeights();
    currentQuestionIsSkipped.value = false;

    currentQuestion.value = quiz.value[index] as ResponseQuestion;
    const answer = userAnswer.value.find((x) => x.questionId === currentQuestion.value.id);

    switch (currentQuestion.value.type) {
        case QUESTION_TYPE.MULTIPLE_CHOICE: {
            currentQuestionInstruction.value = `Choose (${currentQuestion.value.questionData.multipleChoice?.filter((x) => x.isAnswer).length}) options.`;
            userAnswerMultipleChoice.value = answer ? answer?.multipleChoices! : [];
            break;
        }

        case QUESTION_TYPE.ORDERING: {
            currentQuestionInstruction.value = `Arrange these options to their correct order.`;
            userAnswerOrdering.value = answer
                ? answer?.ordering!
                : currentQuestion.value.questionData.ordering?.map((x) => x) || [];
            break;
        }

        case QUESTION_TYPE.MATCHING: {
            currentQuestionInstruction.value = `Arrange the items to align with their correct matches.`;
            userAnswerMatchingLeft.value = answer
                ? answer?.matchingLeft!
                : currentQuestion.value.questionData.matching!.leftItems.map((x) => x) || [];

            userAnswerMatchingRight.value = answer
                ? answer?.matchingRight!
                : currentQuestion.value.questionData.matching!.rightItems.map((x) => x) || {};

            break;
        }

        case QUESTION_TYPE.SHORT_TEXT: {
            currentQuestionInstruction.value = `Fill in the blank the correct answer.`;
            userAnswerShortText.value = answer ? answer?.shortText! : "";
            break;
        }
    }
};

const onNextQuestion = () => {
    const index = quiz.value.findIndex((x) => x.id === currentQuestion.value.id);
    if (index < quiz.value.length - 1) {
        onLoadCurrentQuestion(index + 1);
    }
};

const onPreviousQuestion = () => {
    const index = quiz.value.findIndex((x) => x.id === currentQuestion.value.id);
    if (index > 0) {
        onLoadCurrentQuestion(index - 1);
    }
};

const userAnswerContainQuestion = (questionId: string) => {
    return Array.from(userAnswer.value).some((x) => x.questionId === questionId);
};

const hasNextQuestion = computed(() => {
    const index = quiz.value.findIndex((x) => x.id === currentQuestion.value.id);
    return index !== -1 && index < quiz.value.length - 1;
});

const hasPreviousQuestion = computed(() => {
    const index = quiz.value.findIndex((x) => x.id === currentQuestion.value.id);
    return index !== -1 && index > 0;
});

//#endregion

//#region adjust UI scale
const dragOptions = {
    scroll: true,
    scrollSensitivity: 100,
    scrollSpeed: 100,
    scrollTarget: document.scrollingElement,
};

function syncMatchingHeights() {
    nextTick(() => {
        requestAnimationFrame(() => {
            const leftItems = document.querySelectorAll(
                ".matching-option-container.left .answer-option-matching",
            );
            const rightItems = document.querySelectorAll(
                ".matching-option-container.right .answer-option-matching",
            );

            const count = Math.min(leftItems.length, rightItems.length);

            for (let i = 0; i < count; i++) {
                const left = leftItems[i] as HTMLElement;
                const right = rightItems[i] as HTMLElement;

                if (!left || !right) continue;

                left.style.height = "auto";
                right.style.height = "auto";

                const maxHeight = Math.max(left.offsetHeight, right.offsetHeight);

                left.style.height = `${maxHeight}px`;
                right.style.height = `${maxHeight}px`;
            }
        });
    });
}

/* adjust multiple choice layout */
const isOptionExceed = computed(() => {
    return currentQuestion.value.questionData.multipleChoice?.some((x) => x.text.length >= 100);
});

//#endregion

//#region timer
const endTime = ref<Dayjs>(dayjs().add(attemptData.value.timeRemaining * 60, "second"));

const remainingTime = ref<number>(attemptData.value.timeRemaining * 60);
let timer: ReturnType<typeof setInterval> | null = null;

const formattedTime = computed<string>(() => {
    const min = Math.floor(remainingTime.value / 60)
        .toString()
        .padStart(2, "0");
    const sec = (remainingTime.value % 60).toString().padStart(2, "0");
    return `${min}:${sec}`;
});

const updateCountdown = (): void => {
    const diff = endTime.value.diff(dayjs(), "second");
    remainingTime.value = diff > 0 ? diff : 0;
    if (diff <= 0 && timer) {
        clearInterval(timer);
        timer = null;
        //trigger submit final here
    }
};

//#endregion

//#region auto save
let autoSaver: ReturnType<typeof setInterval> | null = null;
const autoSave = async () => {
    //call api submit
    const answerObject = TransferUserAnswerData.transferToUserAnswerSubmit(userAnswer.value);

    const result = await ApiTest.Submit({
        attemptId: attemptData.value.attemptId,
        userAnswers: answerObject,
        isSubmit: false,
    });

    if (!result.data.success) {
        message.error("Auto failed!");
        return;
    }

    message.info("Auto saved");
};
//#endregion

//#region flag

const flaggedQuestion = ref<Set<string>>(new Set());

const onToggleFlagQuestion = () => {
    const questionId = currentQuestion.value.id;
    if (!flaggedQuestion.value.delete(questionId)) {
        flaggedQuestion.value.add(questionId);
    }
};

const flagContainQuestion = (questionId: string) => {
    return Array.from(flaggedQuestion.value).some((x) => x === questionId);
};

const isCurrentQuestionFlagged = computed(() => {
    const questionId = currentQuestion.value.id;
    return Array.from(flaggedQuestion.value).some((x) => x === questionId);
});

//#endregion

//#region leave guard
onUnmounted(() => {
    if (timer) clearInterval(timer);
    if (autoSaver) clearInterval(autoSaver);
});
//#endregion

onMounted(async () => {
    syncMatchingHeights();
    window.addEventListener("resize", syncMatchingHeights);

    await getAttemptData();
    remainingTime.value = attemptData.value.timeRemaining * 60;
    endTime.value = dayjs().add(attemptData.value.timeRemaining * 60, "second");

    onLoadCurrentQuestion(0);

    updateCountdown();
    timer = setInterval(updateCountdown, 1000);
    autoSaver = setInterval(autoSave, 60_000); //save each 60s
});
</script>

<template>
    <div class="page-container">
        <div class="title-container title-container-header">
            <a-row class="w-100 d-flex align-items-center">
                <a-col :span="1">
                    <RouterLink :to="{ name: 'User_Library' }">
                        <i class="bx bx-chevron-left navigator-back-button"></i>
                    </RouterLink>
                </a-col>
                <a-col class="main-title" :span="22">
                    <span> {{ attemptData?.name }}</span> <br />
                    <span>
                        {{ attemptData?.questionCount }}
                    </span>
                </a-col>
            </a-row>
        </div>

        <div class="content content-test d-flex flex-column">
            <div class="d-flex">
                <div class="content-item question-navigators">
                    <div
                        class="question-navigator-title d-flex justify-content-between align-items-center"
                    >
                        <span>Questions</span>
                        <span class="countdown d-flex align-items-center">
                            <i class="bx bx-timer"></i>
                            {{ formattedTime }}
                        </span>
                    </div>
                    <div class="question-navigator-container">
                        <div
                            :class="[
                                'question-navigator-item',
                                currentQuestion.id === item.id ? 'current-question' : '',
                                userAnswerContainQuestion(item.id) ? 'completed-question' : '',
                                flagContainQuestion(item.id) ? 'flagged-question' : '',
                            ]"
                            v-for="(item, index) in quiz"
                            @click="onLoadCurrentQuestion(index)"
                        >
                            <span> {{ index + 1 }} </span>
                        </div>
                    </div>
                    <a-button
                        type="primary"
                        :class="['main-color-btn', isSubmitted ? 'main-color-btn-disabled' : '']"
                        @click="onSubmit"
                    >
                        Submit
                    </a-button>
                </div>
            </div>
            <div class="content-item">
                <div v-if="loading">
                    <a-skeleton :loading="loading"></a-skeleton>
                    <a-skeleton :loading="loading"></a-skeleton>
                    <a-skeleton :loading="loading"></a-skeleton>
                </div>
                <div v-else class="section question-section">
                    <div
                        v-if="currentQuestion.textFormat.toString() === '0'"
                        :class="['learn-question']"
                        v-html="currentQuestion.questionText"
                    ></div>
                    <div v-else :class="['learn-question']">
                        {{ currentQuestion.questionText }}
                    </div>
                    <div class="section answer-section">
                        <div class="d-flex align-items-center">
                            <div class="answer-section-ins">
                                {{ currentQuestionInstruction }}
                            </div>
                        </div>
                        <template v-if="currentQuestion.type === QUESTION_TYPE.MULTIPLE_CHOICE">
                            <a-checkbox-group
                                @change="onUserAnswerChange"
                                v-model:value="userAnswerMultipleChoice"
                                :class="[
                                    'answer-option-container multiplechoice',
                                    isOptionExceed ? 'column' : '',
                                ]"
                            >
                                <template
                                    v-for="(option, index) in currentQuestion.questionData
                                        .multipleChoice"
                                >
                                    <a-checkbox
                                        v-model:value="option.id"
                                        :class="['answer-option answer-option-multiplechoice']"
                                    >
                                        <div class="answer-option-content">
                                            {{ option.text }}
                                        </div>
                                    </a-checkbox>
                                </template>
                            </a-checkbox-group>
                        </template>

                        <template v-if="currentQuestion.type === QUESTION_TYPE.MATCHING">
                            <div class="answer-option-container matching">
                                <div class="matching-option-container left">
                                    <VueDraggable
                                        v-model="userAnswerMatchingLeft"
                                        :options="dragOptions"
                                        @move="syncMatchingHeights"
                                        @end="
                                            () => {
                                                syncMatchingHeights();
                                                onUserAnswerChange();
                                            }
                                        "
                                    >
                                        <template v-for="(option, index) in userAnswerMatchingLeft">
                                            <div class="d-flex align-items-center">
                                                <div
                                                    :class="[
                                                        'answer-option answer-option-matching',
                                                    ]"
                                                >
                                                    <div class="answer-option-order">
                                                        <HolderOutlined />
                                                    </div>
                                                    <div class="answer-option-content">
                                                        {{ option.text }}
                                                    </div>
                                                </div>
                                                <i :class="['bx bxs-label matching-icon']"></i>
                                            </div>
                                        </template>
                                    </VueDraggable>
                                </div>
                                <div class="matching-option-container right">
                                    <VueDraggable
                                        v-model="userAnswerMatchingRight"
                                        :options="dragOptions"
                                        @move="syncMatchingHeights"
                                        @end="
                                            () => {
                                                syncMatchingHeights();
                                                onUserAnswerChange();
                                            }
                                        "
                                    >
                                        <template
                                            v-for="(option, index) in userAnswerMatchingRight"
                                        >
                                            <div class="d-flex align-items-center">
                                                <i :class="['bx bxs-label matching-icon']"></i>
                                                <div
                                                    :class="[
                                                        'answer-option answer-option-matching',
                                                    ]"
                                                >
                                                    <div class="answer-option-content">
                                                        {{ option.text }}
                                                    </div>
                                                    <div class="answer-option-order">
                                                        <HolderOutlined />
                                                    </div>
                                                </div>
                                            </div>
                                        </template>
                                    </VueDraggable>
                                </div>
                            </div>
                        </template>

                        <template v-if="currentQuestion.type === QUESTION_TYPE.ORDERING">
                            <div class="answer-option-container ordering">
                                <VueDraggable
                                    v-model="userAnswerOrdering"
                                    :options="dragOptions"
                                    @end="onUserAnswerChange"
                                >
                                    <template v-for="(option, index) in userAnswerOrdering">
                                        <div :class="['answer-option answer-option-ordering']">
                                            <div class="answer-option-order">
                                                <HolderOutlined />
                                                {{ index + 1 }}
                                            </div>
                                            <div class="answer-option-content">
                                                {{ option.text }}
                                            </div>
                                        </div>
                                    </template>
                                </VueDraggable>
                            </div>
                        </template>

                        <template v-if="currentQuestion.type === QUESTION_TYPE.SHORT_TEXT">
                            <div class="answer-option-container">
                                <div :class="['answer-short-text']">
                                    <div class="w-100 d-flex align-items-center">
                                        <TextArea
                                            :placeholder="'Enter your answer...'"
                                            v-model="userAnswerShortText"
                                            @change="onUserAnswerChange"
                                        />
                                    </div>
                                </div>
                            </div>
                        </template>
                    </div>
                    <div class="learn-question-footer">
                        <a-button
                            :class="[
                                'main-color-btn',
                                !hasPreviousQuestion ? 'main-color-btn-disabled' : '',
                            ]"
                            type="primary"
                            size="large"
                            @click="onPreviousQuestion"
                        >
                            <i class="bx bx-chevron-left"></i>
                            Previous question
                        </a-button>
                        <i
                            :class="[
                                'bx bx-flag flag-button',
                                isCurrentQuestionFlagged ? 'bxs-flag' : '',
                            ]"
                            @click="onToggleFlagQuestion"
                        ></i>
                        <div class="d-flex">
                            <a-button
                                :class="[
                                    'main-color-btn',
                                    !hasNextQuestion ? 'main-color-btn-disabled' : '',
                                ]"
                                type="primary"
                                size="large"
                                @click="onNextQuestion"
                            >
                                Next question
                                <i class="bx bx-chevron-right"></i>
                            </a-button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<style>
.ant-modal-content {
    border: 1px solid var(--form-item-border-color) !important;
}
</style>
<!-- /* for test */ -->
<style scoped>
.content-test {
    display: flex;
    flex-direction: row;
}

.title-container-header {
    background-color: var(--content-item-background-color);
    border-bottom: 1px solid var(--content-item-border-color);
    position: sticky;
    top: 0;
    z-index: 10;
    margin: 0;
    padding: 10px;
}

.page-container {
    width: 100%;
    height: 100vh;
    margin: 0;
}

.content {
    flex-direction: row;
}

.content-item {
    width: 70%;
    margin: 10px auto;
}

.countdown {
    font-size: 20px;
    font-weight: 500;
}

.countdown i {
    margin-right: 3px;
    font-size: 24px;
    transform: translateY(1px);
}

.countdown.danger {
    color: red;
}
/* for test only */
.answer-short-text {
    display: flex;
    flex-direction: column;
    align-items: start;
}
.short-text-correct-answer {
    margin-top: 10px;
}
.short-text-correct-answer span {
    font-size: 18px;
    font-weight: 500;
    color: var(--correct-answer-color);
}

.content-item.question-navigators {
    position: absolute;
    top: 75px;
    width: 200px;
    height: fit-content;
    margin: 10px 0px 0px 10px;
}

.question-navigator-container {
    display: flex;
    flex-wrap: wrap;
    margin: 10px 0px;
}
.question-navigator-item {
    width: calc(100% / 4 - 8px);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0px 0px 3px 3px;
    padding: 5px;
    border: 1px solid var(--form-item-border-color);
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    position: relative;
    overflow: hidden;
}

.question-navigator-item:hover {
    border-color: var(--main-color);
}

.current-question {
    border-color: var(--main-color);
    color: var(--main-color);
}

.completed-question {
    background-color: var(--main-color);
    color: var(--text-color);
}

.learn-question-footer {
    padding: 0px;
}

.flagged-question::after {
    content: "";
    position: absolute;
    inset: 0;
    background-color: yellow;
    clip-path: polygon(100% 0, 100% 50%, 50% 0);
}

.flag-button {
    font-size: 24px;
    cursor: pointer;
    color: yellow;
    transition: all 0.2s ease-in-out;
}
.flag-button:hover {
    transform: scale(1.2);
}
</style>
