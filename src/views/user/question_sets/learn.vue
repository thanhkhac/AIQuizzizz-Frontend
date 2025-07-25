<script setup lang="ts">
import ApiQuestionSet from "@/api/ApiQuestionSet";
import { ref, computed, onMounted, nextTick } from "vue";

import QUESTION_TYPE from "@/constants/questionTypes";
import { QUOTES } from "@/constants/quote";

import type { Question } from "@/models/response/question";
import TextArea from "@/shared/components/Common/TextArea.vue";
import { VueDraggable } from "vue-draggable-plus";
import { HolderOutlined } from "@ant-design/icons-vue";
import { message } from "ant-design-vue";
import { DotLottieVue } from "@lottiefiles/dotlottie-vue";
const animationPath = new URL("@/assets/confetti.lottie", import.meta.url).href;

import { useI18n } from "vue-i18n";

const { t } = useI18n();

const QUESTION_FORMAT = {
    HTML: "HTML",
    PLAIN_TEXT: "PlainText",
};

interface LearnQuizModel {
    completedQuestionCount: number;
    totalQuestionCount: number;
    questions: Question[];
}

const quiz = ref<LearnQuizModel>({
    completedQuestionCount: 0,
    totalQuestionCount: 0,
    questions: [],
});

const getQuizData = async () => {
    //45c16e0c-5b92-4155-946f-ecab5daa60ca
    //eabf4f24-dd83-416f-aeeb-351b7c3ad837
    let result = await ApiQuestionSet.LearnQuestions("eabf4f24-dd83-416f-aeeb-351b7c3ad837", 7);

    if (result.data.success) {
        quiz.value = result.data.data;
        if (quiz.value.completedQuestionCount === quiz.value.totalQuestionCount) {
            openCompleteModal();
            return;
        }
    }
    currentSession.value = [...quiz.value.questions];
    currentQuestion.value = currentSession.value[0];
    currentSession.value.shift();
};

const comment_sample = [
    {
        id: "1",
        user: {
            userName: "NguyenTanDuc",
        },
        content: "D",
        lastModified: "09/07/2025 10:12AM",
    },
    {
        id: "2",
        user: {
            userName: "NguyenManhDuong",
        },
        content: "Phải là A mới đúng",
        lastModified: "09/07/2025 10:15AM",
    },
    {
        id: "3",
        user: {
            userName: "PhamXuanTruong",
        },
        content: "A",
        lastModified: "09/07/2025 10:18AM",
    },
    {
        id: "4",
        user: {
            userName: "NguyenManhHieu",
        },
        content: "D",
        lastModified: "09/07/2025 10:20AM",
    },
    {
        id: "5",
        user: {
            userName: "NguyenDucTan123",
        },
        content: "It's d for sure",
        lastModified: "09/07/2025 10:25AM",
    },
    {
        id: "6",
        user: {
            userName: "NguyenDucTan123",
        },
        content: "It's d for sure",
        lastModified: "09/07/2025 10:25AM",
    },
    {
        id: "7",
        user: {
            userName: "NguyenDucTan123",
        },
        content: "It's d for sure",
        lastModified: "09/07/2025 10:25AM",
    },
    {
        id: "8",
        user: {
            userName: "NguyenDucTan123",
        },
        content: "It's d for sure",
        lastModified: "09/07/2025 10:25AM",
    },
    {
        id: "9",
        user: {
            userName: "NguyenDucTan123",
        },
        content: "It's d for sure",
        lastModified: "09/07/2025 10:25AM",
    },
    {
        id: "10",
        user: {
            userName: "NguyenDucTan123",
        },
        content: "It's d for sure",
        lastModified: "09/07/2025 10:25AM",
    },
];

const totalCompleted = ref(quiz.value.completedQuestionCount); //for total

const completed = ref<Question[]>([]); // for session

const incorrect = ref<Set<Question>>(new Set()); // for session

const currentSession = ref<Question[]>([]); // for session
const isCurrentSessionReLearn = ref(false); //to check whether current session re-learn incorrect

const currentQuestion = ref<Question>({} as Question);

const currentQuestionInstruction = ref("");
const currentQuestionIsSubmitted = ref(false);
const currentQuestionIsSkipped = ref(false);

const userAnswerMultipleChoice = ref<string[]>([]);

/* adjust multiple choice layout */
const isOptionExceed = computed(() => {
    return currentQuestion.value.questionData.multipleChoice?.some((x) => x.text.length >= 100);
});

const userAnswerMatchingLeft = ref<any[]>([]);
const userAnswerMatchingRight = ref<any[]>([]);

const userAnswerOrdering = ref<any[]>([]);
const userAnswerShortText = ref<string>("");

const currentQuestionResult = ref({
    result: false,
    resultText: "Wrong answer!",
});

const completionPercentage = computed(() => {
    return Math.floor((quiz.value.completedQuestionCount / quiz.value.totalQuestionCount) * 100);
});

//#region check user answer
const checkMultipleChoice = () => {
    let correctAnswer = currentQuestion.value.questionData.multipleChoice
        ?.filter((x) => x.isAnswer)
        .map((x) => x.id || [])
        .sort();

    let sortedUserAnswer = userAnswerMultipleChoice.value.sort();
    if (userAnswerMultipleChoice.value.length !== correctAnswer?.length) return false;
    return sortedUserAnswer.every((value: string, i: number) => value === correctAnswer[i]);
};

/* use this for checking answer after submit */
const checkMultipleChoiceAnswerCorrect = (option: any) => {
    //only 2 cases allowed to display result: correct and user_answer + incorrect

    const index = quiz.value.questions.findIndex((x) => x.id === currentQuestion.value.id);
    let correctAnswer = quiz.value.questions[index].questionData.multipleChoice
        ?.filter((x) => x.isAnswer)
        .map((x) => x.id || []);

    let user_answer = userAnswerMultipleChoice.value;

    if (correctAnswer?.includes(option.id)) return true; //case 1
    if (user_answer?.includes(option.id) && !option.isAnswer) return false; //case 2

    return true;
};

const checkOrdering = () => {
    let correctAnswer =
        currentQuestion.value.questionData.ordering?.map((x) => x.correctOrder).sort() || [];

    let userAnswer = userAnswerOrdering.value.map((x) => x.correctOrder);
    return userAnswer.every((value: number, i: number) => value === correctAnswer[i]);
};

const checkMatching = () => {
    let correctMatch = currentQuestion.value.questionData.matching!.matches;

    let userAnswerLeft = userAnswerMatchingLeft.value.map((x) => x.id);
    let userAnswerRight = userAnswerMatchingRight.value.map((x) => x.id);

    let userAnswerMatches = userAnswerLeft.map((leftId: string, i: number) => ({
        leftId,
        rightId: userAnswerRight[i] as string,
    }));

    return userAnswerMatches.every((item: any) =>
        correctMatch.some((x) => x.leftId === item.leftId && x.rightId === item.rightId),
    );
};

const checkMatchingAnswerCorrect = (id: string) => {
    const matching = currentQuestion.value.questionData.matching;
    if (!matching) return false;

    let isLeft = matching.leftItems.some((x) => x.id === id);

    let correctMatch = matching.matches.find((x) => (isLeft ? x.leftId === id : x.rightId === id));

    const index = isLeft
        ? userAnswerMatchingLeft.value.findIndex((x) => x.id === id)
        : userAnswerMatchingRight.value.findIndex((x) => x.id === id);

    if (index === -1 || !correctMatch) return false;

    return isLeft
        ? userAnswerMatchingRight.value[index]?.id === correctMatch.rightId
        : userAnswerMatchingLeft.value[index]?.id === correctMatch.leftId;
};

const cleanShortTextAnswer = (text: string) => {
    return text
        .trim()
        .toLowerCase()
        .normalize("NFKC")
        .replace(/[\u2019\u2018\u201B\u0060]/g, "'")
        .replace(/\s+/g, " ");
};

const checkShortText = () => {
    return (
        cleanShortTextAnswer(userAnswerShortText.value) ===
        cleanShortTextAnswer(currentQuestion.value.questionData.shortText)
    );
};

//#endregion

//#region explain modal
/* explain modal bottom */
const explainModal = ref<HTMLElement | null>(null);
const explainModalOpen = ref(false);
const toggleExplainModal = () => {
    explainModalOpen.value = !explainModalOpen.value;
};

//#endregion

//#region comment modal
/* comment modal right */
const commentModalOpen = ref(false);

const onOpenCommentModal = () => {
    commentModalOpen.value = true;
    //get api comment
};

const onCloseCommentModal = () => {
    commentModalOpen.value = false;
    //reset comment list
};
//#endregion

//#region logic complete question
/* handle logic complete question */
const onSubmitAnswer = () => {
    toggleExplainModal();
    currentQuestionIsSubmitted.value = true;

    switch (currentQuestion.value.type) {
        case QUESTION_TYPE.MULTIPLE_CHOICE: {
            currentQuestionResult.value = {
                result: checkMultipleChoice(),
                resultText: checkMultipleChoice() ? "Correct!" : "Wrong answer!",
            };
            break;
        }
        case QUESTION_TYPE.ORDERING: {
            currentQuestionResult.value = {
                result: checkOrdering(),
                resultText: checkOrdering() ? "Correct!" : "Wrong answer!",
            };
            break;
        }
        case QUESTION_TYPE.MATCHING: {
            currentQuestionResult.value = {
                result: checkMatching(),
                resultText: checkMatching() ? "Correct!" : "Wrong answer!",
            };
            break;
        }
        case QUESTION_TYPE.SHORT_TEXT: {
            currentQuestionResult.value = {
                result: checkShortText(),
                resultText: checkShortText() ? "Correct!" : "Wrong answer!",
            };
            break;
        }
    }

    debugger;
    //if hasn't re-tried and has incorrect
    if (currentQuestionResult.value.result === false && !isCurrentSessionReLearn.value) {
        incorrect.value.add(currentQuestion.value);
    } else if (currentQuestionResult.value.result && isCurrentSessionReLearn.value) {
        //if re-tried and correct
        incorrect.value.delete(currentQuestion.value);
        completed.value.push(currentQuestion.value);
        quiz.value.completedQuestionCount += 1;
    } else if (currentQuestionResult.value.result === false) {
        incorrect.value.add(currentQuestion.value);
    } else {
        completed.value.push(currentQuestion.value);
        quiz.value.completedQuestionCount += 1;
    }
    triggerFinalModal();
};

const onSkipQuestion = (event: MouseEvent) => {
    toggleExplainModal();

    //change result
    currentQuestionIsSubmitted.value = true;
    currentQuestionIsSkipped.value = true;

    currentQuestionResult.value = {
        result: false,
        resultText: "Skipped",
    };
    //false by default
    incorrect.value.add(currentQuestion.value);

    switch (currentQuestion.value.type) {
        case QUESTION_TYPE.MULTIPLE_CHOICE: {
            userAnswerMultipleChoice.value = currentQuestion.value.questionData.multipleChoice
                ?.filter((x) => x.isAnswer)
                .map((x) => x.id)!;
            break;
        }

        //reset to let user know the correct answer if skip
        case QUESTION_TYPE.MATCHING: {
            const matching = currentQuestion.value.questionData.matching;
            const matches = matching?.matches ?? [];
            const leftItems = matching?.leftItems ?? [];
            const rightItems = matching?.rightItems ?? [];

            const matchingLeft = matches.map((match: any) =>
                leftItems.find((item: any) => item.id == match.leftId),
            );
            const matchingRight = matches.map((match: any) =>
                rightItems.find((item: any) => item.id == match.rightId),
            );

            userAnswerMatchingLeft.value = matchingLeft;
            userAnswerMatchingRight.value = matchingRight;
            break;
        }

        case QUESTION_TYPE.ORDERING: {
            userAnswerOrdering.value = userAnswerOrdering.value.sort(
                (asc, desc) => asc.correctOrder - desc.correctOrder,
            );
            break;
        }

        case QUESTION_TYPE.SHORT_TEXT: {
            userAnswerShortText.value = currentQuestion.value.questionData.shortText;
            break;
        }
    }
    triggerFinalModal();
};

const resetUserAnswer = () => {
    switch (currentQuestion.value.type) {
        case QUESTION_TYPE.MULTIPLE_CHOICE: {
            currentQuestionInstruction.value = `Choose (${currentQuestion.value.questionData.multipleChoice?.filter((x) => x.isAnswer).length}) options.`;
            userAnswerMultipleChoice.value = [];
            break;
        }
        case QUESTION_TYPE.ORDERING: {
            currentQuestionInstruction.value = `Arrange these options to their correct order.`;
            userAnswerOrdering.value = currentQuestion.value.questionData.ordering!;
            break;
        }
        case QUESTION_TYPE.MATCHING: {
            currentQuestionInstruction.value = `Arrange the items to align with their correct matches.`;
            userAnswerMatchingLeft.value = currentQuestion.value.questionData.matching!.leftItems;
            userAnswerMatchingRight.value = currentQuestion.value.questionData.matching!.rightItems;
            break;
        }
        case QUESTION_TYPE.SHORT_TEXT: {
            currentQuestionInstruction.value = `Fill in the blank the correct answer.`;
            userAnswerShortText.value = "";
            break;
        }
    }
};

const onNextQuestion = () => {
    triggerFinalModal();
    if (currentSession.value.length <= 0) return;

    currentQuestion.value = currentSession.value.shift()!;

    currentQuestionIsSubmitted.value = false;
    currentQuestionIsSkipped.value = false;

    resetUserAnswer();
    toggleExplainModal(); // turn off explain modal
};
//#endregion

//#region final modal
/* final modal full screen */

const finalModalOpen = ref(false);
const finalModalQuote = ref("");
const openFinalModal = () => {
    finalModalQuote.value = t(
        `learn_QS.final_modal.quotes.${QUOTES[Math.floor(Math.random() * QUOTES.length)].id}`,
    );

    setTimeout(() => {
        finalModalOpen.value = true;
    }, 1000);
};

const closeFinalModal = () => {
    finalModalOpen.value = false;
};

const triggerFinalModal = async () => {
    if (currentSession.value.length > 0) return;

    //has incorrect and hasn't re-learned
    if (incorrect.value.size > 0 && !isCurrentSessionReLearn.value) {
        //append 1st incorrect question - re-try incorrect
        isCurrentSessionReLearn.value = true;
        currentSession.value = Array.from(incorrect.value);
        message.info("Re-learn");
    } else if (
        (incorrect.value.size === 0 && !isCurrentSessionReLearn.value) ||
        (incorrect.value.size > 0 && isCurrentSessionReLearn.value)
    ) {
        //has no incorrect OR re-learned but didnot correct all

        //re-tried - send 2nd incorrect to backend
        //trigger open final modal
        const learnHistory = quiz.value.questions.map((x) => {
            return {
                questionId: x.id,
                isCorrect: completed.value.some((c) => c.id === x.id),
            };
        });

        await ApiQuestionSet.LearnHistory("eabf4f24-dd83-416f-aeeb-351b7c3ad837", learnHistory);
        message.success("Done");
        openFinalModal();
        return;
    }
};

//preview completed question in final modal
const toggleDisplayAnswer = (index: number, button: EventTarget) => {
    let $button = $(button);

    $button.toggleClass("bx-chevron-down bx-chevron-up");

    const answer = $(`#question-item-answer-${index}`);
    if (answer) $(answer).slideToggle();
};
const onContinuesLearn = async () => {
    await getQuizData();

    isCurrentSessionReLearn.value = false;
    currentQuestionIsSkipped.value = false;
    currentQuestionIsSubmitted.value = false;
    currentQuestionInstruction.value = "";
    finalModalOpen.value = false;
    incorrect.value = new Set();
    completed.value = [];

    toggleExplainModal();

    resetUserAnswer();
};

//#endregion

//#region complete modal
import trophy_png from "@/assets/trophy.png";
const completeModalOpen = ref(false);

const openCompleteModal = () => {
    completeModalOpen.value = true;
    triggerAnimation();
};

const animationRef = ref();
const isAnimationDisplaying = ref(false);

const triggerAnimation = () => {
    isAnimationDisplaying.value = true;
    animationRef.value?.getDotLottieInstance()?.play();
    setTimeout(() => {
        isAnimationDisplaying.value = false;
    }, 5000);
};

const onResetLearnHistory = async () => {
    const result = await ApiQuestionSet.resetLearnHistory("eabf4f24-dd83-416f-aeeb-351b7c3ad837");
    if (result.data.success) {
        message.success("Learn mode reset!");
        completeModalOpen.value = false;
        await getQuizData();
    }
};

//#endregion
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

onMounted(async () => {
    await getQuizData();

    resetUserAnswer();
    syncMatchingHeights();
    window.addEventListener("resize", syncMatchingHeights);
});
</script>

<template>
    <div class="page-container">
        <div class="title-container">
            <a-row class="w-100 d-flex align-items-center">
                <a-col :span="1">
                    <RouterLink :to="{ name: 'User_Library' }">
                        <i class="bx bx-chevron-left navigator-back-button"></i>
                    </RouterLink>
                </a-col>
                <a-col class="main-title" :span="23">
                    <!-- <span> {{ quiz.title }}</span> <br />
                    <span>
                        {{ quiz.description }}
                    </span> -->
                    <span>Quiz title</span> <br />
                    <span> Quiz description </span>
                </a-col>
            </a-row>
        </div>
        <div class="progress-bar-container">
            <div class="progress-info">
                <div class="progress-info-number">
                    Question {{ totalCompleted + 1 }} of {{ quiz.totalQuestionCount }}
                </div>
                <div class="progress-info-percentage">
                    <span>{{ completionPercentage }}</span>
                    % Completed
                </div>
            </div>
            <a-progress
                :show-info="false"
                stroke-color="#7C3AED"
                status="active"
                :percent="completionPercentage"
            />
        </div>

        <div class="content">
            <div class="content-item">
                <div class="section question-section">
                    <div
                        :class="[
                            'learn-question',
                            currentQuestion.textFormat === QUESTION_FORMAT.HTML ? '' : 'd-none',
                        ]"
                        v-html="currentQuestion.questionText"
                    ></div>
                    <div
                        :class="[
                            'learn-question',
                            currentQuestion.textFormat === QUESTION_FORMAT.HTML ? 'd-none' : '',
                        ]"
                    >
                        {{ currentQuestion.questionText }}
                    </div>
                    <div class="section answer-section">
                        <div v-if="isCurrentSessionReLearn" class="relearn-ins">
                            Let's try this again
                        </div>
                        <div class="d-flex align-items-center">
                            <div class="answer-section-ins">
                                {{ currentQuestionInstruction }}
                            </div>
                            <div
                                :class="[
                                    'ms-3 learn-question-result',
                                    !currentQuestionIsSubmitted ? 'd-none' : '',
                                    currentQuestionIsSubmitted
                                        ? currentQuestionResult.result
                                            ? 'result-correct'
                                            : 'result-incorrect'
                                        : '',
                                    currentQuestionIsSkipped ? 'result-skipped' : '',
                                ]"
                            >
                                {{ currentQuestionResult.resultText }}
                            </div>
                        </div>
                        <template v-if="currentQuestion.type === QUESTION_TYPE.MULTIPLE_CHOICE">
                            <a-checkbox-group
                                v-model:value="userAnswerMultipleChoice"
                                :class="[
                                    'answer-option-container multiplechoice',
                                    isOptionExceed ? 'column' : '',
                                ]"
                            >
                                <template
                                    v-for="option in currentQuestion.questionData.multipleChoice"
                                >
                                    <a-checkbox
                                        v-model:value="option.id"
                                        :disabled="currentQuestionIsSubmitted"
                                        :class="[
                                            'answer-option answer-option-multiplechoice',
                                            currentQuestionIsSubmitted &&
                                            checkMultipleChoiceAnswerCorrect(option) &&
                                            option.isAnswer
                                                ? 'answer-correct'
                                                : '',
                                            currentQuestionIsSubmitted &&
                                            !checkMultipleChoiceAnswerCorrect(option) &&
                                            !option.isAnswer
                                                ? 'answer-incorrect'
                                                : '',
                                        ]"
                                    >
                                        <div class="answer-option-content">
                                            {{ option.text }}
                                        </div>

                                        <i
                                            v-if="
                                                currentQuestionIsSubmitted &&
                                                checkMultipleChoiceAnswerCorrect(option) &&
                                                option.isAnswer
                                            "
                                            class="bx bx-check answer-icon"
                                        ></i>
                                        <i
                                            v-if="
                                                currentQuestionIsSubmitted &&
                                                !checkMultipleChoiceAnswerCorrect(option) &&
                                                !option.isAnswer
                                            "
                                            class="bx bx-x answer-icon"
                                        ></i>
                                    </a-checkbox>
                                </template>
                            </a-checkbox-group>
                        </template>

                        <template v-if="currentQuestion.type === QUESTION_TYPE.MATCHING">
                            <div class="answer-option-container matching">
                                <div class="matching-option-container left">
                                    <VueDraggable
                                        :disabled="currentQuestionIsSubmitted"
                                        v-model="userAnswerMatchingLeft"
                                        :options="dragOptions"
                                        @end="syncMatchingHeights"
                                    >
                                        <template v-for="(option, index) in userAnswerMatchingLeft">
                                            <div class="d-flex align-items-center">
                                                <div
                                                    :class="[
                                                        'answer-option answer-option-matching',
                                                        currentQuestionIsSubmitted
                                                            ? checkMatchingAnswerCorrect(option.id)
                                                                ? 'answer-correct'
                                                                : 'answer-incorrect'
                                                            : '',
                                                    ]"
                                                >
                                                    <div class="answer-option-order">
                                                        <HolderOutlined />
                                                    </div>
                                                    <div class="answer-option-content">
                                                        {{ option.text }}
                                                    </div>
                                                </div>
                                                <i
                                                    :class="[
                                                        'bx bxs-label matching-icon',
                                                        currentQuestionIsSubmitted
                                                            ? checkMatchingAnswerCorrect(option.id)
                                                                ? 'answer-correct-icon'
                                                                : 'answer-incorrect-icon'
                                                            : '',
                                                    ]"
                                                ></i>
                                            </div>
                                        </template>
                                    </VueDraggable>
                                </div>
                                <div class="matching-option-container right">
                                    <VueDraggable
                                        :disabled="currentQuestionIsSubmitted"
                                        v-model="userAnswerMatchingRight"
                                        :options="dragOptions"
                                        @end="syncMatchingHeights"
                                    >
                                        <template
                                            v-for="(option, index) in userAnswerMatchingRight"
                                        >
                                            <div class="d-flex align-items-center">
                                                <i
                                                    :class="[
                                                        'bx bxs-label matching-icon',
                                                        currentQuestionIsSubmitted
                                                            ? checkMatchingAnswerCorrect(option.id)
                                                                ? 'answer-correct-icon'
                                                                : 'answer-incorrect-icon'
                                                            : '',
                                                    ]"
                                                ></i>
                                                <div
                                                    :class="[
                                                        'answer-option answer-option-matching',
                                                        currentQuestionIsSubmitted
                                                            ? checkMatchingAnswerCorrect(option.id)
                                                                ? 'answer-correct'
                                                                : 'answer-incorrect'
                                                            : '',
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
                                    :disabled="currentQuestionIsSubmitted"
                                    v-model="userAnswerOrdering"
                                    :options="dragOptions"
                                >
                                    <template v-for="(option, index) in userAnswerOrdering">
                                        <div
                                            :class="[
                                                'answer-option answer-option-ordering',
                                                currentQuestionIsSubmitted
                                                    ? index === option.correctOrder
                                                        ? 'answer-correct'
                                                        : 'answer-incorrect'
                                                    : '',
                                            ]"
                                        >
                                            <div class="answer-option-order">
                                                <HolderOutlined />
                                                {{ index + 1 }}
                                            </div>
                                            <div class="answer-option-content">
                                                {{ option.text }}
                                            </div>
                                            <div
                                                :class="[
                                                    'answer-option-order answer-icon',
                                                    !currentQuestionIsSubmitted ? 'd-none' : '',
                                                ]"
                                            >
                                                <i class="bx bx-hash answer-icon"></i>
                                                {{ option.correctOrder }}
                                            </div>
                                        </div>
                                    </template>
                                </VueDraggable>
                            </div>
                        </template>

                        <template v-if="currentQuestion.type === QUESTION_TYPE.SHORT_TEXT">
                            <div class="answer-option-container">
                                <div
                                    layout="vertical"
                                    :class="[
                                        'answer-short-text',
                                        currentQuestionIsSubmitted
                                            ? checkShortText()
                                                ? 'answer-correct'
                                                : 'answer-incorrect'
                                            : '',
                                    ]"
                                >
                                    <div class="w-100 d-flex align-items-center">
                                        <TextArea
                                            :readonly="currentQuestionIsSubmitted"
                                            :placeholder="'Enter your answer...'"
                                            v-model="userAnswerShortText"
                                        />
                                        <i
                                            v-if="currentQuestionIsSubmitted && checkShortText()"
                                            class="bx bx-check answer-icon"
                                        ></i>
                                        <i
                                            v-if="currentQuestionIsSubmitted && !checkShortText()"
                                            class="bx bx-x answer-icon"
                                        ></i>
                                    </div>
                                    <div
                                        v-if="currentQuestionIsSubmitted && !checkShortText()"
                                        class="short-text-correct-answer"
                                    >
                                        Correct answer:
                                        <span> {{ currentQuestion.questionData.shortText }} </span>
                                    </div>
                                </div>
                            </div>
                        </template>
                    </div>
                </div>
                <div class="learn-question-footer">
                    <div
                        :class="[
                            'main-color-btn-ghost',
                            currentQuestionIsSubmitted ? 'main-color-btn-ghost-disabled' : '',
                        ]"
                        @click="onSkipQuestion($event)"
                    >
                        Don't know?
                    </div>
                    <div class="d-flex">
                        <div
                            :class="[
                                'main-color-btn-ghost me-3',
                                !currentQuestionIsSubmitted ? 'd-none' : '',
                            ]"
                            @click="onOpenCommentModal"
                        >
                            <i class="bx bx-conversation me-2"></i>
                            Comments
                        </div>

                        <div
                            :class="[
                                'main-color-btn-ghost me-3',
                                !currentQuestionIsSubmitted ? 'd-none' : '',
                            ]"
                            @click="toggleExplainModal"
                        >
                            <i class="bx bx-bulb me-2"></i>
                            Explaination
                        </div>

                        <a-button
                            :class="[
                                'main-color-btn',
                                currentQuestionIsSubmitted ? 'main-color-btn-disabled' : '',
                            ]"
                            type="primary"
                            size="large"
                            @click="onSubmitAnswer"
                        >
                            Submit
                        </a-button>
                    </div>
                </div>
            </div>
            <div
                ref="explainModal"
                class="explain-modal explain-modal-up"
                :class="{ show: explainModalOpen }"
            >
                <div class="learn-question-explain">
                    {{ currentQuestion.explainText }}
                </div>
                <a-button
                    :class="['main-color-btn close-modal-btn']"
                    type="primary"
                    size="large"
                    @click="toggleExplainModal"
                >
                    <i class="bx bx-chevrons-down"></i>
                </a-button>
                <a-button
                    :class="['main-color-btn']"
                    type="primary"
                    size="large"
                    @click="onNextQuestion"
                >
                    Next question
                    <i class="bx bx-chevron-right"></i>
                </a-button>
            </div>
            <a-drawer
                :width="500"
                title="Comment section"
                :placement="'right'"
                :open="commentModalOpen"
                @close="onCloseCommentModal"
            >
                <div class="comment-section">
                    <div class="comment-container">
                        <div class="comment-item" v-for="comment in comment_sample">
                            <img class="comment-user-img" src="" alt="" />
                            <div>
                                <div class="comment-content-info">
                                    {{ comment.user.userName }}
                                    <span>{{ comment.lastModified }}</span>
                                </div>
                                <div class="comment-content">{{ comment.content }}</div>
                            </div>
                        </div>
                    </div>
                    <a-form layout="vertical" class="comment-form">
                        <TextArea :label="'Your comment'" :placeholder="'Add a comment'" />
                        <div class="comment-form-footer">
                            <div class="me-3 main-color-btn-ghost">Cancel</div>
                            <a-button type="primary" shape="round" class="main-color-btn">
                                Comment
                            </a-button>
                        </div>
                    </a-form>
                </div>
            </a-drawer>
        </div>
    </div>

    <a-drawer
        :open="finalModalOpen"
        placement="top"
        :height="'100vh'"
        :closable="false"
        @close="closeFinalModal"
        :body-style="{ padding: 0, height: '100%' }"
    >
        <template #title>
            <div class="title-container">
                <a-row class="w-100 d-flex align-items-center">
                    <a-col :span="1">
                        <RouterLink :to="{ name: 'User_Library' }">
                            <i class="bx bx-chevron-left navigator-back-button"></i>
                        </RouterLink>
                    </a-col>
                    <a-col class="main-title" :span="23">
                        <span>Quiz title</span> <br />
                        <!-- <span> {{ quiz.title }}</span> <br /> -->
                    </a-col>
                </a-row>
            </div>
        </template>

        <div class="content-item modal-final-container">
            <div class="final-modal-quote">
                {{ finalModalQuote }}
            </div>
        </div>
        <div class="progress-bar-container final">
            <div class="progress-info">
                <div class="progress-info-percentage">
                    Total set progress:
                    <span>{{ completionPercentage }}%</span>
                </div>
            </div>
            <a-progress
                :show-info="false"
                stroke-color="#7C3AED"
                status="active"
                :percent="completionPercentage"
            />
            <div class="progress-info">
                <div class="progress-info-percentage">
                    Completed:
                    <span>{{ quiz.completedQuestionCount }}</span>
                </div>
                <div class="progress-info-percentage">
                    Total question:
                    <span>{{ quiz.totalQuestionCount }}</span>
                </div>
            </div>
        </div>
        <div class="content-item modal-final-container">
            <a-divider style="background-color: var(--content-item-border-color)"></a-divider>
            <div class="preview-question-title">Questions completed in this session</div>
            <div class="preview-question-container">
                <div class="preview-question-item" v-for="(question, index) in completed">
                    <div class="question-item-content">
                        <div
                            v-if="question.textFormat === QUESTION_FORMAT.HTML"
                            class="question-html"
                            v-html="question.questionText"
                        ></div>
                        <div v-else class="question-text">
                            {{ question.questionText }}
                        </div>
                        <div class="question-item-answer" :id="`question-item-answer-${index}`">
                            <template v-if="question.type === QUESTION_TYPE.MULTIPLE_CHOICE">
                                <div class="multiple-choice-answer">
                                    <ul>
                                        <li v-for="option in question.questionData.multipleChoice">
                                            {{ option.text }}
                                            <span class="text-success" v-if="option.isAnswer">
                                                ({{ option.isAnswer }})
                                            </span>
                                        </li>
                                    </ul>
                                </div>
                            </template>
                            <template v-if="question.type === QUESTION_TYPE.MATCHING">
                                <div
                                    class="pair-answer"
                                    v-for="option in question.questionData.matching?.matches"
                                >
                                    <span class="pair-answer-item">
                                        {{
                                            question.questionData.matching?.leftItems.find(
                                                (x) => x.id === option.leftId,
                                            )?.text
                                        }}
                                    </span>
                                    <i class="bx bx-right-arrow-alt"></i>
                                    <span class="pair-answer-item">
                                        {{
                                            question.questionData.matching?.rightItems.find(
                                                (x) => x.id === option.rightId,
                                            )?.text
                                        }}
                                    </span>
                                </div>
                            </template>
                            <template v-if="question.type === QUESTION_TYPE.ORDERING">
                                <div class="ordering-answer">
                                    <div class="ordering-answer-item">
                                        <div v-for="option in question.questionData.ordering">
                                            {{ option.text }}
                                        </div>
                                    </div>
                                    <i class="bx bx-right-arrow-alt"></i>
                                    <div class="ordering-answer-item">
                                        <div
                                            class="ordering-answer-item"
                                            v-for="(
                                                option, index
                                            ) in question.questionData.ordering?.sort(
                                                (asc, desc) => asc.correctOrder - desc.correctOrder,
                                            )"
                                        >
                                            <span>#{{ option.correctOrder }}</span> -
                                            {{ option.text }}
                                        </div>
                                    </div>
                                </div>
                            </template>
                            <template v-if="question.type === QUESTION_TYPE.SHORT_TEXT">
                                <span>Answer:</span>
                                <div class="short-text-answer">
                                    {{ question.questionData.shortText }}
                                </div>
                            </template>
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
            <div class="content-item final-modal-footer">
                <div>Press button to continues</div>
                <a-button
                    :class="['main-color-btn']"
                    type="primary"
                    size="large"
                    shape="round"
                    @click="onContinuesLearn"
                >
                    Continue
                </a-button>
            </div>
        </div>
    </a-drawer>

    <a-drawer
        :open="completeModalOpen"
        placement="top"
        :height="'100vh'"
        :closable="false"
        @close="closeFinalModal"
        :body-style="{ padding: 0, height: '100%' }"
    >
        <DotLottieVue
            v-if="isAnimationDisplaying"
            :autoplay="isAnimationDisplaying"
            ref="animationRef"
            :class="['animation-container']"
            @complete="isAnimationDisplaying = false"
            :src="animationPath"
        />
        <div class="modal-complete-container">
            <div class="content-item modal-complete">
                <img class="modal-complete-img" :src="trophy_png" alt="" />
                <div class="modal-complete-content-container">
                    <div class="modal-complete-content">Nice work! You've completed it!</div>
                    <div class="modal-complete-content sub-content">
                        Try another round to practice difficult questions, or test your knowledge!
                    </div>
                </div>
                <div class="modal-complete-buttons-container">
                    <a-button type="primary" class="main-color-btn ghost-btn" size="large">
                        Back to home page
                    </a-button>
                    <a-button type="primary" class="main-color-btn" size="large">
                        Take a test
                    </a-button>
                    <a-button
                        type="primary"
                        class="main-color-btn"
                        size="large"
                        @click="onResetLearnHistory"
                    >
                        Reset learn mode
                    </a-button>
                </div>
            </div>
        </div>
    </a-drawer>
</template>
<style>
.ant-drawer-content {
    background-color: var(--content-item-background-color) !important;
    border-color: var(--content-item-border-color) !important;
    color: var(--text-color) !important;
}

.ant-drawer-close {
    color: var(--text-color) !important;
}
.ant-drawer-title {
    color: var(--text-color) !important;
}
.ant-drawer-header {
    border-bottom-color: var(--content-item-border-color) !important;
}
</style>

<style scoped>
.page-container {
    height: 100vh;
}
.content-item {
    width: 70%;
    margin: 10px auto;
}
::v-deep(.answer-correct textarea) {
    border-color: #2ecc71;
}

::v-deep(.answer-incorrect textarea) {
    border-color: #e74c3c;
}

::v-deep(.ant-progress-bg) {
    background-color: var(--main-color) !important;
    height: 15px !important;
}

::v-deep(.ant-progress-text) {
    color: var(--text-color) !important;
    font-weight: 600;
    font-size: 14px;
}

::v-deep(.ant-progress-inner) {
    background-color: var(--content-item-border-color);
}
.relearn-ins {
    padding: 0px 10px;
    background-color: #f39c12;
    width: fit-content;
    border-radius: 100px;
    font-size: 14px;
    font-weight: 500;
    margin: 10px 0px;
}

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

.animation-container {
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: 1000;
}

.modal-complete-container {
    display: flex;
    justify-content: center;
    width: 100%;
    height: 100%;
}

.modal-complete {
    border-radius: 10px;
    border: 1px solid var(--form-item-border-color);
    background: var(--form-item-background-color);
    box-shadow:
        0 4px 6px -4px rgba(0, 0, 0, 0.1),
        0 10px 15px -3px rgba(0, 0, 0, 0.1);

    height: 80%;
    width: 80%;
    margin: auto;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}
.modal-complete-img {
    width: 130px;
    height: 130px;
}

.modal-complete-content-container {
    margin: 20px 0px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.modal-complete-content {
    color: var(--text-color);
    font-size: 32px;
    font-weight: 700;
    letter-spacing: -0.293px;
}
.modal-complete-content.sub-content {
    font-size: 18px;
    font-weight: 500;
}

.modal-complete-buttons-container {
    width: 40%;
    display: flex;
    justify-content: space-evenly;
}
.ghost-btn {
    background-color: transparent;
    border-color: var(--text-color);
    color: var(--text-color);
}
.ghost-btn:hover {
    background-color: transparent !important;
    border-color: var(--text-color-grey) !important;
}
</style>
