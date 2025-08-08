<script setup lang="ts">
import ApiQuestionSet from "@/api/ApiQuestionSet";
import QUESTION_FORMAT from "@/constants/questionTextFormat";
import QUESTION_TYPE from "@/constants/questionTypes";
import type { ResponseQuestion } from "@/models/response/question";
import ERROR from "@/constants/errors";

import { DotLottieVue } from "@lottiefiles/dotlottie-vue";
const animationPath = new URL("@/assets/confetti.lottie", import.meta.url).href;

import { ref, computed, onMounted, nextTick, reactive, watch } from "vue";

import TextArea from "@/shared/components/Common/TextArea.vue";
import { VueDraggable } from "vue-draggable-plus";
import { HolderOutlined } from "@ant-design/icons-vue";
import { Modal } from "ant-design-vue";
import Highcharts from "highcharts";
import { useRouter, useRoute } from "vue-router";
import Validator from "@/services/Validator";
import ShuffleQuestionData from "@/services/ShuffleQuestionData";

const route = useRoute();
const router = useRouter();

import { useI18n } from "vue-i18n";

const { t } = useI18n();

interface UserAnswer {
    questionId: string;
    type: string;
    isSkipped: boolean;
    result: boolean;
    resultText: string;
    multipleChoices: string[] | null;
    matchingLeft: any[] | null;
    matchingRight: any[] | null;
    ordering: any[] | null;
    shortText: string;
}

interface TestQuizModel {
    title: string;
    description: string;
    totalQuestionCount: number;
    questions: ResponseQuestion[];
}

const quiz = ref<TestQuizModel>({
    title: "",
    description: "",
    totalQuestionCount: 0,
    questions: [],
});

const incorrect = computed((): UserAnswer[] => {
    return userAnswer.value.filter((x) => x.result === false);
});

const currentQuestion = ref<ResponseQuestion>({} as ResponseQuestion);

const currentQuestionInstruction = ref("");
const currentQuestionIsSkipped = ref(false);
const isSubmitted = ref(false);

/* adjust multiple choice layout */
const isOptionExceed = computed(() => {
    return currentQuestion.value.questionData.multipleChoice?.some((x) => x.text.length >= 100);
});

const userAnswerMultipleChoice = ref<string[]>([]);

const userAnswerMatchingLeft = ref<any[]>([]);
const userAnswerMatchingRight = ref<any[]>([]);

const userAnswerOrdering = ref<any[]>([]);
const userAnswerShortText = ref<string>("");

const userAnswer = ref<UserAnswer[]>([]);

const reset = () => {
    userAnswer.value = [];
    isSubmitted.value = false;
    onLoadCurrentQuestion(0);
    syncMatchingHeights();
    timerStart();
};

//#region setting modal
/* setting modal  */
const setting_modal_open = ref(false);

const openSettingModal = () => {
    setting_modal_open.value = true;

    //get settings from session or default
    let session_settings = sessionStorage.getItem("test_settings");
    if (!session_settings) return;

    settingFormState.numberOfQuestion = JSON.parse(session_settings).numberOfQuestion;
    settingFormState.questionTypes = JSON.parse(session_settings).questionTypes;
};

const closeSettingModal = () => {
    setting_modal_open.value = false;
};

const settingFormRef = ref();
const settingFormState = reactive({
    numberOfQuestion: 5,
    questionTypes: [
        QUESTION_TYPE.MULTIPLE_CHOICE,
        QUESTION_TYPE.MATCHING,
        QUESTION_TYPE.ORDERING,
        QUESTION_TYPE.SHORT_TEXT,
    ],
});

const toggleQuestionType = (type: string, checked: boolean) => {
    if (checked) {
        if (!settingFormState.questionTypes.includes(type)) {
            settingFormState.questionTypes.push(type);
        }
    } else {
        const index = settingFormState.questionTypes.indexOf(type);
        if (index !== -1) {
            settingFormState.questionTypes.splice(index, 1);
        }
    }
};

const onCreateNewTest = async () => {
    reset();

    await getQuizData();

    //save settings to session
    sessionStorage.setItem("test_settings", JSON.stringify(settingFormState));

    closeSettingModal();
};

//#endregion

//#region init data
const questionSetId = ref<string>(route.params.id.toString());
const loading = ref(false);
const getQuizData = async () => {
    if (!Validator.isValidGuid(questionSetId.value.toString())) {
        router.push({ name: "404" });
        return;
    }
    try {
        loading.value = true;
        let detail_result = await ApiQuestionSet.GetDetailById(questionSetId.value.toString());

        quiz.value.title = detail_result.data.data.name;
        quiz.value.description = detail_result.data.data.description;
        quiz.value.totalQuestionCount = detail_result.data.data.questionCount;

        let result = await ApiQuestionSet.TestQuestions(
            questionSetId.value.toString(),
            settingFormState.numberOfQuestion,
            settingFormState.questionTypes.join(","),
        );

        if (!detail_result.data.success || !result.data.success) {
            router.push({ name: "404" });
            return;
        }

        quiz.value.questions = result.data.data.map((x: ResponseQuestion) =>
            ShuffleQuestionData.shuffleQuestionOptions(x),
        );
        // quiz.value.questions = result.data.data;

        onLoadCurrentQuestion(0);
    } catch (error: any) {
        const errorKeys = Object.keys(error.response.data.errors);
        if (errorKeys.includes(ERROR.PLAN_REQUIRE_PLAN)) {
            router.push({ name: "not-allowed" });
        }
    } finally {
        loading.value = false;
    }
};

//#endregion

//#region animation
const animationRef = ref();
const isAnimationDisplaying = ref(false);

const triggerAnimation = () => {
    isAnimationDisplaying.value = true;
    animationRef.value?.getDotLottieInstance()?.play();
    setTimeout(() => {
        isAnimationDisplaying.value = false;
    }, 5000);
};

//#endregion

//#region check user answer
const checkMultipleChoice = (id: string, answer: string[]) => {
    const index = quiz.value.questions.findIndex((x) => x.id === id);
    if (index === -1) return false;

    let correctAnswer = quiz.value.questions[index].questionData.multipleChoice
        ?.filter((x) => x.isAnswer)
        .map((x) => x.id || [])
        .sort();

    let sortedUserAnswer = answer.sort();
    if (answer.length !== correctAnswer?.length) return false;
    return sortedUserAnswer.every((value: string, i: number) => value === correctAnswer[i]);
};

/* use this for checking answer after submit */
const checkMultipleChoiceAnswerCorrect = (option: any) => {
    //only 2 cases allowed to display result: correct and user_answer + incorrect

    const index = quiz.value.questions.findIndex((x) => x.id === currentQuestion.value.id);
    let correctAnswer = quiz.value.questions[index].questionData.multipleChoice
        ?.filter((x) => x.isAnswer)
        .map((x) => x.id || []);

    const useAnswerIndex = userAnswer.value.findIndex(
        (x) => x.questionId === currentQuestion.value.id,
    );
    let user_answer = userAnswer.value[useAnswerIndex].multipleChoices;

    if (correctAnswer?.includes(option.id)) return true; //case 1
    if (user_answer?.includes(option.id) && !option.isAnswer) return false; //case 2

    return true;
};

const checkOrdering = (id: string, answer: any[]) => {
    const index = quiz.value.questions.findIndex((x) => x.id === id);
    if (index === -1) return false;

    let correctAnswer =
        quiz.value.questions[index].questionData.ordering?.map((x) => x.correctOrder).sort() || [];

    let userAnswer = answer.map((x) => x.correctOrder);
    return userAnswer.every((value: number, i: number) => value === correctAnswer[i]);
};

const checkMatching = (id: string, answerLeft: any[], answerRight: any[]) => {
    const index = quiz.value.questions.findIndex((x) => x.id === id);
    if (index === -1) return false;
    let correctMatch = quiz.value.questions[index].questionData.matching!.matches;

    let userAnswerLeft = answerLeft.map((x) => x.id);
    let userAnswerRight = answerRight.map((x) => x.id);

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

//get user answer result
const checkShortText = (id: string, answer: string) => {
    const index = quiz.value.questions.findIndex((x) => x.id === id);
    if (index === -1) return false;
    return (
        cleanShortTextAnswer(answer) ===
        cleanShortTextAnswer(quiz.value.questions[index].questionData.shortText!)
    );
};

// get UI
const checkShortextCorrect = () => {
    const answer = userAnswer.value.find(
        (x) => x.questionId === currentQuestion.value.id,
    )?.shortText;
    if (!answer) return false;

    const correct = quiz.value.questions.find((x) => x.id === currentQuestion.value.id)
        ?.questionData.shortText!;

    return cleanShortTextAnswer(answer) === cleanShortTextAnswer(correct);
};

//get correct answer if user answer is incorrect
const getShortTextCorrectAnswer = computed(() => {
    if (
        currentQuestion.value.type === QUESTION_TYPE.SHORT_TEXT &&
        isSubmitted.value &&
        !checkShortextCorrect()
    ) {
        return quiz.value.questions.find((x) => x.id === currentQuestion.value.id)?.questionData
            .shortText;
    }
});

//#endregion

//#region explain modal
/* explain modal bottom */
const explainModal = ref<HTMLElement | null>(null);
const explainModalOpen = ref(false);
const toggleExplainModal = () => {
    explainModalOpen.value = !explainModalOpen.value;
};

//#endregion

//#region logic complete question
/* handle logic complete question */
const updateUserAnswer = (index: number, newAnswer: UserAnswer) => {
    if (index === -1) {
        userAnswer.value.push(newAnswer);
    } else {
        userAnswer.value[index] = newAnswer;
    }
};

//track change when user perform actions on questions
const onUserAnswerChange = () => {
    if (isSubmitted.value) return; //prevent change detected after submit and re-format user answer

    const index = userAnswer.value.findIndex((x) => x.questionId === currentQuestion.value.id);

    //user changed but still chose to skip
    const isSkipped = currentQuestionIsSkipped.value;
    const resultText = currentQuestionIsSkipped.value ? t("learn_QS.result.skipped") : "";

    switch (currentQuestion.value.type) {
        case QUESTION_TYPE.MULTIPLE_CHOICE: {
            if (userAnswerMultipleChoice.value.length > 0) {
                updateUserAnswer(index, {
                    questionId: currentQuestion.value.id,
                    type: currentQuestion.value.type,
                    isSkipped: isSkipped,
                    result: false,
                    resultText: resultText,
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
                isSkipped: isSkipped,
                result: false,
                resultText: resultText,
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
                isSkipped: isSkipped,
                result: false,
                resultText: resultText,
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
                    isSkipped: isSkipped,
                    result: false,
                    resultText: resultText,
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

const refactorLeftOverUserAnswer = (quiz_answer: any, base: UserAnswer): UserAnswer => {
    switch (quiz_answer.type) {
        case QUESTION_TYPE.MULTIPLE_CHOICE:
            return {
                ...base,
                multipleChoices:
                    quiz_answer.questionData.multipleChoice
                        ?.filter((x: any) => x.isAnswer)
                        .map((x: any) => x.id) ?? [],
            };
        case QUESTION_TYPE.MATCHING: {
            const matching = quiz_answer.questionData.matching;
            const matches = matching?.matches ?? [];
            const leftItems = matching?.leftItems ?? [];
            const rightItems = matching?.rightItems ?? [];

            const matchingLeft = matches.map((match: any) =>
                leftItems.find((item: any) => item.id == match.leftId),
            );
            const matchingRight = matches.map((match: any) =>
                rightItems.find((item: any) => item.id == match.rightId),
            );

            return {
                ...base,
                matchingLeft,
                matchingRight,
            };
        }
        case QUESTION_TYPE.ORDERING:
            return {
                ...base,
                ordering:
                    quiz_answer.questionData.ordering
                        ?.slice()
                        .sort((a: any, b: any) => a.correctOrder - b.correctOrder) ?? [],
            };
        case QUESTION_TYPE.SHORT_TEXT:
            return {
                ...base,
                shortText: quiz_answer.questionData.shortText ?? "",
            };
        default:
            return base;
    }
};

const handleSkippedQuestion = () => {
    quiz.value.questions.forEach((x) => {
        const base = {
            questionId: x.id,
            type: x.type,
            isSkipped: true,
            result: false,
            resultText: t("learn_QS.result.skipped"),
            multipleChoices: null,
            matchingLeft: null,
            matchingRight: null,
            ordering: null,
            shortText: "",
        };

        let index = userAnswer.value.findIndex((answer) => answer.questionId === x.id);

        //add leftover question
        if (index === -1) {
            userAnswer.value.push(refactorLeftOverUserAnswer(x, base));
            index = userAnswer.value.length - 1; //update to the pushed index
        }

        //update skipped question by single (dontknow)
        if (userAnswer.value[index].isSkipped) {
            updateUserAnswer(index, {
                ...userAnswer.value[index],
                ...refactorLeftOverUserAnswer(x, {} as UserAnswer), //keep default base answer
            });
        }
    });
};

const onSubmitAnswer = () => {
    timerEnd();
    // onUserAnswerChange();
    if (userAnswer.value.length < quiz.value.questions.length) {
        Modal.confirm({
            title: `You missed ${quiz.value.questions.length - userAnswer.value.length} questions.`,
            content: "Are you certain about this decision?",
            centered: true,
            onOk: () => {
                //import all left over question from quiz in to userAnswer
                isSubmitted.value = true;
                handleSkippedQuestion();
                getUserAnswerResult();
            },
        });
    } else {
        isSubmitted.value = true;
        getUserAnswerResult();
    }
};

//calculate user result
const getUserAnswerResult = () => {
    //incase user does not interact anything in currentquestion and skip => show them correct answer
    const index = quiz.value.questions.findIndex((x) => x.id === currentQuestion.value.id);
    onLoadCurrentQuestion(index);

    userAnswer.value
        .filter((x) => x.isSkipped === false)
        .forEach((answer: UserAnswer) => {
            let result;
            switch (answer.type) {
                case QUESTION_TYPE.MULTIPLE_CHOICE: {
                    result = checkMultipleChoice(answer.questionId, answer.multipleChoices!);
                    answer.result = result;
                    answer.resultText = result
                        ? t("learn_QS.result.correct")
                        : t("learn_QS.result.wrong");
                    break;
                }
                case QUESTION_TYPE.MATCHING: {
                    result = checkMatching(
                        answer.questionId,
                        answer.matchingLeft!,
                        answer.matchingRight!,
                    );
                    answer.result = result;
                    answer.resultText = result
                        ? t("learn_QS.result.correct")
                        : t("learn_QS.result.wrong");
                    break;
                }
                case QUESTION_TYPE.ORDERING: {
                    result = checkOrdering(answer.questionId, answer.ordering!);
                    answer.result = result;
                    answer.resultText = result
                        ? t("learn_QS.result.correct")
                        : t("learn_QS.result.wrong");
                    break;
                }
                case QUESTION_TYPE.SHORT_TEXT: {
                    result = checkShortText(answer.questionId, answer.shortText);
                    answer.result = result;
                    answer.resultText = result
                        ? t("learn_QS.result.correct")
                        : t("learn_QS.result.wrong");
                    break;
                }
            }
        });

    generateChart();

    if (incorrect.value.length === 0) triggerAnimation();
};

//skip single current question
const onSkipQuestion = () => {
    currentQuestionIsSkipped.value = true;

    const index = userAnswer.value.findIndex((x) => x.questionId === currentQuestion.value.id);
    updateUserAnswer(index, {
        questionId: currentQuestion.value.id,
        type: currentQuestion.value.type,
        isSkipped: true,
        result: false,
        resultText: "Skipped",
        multipleChoices: userAnswerMultipleChoice.value,
        matchingLeft: userAnswerMatchingLeft.value,
        matchingRight: userAnswerMatchingRight.value,
        ordering: userAnswerOrdering.value,
        shortText: userAnswerShortText.value,
    });
};

const onLoadCurrentQuestion = (index: number) => {
    syncMatchingHeights();
    currentQuestionIsSkipped.value = false;

    currentQuestion.value = quiz.value.questions[index] as ResponseQuestion;
    const answer = userAnswer.value.find((x) => x.questionId === currentQuestion.value.id);

    switch (currentQuestion.value.type) {
        case QUESTION_TYPE.MULTIPLE_CHOICE: {
            currentQuestionInstruction.value = t("learn_QS.instructions.multiple_choice", {
                number: currentQuestion.value.questionData.multipleChoice?.filter((x) => x.isAnswer)
                    .length,
            });
            userAnswerMultipleChoice.value = answer ? answer?.multipleChoices! : [];
            break;
        }

        case QUESTION_TYPE.ORDERING: {
            currentQuestionInstruction.value = t("learn_QS.instructions.matching");
            userAnswerOrdering.value = answer
                ? answer?.ordering!
                : currentQuestion.value.questionData.ordering?.map((x) => x) || [];
            break;
        }

        case QUESTION_TYPE.MATCHING: {
            currentQuestionInstruction.value = t("learn_QS.instructions.ordering");
            userAnswerMatchingLeft.value = answer
                ? answer?.matchingLeft!
                : currentQuestion.value.questionData.matching!.leftItems.map((x) => x) || [];

            userAnswerMatchingRight.value = answer
                ? answer?.matchingRight!
                : currentQuestion.value.questionData.matching!.rightItems.map((x) => x) || {};

            break;
        }

        case QUESTION_TYPE.SHORT_TEXT: {
            currentQuestionInstruction.value = t("learn_QS.instructions.short_text");
            userAnswerShortText.value = answer ? answer?.shortText! : "";
            break;
        }
    }
};

const onNextQuestion = () => {
    currentQuestionIsSkipped.value = false;

    const index = quiz.value.questions.findIndex((x) => x.id === currentQuestion.value.id);

    if (index < quiz.value.questions.length - 1) {
        onLoadCurrentQuestion(index + 1);
    }
};

const onPreviousQuestion = () => {
    currentQuestionIsSkipped.value = false;

    const index = quiz.value.questions.findIndex((x) => x.id === currentQuestion.value.id);

    if (index > 0) {
        onLoadCurrentQuestion(index - 1);
    }
};

const userAnswerContainQuestion = (questionId: string) => {
    return Array.from(userAnswer.value).some((x) => x.questionId === questionId);
};

const getUserAnswerResultById = (id: string) => {
    return userAnswer.value.find((x) => x.questionId === id && !x.isSkipped)?.result;
};

const userAnswerCurrentQuestionSkipped = computed(() => {
    return userAnswer.value.some((x) => x.questionId === currentQuestion.value.id && x.isSkipped);
});

const userAnswerCurrentQuestionResult = computed(() => {
    const result = userAnswer.value.find((x) => x.questionId === currentQuestion.value.id);
    return {
        result: result?.result,
        resultText: result?.resultText,
    };
});

const hasNextQuestion = computed(() => {
    const index = quiz.value.questions.findIndex((x) => x.id === currentQuestion.value.id);
    return index !== -1 && index < quiz.value.questions.length - 1;
});

const hasPreviousQuestion = computed(() => {
    const index = quiz.value.questions.findIndex((x) => x.id === currentQuestion.value.id);
    return index !== -1 && index > 0;
});

const currentQuestionIndex = computed(() => {
    return quiz.value.questions.findIndex((x) => x.id === currentQuestion.value.id);
});

//#endregion

//#region final chart
const getCorrectPercentage = () => {
    return Math.floor(
        ((quiz.value.questions.length - incorrect.value.length) / quiz.value.questions.length) *
            100,
    );
};

const getInCorrectPercentage = () => {
    return Math.floor((incorrect.value.length / quiz.value.questions.length) * 100);
};

const toggleResult = () => {
    const content_item_result = $(".content-item-test-result");
    if (content_item_result) $(content_item_result).slideToggle();
};

const generateChart = () => {
    toggleResult();
    Highcharts.setOptions({
        lang: {
            decimalPoint: ".",
            thousandsSep: ",",
        },
    });
    Highcharts.chart("result_chart_container", {
        chart: {
            type: "pie",
            custom: {} as any,
            events: {
                render: function (this: Highcharts.Chart) {
                    const chart = this;
                    const series = chart.series[0] as Highcharts.Series & {
                        center: [number, number];
                    };
                    let customLabel = (chart.options.chart as any).custom.label as
                        | Highcharts.SVGElement
                        | undefined;

                    if (!customLabel) {
                        customLabel = (chart.options.chart as any).custom.label = chart.renderer
                            .label(`<strong>${getCorrectPercentage()}%</strong>`, 0, 0)
                            .css({
                                color: "var(--text-color)",
                                textAnchor: "middle",
                            })
                            .add();
                    }

                    const x = series.center[0] + chart.plotLeft,
                        y =
                            series.center[1] +
                            chart.plotTop -
                            (customLabel.attr("height") as number) / 2;

                    customLabel.attr({
                        x,
                        y,
                    });
                    // adjust font size based on chart width
                    customLabel.css({
                        fontSize: `${series.center[2] / 8}px`,
                    });
                },
            },
        },
        credits: {
            enabled: false,
        },
        plotOptions: {
            pie: {
                borderWidth: 0,
                borderRadius: 3,
            },
        },
        tooltip: {
            pointFormat: "{series.name}: <b>{point.percentage:.0f}%</b>",
        },
        series: [
            {
                type: "pie",
                name: "Result",
                colorByPoint: true,
                innerSize: "75%",
                dataLabels: {
                    enabled: false,
                },
                data: [
                    {
                        name: t("practice_test.other.correct"),
                        y: getCorrectPercentage(),
                        color: "var(--correct-answer-color)",
                    },
                    {
                        name: t("practice_test.other.incorrect"),
                        y: getInCorrectPercentage(),
                        color: "var(--incorrect-answer-color)",
                    },
                ],
            },
        ] as any,
    } as Highcharts.Options);
};
//#endregion

//#region timer
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
dayjs.extend(duration);

const startTime = ref<dayjs.Dayjs>();
const timerResult = ref<string>("");

const timerStart = () => {
    startTime.value = dayjs();
};

const timerEnd = () => {
    const endTime = dayjs();
    const diffMs = endTime.diff(startTime.value); // get duration in milliseconds
    const diffSeconds = Math.floor(diffMs / 1000); //convert to second

    if (diffSeconds < 60) {
        timerResult.value = `${t("practice_test.other.your_time")} ${diffSeconds} ${diffSeconds === 1 ? t("practice_test.other.second") : t("practice_test.other.second_plural")}`;
    } else {
        const duration_ms = dayjs.duration(diffMs);
        const hours = duration_ms.hours();
        const minutes = duration_ms.minutes();

        let result = t("practice_test.other.your_time");
        if (hours > 0)
            result += `${hours} ${hours > 1 ? t("practice_test.other.hour") : t("practice_test.other.hour_plural")} `;
        if (minutes > 0)
            result += `${minutes} ${minutes > 1 ? t("practice_test.other.minute") : t("practice_test.other.minute_plural")}`;
        timerResult.value = result.trim();
    }
};

//#endregion

//#region calculate UI
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
//#endregion

//#region final buttons
const onNewTest = () => {
    window.location.reload();
};

const onRedirectToLearn = () => {
    router.push({ name: "User_QuestionSet_Learn", params: { id: questionSetId.value } });
};

const onRetest = () => {
    const incorrectIds = incorrect.value.map((x) => x.questionId);
    quiz.value.questions = quiz.value.questions.filter((x) => incorrectIds.includes(x.id));

    reset();
    toggleResult();
};

//#endregion

onMounted(async () => {
    let session_settings = sessionStorage.getItem("test_settings");
    if (session_settings) {
        settingFormState.numberOfQuestion = JSON.parse(session_settings).numberOfQuestion;
        settingFormState.questionTypes = JSON.parse(session_settings).questionTypes;
    }

    await getQuizData();

    openSettingModal();
    onLoadCurrentQuestion(0);
    syncMatchingHeights();
    window.addEventListener("resize", syncMatchingHeights);
    console.log(currentQuestion.value);

    timerStart();
});
</script>

<template>
    <div class="page-container">
        <DotLottieVue
            v-if="isAnimationDisplaying"
            :autoplay="isAnimationDisplaying"
            ref="animationRef"
            :class="['animation-container']"
            @complete="isAnimationDisplaying = false"
            :src="animationPath"
        />
        <div class="title-container title-container-header">
            <a-row class="w-100 d-flex align-items-center">
                <a-col :span="1">
                    <RouterLink :to="{ name: 'User_Library' }">
                        <i class="bx bx-chevron-left navigator-back-button"></i>
                    </RouterLink>
                </a-col>
                <a-col class="main-title" :span="22">
                    <span> {{ quiz.title }}</span> <br />
                    <span>
                        {{ quiz.description }}
                    </span>
                </a-col>
                <a-col :span="1">
                    <i class="bx bx-cog test-setting-btn" @click="openSettingModal"></i>
                </a-col>
            </a-row>
        </div>

        <div class="content content-test d-flex flex-column">
            <div class="d-flex">
                <div class="content-item question-navigators">
                    <div class="question-navigator-title">
                        {{ t("practice_test.other.question_list") }}
                    </div>
                    <template v-if="loading">
                        <a-skeleton :loading="loading"></a-skeleton>
                    </template>
                    <div v-else class="question-navigator-container">
                        <div
                            :class="[
                                'question-navigation-item-outer',
                                currentQuestion.id === item.id ? 'current-question' : '',
                            ]"
                            v-for="(item, index) in quiz.questions"
                        >
                            <div
                                :class="[
                                    'question-navigator-item',
                                    userAnswerContainQuestion(item.id) ? 'completed-question' : '',
                                    isSubmitted
                                        ? getUserAnswerResultById(item.id)
                                            ? 'correct'
                                            : 'incorrect'
                                        : '',
                                ]"
                                @click="onLoadCurrentQuestion(index)"
                            >
                                <span> {{ index + 1 }} </span>
                            </div>
                        </div>
                    </div>
                    <a-button
                        type="primary"
                        :class="['main-color-btn', isSubmitted ? 'main-color-btn-disabled' : '']"
                        @click="onSubmitAnswer"
                    >
                        {{ $t("learn_QS.buttons.submit") }}
                    </a-button>
                </div>
                <div class="content-item content-item-test-result">
                    <div class="result-container">
                        <div class="result-section">
                            <div class="result-section-title">
                                {{ timerResult }}
                            </div>
                            <div class="result-section-statistic">
                                <div id="result_chart_container"></div>
                                <div class="result-text-container">
                                    <div class="result-text correct">
                                        {{ $t("practice_test.other.correct") }}
                                        <span>{{ quiz.questions.length - incorrect.length }}</span>
                                    </div>
                                    <div class="result-text incorrect">
                                        {{ $t("practice_test.other.incorrect") }}
                                        <span> {{ incorrect.length }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="result-section result-section-buttons">
                            <div class="result-section-title">
                                {{ $t("practice_test.final_modal.button_title") }}
                            </div>
                            <div class="result-button" @click="onNewTest">
                                <i class="bx bxs-news"></i>
                                <div>
                                    <div class="result-button-title">
                                        {{ $t("practice_test.final_modal.buttons.new_test") }}
                                    </div>
                                    <div class="result-button-content">
                                        {{ $t("practice_test.final_modal.buttons_ins.new_test") }}
                                    </div>
                                </div>
                            </div>
                            <div
                                class="result-button"
                                v-if="getInCorrectPercentage() <= 30"
                                @click="onRedirectToLearn"
                            >
                                <i class="bx bx-analyse"></i>
                                <div>
                                    <div class="result-button-title">
                                        {{ $t("practice_test.final_modal.buttons.practice") }}
                                    </div>
                                    <div class="result-button-content">
                                        {{ $t("practice_test.final_modal.buttons_ins.practice") }}
                                    </div>
                                </div>
                            </div>
                            <div
                                class="result-button"
                                v-if="getInCorrectPercentage() > 30"
                                @click="onRetest"
                            >
                                <i class="bx bx-reset"></i>
                                <div>
                                    <div class="result-button-title">
                                        {{ $t("practice_test.final_modal.buttons.re_test") }}
                                    </div>
                                    <div class="result-button-content">
                                        {{ $t("practice_test.final_modal.buttons_ins.re_test") }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="content-item">
                <template v-if="loading">
                    <a-skeleton :loading="loading"></a-skeleton>
                    <a-skeleton :loading="loading"></a-skeleton>
                    <a-skeleton :loading="loading"></a-skeleton>
                </template>
                <div v-else class="section question-section">
                    <div class="question-info-index">
                        {{ $t("create_QS.question.question") }} {{ currentQuestionIndex + 1 }}
                    </div>
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
                        <div class="d-flex align-items-center">
                            <div class="answer-section-ins">
                                {{ currentQuestionInstruction }}
                            </div>
                            <div
                                :class="[
                                    'ms-3 learn-question-result',
                                    isSubmitted
                                        ? userAnswerCurrentQuestionResult.result
                                            ? 'result-correct'
                                            : 'result-incorrect'
                                        : '',
                                    userAnswerCurrentQuestionSkipped ? 'result-skipped' : '',
                                ]"
                            >
                                {{ userAnswerCurrentQuestionResult.resultText }}
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
                                        :disabled="userAnswerCurrentQuestionSkipped || isSubmitted"
                                        :class="[
                                            'answer-option answer-option-multiplechoice',
                                            isSubmitted &&
                                            checkMultipleChoiceAnswerCorrect(option) &&
                                            option.isAnswer
                                                ? 'answer-correct'
                                                : '',
                                            isSubmitted &&
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
                                                isSubmitted &&
                                                checkMultipleChoiceAnswerCorrect(option) &&
                                                option.isAnswer
                                            "
                                            class="bx bx-check answer-icon"
                                        ></i>
                                        <i
                                            v-if="
                                                isSubmitted &&
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
                                        :disabled="userAnswerCurrentQuestionSkipped || isSubmitted"
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
                                                        isSubmitted
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
                                                        isSubmitted
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
                                        :disabled="userAnswerCurrentQuestionSkipped || isSubmitted"
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
                                                <i
                                                    :class="[
                                                        'bx bxs-label matching-icon',
                                                        isSubmitted
                                                            ? checkMatchingAnswerCorrect(option.id)
                                                                ? 'answer-correct-icon'
                                                                : 'answer-incorrect-icon'
                                                            : '',
                                                    ]"
                                                ></i>
                                                <div
                                                    :class="[
                                                        'answer-option answer-option-matching',
                                                        isSubmitted
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
                                    :disabled="userAnswerCurrentQuestionSkipped || isSubmitted"
                                    v-model="userAnswerOrdering"
                                    :options="dragOptions"
                                    @end="onUserAnswerChange"
                                >
                                    <template v-for="(option, index) in userAnswerOrdering">
                                        <div
                                            :class="[
                                                'answer-option answer-option-ordering',
                                                isSubmitted
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
                                                    !isSubmitted ? 'd-none' : '',
                                                ]"
                                            >
                                                <i class="bx bx-hash answer-icon"></i>
                                                {{ option.correctOrder + 1 }}
                                            </div>
                                        </div>
                                    </template>
                                </VueDraggable>
                            </div>
                        </template>

                        <template v-if="currentQuestion.type === QUESTION_TYPE.SHORT_TEXT">
                            <div class="answer-option-container">
                                <div
                                    :class="[
                                        'answer-short-text',
                                        isSubmitted
                                            ? checkShortextCorrect()
                                                ? 'answer-correct'
                                                : 'answer-incorrect'
                                            : '',
                                    ]"
                                >
                                    <div class="w-100 d-flex align-items-center">
                                        <TextArea
                                            :readonly="
                                                userAnswerCurrentQuestionSkipped || isSubmitted
                                            "
                                            :placeholder="'Enter your answer...'"
                                            v-model="userAnswerShortText"
                                            @change="onUserAnswerChange"
                                        />
                                        <i
                                            v-if="isSubmitted && checkShortextCorrect()"
                                            class="bx bx-check answer-icon"
                                        ></i>
                                        <i
                                            v-if="isSubmitted && !checkShortextCorrect()"
                                            class="bx bx-x answer-icon"
                                        ></i>
                                    </div>
                                    <div
                                        v-if="isSubmitted && !checkShortextCorrect()"
                                        class="short-text-correct-answer"
                                    >
                                        Correct answer:
                                        <span> {{ getShortTextCorrectAnswer }} </span>
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
                            {{ $t("practice_test.buttons.previous") }}
                        </a-button>
                        <div
                            :class="[
                                'main-color-btn-ghost',
                                userAnswerCurrentQuestionSkipped || isSubmitted
                                    ? 'main-color-btn-ghost-disabled'
                                    : '',
                            ]"
                            @click="onSkipQuestion()"
                        >
                            {{ $t("learn_QS.buttons.dont_know") }}
                        </div>
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
                                {{ $t("learn_QS.buttons.next_question") }}
                                <i class="bx bx-chevron-right"></i>
                            </a-button>
                        </div>
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
                    {{ $t("learn_QS.buttons.next_question") }}
                    <i class="bx bx-chevron-right"></i>
                </a-button>
            </div>
        </div>
    </div>

    <a-modal
        centered
        wrap-class-name="medium-modal"
        :open="setting_modal_open"
        @cancel="closeSettingModal"
    >
        <div class="title-container">
            <a-row class="w-100 d-flex align-items-center justify-content-between">
                <a-col :span="1">
                    <div @click="closeSettingModal">
                        <i class="bx bx-chevron-left navigator-back-button"></i>
                    </div>
                </a-col>
                <a-col class="main-title" :span="20">
                    <span> {{ $t("practice_test.setting_modal.title") }}</span> <br />
                </a-col>
            </a-row>
        </div>
        <a-form class="setting-form">
            <a-form-item>
                <div class="setting-form-item">
                    <div>
                        {{
                            $t("practice_test.setting_modal.max_question", {
                                length: quiz.totalQuestionCount,
                            })
                        }}
                    </div>
                    <a-input-number
                        size="large"
                        id="inputNumber"
                        v-model:value="settingFormState.numberOfQuestion"
                        :min="5"
                        :max="quiz.totalQuestionCount"
                    />
                </div>
            </a-form-item>
            <a-divider style="background-color: var(--form-item-border-color)"></a-divider>
            <a-form-item>
                <div class="setting-form-item setting-form-switch" v-for="type in QUESTION_TYPE">
                    <div>{{ t(`create_QS.type.${type}`) }}</div>
                    <a-switch
                        :disabled="
                            settingFormState.questionTypes.length <= 1 &&
                            settingFormState.questionTypes.includes(type)
                        "
                        :checked="settingFormState.questionTypes.includes(type)"
                        @change="(checked: boolean) => toggleQuestionType(type, checked)"
                    ></a-switch>
                </div>
            </a-form-item>
        </a-form>

        <template #footer>
            <a-button
                type="primary"
                class="main-color-btn"
                size="large"
                shape="round"
                @click="onCreateNewTest"
            >
                {{ t("practice_test.setting_modal.create_new_test") }}
            </a-button>
        </template>
    </a-modal>
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
.question-navigation-item-outer {
    width: calc(100% / 4 - 8px);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0px 0px 3px 3px;
    padding: 3px;
    border: 2px solid var(--form-item-border-color);
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    position: relative;
    overflow: hidden;
}

.question-navigator-item {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 3px;
}

.question-navigation-item-outer:hover {
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

.completed-question.correct {
    background-color: var(--correct-answer-color);
    border-color: var(--correct-answer-color);
}
.completed-question.incorrect {
    background-color: var(--incorrect-answer-color);
    border-color: var(--incorrect-answer-color);
}
.learn-question-footer {
    padding: 0px;
}

#result_chart_container {
    width: 200px;
    height: 200px;
}

::v-deep(.highcharts-background) {
    fill: transparent;
}

::v-deep(.highcharts-title) {
    display: none;
}

.content-item-test-result {
    display: none;
}
.result-container {
    display: flex;
    align-items: start;
    justify-content: space-between;
}
.result-text-container {
    font-size: 18px;
}
.result-text {
    margin: 20px 10px;
    width: 160px;
    display: flex;
    justify-content: space-between;
    font-weight: 600;
}
.result-text span {
    padding: 0px 20px;
    border: 2px solid transparent;
    border-radius: 500px;
}
.result-text.correct {
    color: var(--correct-answer-color);
}
.result-text.correct span {
    border-color: var(--correct-answer-color);
}

.result-text.incorrect {
    color: var(--incorrect-answer-color);
}

.result-text.incorrect span {
    border-color: var(--incorrect-answer-color);
}

::v-deep(.answer-correct textarea) {
    border-color: var(--correct-answer-color);
}

::v-deep(.answer-incorrect textarea) {
    border-color: var(--incorrect-answer-color);
}
.test-setting-btn {
    font-size: 30px;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
}
.test-setting-btn:hover {
    font-size: 35px;
    transform: rotate(180deg);
}

.result-section-title {
    font-size: 18px;
    font-weight: 500;
    color: var(--text-color-grey);
    text-align: end;
}

.result-section-statistic {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.result-section-buttons {
    display: flex;
    flex-direction: column;
    justify-content: end;
    align-items: start;
}
.result-button {
    display: flex;
    align-items: center;
    width: 400px;
    margin: 10px 0px;
    padding: 5px;
    height: 80px;
    max-height: 80px;
    max-width: 400px;
    border: 1px solid var(--main-color);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
}
.result-button:hover {
    background-color: var(--main-color);
}
.result-button:hover .result-button-title {
    color: var(--text-color);
}

.result-button i {
    margin: 10px;
    font-size: 30px;
}

.result-button-title {
    font-size: 20px;
    font-weight: 500;
    color: var(--main-color);
    transition: all 0.2s ease-in-out;
}

.result-button-content {
    font-size: 15px;
    color: var(--text-color);
}

.setting-form {
    padding: 10px;
}

.setting-form-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 20px 0px;
    color: var(--text-color);
    font-size: 16px;
    font-weight: 500;
}
.setting-form-switch {
    padding-bottom: 5px;
    border-bottom: 1px solid var(--form-item-border-color);
}

.animation-container {
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: 100;
}

.question-info-index {
    font-size: 16px;
    font-weight: 500;
    padding: 5px 10px;
    background-color: var(--main-color);
    border: 1px solid var(--main-color);
    border-radius: 5px;
    width: fit-content;
}
</style>
