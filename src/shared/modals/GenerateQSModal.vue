<script setup lang="ts">
import type { RequestQuestion } from "@/models/request/question";

import QUESTION_TYPE from "@/constants/questionTypes";
import QUESTION_DIFFICULTY from "@/constants/questiondifficulties";
import SUPPORTED_LOCALES from "@/constants/languages";

import { ref, reactive, watch, onMounted, nextTick, h } from "vue";
import { Modal, message } from "ant-design-vue";
import { InboxOutlined, LoadingOutlined } from "@ant-design/icons-vue";

import TextArea from "../components/Common/TextArea.vue";

import { useI18n } from "vue-i18n";

import dayjs from "dayjs";

const { t } = useI18n();

//#region modal
interface Props {
    title: string;
    numberOfQuestion: number;
}

const props = defineProps<Props>();

const emit = defineEmits<(e: "import", selected: RequestQuestion[]) => void>();

const modal_generate_ai_open = ref(false);
const openGenerateAIModal = () => {
    generateModalState.checkedList = []; //reset checked list
    modal_generate_ai_open.value = true;
};

const closeGenerateAIModal = () => {
    modal_generate_ai_open.value = false;
};

//expose functions to main ref
defineExpose({
    openGenerateAIModal,
});

const handleModalImport = () => {
    if (generateModalState.checkedList.length === 0) {
        message.warning(
            t("message.minimum_question", {
                number: 1,
            }),
        );
        return;
    }
    if (generateModalState.checkedList.length + props.numberOfQuestion > 500) {
        message.warning(
            t("message.limit_question", {
                number: 500,
            }),
        );
        return;
    }

    Modal.confirm({
        title: t("import_qs_modal.confirm_modal.title"),
        content: t("import_qs_modal.confirm_modal.content", {
            number: generateModalState.checkedList.length,
        }),
        okText: t("create_QS.buttons.ok"),
        cancelText: t("create_QS.buttons.cancel"),
        onOk: () => {
            const selectedQuestions = generatedQuestions.value.filter((question) =>
                generateModalState.checkedList.includes(question.id),
            ) as RequestQuestion[];

            //emit event & params to main
            emit("import", selectedQuestions);
            closeGenerateAIModal();
        },
    });
};
//#endregion

//#region init data
const questionTypeOptions = Object.values(QUESTION_TYPE).map((questionType) => ({
    label: t(`create_QS.type.${questionType}`),
    value: questionType,
}));

const questionDifficultyOptions = Object.values(QUESTION_DIFFICULTY).map((difficulty) => ({
    label: difficulty,
    value: difficulty,
}));

const questionMaximumOptions = ref<any>([]);
for (let i = 10; i <= 50; i += 10) {
    questionMaximumOptions.value.push({ label: i, value: i });
}
//#endregion

//#region form state
const generatedQuestions = ref<RequestQuestion[]>([]);

const generateModalState = reactive({
    checkAll: false,
    indeterminate: false,
    checkedList: [] as string[],
});

const generateByAIModalState = reactive({
    file: null as File | null,
    isGenerateExplain: true,
    language: SUPPORTED_LOCALES[0].code,
    questionCount: questionMaximumOptions.value[0].value,
    questionTypes: [questionTypeOptions[0]],
    // difficulty: questionDifficultyOptions[0].value,
    documentStructureJson: null as string | null,
    selectedPartJson: null as string | null,
    title: "",
});

const onDeselectQuestionType = (value: any) => {
    if (generateByAIModalState.questionTypes.length === 0) {
        message.warning(t("message.minimun_question_type"));

        //keep the item
        generateByAIModalState.questionTypes.push(value);
    }
};

const loading = ref(false);
const indicator = h(LoadingOutlined, {
    style: { fontSize: "100px", color: "var(--main-color)" },
    spin: true,
});

const onGenerateQuestions = async () => {
    try {
        loading.value = true;
        if (!generateByAIModalState.title && generateByAIModalState.isGenerateExplain) {
            message.error(t("message.invalid_reference"));
            return;
        }
        if (
            generateByAIModalState.documentStructureJson === null ||
            generateByAIModalState.selectedPartJson === null
        ) {
            Modal.error({
                title: t("generate_qs_modal.invalid_structure_modal.title"),
                content: t("generate_qs_modal.invalid_structure_modal.content"),
                centered: true,
            });
            openFileStructureModal();
            return;
        }

        const object_document_structure = JSON.parse(generateByAIModalState.documentStructureJson);
        const object_selected_part = JSON.parse(generateByAIModalState.selectedPartJson);

        if (generateByAIModalState.isGenerateExplain && generateByAIModalState.title) {
            generateByAIModalState.documentStructureJson = JSON.stringify({
                ...object_document_structure,
                title: generateByAIModalState.title,
            });

            generateByAIModalState.selectedPartJson = JSON.stringify({
                ...object_selected_part,
                title: generateByAIModalState.title,
            });
        }

        const formData = new FormData();
        formData.append("file", files.value[0] as File);
        formData.append(
            "isGenerateExplain",
            generateByAIModalState.isGenerateExplain ? "true" : "false",
        );

        formData.append(
            "language",
            SUPPORTED_LOCALES.find((x) => x.code === generateByAIModalState.language)?.label ||
                SUPPORTED_LOCALES[0].label,
        );

        formData.append("questionCount", generateByAIModalState.questionCount);
        formData.append(
            "questionTypes",
            JSON.stringify(generateByAIModalState.questionTypes.map((x) => x)),
        );

        formData.append("documentStructureJson", generateByAIModalState.documentStructureJson);
        formData.append("selectedPartJson", generateByAIModalState.selectedPartJson);

        const result = await ApiAIGenerate.GenerateQuestion(formData);
        if (!result.data.success) {
            message.error("Generate failed!");
            return;
        }

        generatedQuestions.value = [
            ...(generatedQuestions.value || []),
            ...(result.data.data.map((x: any) => ({
                ...x,
                questionId: dayjs().valueOf(),
            })) as RequestQuestion[]),
        ];

        await nextTick();
        generateModalState.checkedList = [];
        generateModalState.indeterminate = false;
        generateModalState.checkAll = false;
    } catch (error) {
        console.log(error);
    } finally {
        loading.value = false;
    }
};
//#endregion

//#region file
//file-upload customized events
const files = ref<File[]>([]);
const fileInput = ref<HTMLInputElement | null>(null);
const isDragging = ref(false);

const openFileExplorer = () => {
    fileInput.value?.click();
};

const onFileChange = async (file: File) => {
    if (file) {
        if (file.type !== "application/pdf") {
            message.error(t("message.file_support_only", { fileTypes: "PDF" }));
            return;
        }
        files.value = [];
        message.success(t("message.uploaded_successfully", { name: file.name }));
        files.value.push(file);

        //get string before dot
        const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
        generateByAIModalState.title = fileNameWithoutExt;

        await nextTick(); //to bind data in modal
        openFileStructureModal();
        return;
    }
    message.error(t("message.uploaded_failed"));
};

const handleFileChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
        onFileChange(file);
        target.value = "";
    }
};

const handleDragEnter = (event: DragEvent) => {
    const types = event.dataTransfer?.types || [];
    if (Array.from(types).includes("files")) {
        isDragging.value = true;
    }
};

const handleDrop = async (event: DragEvent) => {
    const file = event.dataTransfer?.files[0];
    isDragging.value = false;

    if (file) {
        onFileChange(file);
    }
};

const onRemoveUploadedFile = () => {
    files.value = [];
    generateFileStructureRef.value?.clearData();
};

//#endregion

//#region check all
//checkboxes  / checkbox-all for importing question back to the page
const onCheckAll = (event: any) => {
    Object.assign(generateModalState, {
        checkedList: event.target.checked ? generatedQuestions.value : [],
        indeterminate: false,
    });
};

watch(
    () => generateModalState.checkedList,
    (val) => {
        generateModalState.indeterminate =
            !!val.length && val.length < generatedQuestions.value.length; //change to uploadedList when it done
        generateModalState.checkAll = val.length === generatedQuestions.value.length;
    },
);

//preview uploaded content
const toggleDisplayAnswer = (index: number, button: EventTarget) => {
    let $button = $(button);

    $button.toggleClass("bx-chevron-up bx-chevron-down");

    const answer = $(`#question-item-answer-${index}`);
    if (answer) $(answer).slideToggle();
};
//#endregion

//#region generate file structure
import GenerateFileStructure from "./GenerateFileStructure.vue";
import ApiAIGenerate from "@/api/ApiAIGenerate";
const generateFileStructureRef = ref<InstanceType<typeof GenerateFileStructure> | null>(null);

const openFileStructureModal = () => {
    if (generateFileStructureRef.value) {
        generateFileStructureRef.value.openModal();
    }
};

const handleImportStructure = (document_structure: string, selected_structure: string) => {
    generateByAIModalState.documentStructureJson = document_structure;
    generateByAIModalState.selectedPartJson = selected_structure;
};

//#endregion

onMounted(() => {});
</script>

<template>
    <a-modal
        centered
        width="100%"
        :closable="false"
        wrap-class-name="full-modal"
        :open="modal_generate_ai_open"
        @cancel="closeGenerateAIModal"
    >
        <a-spin :spinning="loading" size="large" :indicator="indicator">
            <div class="modal-container">
                <div class="modal-title-container">
                    <a-row class="w-100 d-flex align-items-center">
                        <a-col :span="1">
                            <RouterLink @click="closeGenerateAIModal" :to="{ name: '' }">
                                <i class="bx bx-chevron-left navigator-back-button"></i>
                            </RouterLink>
                        </a-col>
                        <a-col class="main-title" :span="23">
                            <span> {{ $t("generate_qs_modal.title") }}</span> <br />
                            <span>
                                {{ $t("generate_qs_modal.sub_title") }}
                            </span>
                        </a-col>
                    </a-row>
                </div>
                <div class="modal-content-item">
                    <div class="content-item-section upload-section">
                        <div class="section-title">
                            <span>{{ $t("import_qs_modal.upload_section") }}</span>
                        </div>
                        <div v-if="!files.length" class="section-content mb-2">
                            <input
                                @change="handleFileChange"
                                class="d-none"
                                type="file"
                                ref="fileInput"
                                accept=".pdf"
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
                                    {{ $t("import_qs_modal.upload_area.title") }}
                                </div>
                                <div class="customized-file-upload-hint">
                                    {{ $t("import_qs_modal.upload_area.content") }}
                                    <br />
                                    {{ $t("import_qs_modal.upload_area.sub_content") }}
                                </div>
                            </div>
                        </div>
                        <div v-if="files.length" class="file-container">
                            <div class="file-item" v-for="file in files">
                                <span>{{ file.name }}</span>
                                <i
                                    class="bx bx-trash text-danger"
                                    @click="onRemoveUploadedFile()"
                                ></i>
                            </div>
                            <div class="file-structure" @click="openFileStructureModal">
                                <i class="bx bx-file"></i>
                                <div>{{ $t("generate_qs_modal.form.structure") }}</div>
                            </div>
                        </div>
                        <a-form layout="vertical" class="generate-ai-form">
                            <a-row class="d-flex justify-content-between">
                                <a-col :span="12">
                                    <a-form-item l :label="t('generate_qs_modal.form.language')">
                                        <a-select
                                            class="language-select"
                                            v-model:value="generateByAIModalState.language"
                                        >
                                            <a-select-option
                                                v-for="locale in SUPPORTED_LOCALES"
                                                :key="`locale-${locale.code}`"
                                                :value="locale.code"
                                            >
                                                {{ locale.label }}
                                            </a-select-option>
                                        </a-select>
                                    </a-form-item>
                                </a-col>
                                <a-col :span="11">
                                    <a-form-item
                                        :label="t('generate_qs_modal.form.maximum_question')"
                                    >
                                        <a-select
                                            v-model:value="generateByAIModalState.questionCount"
                                            style="width: 100%"
                                            :placeholder="'Maximum number of question'"
                                            :options="questionMaximumOptions"
                                        />
                                    </a-form-item>
                                </a-col>
                            </a-row>

                            <a-form-item :label="t('generate_qs_modal.form.question_types')">
                                <a-select
                                    @deselect="onDeselectQuestionType"
                                    v-model:value="generateByAIModalState.questionTypes"
                                    mode="multiple"
                                    style="width: 100%"
                                    :placeholder="'Select multiple'"
                                    :options="questionTypeOptions"
                                />
                            </a-form-item>
                            <a-row class="d-flex justify-content-between">
                                <a-col :span="7">
                                    <a-form-item
                                        :label="t('generate_qs_modal.form.enable_explaination')"
                                    >
                                        <a-switch
                                            v-model:checked="
                                                generateByAIModalState.isGenerateExplain
                                            "
                                        />
                                    </a-form-item>
                                </a-col>
                                <a-col v-if="generateByAIModalState.isGenerateExplain" :span="16">
                                    <a-form-item
                                        :label="t('generate_qs_modal.form.reference_name')"
                                    >
                                        <TextArea
                                            v-model="generateByAIModalState.title"
                                            :is-required="generateByAIModalState.isGenerateExplain"
                                            :max-length="200"
                                            :placeholder="
                                                t(
                                                    'generate_qs_modal.form.reference_name_placeholder',
                                                )
                                            "
                                            :readonly="!generateByAIModalState.isGenerateExplain"
                                        />
                                    </a-form-item>
                                </a-col>
                            </a-row>

                            <a-form-item style="margin-top: 7px" class="generate-ai-btn-container">
                                <a-button
                                    :loading="loading"
                                    size="large"
                                    class="w-100 main-color-btn generate_ai"
                                    type="primary"
                                    @click="onGenerateQuestions"
                                >
                                    {{ $t("generate_qs_modal.buttons.generate") }}
                                </a-button>
                            </a-form-item>
                        </a-form>
                    </div>
                    <div class="content-item-section preview-section">
                        <div class="section-title">{{ $t("import_qs_modal.preview_section") }}</div>
                        <div class="section-content">
                            <div
                                v-if="generatedQuestions.length > 0"
                                class="section-content-header"
                            >
                                <a-checkbox
                                    :class="[
                                        'header-item',
                                        generateModalState.checkAll ? 'check-all' : '',
                                    ]"
                                    @click="onCheckAll"
                                    v-model:checked="generateModalState.checkAll"
                                    :indeterminate="generateModalState.indeterminate"
                                >
                                    {{
                                        $t("share_modal.buttons.check_all", {
                                            number: generateModalState.checkedList.length,
                                        })
                                    }}
                                </a-checkbox>

                                <div class="header-item">
                                    {{
                                        $t("import_qs_modal.other.total_question", {
                                            number: generateModalState.checkedList.length,
                                        })
                                    }}
                                </div>
                            </div>
                            <a-checkbox-group v-model:value="generateModalState.checkedList">
                                <div class="preview-question-container">
                                    <div
                                        class="preview-question-item"
                                        v-for="(question, index) in generatedQuestions"
                                    >
                                        <a-checkbox :value="question"></a-checkbox>
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
                                                        question.type ===
                                                        QUESTION_TYPE.MULTIPLE_CHOICE
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
                                                                <span>#{{ index + 1 }}</span>
                                                                -
                                                                {{ option.text }}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </template>
                                                <template
                                                    v-if="
                                                        question.type === QUESTION_TYPE.SHORT_TEXT
                                                    "
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
                                                    toggleDisplayAnswer(
                                                        index,
                                                        $event.currentTarget!,
                                                    )
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
                                {{ $t("generate_qs_modal.other.ai_warning") }}
                            </span>
                        </div>
                        <div class="w-100 d-flex justify-content-end">
                            <a-button
                                class="main-color-btn"
                                key="submit"
                                type="primary"
                                size="large"
                                @click="handleModalImport"
                            >
                                {{ $t("import_qs_modal.buttons.import") }}
                            </a-button>
                        </div>
                    </div>
                </div>
            </div>
        </a-spin>
        <template #footer></template>
    </a-modal>

    <GenerateFileStructure
        :file="files[0]"
        ref="generateFileStructureRef"
        @import="handleImportStructure"
    />
</template>
<style>
.ant-spin-nested-loading .ant-spin {
    max-width: 100% !important;
}
.ant-spin-nested-loading > div > .ant-spin {
    max-height: 100% !important;
    display: flex;
    align-items: center;
    justify-content: center;
}

.ant-spin-nested-loading > div > .ant-spin .ant-spin-dot {
    inset-inline-start: auto !important;
}
</style>

<style scoped>
.main-color-btn.generate_ai {
    display: block;
}
.preview-section .section-content {
    height: 550px;
    max-height: 550px;
}

::v-deep(.ant-form-item-control-input-content textarea) {
    height: 95px;
    resize: none;
}
.generate-modal-info {
    color: var(--main-color) !important;
}

.file-structure {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100px;
    width: 100px;
    padding: 10px;
    border: 1px solid var(--main-color);
    border-radius: 8px;
    color: var(--text-color-contrast);
    font-weight: 500;
    transition: all 0.2s ease-in-out;
    cursor: pointer;
}

.file-structure i {
    font-size: 50px;
}

.file-structure:hover {
    background-color: var(--main-color);
    border-color: var(--main-color);
}
.loading-container {
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: absolute;
}
</style>
