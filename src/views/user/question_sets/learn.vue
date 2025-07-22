<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, nextTick, readonly } from "vue";

import QUESTION_TYPE from "@/constants/questionTypes";
import { QUOTES } from "@/constants/quote";

import type { Question } from "@/models/response/question";
import TextArea from "@/shared/components/Common/TextArea.vue";
import { VueDraggable } from "vue-draggable-plus";
import { HolderOutlined } from "@ant-design/icons-vue";
import { message } from "ant-design-vue";

import { useI18n } from "vue-i18n";

const { t } = useI18n();

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

const totalCompleted = ref(quiz.completed); //for total

const completed = ref<Question[]>([]); // for session

const incorrect = ref<Set<Question>>(new Set()); // for session

const currentSession = ref<Question[]>(quiz.question as Question[]); // for session
const isCurrentSessionReLearn = ref(false); //to check whether current session re-learn incorrect

const currentQuestion = ref<Question>(currentSession.value[0]);

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
    return Math.floor((quiz.completed / quiz.question.length) * 100);
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

const checkShortText = () => {
    return (
        userAnswerShortText.value.trim().toLowerCase() ===
        currentQuestion.value.questionData.shortText
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
    }, 2000);
};

const closeFinalModal = () => {
    finalModalOpen.value = false;
};

const triggerFinalModal = () => {
    if (currentSession.value.length <= 0 && !isCurrentSessionReLearn.value) {
        //append 1st incorrect question - re-try incorrect
        isCurrentSessionReLearn.value = true;
        currentSession.value = Array.from(incorrect.value);
    } else if (currentSession.value.length <= 0 && isCurrentSessionReLearn.value) {
        //re-tried - send 2nd incorrect to backend
        //trigger open final modal
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

//#endregion

//#region logic complete question
/* handle logic complete question */
const onSubmitAnswer = () => {
    triggerFinalModal();
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

    //if hasn't re-tried and incorrect
    if (!currentQuestionResult.value.result && !isCurrentSessionReLearn.value) {
        incorrect.value.add(currentQuestion.value);
    } else if (currentQuestionResult.value.result && isCurrentSessionReLearn.value) {
        //if re-tried and correct
        incorrect.value.delete(currentQuestion.value);
        completed.value.push(currentQuestion.value);
    } else if (currentQuestionResult.value.result === false) {
        incorrect.value.add(currentQuestion.value);
    } else {
        completed.value.push(currentQuestion.value);
    }
};

const onSkipQuestion = (event: MouseEvent) => {
    triggerFinalModal();
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
            userAnswerMatchingLeft.value = currentQuestion.value.questionData.matching?.leftItems!;
            userAnswerMatchingRight.value =
                currentQuestion.value.questionData.matching?.rightItems!;
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
    resetUserAnswer();
    syncMatchingHeights();
    window.addEventListener("resize", syncMatchingHeights);

    currentSession.value = quiz.question.splice(0, 7) as Question[];
    currentSession.value.shift();
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
                    <span> {{ quiz.title }}</span> <br />
                    <span>
                        {{ quiz.description }}
                    </span>
                </a-col>
            </a-row>
        </div>
        <div class="progress-bar-container">
            <div class="progress-info">
                <div class="progress-info-number">
                    Question {{ totalCompleted + 1 }} of {{ quiz.totalQuestion }}
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
                                            userAnswerMultipleChoice.includes(option.id) &&
                                            option.isAnswer
                                                ? 'answer-correct'
                                                : '',
                                            currentQuestionIsSubmitted &&
                                            userAnswerMultipleChoice.includes(option.id) &&
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
                                                userAnswerMultipleChoice.includes(option.id) &&
                                                option.isAnswer
                                            "
                                            class="bx bx-check answer-icon"
                                        ></i>
                                        <i
                                            v-if="
                                                currentQuestionIsSubmitted &&
                                                userAnswerMultipleChoice.includes(option.id) &&
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
                        <a-button
                            :class="[
                                'main-color-btn',
                                currentQuestionIsSubmitted ? 'main-color-btn-disabled' : '',
                            ]"
                            type="primary"
                            size="large"
                            @click="openFinalModal"
                        >
                            Final
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
                        <span> {{ quiz.title }}</span> <br />
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
                    <span>{{ quiz.completed }}</span>
                </div>
                <div class="progress-info-percentage">
                    Total question:
                    <span>{{ quiz.totalQuestion }}</span>
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
                    @click="onNextQuestion"
                >
                    Continue
                </a-button>
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
</style>
