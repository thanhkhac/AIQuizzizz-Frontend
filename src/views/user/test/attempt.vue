<script setup lang="ts">
import { ref, computed, onMounted, nextTick, onUnmounted } from "vue";
import QUESTION_TYPE from "@/constants/questionTypes";
import type { ResponseQuestion } from "@/models/response/question";

import TextArea from "@/shared/components/Common/TextArea.vue";
import { VueDraggable } from "vue-draggable-plus";
import { HolderOutlined } from "@ant-design/icons-vue";

import { useI18n } from "vue-i18n";
import dayjs, { Dayjs } from "dayjs";
import { Modal, message } from "ant-design-vue";

const { t } = useI18n();

interface UserAnswer {
    questionId: string;
    type: string;
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

const currentQuestion = ref<ResponseQuestion>(quiz.question[0] as ResponseQuestion);

const currentQuestionInstruction = ref("");
const currentQuestionIsSkipped = ref(false);
const isSubmitted = ref(false);

const userAnswerMultipleChoice = ref<string[]>([]);

const userAnswerMatchingLeft = ref<any[]>([]);
const userAnswerMatchingRight = ref<any[]>([]);

const userAnswerOrdering = ref<any[]>([]);
const userAnswerShortText = ref<string>("");

const userAnswer = ref<UserAnswer[]>([]);

//#region init data

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
        },
    });
};

const onLoadCurrentQuestion = (index: number) => {
    syncMatchingHeights();
    currentQuestionIsSkipped.value = false;

    currentQuestion.value = quiz.question[index] as ResponseQuestion;
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
    const index = quiz.question.findIndex((x) => x.id === currentQuestion.value.id);
    if (index < quiz.question.length - 1) {
        onLoadCurrentQuestion(index + 1);
    }
};

const onPreviousQuestion = () => {
    const index = quiz.question.findIndex((x) => x.id === currentQuestion.value.id);
    if (index > 0) {
        onLoadCurrentQuestion(index - 1);
    }
};

const userAnswerContainQuestion = (questionId: string) => {
    return Array.from(userAnswer.value).some((x) => x.questionId === questionId);
};

const hasNextQuestion = computed(() => {
    const index = quiz.question.findIndex((x) => x.id === currentQuestion.value.id);
    return index !== -1 && index < quiz.question.length - 1;
});

const hasPreviousQuestion = computed(() => {
    const index = quiz.question.findIndex((x) => x.id === currentQuestion.value.id);
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
const endTime: Dayjs = dayjs().add(61, "second");

const remainingTime = ref<number>(endTime.diff(dayjs(), "second"));
let timer: ReturnType<typeof setInterval> | null = null;

const formattedTime = computed<string>(() => {
    const min = Math.floor(remainingTime.value / 60)
        .toString()
        .padStart(2, "0");
    const sec = (remainingTime.value % 60).toString().padStart(2, "0");
    return `${min}:${sec}`;
});

const updateCountdown = (): void => {
    const diff = endTime.diff(dayjs(), "second");
    remainingTime.value = diff > 0 ? diff : 0;
    if (diff <= 0 && timer) {
        clearInterval(timer);
        timer = null;
    }
};

timer = setInterval(updateCountdown, 1000);

//#endregion

//#region auto save
const autoSaver = ref<number>();
const autoSave = () => {
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
    if (autoSaver.value) clearInterval(autoSaver.value);
});
//#endregion

onMounted(() => {
    onLoadCurrentQuestion(0);
    syncMatchingHeights();
    window.addEventListener("resize", syncMatchingHeights);

    updateCountdown();
    timer = setInterval(updateCountdown, 1000);
    autoSaver.value = setInterval(autoSave, 60_000); //save each 60s
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
                            v-for="(item, index) in quiz.question"
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
