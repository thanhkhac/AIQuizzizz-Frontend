<script setup lang="ts">
import { ref, reactive, onMounted, watch, computed } from "vue";
import { useI18n } from "vue-i18n";
import { message, Modal } from "ant-design-vue";
import { InboxOutlined } from "@ant-design/icons-vue";

import type { Question } from "@/models/question";

import Input from "@/shared/components/Common/Input.vue";
import TextArea from "@/shared/components/Common/TextArea.vue";

import MultipleChoice from "@/shared/components/Questions/MultipleChoice.vue";
import Matching from "@/shared/components/Questions/Matching.vue";
import Ordering from "@/shared/components/Questions/Ordering.vue";
import ShortText from "@/shared/components/Questions/ShortText.vue";
import QUESTION_TYPE from "@/constants/questionTypes";
import QUESTION_DIFFICULTY from "@/constants/questiondifficulties";

interface FormState {
    title: string;
    description: string;
    tags: string[];
    questions: Question[]; // or specify the type if you know it
}

const { t } = useI18n();

const formRef = ref();

const formState = reactive<FormState>({
    title: "",
    description: "",
    tags: [],
    questions: [],
});

const rules = {
    title: [
        {
            required: "true",
            message: "This field is required",
            trigger: "change",
        },
        {
            length: 100,
            message: "Limit 100",
            trigger: "change",
        },
    ],
    description: [
        {
            length: 200,
            message: "Limit 200",
            trigger: "change",
        },
    ],
    tags: [
        {
            validator: (rule: string, value: []) => {
                if (value && value.length > 5) {
                    return Promise.reject("You can only add up to 5 tags.");
                }
                return Promise.resolve();
            },
            trigger: "change",
        },
    ],
    questions: [
        {
            validator: (rule: string, value: []) => {
                if (value && value.length > 500) {
                    return Promise.reject("You can only add up to 5 questions.");
                }
                return Promise.resolve();
            },
            trigger: "change",
        },
    ],
};

const componentMap = {
    MultipleChoice,
    Matching,
    Ordering,
    ShortText,
};

const question_data_raw = [
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
];

const tagContent = ref("");
const addTag = () => {
    if (formState.tags.length >= 5) {
        message.warning("Limit : 5 tags");
        return;
    }
    if (tagContent.value) {
        formState.tags.push(tagContent.value);
        tagContent.value = "";
    }
};

const removeTag = (index: number) => {
    formState.tags.splice(index, 1);
};

const createQuestionTemplate = (): Question => ({
    id: Date.now().toString(),
    type: "MultipleChoice",
    questionText: "",
    questionHTML: "",
    explainText: "",
    score: 10,
    multipleChoices: [
        { id: (Date.now() + 1).toString(), text: "", isAnswer: true },
        { id: (Date.now() + 2).toString(), text: "", isAnswer: false },
        { id: (Date.now() + 3).toString(), text: "", isAnswer: false },
        { id: (Date.now() + 4).toString(), text: "", isAnswer: false },
    ],
    matchingPairs: [
        { id: (Date.now() + 1).toString(), leftItem: "", rightItem: "" },
        { id: (Date.now() + 2).toString(), leftItem: "", rightItem: "" },
    ],
    orderingItems: [
        { id: (Date.now() + 1).toString(), text: "", correctOrder: 1 },
        { id: (Date.now() + 2).toString(), text: "", correctOrder: 2 },
        { id: (Date.now() + 3).toString(), text: "", correctOrder: 3 },
        { id: (Date.now() + 4).toString(), text: "", correctOrder: 4 },
    ],
    shortAnswer: "",
});

const onAddQuestion = () => {
    if (formState.questions.length >= 10) {
        message.warning("Each question set could have at most 100 questions");
        return;
    }

    formState.questions.push(createQuestionTemplate());
};

const onRemoveQuestion = (index: number) => {
    if (formState.questions.length <= 1) {
        message.warning("Each question set must have at least 1 questions");
        return;
    }

    formState.questions.splice(index, 1);
};

const check = () => {
    console.log(formState.questions);
};

//modal-import
const modal_import_open = ref(false);

const uploadedQuestions = ref<Question[]>();

const importModalState = reactive({
    checkAll: false,
    indeterminate: false,
    checkedList: [] as string[],
});

const openImportModal = () => {
    importModalState.checkedList = []; //reset checked list

    uploadedQuestions.value = []; //temp;
    uploadedQuestions.value.push(...(question_data_raw as Question[])); //temp

    modal_import_open.value = true;
};

const closeImportModal = () => {
    modal_import_open.value = false;
};

//modal-generate by AI
const modal_generate_ai_open = ref(false);

const questionTypeOptions = Object.values(QUESTION_TYPE).map((questionType) => ({
    label: t(`create_QS.type.${questionType}`),
    value: questionType,
}));

const questionDifficultyOptions = Object.values(QUESTION_DIFFICULTY).map((difficulty) => ({
    label: difficulty,
    value: difficulty,
}));

const questionMaximumOptions = ref<any>([]);
for (let i = 10; i <= 100; i += 10) {
    questionMaximumOptions.value.push({ label: i, value: i });
}

const generateByAIModalState = reactive({
    selectedQuestionTypes: [questionTypeOptions[0]],
    maxQuestion: questionMaximumOptions.value[0].value,
    difficulty: questionDifficultyOptions[0].value,
});

const openGenerateAIModal = () => {
    importModalState.checkedList = []; //reset checked list

    uploadedQuestions.value = []; //temp;
    uploadedQuestions.value.push(...(question_data_raw as Question[])); //temp

    modal_generate_ai_open.value = true;
};

const closeGenerateAIModal = () => {
    modal_generate_ai_open.value = false;
};

//file-upload customized events

const files = ref<File[]>([]);
const fileInput = ref<HTMLInputElement | null>(null);
const isDragging = ref(false);

const openFileExplorer = () => {
    fileInput.value?.click();
};

const handleFileChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (file) {
        files.value = [];
        message.success(file.name + " uploaded successfully.");
        files.value.push(file);
        return;
    }
    message.error("Upload failed");
};

const handleDragEnter = (event: DragEvent) => {
    const types = event.dataTransfer?.types || [];
    if (Array.from(types).includes("files")) {
        isDragging.value = true;
    }
};

const handleDrop = (event: DragEvent) => {
    const file = event.dataTransfer?.files[0];

    isDragging.value = false;

    if (file) {
        files.value = [];
        message.success(file.name + " uploaded successfully.");
        files.value.push(file);
        return;
    }
    message.error("Upload failed");
};

const onRemoveUploadedFile = (index: number) => {
    files.value?.splice(index, 1);
};

//preview uploaded content

const toggleDisplayAnswer = (index: number, button: EventTarget) => {
    var $button = $(button);

    $button.toggleClass("bx-chevron-up bx-chevron-down");

    const answer = $(`#question-item-answer-${index}`);
    if (answer) $(answer).slideToggle();
};

//checkboxes  / checkbox-all for importing question back to the page

const onCheckAll = (event: any) => {
    Object.assign(importModalState, {
        checkedList: event.target.checked ? question_data_raw.map((x) => x.id) : [],
        indeterminate: false,
    });
};

watch(
    () => importModalState.checkedList,
    (val) => {
        importModalState.indeterminate =
            !!val.length && val.length < question_data_raw.map((x) => x.id).length; //change to uploadedList when it done
        importModalState.checkAll = val.length === question_data_raw.length;
    },
);

const handleModalImport = () => {
    Modal.confirm({
        title: "Are your sure? ",
        content:
            "Import: " + importModalState.checkedList.length + "into " + formState.title + " ? ",
        okText: "Confirm",
        onOk: () => {
            const selectedQuestions = question_data_raw.filter((question) =>
                importModalState.checkedList.includes(question.id),
            ) as Question[];

            formState.questions.push(...selectedQuestions);
            closeImportModal();
        },
    });
};

onMounted(() => {
    formState.questions.push(...(question_data_raw as Question[]));

    // formState.questions.push(createQuestionTemplate());
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
                    <span> {{ $t("create_QS.title") }}</span> <br />
                    <span>
                        {{ $t("create_QS.sub_title") }}
                    </span>
                </a-col>
            </a-row>
        </div>
        <div class="content">
            <a-form layout="vertical" v-model="formState" :rules="rules" ref="formRef">
                <div class="content-item">
                    <div class="content-item-title">
                        <div>
                            <span>{{ $t("create_QS.quiz.question_detail_title") }}</span>
                            <span>{{ $t("create_QS.quiz.question_detail_sub_title") }}</span>
                        </div>
                    </div>
                    <Input
                        class="question-input-item"
                        v-model="formState.title"
                        :isRequired="true"
                        :placeholder="t('question_sets_index.search_placeholder')"
                        :label="t('create_QS.quiz.title')"
                    />
                    <div class="d-flex">
                        <TextArea
                            class="question-input-item"
                            v-model="formState.description"
                            placeholder="textarea with clear icon"
                            :max-length="500"
                            :label="t('create_QS.quiz.description')"
                        />
                        <div class="form-item">
                            <label>{{ $t("create_QS.quiz.tag") }}</label>
                            <div class="tag-container">
                                <div
                                    class="tag-item"
                                    v-for="(tag, index) in formState.tags"
                                    :key="index"
                                >
                                    {{ tag }}
                                    <i class="bx bx-x" @click="removeTag(index)"></i>
                                </div>
                            </div>
                            <div class="tag-inputter">
                                <Input
                                    v-model="tagContent"
                                    :placeholder="t('question_sets_index.search_placeholder')"
                                >
                                    <template #icon>
                                        <i class="bx bx-purchase-tag-alt"></i>
                                    </template>
                                </Input>
                                <i class="bx bx-plus tag-inputter-button" @click="addTag"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="content-item">
                    <div class="content-item-title">
                        <div>
                            <span>{{ $t("create_QS.quiz.question_question_title") }}</span>
                            <span>{{ $t("create_QS.quiz.question_question_sub_title") }}</span>
                        </div>
                        <div class="content-item-buttons">
                            <RouterLink
                                @click="openImportModal"
                                class="import-button"
                                :to="{ name: '' }"
                            >
                                {{ $t("create_QS.buttons.import") }} <i class="bx bx-download"></i>
                            </RouterLink>
                            <RouterLink
                                @click="openGenerateAIModal"
                                class="import-button"
                                :to="{ name: '' }"
                            >
                                {{ $t("create_QS.buttons.generated_by_ai") }}
                                <i class="bx bx-upload"></i>
                            </RouterLink>
                            <div class="import-button" @click="check">
                                {{ $t("create_QS.buttons.create") }}
                            </div>
                            <div class="import-button">
                                {{
                                    $t("create_QS.quiz.total", {
                                        number: formState.questions.length
                                            .toString()
                                            .padStart(3, "0"),
                                    })
                                }}
                            </div>
                        </div>
                    </div>
                    <div class="list-question-container">
                        <div v-for="(question, index) in formState.questions" :key="question.id">
                            <component
                                :is="componentMap[question.type]"
                                :question="question"
                                :index="index + 1"
                                @deleteQuestion="onRemoveQuestion(index)"
                            />
                        </div>
                        <div class="add-question-btn" @click="onAddQuestion">
                            <i class="bx bx-plus"></i>
                            {{ $t("create_QS.buttons.add_question") }}
                        </div>
                    </div>
                </div>
            </a-form>
        </div>
    </div>

    <a-modal
        centered
        width="100%"
        wrap-class-name="full-modal"
        :open="modal_import_open"
        @cancel="closeImportModal"
    >
        <div class="modal-container">
            <div class="modal-title-container">
                <a-row class="w-100 d-flex align-items-center">
                    <a-col :span="1">
                        <RouterLink @click="closeImportModal" :to="{ name: '' }">
                            <i class="bx bx-chevron-left navigator-back-button"></i>
                        </RouterLink>
                    </a-col>
                    <a-col class="main-title" :span="23">
                        <span> {{ $t("create_QS.title") }}</span> <br />
                        <span>
                            {{ $t("create_QS.sub_title") }}
                        </span>
                    </a-col>
                </a-row>
            </div>
            <div class="modal-content-item">
                <div class="content-item-section upload-section">
                    <div class="section-title">
                        <span>Upload</span>
                        <a-button class="main-color-btn" type="primary">Download template</a-button>
                    </div>
                    <div class="section-content">
                        <input
                            @change="handleFileChange"
                            class="d-none"
                            type="file"
                            ref="fileInput"
                        />
                        <div
                            :class="['customized-file-upload', isDragging ? 'is-dragging' : '']"
                            @click="openFileExplorer"
                            @dragenter="handleDragEnter"
                            @dragover.prevent="isDragging = true"
                            @dragleave="isDragging = false"
                            @drop.prevent="handleDrop"
                        >
                            <div class="customized-file-upload-icons">
                                <i
                                    :class="[
                                        'bx',
                                        'bx-down-arrow-alt',
                                        'bx-fade-up',
                                        !isDragging ? 'd-none' : '',
                                    ]"
                                ></i>
                                <InboxOutlined :class="[isDragging ? 'd-none' : '']" />
                            </div>
                            <div class="customized-file-upload-ins">
                                <strong>Click</strong> or <strong>drag</strong> file to this area to
                                upload
                            </div>
                            <div class="customized-file-upload-hint">
                                Please use the template above to ensure the file is read
                                correctly.<br />
                                Support for a single upload.
                            </div>
                        </div>
                    </div>
                    <div class="file-container">
                        <div class="file-item" v-for="(file, index) in files">
                            <span>{{ file.name }}</span>
                            <i
                                class="bx bx-trash text-danger"
                                @click="onRemoveUploadedFile(index)"
                            ></i>
                        </div>
                    </div>
                </div>
                <div class="content-item-section preview-section">
                    <div class="section-title">Preview</div>
                    <div class="section-content">
                        <div class="section-content-header">
                            <div
                                :class="[
                                    'header-item',
                                    importModalState.checkAll ? 'check-all' : '',
                                ]"
                            >
                                <a-checkbox
                                    @click="onCheckAll"
                                    v-model:checked="importModalState.checkAll"
                                    :indeterminate="importModalState.indeterminate"
                                ></a-checkbox>
                                Check all ({{ importModalState.checkedList.length }})
                            </div>
                            <div class="header-item">
                                Total:
                                {{ uploadedQuestions?.length }}
                                questions
                            </div>
                        </div>
                        <a-checkbox-group v-model:value="importModalState.checkedList">
                            <div class="preview-question-container">
                                <div
                                    class="preview-question-item"
                                    v-for="(question, index) in uploadedQuestions"
                                >
                                    <a-checkbox
                                        @click="console.log(importModalState.checkedList)"
                                        :value="question.id"
                                    ></a-checkbox>
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
                                        >
                                            <template
                                                v-if="
                                                    question.type === QUESTION_TYPE.MULTIPLE_CHOICE
                                                "
                                            >
                                                <div class="multiple-choice-answer">
                                                    <ul>
                                                        <li
                                                            v-for="option in question.multipleChoices"
                                                        >
                                                            {{ option.text }}
                                                            <span
                                                                class="text-success"
                                                                v-if="option.isAnswer"
                                                            >
                                                                ({{ option.isAnswer }})
                                                            </span>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </template>
                                            <template
                                                v-if="question.type === QUESTION_TYPE.MATCHING"
                                            >
                                                <div
                                                    class="pair-answer"
                                                    v-for="option in question.matchingPairs"
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
                                            <template
                                                v-if="question.type === QUESTION_TYPE.ORDERING"
                                            >
                                                <div class="ordering-answer">
                                                    <div class="ordering-answer-item">
                                                        <div
                                                            v-for="option in question.orderingItems"
                                                        >
                                                            {{ option.text }}
                                                        </div>
                                                    </div>
                                                    <i class="bx bx-right-arrow-alt"></i>
                                                    <div class="ordering-answer-item">
                                                        <div
                                                            class="ordering-answer-item"
                                                            v-for="(
                                                                option, index
                                                            ) in question.orderingItems"
                                                        >
                                                            <span>#{{ index + 1 }}</span> -
                                                            {{ option.text }}
                                                        </div>
                                                    </div>
                                                </div>
                                            </template>
                                            <template
                                                v-if="question.type === QUESTION_TYPE.SHORT_TEXT"
                                            >
                                                <span>Answer:</span>
                                                <div class="short-text-answer">
                                                    {{ question.shortAnswer }}
                                                </div>
                                            </template>
                                        </div>
                                    </div>
                                    <div class="question-item-toogle-btn">
                                        <i
                                            class="bx bx-chevron-up"
                                            @click="
                                                toggleDisplayAnswer(index, $event.currentTarget!)
                                            "
                                        ></i>
                                    </div>
                                </div>
                            </div>
                        </a-checkbox-group>
                    </div>
                </div>
            </div>
        </div>

        <template #footer>
            <a-button class="main-color-btn" key="submit" type="primary" @click="handleModalImport"
                >Import</a-button
            >
        </template>
    </a-modal>

    <!-- **
    modal-generate-by-ai
    ** -->

    <a-modal
        centered
        width="100%"
        wrap-class-name="full-modal"
        :open="modal_generate_ai_open"
        @cancel="closeGenerateAIModal"
    >
        <div class="modal-container">
            <div class="modal-title-container">
                <a-row class="w-100 d-flex align-items-center">
                    <a-col :span="1">
                        <RouterLink @click="closeGenerateAIModal" :to="{ name: '' }">
                            <i class="bx bx-chevron-left navigator-back-button"></i>
                        </RouterLink>
                    </a-col>
                    <a-col class="main-title" :span="23">
                        <span> {{ $t("create_QS.title") }}</span> <br />
                        <span>
                            {{ $t("create_QS.sub_title") }}
                        </span>
                    </a-col>
                </a-row>
            </div>
            <div class="modal-content-item">
                <div class="content-item-section upload-section">
                    <div class="section-title">
                        <span>Upload</span>
                    </div>
                    <div class="section-content">
                        <input
                            @change="handleFileChange"
                            class="d-none"
                            type="file"
                            ref="fileInput"
                        />
                        <div
                            :class="['customized-file-upload', isDragging ? 'is-dragging' : '']"
                            @click="openFileExplorer"
                            @dragenter="handleDragEnter"
                            @dragover.prevent="isDragging = true"
                            @dragleave="isDragging = false"
                            @drop.prevent="handleDrop"
                        >
                            <div class="customized-file-upload-icons">
                                <i
                                    :class="[
                                        'bx',
                                        'bx-down-arrow-alt',
                                        'bx-fade-up',
                                        !isDragging ? 'd-none' : '',
                                    ]"
                                ></i>
                                <InboxOutlined :class="[isDragging ? 'd-none' : '']" />
                            </div>
                            <div class="customized-file-upload-ins">
                                <strong>Click</strong> or <strong>drag</strong> file to this area to
                                upload
                            </div>
                            <div class="customized-file-upload-hint">
                                Please use the template above to ensure the file is read
                                correctly.<br />
                                Support for a single upload.
                            </div>
                        </div>
                    </div>
                    <div class="file-container">
                        <div class="file-item" v-for="(file, index) in files">
                            <span>{{ file.name }}</span>
                            <i
                                class="bx bx-trash text-danger"
                                @click="onRemoveUploadedFile(index)"
                            ></i>
                        </div>
                    </div>
                    <a-form layout="vertical" class="generate-ai-form">
                        <a-row class="d-flex justify-content-between">
                            <a-col :span="12">
                                <a-form-item label="Difficulty">
                                    <a-select
                                        v-model:value="generateByAIModalState.difficulty"
                                        style="width: 100%"
                                        :placeholder="'Difficulty of questions'"
                                        :options="questionDifficultyOptions"
                                    />
                                </a-form-item>
                            </a-col>
                            <a-col :span="11">
                                <a-form-item label="Maximum question">
                                    <a-select
                                        v-model:value="generateByAIModalState.maxQuestion"
                                        style="width: 100%"
                                        :placeholder="'Maximum number of question'"
                                        :options="questionMaximumOptions"
                                    />
                                </a-form-item>
                            </a-col>
                        </a-row>

                        <a-form-item label="Question types">
                            <a-select
                                v-model:value="generateByAIModalState.selectedQuestionTypes"
                                mode="multiple"
                                style="width: 100%"
                                :placeholder="'Select multiple'"
                                :options="questionTypeOptions"
                            />
                        </a-form-item>

                        <a-form-item class="generate-ai-btn-container">
                            <a-button size="large" class="generate-ai-btn" type="primary"
                                >✨ Generate</a-button
                            >
                        </a-form-item>
                    </a-form>
                </div>
                <div class="content-item-section preview-section">
                    <div class="section-title">Preview</div>
                    <div class="section-content">
                        <div class="section-content-header">
                            <div
                                :class="[
                                    'header-item',
                                    importModalState.checkAll ? 'check-all' : '',
                                ]"
                            >
                                <a-checkbox
                                    @click="onCheckAll"
                                    v-model:checked="importModalState.checkAll"
                                    :indeterminate="importModalState.indeterminate"
                                ></a-checkbox>
                                Check all ({{ importModalState.checkedList.length }})
                            </div>
                            <div class="header-item">
                                Total:
                                {{ uploadedQuestions?.length }}
                                questions
                            </div>
                        </div>
                        <a-checkbox-group v-model:value="importModalState.checkedList">
                            <div class="preview-question-container">
                                <div
                                    class="preview-question-item"
                                    v-for="(question, index) in uploadedQuestions"
                                >
                                    <a-checkbox
                                        @click="console.log(importModalState.checkedList)"
                                        :value="question.id"
                                    ></a-checkbox>
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
                                        >
                                            <template
                                                v-if="
                                                    question.type === QUESTION_TYPE.MULTIPLE_CHOICE
                                                "
                                            >
                                                <div class="multiple-choice-answer">
                                                    <ul>
                                                        <li
                                                            v-for="option in question.multipleChoices"
                                                        >
                                                            {{ option.text }}
                                                            <span
                                                                class="text-success"
                                                                v-if="option.isAnswer"
                                                            >
                                                                ({{ option.isAnswer }})
                                                            </span>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </template>
                                            <template
                                                v-if="question.type === QUESTION_TYPE.MATCHING"
                                            >
                                                <div
                                                    class="pair-answer"
                                                    v-for="option in question.matchingPairs"
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
                                            <template
                                                v-if="question.type === QUESTION_TYPE.ORDERING"
                                            >
                                                <div class="ordering-answer">
                                                    <div class="ordering-answer-item">
                                                        <div
                                                            v-for="option in question.orderingItems"
                                                        >
                                                            {{ option.text }}
                                                        </div>
                                                    </div>
                                                    <i class="bx bx-right-arrow-alt"></i>
                                                    <div class="ordering-answer-item">
                                                        <div
                                                            class="ordering-answer-item"
                                                            v-for="(
                                                                option, index
                                                            ) in question.orderingItems"
                                                        >
                                                            <span>#{{ index + 1 }}</span> -
                                                            {{ option.text }}
                                                        </div>
                                                    </div>
                                                </div>
                                            </template>
                                            <template
                                                v-if="question.type === QUESTION_TYPE.SHORT_TEXT"
                                            >
                                                <span>Answer:</span>
                                                <div class="short-text-answer">
                                                    {{ question.shortAnswer }}
                                                </div>
                                            </template>
                                        </div>
                                    </div>
                                    <div class="question-item-toogle-btn">
                                        <i
                                            class="bx bx-chevron-up"
                                            @click="
                                                toggleDisplayAnswer(index, $event.currentTarget!)
                                            "
                                        ></i>
                                    </div>
                                </div>
                            </div>
                        </a-checkbox-group>
                    </div>
                    <div class="modal-generate-by-ai-warning">
                        <span>
                            <i class="bx bx-info-circle"></i>
                            AI can make mistakes. Please check carefully the important info.
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <template #footer>
            <a-button class="main-color-btn" key="submit" type="primary" @click="handleModalImport"
                >Import</a-button
            >
        </template>
    </a-modal>
</template>

<style>
.full-modal {
    .ant-modal {
        max-width: 100%;
    }
    .ant-modal-content {
        display: flex;
        flex-direction: column;
        height: calc(100vh);
        padding: 10px;
        background-color: #101010;
    }
    .ant-modal-body {
        flex: 1;
    }
}

.ant-checkbox-group {
    width: 100%;
}

.ant-checkbox-inner {
    background-color: var(--background-color-white);
    border: 1px solid var(--main-sub-color) !important;
}

.ant-checkbox-checked .ant-checkbox-inner {
    background-color: var(--main-color);
    border-color: var(--main-sub-color);
}

.ant-checkbox-checked:hover .ant-checkbox-inner {
    background-color: var(--main-color) !important;
    border: 1px solid var(--main-sub-color) !important;
}
</style>

<style scoped>
.content-item-title {
    margin-bottom: 20px;
}

.page-container {
    overflow-y: scroll;
    scroll-behavior: smooth;
}

.page-container::-webkit-scrollbar {
    width: 8px;
}

.page-container::-webkit-scrollbar-thumb {
    background-color: var(--input-item-border-color) !important;
    border-radius: 10px;
}

.navigator-back-button {
    padding: 5px;
    font-size: 30px;
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 5px;
    color: var(--text-color-white);
    transition: all 0.2s ease-in-out;
}
.navigator-back-button:hover {
    background-color: var(--main-color);
}

.content-item-buttons {
    display: flex;
    flex-direction: row;
    align-items: center;
}

.import-button {
    padding: 8px 16px;
    border: 2px solid #878787;
    border-radius: 8px;
    margin: 0px 10px;
    font-size: 16px;
    color: var(--text-color-white);
    text-decoration: none;
    display: flex;
    align-items: center;
    transition: all 0.2s ease-in-out;
}
.import-button i {
    font-size: 22px;
    margin-left: 10px;
}

.import-button:first-child:hover {
    background-color: var(--main-color);
    border: 2px solid var(--main-color);
}

.import-button:nth-child(2) {
    background: var(--background-color-gradient);
    border: 2px solid var(--main-color);
}

.import-button:nth-child(3) {
    border: 2px solid var(--main-color);
}

.form-item {
    width: 100%;
    display: flex;
    flex-direction: column;
    padding: 5px 20px;
}

.tag-container {
    height: 100px;
    max-height: 150px;
    display: flex;
    justify-content: start;
    flex-wrap: wrap;
    padding: 5px;
    margin-bottom: 16px;
    background-color: #101010 !important;
    overflow-y: scroll;
    border: 1px solid #27272a;
    border-radius: 5px;
}

.tag-item {
    padding: 0px 1px 0px 6px;
    border: 1px solid #a1a1aa;
    border-radius: 120px;
    height: 22px;
    font-size: 14px;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 2px;
}

.tag-item i {
    background-color: #f44336;
    padding: 2px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    margin-left: 10px;
}

.tag-inputter {
    display: flex;
}

.tag-inputter-button {
    padding: 9px;
    font-size: 26px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--main-color);
    border-radius: 5px;
    margin-left: 10px;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
}

.tag-inputter-button:hover {
    background-color: var(--main-sub-color);
}

.list-question-container {
    padding: 10px;
}

.question-input-item {
    margin-bottom: 10px;
}

.add-question-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px dashed var(--main-color);
    padding: 10px;
    border-radius: 5px;
    font-size: 16px;
    font-weight: 600;
    transition: all 0.2s ease-in-out;
}

.add-question-btn i {
    font-size: 24px;
    margin-right: 10px;
    transform: translateY(2px);
}

.add-question-btn:hover {
    background-color: var(--main-color);
    border: 2px solid var(--main-color);
    cursor: pointer;
}

.modal-title-container {
    color: var(--text-color-white);
    margin-bottom: 10px;
}

.modal-content-item {
    color: var(--text-color-white);
    background-color: var(--content-item-background-color);
    border: 1px solid var(--content-item-border-color);
    border-radius: 5px;
    padding: 10px;
    display: flex;
    justify-content: space-between;
}

.content-item-section {
    padding: 10px;
}

.section-title {
    color: var(--text-color-white);
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 10px;
    display: flex;
    justify-content: space-between;
}

.section-content {
    border: 1px solid var(--main-color);
    border-radius: 5px;
    padding: 10px;
    padding-top: 0px;
}

.upload-section {
    width: calc(100% - 65% - 20px);
}

.preview-section {
    flex: 1;
}
.preview-section .section-content {
    height: 520px;
    max-height: 520px;
    overflow-y: scroll;
}

.preview-section .section-content::-webkit-scrollbar {
    width: 8px;
}

.preview-section .section-content::-webkit-scrollbar-thumb {
    background-color: var(--input-item-border-color);
    border-radius: 10px;
}

.main-color-btn {
    background-color: var(--main-color);
}

.main-color-btn:hover {
    background-color: var(--main-sub-color);
}

.customized-file-upload {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border-radius: 3px;
    padding: 10px;
    cursor: pointer;
}

.customized-file-upload-icons {
    font-size: 50px;
    display: flex;
    flex-direction: column;
    color: var(--main-color);
}

.is-dragging {
    background-color: var(--content-item-border-color);
}

.customized-file-upload-ins {
    font-size: 18px;
    font-weight: 500;
    margin-bottom: 10px;
    color: #ddd;
}

.customized-file-upload-hint {
    text-align: center;
    font-size: 12px;
    color: var(--text-color-grey);
}

.file-container {
    margin-top: 10px;
}

.file-item {
    padding: 5px 10px;
    border: 1px solid var(--input-item-border-color);
    border-radius: 5px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.file-item i {
    cursor: pointer;
    font-size: 20px;
}

.section-content-header {
    position: sticky;
    top: 0;
    background-color: var(--content-item-background-color);
    border-bottom: 1px solid var(--content-item-border-color);
    z-index: 1;
    padding: 10px 0px;
    display: flex;
    align-items: center;
}

.header-item {
    margin-right: 10px;
    padding: 8px;
    border: 1px solid var(--main-color);
    border-radius: 5px;
    color: var(--text-color-white);
    font-weight: 500;
}

.check-all {
    background-color: var(--main-color);
}

.preview-question-container {
    width: 100%;
}

.preview-question-item {
    padding: 10px;
    margin: 10px 0px;
    border: 1px solid var(--input-item-border-color);
    border-radius: 5px;
    display: flex;
    align-items: start;
    color: var(--text-color-white);
}

.question-item-content {
    margin-left: 20px;
}

.question-item-toogle-btn {
    flex: 1;
    display: flex;
    justify-content: end;
}

.question-item-toogle-btn i {
    height: 30px;
    width: 30px;
    padding: 5px;
    font-size: 20px;
    color: var(--text-color-grey);
    border: 1px solid var(--text-color-grey);
    border-radius: 3px;
    display: flex;
    justify-content: center;
    cursor: pointer;
}

.multiple-choice-answer ul {
    margin: 0;
}

.pair-answer {
    margin-bottom: 10px;
    display: flex;
    align-items: center;
}
.pair-answer i {
    font-size: 20px;
}

.pair-answer-item {
    min-width: 100px;
    max-width: 400px;
    padding: 5px 10px;
    border: 1px solid var(--input-item-border-color);
    border-radius: 3px;
}

.ordering-answer {
    display: flex;
    align-items: center;
}

.ordering-answer-item {
    max-width: 400px;
}

.ordering-answer-item div {
    margin: 5px 0px;
}

.ordering-answer i {
    font-size: 20px;
    margin: 0 10px;
}

.short-text-answer {
    margin-top: 10px;
    max-width: 600px;
    padding: 5px 10px;
    border: 1px solid var(--input-item-border-color);
    border-radius: 3px;
}

::v-deep(.ant-select-selection-item-remove) {
    color: var(--text-color-white);
    transform: translateY(-2px);
}

::v-deep(.ant-select-selection-item-remove):hover {
    color: var(--text-color-white);
}

::v-deep(.ant-select-selection-overflow) {
    color: var(--text-color-white);
}

::v-deep(.ant-select-selection-placeholder) {
    color: var(--text-color-grey);
}

.generate-ai-form {
    display: flex;
    flex-direction: column;
}
.generate-ai-btn-container {
    display: flex;
    flex-direction: column;
}

.generate-ai-btn {
    width: 100%;
    background-color: var(--main-color);
}

.generate-ai-btn:hover {
    background-color: var(--main-sub-color);
}

.modal-generate-by-ai-warning {
    color: var(--text-color-grey);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 10px;
    font-size: 14px;
}
</style>
