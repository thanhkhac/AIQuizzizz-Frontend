<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, nextTick, readonly } from "vue";

import QUESTION_TYPE from "@/constants/questionTypes";
import type { Question } from "@/models/response/question";
import TextArea from "@/shared/components/Common/TextArea.vue";
import { VueDraggable } from "vue-draggable-plus";
import { HolderOutlined } from "@ant-design/icons-vue";

const QUESTION_FORMAT = {
    HTML: "HTML",
    PLAIN_TEXT: "PlainText",
};

const quiz = {
    id: "123456",
    title: "Programming fundamental",
    description: "Basic knowledge about programming.",
    totalQuestion: 30,
    completed: 1,
    question: [
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
            id: "11111111-aaaa-aaaa-aaaa-111111111111",
            questionSetId: "11111111-1111-1111-1111-111111111111",
            type: "MultipleChoice",
            textFormat: "HTML",
            questionText:
                "Which of the following are valid variable declarations in JavaScript?<br/><pre>let x = 5;<br>const y = 'hello';<br>var 1name = 'error';</pre>",
            score: 10.0,
            scoreGraded: 0.0,
            explainText:
                "Variables in JavaScript cannot start with a number. 'let x = 5' and 'const y = \"hello\"' are valid, but 'var 1name = \"error\"' is invalid.",
            questionData: {
                multipleChoice: [
                    { id: "a1", text: "let x = 5", isAnswer: true },
                    { id: "a2", text: "const y = 'hello';", isAnswer: true },
                    { id: "a3", text: "var 1name = 'error';", isAnswer: false },
                ],
                matching: null,
                ordering: null,
                shortText: null,
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

const incorrect = ref<Question[]>([]); // for session

const currentSession = ref<Question[]>([]); // for session

const currentQuestionIndex = ref(0);
const currentQuestion = ref<Question>(quiz.question[0] as Question);

const currentQuestionInstruction = ref("");
const currentQuestionIsSubmitted = ref(false);
const currentQuestionIsSkipped = ref(false);

const userAnswerMultipleChoice = ref<string[]>([]);

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

function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

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
    currentQuestionIndex.value = clamp((currentQuestionIndex.value += 1), 0, quiz.question.length);
    currentQuestion.value = quiz.question[currentQuestionIndex.value] as Question;

    currentQuestionIsSubmitted.value = false;
    currentQuestionIsSkipped.value = false;

    resetUserAnswer();
    toggleExplainModal();
};

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

/* explain modal bottom */
const explainModal = ref<HTMLElement | null>(null);
const explainModalOpen = ref(false);
const toggleExplainModal = () => {
    explainModalOpen.value = !explainModalOpen.value;
};

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
                    Question {{ totalCompleted + 1 }} of {{ quiz.question.length }}
                </div>
                <div class="progress-info-percentage">{{ completionPercentage }}% Completed</div>
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
                                class="answer-option-container"
                            >
                                <template
                                    v-for="option in currentQuestion.questionData.multipleChoice"
                                >
                                    <a-checkbox
                                        v-model:value="option.id"
                                        :disabled="currentQuestionIsSubmitted"
                                        :class="[
                                            'answer-option',
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

.progress-bar-container {
    width: 95vw;
    margin: auto;
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

.progress-info {
    color: var(--text-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 14px;
}

.section {
    padding: 10px 20px;
}

.learn-question {
    font-size: 20px;
    margin-bottom: 50px;
}

.answer-section {
    padding: 0px;
}

.answer-section-ins {
    font-size: 1em;
    color: var(--text-color);
}

.answer-option-container {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    margin-top: 10px;
    border-top: 2px solid var(--form-item-border-color);
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
}

.answer-option {
    width: calc(100% / 2 - 100px);
    border: 2px solid var(--form-item-border-color);
    background-color: var(--content-item-background-color);
    padding: 20px;
    margin: 10px 0px;
    border-radius: 8px;
    font-size: 1.1em;
    cursor: pointer;
    display: flex;
    align-items: center;
    white-space: normal;
    transition: all 0.1s ease;
}

.answer-option:hover {
    background-color: var(--content-item-border-color);
}

.answer-option-content {
    font-size: 1.1em;
    color: var(--text-color);
    margin-left: 10px;
    max-height: 160px;
    overflow-y: auto;
    padding: 10px 0px;
}

.answer-option .answer-option-content::-webkit-scrollbar {
    width: 10px;
}
.answer-option .answer-option-content::-webkit-scrollbar-thumb {
    background-color: var(--main-color);
    padding: 5px 0px;
}

::v-deep(.ant-checkbox-wrapper span:last-of-type) {
    flex: 1;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

::v-deep(.ant-checkbox-wrapper-disabled) {
    color: var(--text-color) !important;
}

.answer-correct {
    border-color: #2ecc71;
}

.answer-incorrect {
    border-color: #e74c3c;
}

.answer-icon {
    font-size: 26px;
}
.answer-correct .answer-icon {
    color: #2ecc71;
}

.answer-incorrect .answer-icon {
    color: #e74c3c;
}

.learn-question-footer {
    padding: 0px 20px;
    display: flex;
    justify-content: space-between;
}

.learn-question-result {
    font-weight: 500;
}

.result-correct {
    color: #2ecc71;
}

.result-incorrect {
    color: #e74c3c;
}

.result-skipped {
    color: #f39c12;
}

.main-color-btn-disabled {
    opacity: 0.5;
    pointer-events: none;
}

.main-color-btn-ghost {
    display: flex;
    align-items: center;
    padding: 8px 10px;
    border: 1px solid transparent;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    color: var(--text-color);
}

.main-color-btn-ghost:hover {
    color: var(--text-color);
    border-color: var(--main-color);
}

.main-color-btn-ghost-disabled {
    color: var(--text-color-grey);
    cursor: default;
    pointer-events: none;
}
.main-color-btn-ghost-disabled:hover {
    color: var(--text-color-grey);
    border-color: transparent;
}

.explain-modal-up {
    background-color: var(--content-item-background-color);
    padding: 20px 50px;
    border-top: 1px solid var(--main-color);
    border-radius: 10px;
    display: flex;
    justify-content: space-between;

    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    transform: translateY(130%);
    transition: transform 0.5s ease-in-out;
    z-index: 100;
}

.explain-modal-up.show {
    transform: translateY(0%);
}

.close-modal-btn {
    position: absolute;
    top: -20px;
    left: 50%;
}

.learn-question-explain {
    color: var(--text-color);
    width: 50%;
}

.comment-section {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.comment-container {
    flex: 1;
    overflow-y: scroll;
}

.comment-container::-webkit-scrollbar {
    width: 10px;
}

.comment-container::-webkit-scrollbar-thumb {
    background-color: var(--content-item-border-color);
    border-radius: 10px;
}

.comment-item {
    padding: 5px;
    display: flex;
    margin-bottom: 10px;
    align-items: start;
}

.comment-user-img {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: var(--text-color);
    margin-right: 10px;
    margin-top: 5px;
}

.comment-content-info {
    display: flex;
    align-items: center;
}

.comment-content-info span {
    margin-left: 10px;
    font-size: 12px;
    color: var(--text-color-grey);
}

.comment-content {
    font-weight: 500;
    margin-top: 5px;
    max-width: 400px;
    word-wrap: break-word;
}

.comment-form {
    width: 100%;
    border-top: 1px solid var(--form-item-border-color);
    padding-top: 10px;
    border-radius: 8px;
}

.comment-form-footer {
    margin-top: 5px;
    display: flex;
    align-items: center;
    justify-content: end;
}

/* ordering */
.answer-option-container.ordering {
    display: flex;
    justify-content: center;
    padding: 10px;
}

.answer-option-ordering {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.answer-option-ordering .answer-option-content {
    margin-right: 20px;
}

.answer-option-order {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-color-grey);
    font-size: 26px;
    font-weight: 600;
    margin-right: 10px;
    cursor: pointer;
}

.answer-option-order i {
    color: var(--text-color-grey);
    font-size: 26px;
    transform: translateY(2px);
}

/* matching */
.sortable-chosen .answer-option {
    background-color: var(--content-item-border-color);
    border: 2px solid var(--main-color);
}

.sortable-chosen .matching-icon {
    color: var(--main-color);
}

.answer-option-container.matching {
    display: flex;
    justify-content: center;
    padding: 10px;
    width: 100%;
}

.matching-option-container {
    position: relative;
}

.answer-option.answer-option-matching {
    width: calc(100vw / 2 - 120px);
    display: flex;
    justify-content: space-between;
    align-items: center;
    z-index: 1;
}

.matching-icon {
    z-index: 0;
    color: var(--form-item-border-color);
}

.answer-correct-icon {
    color: #2ecc71;
}

.answer-incorrect-icon {
    color: #e74c3c;
}

.matching-option-container.left {
    margin-right: 20px;
}

.matching-option-container.right {
    margin-left: 20px;
}

.matching-option-container.left .matching-icon {
    font-size: 105px;
    position: absolute;
    right: -35px;
}

.matching-option-container.right .matching-icon {
    font-size: 105px;
    position: absolute;
    left: -35px;
}

/* short text */
.answer-short-text {
    width: 50%;
    margin: 20px auto;

    display: flex;
    align-items: center;
    justify-content: space-between;
}

::v-deep(.answer-correct textarea) {
    border-color: #2ecc71;
}

::v-deep(.answer-incorrect textarea) {
    border-color: #e74c3c;
}
</style>
