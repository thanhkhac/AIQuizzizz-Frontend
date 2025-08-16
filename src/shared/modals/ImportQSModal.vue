<script setup lang="ts">
import ApiTestTemplate from "@/api/ApiTestTemplate";

import { ref, reactive, watch, onMounted, computed } from "vue";
import { Modal, message } from "ant-design-vue";
import { InboxOutlined } from "@ant-design/icons-vue";

import { useI18n } from "vue-i18n";

import type { RequestQuestion } from "@/models/request/question";
import QUESTION_TYPE from "@/constants/questionTypes";
import UPLOADED_QUESTION_STATUS from "@/constants/uploadedQuestionStatus";

const { t } = useI18n();

interface Props {
    title: string;
    numberOfQuestion: number;
}

const props = defineProps<Props>();

const emit = defineEmits<(e: "import", selected: RequestQuestion[]) => void>();

const modal_import_open = ref(false);
const question_data = ref<RequestQuestion[]>([]);

const uploadedQuestions = ref<RequestQuestion[]>([]);
const uploadedInvalidQuestions = ref<RequestQuestion[]>([]);

const importModalState = reactive({
    checkAll: false,
    indeterminate: false,
    checkedList: [] as RequestQuestion[],
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

const onFileChange = async (file: File) => {
    if (file) {
        if (
            file.type !== "application/vnd.ms-excel" &&
            file.type !== "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        ) {
            message.error(t("message.file_support_only", { fileTypes: "XLS, XLSX" }));
            return;
        }

        files.value = [];
        message.success(t("message.uploaded_successfully", { name: file.name }));
        files.value.push(file);

        const result = await ApiTestTemplate.ImportFile(files.value[0]);
        if (result.data.success) {
            question_data.value = [
                ...result.data.data.validQuestions,
                ...result.data.data.invalidQuestions,
            ];

            uploadedQuestions.value = [
                ...result.data.data.validQuestions,
                ...result.data.data.invalidQuestions,
            ];

            uploadedInvalidQuestions.value = result.data.data.invalidQuestions;
            importModalState.checkedList = []; //reset checked list
        }

        return;
    }
    message.error(t("message.uploaded_failed"));
};

const handleFileChange = async (event: Event) => {
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

const handleDrop = (event: DragEvent) => {
    const file = event.dataTransfer?.files[0];

    isDragging.value = false;

    if (file) {
        onFileChange(file);
    }
};

const onRemoveUploadedFile = (index: number) => {
    files.value?.splice(index, 1);

    importModalState.checkedList = [];
    question_data.value = [];
    uploadedInvalidQuestions.value = [];
    uploadedQuestions.value = [];
};

//#region filter select

const optionKeys = Object.values(UPLOADED_QUESTION_STATUS);
const select_options = computed(() =>
    optionKeys.map((key) => ({
        label: t(`import_qs_modal.uploaded_question_status.${key}`),
        value: key,
    })),
);
const selected_option = ref(select_options.value[0].value);

const onFilter = () => {
    importModalState.checkedList = [];

    let filtered_data = question_data.value;
    switch (selected_option.value) {
        case UPLOADED_QUESTION_STATUS.VALID: {
            filtered_data = question_data.value?.filter(
                (x) => !uploadedInvalidQuestions.value?.includes(x),
            );
            break;
        }
        case UPLOADED_QUESTION_STATUS.IN_VALID: {
            filtered_data = question_data.value?.filter((x) =>
                uploadedInvalidQuestions.value?.includes(x),
            );
            break;
        }
        default: {
            break;
        }
    }
    uploadedQuestions.value = filtered_data || [];
};
//#endregion

//checkboxes  / checkbox-all for importing question back to the page
const onCheckAll = (event: any) => {
    Object.assign(importModalState, {
        checkedList: event.target.checked ? uploadedQuestions.value : [],
        indeterminate: false,
    });
};

watch(
    () => importModalState.checkedList,
    (val) => {
        importModalState.indeterminate =
            !!val.length && val.length < uploadedQuestions.value!.length; //change to uploadedList when it done
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
    if (importModalState.checkedList.length === 0) {
        message.warning(
            t("message.minimum_question", {
                number: 5,
            }),
        );
        return;
    }
    if (importModalState.checkedList.length + props.numberOfQuestion > 500) {
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
            number: importModalState.checkedList.length,
        }),
        okText: t("create_QS.buttons.ok"),
        cancelText: t("create_QS.buttons.cancel"),
        onOk: () => {
            const selectedQuestions = uploadedQuestions.value?.filter((question) =>
                importModalState.checkedList.includes(question),
            ) as RequestQuestion[];

            //emit event & params to main
            emit("import", selectedQuestions);
            closeImportModal();
        },
    });
};

onMounted(() => {
    // uploadedQuestions.value = question_data_raw as RequestQuestion[]; //sample
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
                        <span> {{ $t("import_qs_modal.title") }}</span> <br />
                        <span>
                            {{ $t("import_qs_modal.sub_title") }}
                        </span>
                    </a-col>
                </a-row>
            </div>
            <div class="modal-content-item">
                <div class="content-item-section upload-section">
                    <div class="section-title">
                        <span>{{ $t("import_qs_modal.upload_section") }}</span>
                        <a-button class="main-color-btn" type="primary">{{
                            $t("import_qs_modal.buttons.download")
                        }}</a-button>
                    </div>
                    <div class="section-content">
                        <input
                            @change="handleFileChange"
                            class="d-none"
                            type="file"
                            ref="fileInput"
                            accept=".xls,.xlsx"
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
                    <div class="section-title">{{ $t("import_qs_modal.preview_section") }}</div>
                    <div class="section-content">
                        <div v-if="question_data.length > 0" class="section-content-header">
                            <a-checkbox
                                :class="[
                                    'header-item',
                                    importModalState.checkAll ? 'check-all' : '',
                                ]"
                                @click="onCheckAll"
                                v-model:checked="importModalState.checkAll"
                                :indeterminate="importModalState.indeterminate"
                            >
                                {{
                                    $t("share_modal.buttons.check_all", {
                                        number: importModalState.checkedList.length,
                                    })
                                }}
                            </a-checkbox>

                            <div class="d-flex">
                                <a-select
                                    size="large"
                                    class="me-3"
                                    v-model:value="selected_option"
                                    style="width: 200px"
                                    @change="onFilter"
                                >
                                    <a-select-option
                                        v-for="option in select_options"
                                        :value="option.value"
                                    >
                                        {{ option.label }}
                                    </a-select-option>
                                </a-select>
                            </div>
                        </div>
                        <a-checkbox-group v-model:value="importModalState.checkedList">
                            <div class="preview-question-container">
                                <div
                                    :class="[
                                        'preview-question-item',
                                        uploadedInvalidQuestions?.includes(question)
                                            ? 'invalid'
                                            : '',
                                    ]"
                                    v-for="(question, index) in uploadedQuestions"
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
            <div class="mt-4 d-flex align-items-center">
                <div class="header-item">
                    {{
                        $t("import_qs_modal.other.total_question", {
                            number: importModalState.checkedList.length,
                        })
                    }}
                </div>
                <a-button
                    class="main-color-btn"
                    size="large"
                    key="submit"
                    type="primary"
                    @click="handleModalImport"
                >
                    {{ $t("import_qs_modal.buttons.import") }}
                </a-button>
            </div>
        </template>
    </a-modal>
</template>
<style>
.preview-question-item.invalid {
    border-color: red;
}
</style>
