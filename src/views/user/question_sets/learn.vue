<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from "vue";
import type { Question } from "@/models/response/question";

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
                    { id: "a1", text: "let x = 5;", isAnswer: true },
                    { id: "a2", text: "const y = 'hello';", isAnswer: true },
                    { id: "a3", text: "var 1name = 'error';", isAnswer: false },
                ],
                matching: null,
                ordering: null,
                shortText: null,
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
                    { id: "s1", text: "Function is declared", correctOrder: 1 },
                    { id: "s2", text: "Function is called", correctOrder: 2 },
                    { id: "s3", text: "Function body is executed", correctOrder: 3 },
                ],
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

const totalCompleted = ref(quiz.completed); //for total

const completed = ref<Question[]>([]); // for session

const incorrect = ref<Question[]>([]); // for session

const currentSession = ref<Question[]>([]); // for session

const currentQuestionIndex = ref(0);
const currentQuestion = ref<Question>(quiz.question[0] as Question);

const completionPercentage = computed(() => {
    return Math.floor((quiz.completed / quiz.question.length) * 100);
});

function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

const onNextQuestion = () => {
    currentQuestionIndex.value = clamp((currentQuestionIndex.value += 1), 0, quiz.question.length);
    currentQuestion.value = quiz.question[currentQuestionIndex.value] as Question;
    console.log(currentQuestionIndex.value);
};

const onPreviousQuestion = () => {
    currentQuestionIndex.value = clamp((currentQuestionIndex.value -= 1), 0, quiz.question.length);
    currentQuestion.value = quiz.question[currentQuestionIndex.value] as Question;
    console.log(currentQuestionIndex.value);
};

onMounted(() => {
    //initiate
    console.log(clamp(10, 0, 5)); // 👉 5
    console.log(clamp(-3, 0, 5)); // 👉 0
    console.log(clamp(3, 0, 5)); // 👉 3
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
                        <div class="answer-section-ins">
                            Choose ({{ currentQuestion.questionData.multipleChoice?.length }})
                            answers
                        </div>
                        <div class="answer-option-container">
                            <a-checkbox
                                class="answer-option"
                                v-for="option in currentQuestion.questionData.multipleChoice"
                            >
                                <div>
                                    {{ option.text }}
                                </div>
                            </a-checkbox>
                        </div>
                    </div>
                </div>
                <div class="learn-question-footer d-flex justify-content-between">
                    <a-button
                        type="primary"
                        size="large"
                        class="main-color-btn"
                        @click="onPreviousQuestion"
                    >
                        <i class="bx bx-chevron-left"></i>
                        Previous question
                    </a-button>
                    <div class="main-color-btn-ghost">Don't know ?</div>
                    <a-button
                        type="primary"
                        size="large"
                        class="main-color-btn"
                        @click="onNextQuestion"
                    >
                        Next question
                        <i class="bx bx-chevron-right"></i>
                    </a-button>
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped>
.page-container {
    height: 100vh;
}

.progress-bar-container {
    width: 95vw;
    margin: auto;
}

::v-deep(.ant-progress-outer) {
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
    padding: 10px;
}

.answer-section {
    padding: 0px;
}

.answer-section-ins {
    font-size: 14px;
    color: var(--text-color-grey);
}

.answer-option-container {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
}
.answer-option {
    width: calc(100% / 2 - 100px);
    border: 1px solid var(--form-item-border-color);
    padding: 10px;
    margin: 10px 0px;
    border-radius: 8px;
    cursor: pointer;
}

.answer-option:hover {
    background-color: var(--content-item-border-color);
}

.learn-question-footer {
    padding: 0px 10px;
}

.main-color-btn-ghost {
    padding: 8px 10px;
    border: 1px solid var(--border-color-contrast);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
}

.main-color-btn-ghost:hover {
    color: var(--main-color);
    border-color: var(--main-color);
}
</style>
