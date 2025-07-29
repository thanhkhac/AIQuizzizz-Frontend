<script setup lang="ts">
import ApiFolder from "@/api/ApiFolder";
import type FolderTestTemplatePageParams from "@/models/request/folder/testTemplatePageParams";
import type { TestTemplate } from "@/models/response/testTemplate/testTemplate";
import type { Folder } from "@/models/response/folder/folder";

import { ref, reactive, onUpdated } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";

import Input from "@/shared/components/Common/Input.vue";

const route = useRoute();

const { t } = useI18n();

interface Props {
    folder: Folder | null;
}

const props = defineProps<Props>();

//#region pagination
const test_template_data = ref<TestTemplate[]>([]);
const pageParams = reactive({
    pageNumber: route.query.pageNumber || 1,
    pageSize: route.query.pageSize || 10,
    testTemplateName: route.query.testTemplateName?.toString() || "",
    totalCount: 0,
    statusFilter: false, //serve as a flag to check if pageParams is in url
});

const getData = async () => {
    try {
        if (!props.folder?.folderTestId) return;
        let result = await ApiFolder.GetAllTestTemplateByLimit(
            props.folder?.folderTestId,
            pageParams as FolderTestTemplatePageParams,
        );
        if (result.data.success) {
            let resultData = result.data.data;
            test_template_data.value = resultData.items;
            pageParams.pageNumber = resultData.pageNumber;
            pageParams.pageSize = resultData.pageSize;
            pageParams.totalCount = resultData.totalCount;
        }
    } catch (error) {
        console.log("ERROR: GETALLBYLIMIT testtemplate: " + error);
    }
};

//update when page change (url)
onUpdated(() => {
    if (Object.keys(route.query).length === 0) {
        pageParams.pageNumber = route.query.pageNumber || 1;
        pageParams.pageSize = route.query.pageSize || 10;
        pageParams.testTemplateName = route.query.testTemplateName?.toString() || "";
        pageParams.statusFilter = true;

        getData();
    }
});

//change when page change (pageParams)
const onPaginationChange = (page: number, pageSize: number) => {
    pageParams.pageNumber = page;
    pageParams.pageSize = pageSize;
    pageParams.statusFilter = true;
    getData();
};
//#endregion

//#region modal
const emit = defineEmits<{
    (e: "openTestTemplate", testTemplateId: string): void;
    (e: "backToFolderModal"): void;
}>();

const modal_open = ref(false);

const openModal = () => {
    modal_open.value = true;
};

const closeModal = () => {
    modal_open.value = false;
    emit("backToFolderModal");
};

const handleOpenTestTemplate = (testTemplateId: string) => {
    emit("openTestTemplate", testTemplateId);
};

//expose functions to main ref
defineExpose({
    openModal,
    closeModal,
});
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
                        <span>Choose from folder test</span>
                    </a-col>
                </a-row>
            </div>

            <div class="content">
                <div class="content-item">
                    <div class="title-container">
                        <div class="main-title">
                            <span>Folder test: {{ folder?.name }}</span> <br />
                            <span>
                                {{ $t("folder_index.sub_title") }}
                            </span>
                        </div>
                    </div>
                    <div class="content-item-functions">
                        <div class="filter-container">
                            <div style="width: 300px; padding: 0px">
                                <Input
                                    @input="getData"
                                    v-model="pageParams.testTemplateName"
                                    :placeholder="t('class_index.other.search_class_placeholder')"
                                >
                                    <template #icon>
                                        <i class="bx bx-search"></i>
                                    </template>
                                </Input>
                            </div>
                        </div>
                    </div>
                    <div v-if="test_template_data.length > 0" class="quiz-item-container">
                        <div
                            class="quiz-item"
                            v-for="template in test_template_data"
                            @click="handleOpenTestTemplate(template.testTemplateId)"
                        >
                            <i class="bx bx-book-open quiz-item-icon"></i>
                            <div>
                                <div class="quiz-item-title">
                                    {{ template.name }}
                                </div>
                                <div class="quiz-item-info quiz-info-detail">
                                    <div class="quiz-item-questions">
                                        <i class="bx bx-message-square-edit bx-rotate-270"></i>
                                        {{ template.numberOfQuestion }}
                                        {{ $t("dashboards.list_items.quiz.questions") }}
                                    </div>
                                    <div class="quiz-item-created-by">
                                        {{ $t("class_question_set.other.created_by") }}
                                        {{ template.createdBy }}
                                    </div>
                                </div>
                            </div>
                            <div class="exam-item-actions">
                                <a-button
                                    type="primary"
                                    class="me-3 main-color-btn"
                                    @click="handleOpenTestTemplate(template.testTemplateId)"
                                >
                                    {{ $t("class_question_set.buttons.view") }}
                                </a-button>
                            </div>
                        </div>
                    </div>
                    <template v-else>
                        <div class="w-100 d-flex justify-content-center">
                            <a-empty>
                                <template #description>
                                    <span> No data matches. </span>
                                </template>
                            </a-empty>
                        </div>
                    </template>
                    <div class="pagination-container">
                        <a-pagination
                            @change="onPaginationChange"
                            v-model:current="pageParams.pageNumber"
                            :total="pageParams.totalCount"
                            :pageSize="pageParams.pageSize"
                            :show-total="
                                (total: any, range: any) =>
                                    `${range[0]}-${range[1]} of ${total} ${t('folder_index.other.items')}`
                            "
                            show-size-changer
                            show-quick-jumper
                            class="crud-layout-pagination"
                            :locale="{
                                items_per_page: t('folder_index.other.pages'),
                            }"
                        ></a-pagination>
                    </div>
                </div>
            </div>
        </div>
        <template #footer></template>
    </a-modal>
</template>
