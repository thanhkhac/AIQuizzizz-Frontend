<script setup lang="ts">
import { ref, computed, onMounted, nextTick, reactive } from "vue";

import QUESTION_TYPE from "@/constants/questionTypes";
import { QUOTES } from "@/constants/quote";

import type { Question } from "@/models/response/question";
import TextArea from "@/shared/components/Common/TextArea.vue";
import { VueDraggable } from "vue-draggable-plus";
import { HolderOutlined } from "@ant-design/icons-vue";
import { Modal } from "ant-design-vue";
import Highcharts from "highcharts";

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

const QUESTION_FORMAT = {
    HTML: "HTML",
    PLAIN_TEXT: "PlainText",
};

const quiz = {
    id: "123456",
    title: "Programming fundamental",
    description: "Basic knowledge about programming.",
    totalQuestion: 30,
    completed: 8,
    question: [
        {
            id: "11111111-aaaa-aaaa-aaaa-111111111111",
            questionSetId: "11111111-1111-1111-1111-111111111111",
            type: "MultipleChoice",
            textFormat: "HTML",
            questionText:
                "<p>Which of the following are valid variable declarations in JavaScript?<br/><pre>let x = 5;<br>const y = 'hello';<br>var 1name = 'error';</pre></p>",
            score: 10.0,
            scoreGraded: 0.0,
            explainText:
                "Variables in JavaScript cannot start with a number. 'let x = 5' and 'const y = \"hello\"' are valid, but 'var 1name = \"error\"' is invalid.",
            questionData: {
                multipleChoice: [
                    {
                        id: "a1",
                        text: "Giữ vững địa vị thống trị của giai cấp công nhân thông qua Đảng Cộng sản Việt Nam trong mối liên minh giai cấp",
                        isAnswer: true,
                    },
                    {
                        id: "a2",
                        text: "Giữ vững lập trường chính trị - tư tưởng của giai cấp công nhân, vai trò lãnh đạo của Đảng Cộng sản Việt Nam, giữ vững độc lập dân tộc và định hướng đi lên chủ nghĩa xã hội",
                        isAnswer: true,
                    },
                    {
                        id: "a3",
                        text: "Giữ vững nền kinh tế thị trường theo hướng hiện đại, kiên định con đường đi lên chủ nghĩa xã hội",
                        isAnswer: false,
                    },
                    {
                        id: "a4",
                        text: "Giữ vững nền kinh tế thị trường theo hướng hiện đại, kiên định con đường đi lên chủ nghĩa xã hội",
                        isAnswer: false,
                    },
                ],
                matching: null,
                ordering: null,
                shortText: null,
            },
        },
        {
            id: "44444444-dddd-dddd-dddd-444444444444",
            questionSetId: "11111111-1111-1111-1111-111111111111",
            type: "ShortText",
            textFormat: "HTML",
            questionText:
                "What is the output of the following code?<br/><pre>console.log(typeof null);</pre>",
            score: 5.0,
            scoreGraded: 5.0,
            explainText:
                "`typeof null` returns `'object'` due to a historical bug in JavaScript that has been preserved for backward compatibility.",
            questionData: {
                multipleChoice: null,
                matching: null,
                ordering: null,
                shortText: "object",
            },
        },
        {
            id: "22222222-bbbb-bbbb-bbbb-222222222222",
            questionSetId: "11111111-1111-1111-1111-111111111111",
            type: "Matching",
            textFormat: "PlainText",
            questionText: "Match the data types with appropriate examples.",
            score: 10.0,
            scoreGraded: 10.0,
            explainText:
                "A string is a series of characters like 'Hello World'. A boolean can be true or false. A number is a numeric value like 42.",
            questionData: {
                multipleChoice: null,
                ordering: null,
                shortText: null,
                matching: {
                    leftItems: [
                        { id: "l1", text: "String" },
                        { id: "l2", text: "Boolean" },
                        { id: "l3", text: "Number" },
                    ],
                    rightItems: [
                        { id: "r1", text: "'Hello World'" },
                        { id: "r2", text: "true" },
                        { id: "r3", text: "42" },
                    ],
                    matches: [
                        { leftId: "l1", rightId: "r1" },
                        { leftId: "l2", rightId: "r2" },
                        { leftId: "l3", rightId: "r3" },
                    ],
                },
            },
        },
        {
            id: "33333333-cccc-cccc-cccc-333333333333",
            questionSetId: "11111111-1111-1111-1111-111111111111",
            type: "Ordering",
            textFormat: "PlainText",
            questionText: "Arrange the steps of executing a JavaScript function.",
            score: 10.0,
            scoreGraded: 10.0,
            explainText:
                "First, the function must be declared. Then it can be called, at which point the body of the function will execute.",
            questionData: {
                multipleChoice: null,
                matching: null,
                shortText: null,
                ordering: [
                    { id: "s2", text: "Function is called", correctOrder: 2 },
                    { id: "s3", text: "Function body is executed", correctOrder: 3 },
                    { id: "s1", text: "Function is declared", correctOrder: 1 },
                ],
            },
        },
        {
            id: "55555555-aaaa-aaaa-aaaa-555555555555",
            questionSetId: "11111111-1111-1111-1111-111111111111",
            type: "MultipleChoice",
            textFormat: "HTML",
            questionText:
                "Which of the following statements correctly define a function in JavaScript?<br/><pre>function greet() { return 'Hi'; }</pre>",
            score: 10.0,
            scoreGraded: 0.0,
            explainText:
                "`function greet()` and `let greet = () => 'Hi';` are valid JavaScript function declarations. `def greet()` is Python syntax and not valid in JavaScript.",
            questionData: {
                multipleChoice: [
                    { id: "f1", text: "function greet() { return 'Hi'; }", isAnswer: true },
                    { id: "f2", text: "def greet(): return 'Hi'", isAnswer: false },
                    { id: "f3", text: "let greet = () => 'Hi';", isAnswer: true },
                ],
                matching: null,
                ordering: null,
                shortText: null,
            },
        },
        {
            id: "66666666-bbbb-bbbb-bbbb-666666666666",
            questionSetId: "11111111-1111-1111-1111-111111111111",
            type: "Matching",
            textFormat: "PlainText",
            questionText: "Match the loop type with its primary use case.",
            score: 10.0,
            scoreGraded: 10.0,
            explainText:
                "`for` is used when the number of iterations is known, `while` is better when the condition is dynamic, and `forEach` is designed for arrays.",
            questionData: {
                multipleChoice: null,
                ordering: null,
                shortText: null,
                matching: {
                    leftItems: [
                        { id: "lp1", text: "for loop" },
                        { id: "lp2", text: "while loop" },
                        { id: "lp3", text: "forEach loop" },
                    ],
                    rightItems: [
                        { id: "ru1", text: "Known number of iterations" },
                        { id: "ru2", text: "Iterating over array elements" },
                        { id: "ru3", text: "Unknown loop condition" },
                    ],
                    matches: [
                        { leftId: "lp1", rightId: "ru1" },
                        { leftId: "lp2", rightId: "ru3" },
                        { leftId: "lp3", rightId: "ru2" },
                    ],
                },
            },
        },
        {
            id: "77777777-cccc-cccc-cccc-777777777777",
            questionSetId: "11111111-1111-1111-1111-111111111111",
            type: "Ordering",
            textFormat: "PlainText",
            questionText: "Arrange the steps for writing and running a basic JavaScript program.",
            score: 10.0,
            scoreGraded: 10.0,
            explainText:
                "JavaScript code is typically written in a .js file, then linked in HTML, and finally run in the browser when the HTML is opened.",
            questionData: {
                multipleChoice: null,
                matching: null,
                shortText: null,
                ordering: [
                    { id: "j1", text: "Write code in a .js file", correctOrder: 1 },
                    { id: "j2", text: "Link the file to an HTML document", correctOrder: 2 },
                    { id: "j3", text: "Open the HTML file in a browser", correctOrder: 3 },
                ],
            },
        },
        {
            id: "88888888-dddd-dddd-dddd-888888888888",
            questionSetId: "11111111-1111-1111-1111-111111111111",
            type: "ShortText",
            textFormat: "HTML",
            questionText:
                "What will be the output of the following JavaScript code?<br/><pre>console.log(2 + '2');</pre>",
            score: 5.0,
            scoreGraded: 5.0,
            explainText:
                "When using `+` with a number and a string, JavaScript performs string concatenation. So `2 + '2'` becomes `'22'`.",
            questionData: {
                multipleChoice: null,
                matching: null,
                ordering: null,
                shortText: "22",
            },
        },
        {
            id: "99999999-eeee-eeee-eeee-999999999999",
            questionSetId: "11111111-1111-1111-1111-111111111111",
            type: "ShortText",
            textFormat: "PlainText",
            questionText: "In programming, what does 'DRY' stand for?",
            score: 5.0,
            scoreGraded: 5.0,
            explainText:
                "DRY stands for 'Don't Repeat Yourself', a principle aimed at reducing code duplication and improving maintainability.",
            questionData: {
                multipleChoice: null,
                matching: null,
                ordering: null,
                shortText: "Don't Repeat Yourself",
            },
        },
    ],
};

const completed = ref<Question[]>([]); // for session

// const incorrect = ref<Set<UserAnswer>>(new Set());
const incorrect = computed((): UserAnswer[] => {
    return userAnswer.value.filter((x) => x.result === false);
});

const currentQuestion = ref<Question>(quiz.question[0] as Question);

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

//#region check user answer
const checkMultipleChoice = (id: string, answer: string[]) => {
    const index = quiz.question.findIndex((x) => x.id === id);
    if (index === -1) return false;

    let correctAnswer = quiz.question[index].questionData.multipleChoice
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

    const index = quiz.question.findIndex((x) => x.id === currentQuestion.value.id);
    let correctAnswer = quiz.question[index].questionData.multipleChoice
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
    const index = quiz.question.findIndex((x) => x.id === id);
    if (index === -1) return false;

    let correctAnswer =
        quiz.question[index].questionData.ordering?.map((x) => x.correctOrder).sort() || [];

    let userAnswer = answer.map((x) => x.correctOrder);
    return userAnswer.every((value: number, i: number) => value === correctAnswer[i]);
};

const checkMatching = (id: string, answerLeft: any[], answerRight: any[]) => {
    const index = quiz.question.findIndex((x) => x.id === id);
    if (index === -1) return false;
    let correctMatch = quiz.question[index].questionData.matching!.matches;

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

const checkShortText = (id: string, answer: string) => {
    const index = quiz.question.findIndex((x) => x.id === id);
    if (index === -1) return false;
    return answer.trim().toLowerCase() === quiz.question[index].questionData.shortText;
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
    numberOfQuestion: 20,
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

const onCreateNewTest = () => {
    //save settings to session
    sessionStorage.setItem("test_settings", JSON.stringify(settingFormState));
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
    const resultText = currentQuestionIsSkipped.value ? "Skipped" : "";

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

//logic handle submit
const onSubmitAnswer = () => {
    timerEnd();
    onUserAnswerChange();
    if (userAnswer.value.length < quiz.question.length) {
        Modal.confirm({
            title: `You missed ${quiz.question.length - userAnswer.value.length} questions.`,
            content: "Are you certain about this decision?",
            onOk: async () => {
                //import all left over question from quiz in to userAnswer
                isSubmitted.value = true;
                quiz.question.forEach((x) => {
                    if (!userAnswer.value.some((answer) => answer.questionId === x.id)) {
                        const skippedAnswer = {
                            questionId: x.id,
                            type: x.type,
                            isSkipped: true,
                            result: false,
                            resultText: "Skipped",
                            multipleChoices: null,
                            matchingLeft: null,
                            matchingRight: null,
                            ordering: null,
                            shortText: "",
                        };
                        switch (x.type) {
                            case QUESTION_TYPE.MULTIPLE_CHOICE: {
                                userAnswer.value.push({
                                    ...skippedAnswer,
                                    multipleChoices: x.questionData.multipleChoice
                                        ?.filter((x) => x.isAnswer)
                                        .map((x) => x.id)!,
                                });
                                break;
                            }
                            case QUESTION_TYPE.MATCHING: {
                                //get matching answer by matches order
                                const matching = x.questionData.matching;
                                const matches = matching?.matches ?? [];
                                const leftItems = matching?.leftItems ?? [];
                                const rightItems = matching?.rightItems ?? [];

                                const matchingLeft = matches.map((match) =>
                                    leftItems.find((item) => item.id == match.leftId),
                                );
                                const matchingRight = matches.map((match) =>
                                    rightItems.find((item) => item.id == match.rightId),
                                );

                                userAnswer.value.push({
                                    ...skippedAnswer,
                                    matchingLeft,
                                    matchingRight,
                                });
                                break;
                            }
                            case QUESTION_TYPE.ORDERING: {
                                userAnswer.value.push({
                                    ...skippedAnswer,
                                    ordering: x.questionData.ordering
                                        ?.slice()
                                        .sort((a, b) => a.correctOrder - b.correctOrder)!,
                                });
                                break;
                            }
                            case QUESTION_TYPE.SHORT_TEXT: {
                                userAnswer.value.push({
                                    ...skippedAnswer,
                                    shortText: x.questionData.shortText!,
                                });
                                break;
                            }
                        }
                    }
                });
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
    userAnswer.value
        .filter((x) => x.isSkipped === false)
        .forEach((answer: UserAnswer) => {
            let result;
            switch (answer.type) {
                case QUESTION_TYPE.MULTIPLE_CHOICE: {
                    result = checkMultipleChoice(answer.questionId, answer.multipleChoices!);
                    answer.result = result;
                    answer.resultText = result ? "Correct!" : "Wrong answer";
                    break;
                }
                case QUESTION_TYPE.MATCHING: {
                    result = checkMatching(
                        answer.questionId,
                        answer.matchingLeft!,
                        answer.matchingRight!,
                    );
                    answer.result = result;
                    answer.resultText = result ? "Correct!" : "Wrong answer";
                    break;
                }
                case QUESTION_TYPE.ORDERING: {
                    result = checkOrdering(answer.questionId, answer.ordering!);
                    answer.result = result;
                    answer.resultText = result ? "Correct!" : "Wrong answer";
                    break;
                }
                case QUESTION_TYPE.SHORT_TEXT: {
                    result = checkShortText(answer.questionId, answer.shortText);
                    answer.result = result;
                    answer.resultText = result ? "Correct!" : "Wrong answer";
                    break;
                }
            }
        });

    generateChart();
};

const onSkipQuestion = () => {
    //skip single current question
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
    currentQuestionIsSkipped.value = false;

    currentQuestion.value = quiz.question[index] as Question;
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
    currentQuestionIsSkipped.value = false;

    const index = quiz.question.findIndex((x) => x.id === currentQuestion.value.id);

    if (index < quiz.question.length - 1) {
        onLoadCurrentQuestion(index + 1);
    }
};

const onPreviousQuestion = () => {
    currentQuestionIsSkipped.value = false;

    const index = quiz.question.findIndex((x) => x.id === currentQuestion.value.id);

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
    const index = quiz.question.findIndex((x) => x.id === currentQuestion.value.id);
    return index !== -1 && index < quiz.question.length - 1;
});

const hasPreviousQuestion = computed(() => {
    const index = quiz.question.findIndex((x) => x.id === currentQuestion.value.id);
    return index !== -1 && index > 0;
});

//#endregion

//#region final chart
const getCorrectPercentage = () => {
    return Math.floor(
        ((quiz.question.length - incorrect.value.length) / quiz.question.length) * 100,
    );
};

const getInCorrectPercentage = () => {
    return Math.floor((incorrect.value.length / quiz.question.length) * 100);
};

const generateChart = () => {
    const content_item_result = $(".content-item-test-result");
    if (content_item_result) $(content_item_result).slideToggle();

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
                        name: "Correct",
                        y: getCorrectPercentage(),
                        color: "var(--correct-answer-color)",
                    },
                    {
                        name: "Incorrect",
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
        timerResult.value = `Your time: ${diffSeconds} second${diffSeconds === 1 ? "" : "s"}`;
    } else {
        const duration_ms = dayjs.duration(diffMs);
        const hours = duration_ms.hours();
        const minutes = duration_ms.minutes();

        let result = "Your time: ";
        if (hours > 0) result += `${hours} hour${hours > 1 ? "s" : ""} `;
        if (minutes > 0) result += `${minutes} minute${minutes > 1 ? "s" : ""}`;
        timerResult.value = result.trim();
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

onMounted(() => {
    onLoadCurrentQuestion(0);
    syncMatchingHeights();
    window.addEventListener("resize", syncMatchingHeights);

    timerStart();
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
                    <div class="question-navigator-title">Question list</div>
                    <div class="question-navigator-container">
                        <div
                            :class="[
                                'question-navigator-item',
                                currentQuestion.id === item.id ? 'current-question' : '',
                                userAnswerContainQuestion(item.id) ? 'completed-question' : '',
                                isSubmitted
                                    ? getUserAnswerResultById(item.id)
                                        ? 'correct'
                                        : 'incorrect'
                                    : '',
                            ]"
                            v-for="(item, index) in quiz.question"
                            @click="onLoadCurrentQuestion(index)"
                        >
                            <span> {{ index + 1 }} </span>
                        </div>
                    </div>
                    <a-button
                        type="primary"
                        :class="['main-color-btn', isSubmitted ? 'main-color-btn-disabled' : '']"
                        @click="onSubmitAnswer"
                    >
                        Submit
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
                                        Correct:
                                        <span>{{ quiz.question.length - incorrect.length }}</span>
                                    </div>
                                    <div class="result-text incorrect">
                                        Incorrect:
                                        <span> {{ incorrect.length }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="result-section result-section-buttons">
                            <div class="result-section-title">Next steps</div>
                            <div class="result-button">
                                <i class="bx bxs-news"></i>
                                <div>
                                    <div class="result-button-title">New test</div>
                                    <div class="result-button-content">
                                        Attempt new test with current options
                                    </div>
                                </div>
                            </div>
                            <div class="result-button" v-if="getInCorrectPercentage() <= 30">
                                <i class="bx bx-analyse"></i>
                                <div>
                                    <div class="result-button-title">Practice in learn mode</div>
                                    <div class="result-button-content">
                                        Learn these questions in a different way build you
                                        knowledge.
                                    </div>
                                </div>
                            </div>
                            <div class="result-button" v-if="getInCorrectPercentage() > 30">
                                <i class="bx bx-reset"></i>
                                <div>
                                    <div class="result-button-title">
                                        Retest using incorrect questions
                                    </div>
                                    <div class="result-button-content">
                                        Test yourself again on the questions you got wrong.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
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
                                        @end="syncMatchingHeights"
                                        @vue:updated="onUserAnswerChange"
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
                                        @end="syncMatchingHeights"
                                        @vue:updated="onUserAnswerChange"
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
                                    @vue:updated="onUserAnswerChange"
                                >
                                    <template v-for="(option, index) in userAnswerOrdering">
                                        <div
                                            :class="[
                                                'answer-option answer-option-ordering',
                                                isSubmitted
                                                    ? index + 1 === option.correctOrder
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
                                        isSubmitted
                                            ? userAnswerCurrentQuestionResult.result
                                                ? 'answer-correct'
                                                : 'answer-incorrect'
                                            : '',
                                    ]"
                                >
                                    <TextArea
                                        :readonly="userAnswerCurrentQuestionSkipped || isSubmitted"
                                        :placeholder="'Enter your answer...'"
                                        v-model="userAnswerShortText"
                                        @change="onUserAnswerChange"
                                    />
                                    <i
                                        v-if="isSubmitted && true"
                                        class="bx bx-check answer-icon"
                                    ></i>
                                    <i v-if="isSubmitted && !true" class="bx bx-x answer-icon"></i>
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
                        <div
                            :class="[
                                'main-color-btn-ghost',
                                userAnswerCurrentQuestionSkipped || isSubmitted
                                    ? 'main-color-btn-ghost-disabled'
                                    : '',
                            ]"
                            @click="onSkipQuestion()"
                        >
                            Don't know?
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
                                Next question
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
                    Next question
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
                    <span>Practice test settings</span> <br />
                </a-col>
            </a-row>
        </div>
        <a-form class="setting-form">
            <a-form-item>
                <div class="setting-form-item">
                    <div>Number of question (max {{ quiz.question.length }}):</div>
                    <a-input-number
                        size="large"
                        id="inputNumber"
                        v-model:value="settingFormState.numberOfQuestion"
                        :min="5"
                        :max="quiz.totalQuestion"
                    />
                </div>
            </a-form-item>
            <a-divider style="background-color: var(--form-item-border-color)"></a-divider>
            <a-form-item>
                <div class="setting-form-item setting-form-switch" v-for="type in QUESTION_TYPE">
                    <div>{{ type }}</div>
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
                Create new test
            </a-button>
        </template>
    </a-modal>
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

.ant-input-number {
    background-color: var(--form-item-background-color);
    border-color: var(--form-item-border-color);
}

.ant-input-number input {
    color: var(--text-color) !important;
}

.ant-input-number:hover {
    border-color: var(--main-color);
}

.ant-input-number-handler {
    background-color: var(--form-item-background-color);
    border-color: var(--form-item-border-color) !important;
}

.ant-input-number-handler .anticon {
    color: var(--text-color) !important;
}

.ant-input-number-handler:hover .anticon {
    color: var(--main-color) !important;
}

.ant-modal-content {
    border: 1px solid var(--form-item-border-color) !important;
}

.ant-switch {
    background-color: var(--form-item-border-color) !important;
}
.ant-switch-checked {
    background-color: var(--main-color) !important;
    border-color: var(--main-color) !important;
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

.completed-question.correct {
    background-color: var(--correct-answer-color);
    border-color: var(--correct-answer-color);
}
.completed-question.incorrect {
    background-color: var(--incorrect-answer-color);
    border-color: var(--incorrect-answer-color);
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
</style>
