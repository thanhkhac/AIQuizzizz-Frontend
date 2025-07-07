<script setup lang="ts">
import { ref, reactive, watch, onMounted } from "vue";
import { Modal, message } from "ant-design-vue";
import { InboxOutlined } from "@ant-design/icons-vue";

import type { Question } from "@/models/question";
import QUESTION_TYPE from "@/constants/questionTypes";

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

interface Props {
    title: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
    (e: "import", selected: Question[]): void;
}>();

const modal_import_open = ref(false);
const uploadedQuestions = ref<Question[]>();

const importModalState = reactive({
    checkAll: false,
    indeterminate: false,
    checkedList: [] as string[],
});

const openImportModal = () => {
    importModalState.checkedList = []; //reset checked list
    modal_import_open.value = true;
};

const closeImportModal = () => {
    modal_import_open.value = false;
};

//expose functions to main ref
defineExpose({
    openImportModal,
});

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

//checkboxes  / checkbox-all for importing question back to the page
const onCheckAll = (event: any) => {
    Object.assign(importModalState, {
        checkedList: event.target.checked ? uploadedQuestions.value?.map((x) => x.id) : [],
        indeterminate: false,
    });
};

watch(
    () => importModalState.checkedList,
    (val) => {
        importModalState.indeterminate =
            !!val.length && val.length < uploadedQuestions.value!.map((x) => x.id).length; //change to uploadedList when it done
        importModalState.checkAll = val.length === uploadedQuestions.value?.length;
    },
);

//preview uploaded content
const toggleDisplayAnswer = (index: number, button: EventTarget) => {
    let $button = $(button);

    $button.toggleClass("bx-chevron-up bx-chevron-down");

    const answer = $(`#question-item-answer-${index}`);
    if (answer) $(answer).slideToggle();
};

const handleModalImport = () => {
    Modal.confirm({
        title: "Are your sure? ",
        content: "Import: " + importModalState.checkedList.length + "into " + props.title + " ? ",
        okText: "Confirm",
        onOk: () => {
            const selectedQuestions = uploadedQuestions.value?.filter((question) =>
                importModalState.checkedList.includes(question.id),
            ) as Question[];

            //emit event & params to main
            emit("import", selectedQuestions);
            closeImportModal();
        },
    });
};

onMounted(() => {
    uploadedQuestions.value = question_data_raw as Question[]; //sample
});

</script>

<template>
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
</template>
