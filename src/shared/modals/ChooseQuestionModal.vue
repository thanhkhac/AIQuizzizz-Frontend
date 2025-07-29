<script setup lang="ts">
import ApiTestTemplate from "@/api/ApiTestTemplate";

import type { Folder } from "@/models/response/folder/folder";
import type { ResponseQuestion } from "@/models/response/question";
import type { TestTemplateWithQuestion } from "@/models/response/testTemplate/testTemplateWithQuestion";

import QUESTION_TYPE from "@/constants/questionTypes";

import { ref, reactive, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";

import { Modal } from "ant-design-vue";
import Input from "@/shared/components/Common/Input.vue";

const route = useRoute();

const { t } = useI18n();

interface Props {
    testTemplateId: string;
    folder: Folder | null;
}

const props = defineProps<Props>();

const test_template_data = ref<TestTemplateWithQuestion>();
const question_data = ref<ResponseQuestion[]>();

const getData = async () => {
    try {
        if (!props.testTemplateId) return;
        let result = await ApiTestTemplate.GetById(props.testTemplateId || "");
        if (result.data.success) {
            let resultData = result.data.data;
            test_template_data.value = resultData;
            question_data.value = resultData.questions;
        }
    } catch (error) {
        console.log("ERROR: GETBYID testtemplate: " + error);
    }
};

//#region filter
const QUESTION_FORMAT = {
    HTML: "HTML",
    PLAIN_TEXT: "PlainText",
};

const questionTypeOptions = Object.values(QUESTION_TYPE).map((questionType) => ({
    label: t(`create_QS.type.${questionType}`),
    value: questionType,
}));

const selectedQuestionTypes = ref([...questionTypeOptions.map((x) => x.value)]);
const searchValue = ref("");

const onFilter = () => {
    importModalState.checkedList = [];
    let filtered = test_template_data.value?.questions;
    const search = searchValue.value.trim().toLowerCase();

    filtered = test_template_data.value?.questions.filter((x) => {
        const matchesSearch = !search || x.questionText.toLowerCase().includes(search);

        const matchesType =
            !selectedQuestionTypes.value.length || selectedQuestionTypes.value.includes(x.type);

        return matchesSearch && matchesType;
    }) as ResponseQuestion[];

    question_data.value = filtered;
};

//#endregion

//#region check all
const importModalState = reactive({
    checkAll: false,
    indeterminate: false,
    checkedList: [] as ResponseQuestion[],
});

const onCheckAll = (event: any) => {
    Object.assign(importModalState, {
        checkedList: event.target.checked ? question_data.value : [],
        indeterminate: false,
    });
};

watch(
    () => importModalState.checkedList,
    (val) => {
        importModalState.indeterminate = !!val.length && val.length < question_data.value!.length; //change to uploadedList when it done
        importModalState.checkAll = val.length === question_data.value?.length;
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

//#region modal
const emit = defineEmits<{
    (e: "import", selected: ResponseQuestion[]): void;
    (e: "backToFolderTestTemplateModal", folder: Folder): void;
    (e: "backToTestTemplateModal"): void;
}>();
const modal_open = ref(false);

const openModal = async () => {
    modal_open.value = true;
    await getData();
};

const closeModal = () => {
    modal_open.value = false;
    if (props.folder !== null) {
        emit("backToFolderTestTemplateModal", props.folder);
    } else {
        emit("backToTestTemplateModal");
    }
};

//expose functions to main ref
defineExpose({
    openModal,
    closeModal,
});

const handleModalImport = () => {
    Modal.confirm({
        title: "Are your sure? ",
        content: "Import: " + importModalState.checkedList.length + "?",
        okText: "Confirm",
        onOk: () => {
            const selectedQuestions = question_data.value?.filter((question) =>
                importModalState.checkedList.includes(question),
            ) as ResponseQuestion[];

            //emit event & params to main
            emit("import", selectedQuestions);
            modal_open.value = false;
        },
    });
};
//#endregion
</script>
<template>
    <a-modal
        centered
        width="100%"
        wrap-class-name="medium-modal large"
        :open="modal_open"
        @cancel="closeModal"
    >
        <div class="modal-container">
            <div class="modal-title-container">
                <a-row class="w-100 d-flex align-items-center">
                    <a-col :span="1">
                        <RouterLink @click="closeModal" :to="{ name: '' }">
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
                <div class="content-item-section preview-section">
                    <div class="section-content">
                        <div class="section-content-header">
                            <a-checkbox
                                :class="[
                                    'header-item',
                                    importModalState.checkAll ? 'check-all' : '',
                                ]"
                                @click="onCheckAll"
                                v-model:checked="importModalState.checkAll"
                                :indeterminate="importModalState.indeterminate"
                            >
                                Check all
                            </a-checkbox>
                            <div class="header-item">
                                Selected:
                                {{ importModalState.checkedList.length }}
                            </div>
                            <div class="d-flex flex-fill align-items-center justify-content-end">
                                <a-select
                                    size="large"
                                    class="me-3"
                                    mode="multiple"
                                    v-model:value="selectedQuestionTypes"
                                    placeholder="Filter question types"
                                    style="width: fit-content; min-width: 300px"
                                    @change="onFilter"
                                >
                                    <a-select-option
                                        v-for="option in questionTypeOptions"
                                        :value="option.value"
                                    >
                                        {{ option.label }}
                                    </a-select-option>
                                </a-select>
                                <div style="width: 250px">
                                    <Input
                                        @input="onFilter"
                                        v-model="searchValue"
                                        :placeholder="
                                            t('class_index.other.search_class_placeholder')
                                        "
                                    >
                                        <template #icon>
                                            <i class="bx bx-search"></i>
                                        </template>
                                    </Input>
                                </div>
                            </div>
                        </div>
                        <a-checkbox-group v-model:value="importModalState.checkedList">
                            <div class="preview-question-container">
                                <div
                                    class="preview-question-item"
                                    v-for="(question, index) in question_data"
                                >
                                    <a-checkbox :value="question"></a-checkbox>

                                    <div class="question-item-content">
                                        <div
                                            v-if="question.textFormat === QUESTION_FORMAT.HTML"
                                            class="question-html"
                                            v-html="question.questionText"
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
                                                            v-for="option in question.questionData
                                                                .multipleChoice"
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
                                                    v-for="option in question.questionData.matching
                                                        ?.matches"
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
                                            <template
                                                v-if="question.type === QUESTION_TYPE.ORDERING"
                                            >
                                                <div class="ordering-answer">
                                                    <div class="ordering-answer-item">
                                                        <div
                                                            v-for="option in question.questionData
                                                                .ordering"
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
                                                            ) in question.questionData.ordering?.sort(
                                                                (asc, desc) =>
                                                                    asc.correctOrder -
                                                                    desc.correctOrder,
                                                            )"
                                                        >
                                                            <span>#{{ option.correctOrder }}</span>
                                                            -
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
                                                    {{ question.questionData.shortText }}
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
            <a-button
                class="main-color-btn"
                size="large"
                key="submit"
                type="primary"
                @click="handleModalImport"
            >
                Import
            </a-button>
        </template>
    </a-modal>
</template>
<style scoped>
.header-item {
}

/* unique no remove */
::v-deep(.ant-select-selection-item) {
    background-color: var(--form-item-border-color) !important;
}
</style>
