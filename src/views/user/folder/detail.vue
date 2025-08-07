<script setup lang="ts">
import ApiFolder from "@/api/ApiFolder";

import { ref, onMounted, reactive, computed, onUpdated, h } from "vue";
import { useI18n } from "vue-i18n";
import Validator from "@/services/Validator";

import type { Folder } from "@/models/response/folder/folder";
import type { TestTemplate } from "@/models/response/testTemplate/testTemplate";
import type TestTemplatePageParams from "@/models/request/testTemplate/testTemplatePageParams";
import type FolderTestTemplatePageParams from "@/models/request/folder/testTemplatePageParams";

import { useRoute, useRouter } from "vue-router";
import Input from "@/shared/components/Common/Input.vue";
import { Modal, message } from "ant-design-vue";

const route = useRoute();
const router = useRouter();

const { t } = useI18n();
const emit = defineEmits(["updateSidebar"]);

const folderId = ref(route.params.id.toString() || "");
const folderData = ref<Folder>({
    folderTestId: "",
    name: "",
    createBy: "",
});

const pageParams = reactive({
    pageNumber: route.query.pageNumber || 1,
    pageSize: route.query.pageSize || 10,
    testTemplateName: route.query.testTemplateName?.toString() || "",
    totalCount: 0,
    statusFilter: false, //serve as a flag to check if pageParams is in url
});

const test_template_data = ref<TestTemplate[]>([]);

const getFolderData = async () => {
    if (!Validator.isValidGuid(folderId.value.toString())) {
        router.push({ name: "404" });
        return;
    }
    try {
        if (!folderId.value) router.push({ name: "404" });

        let result = await ApiFolder.GetAllTestTemplateByLimit(
            folderId.value.toString(),
            pageParams as FolderTestTemplatePageParams,
        );
        if (!result.data.success) router.push({ name: "404" });

        folderId.value = result.data.data;
    } catch (error) {
        console.log("ERROR: GETBYID class: " + error);
    }
};

const getData = async () => {
    // try {
    //     let result = await ApiFolder.GetAllTestTemplateByLimit(
    //         folderId.value.toString(),
    //         pageParams as TestTemplatePageParams,
    //     );
    //     if (result.data.success) {
    //         let resultData = result.data.data;
    //         test_template_data.value = resultData.items;
    //         pageParams.pageNumber = resultData.pageNumber;
    //         pageParams.pageSize = resultData.pageSize;
    //         pageParams.totalCount = resultData.totalCount;
    //         if (pageParams.statusFilter) {
    //             //check if filter is active
    //             if (pageParams.pageNumber > resultData.totalPages && pageParams.totalCount > 0) {
    //                 pageParams.pageNumber = 1;
    //                 router.push({
    //                     name: "User_Folder_TestTemplate",
    //                     query: {
    //                         pageNumber: 1,
    //                         pageSize: pageParams.pageSize,
    //                         name: pageParams.name,
    //                     },
    //                 });
    //             } else {
    //                 router.push({
    //                     name: "User_Folder_TestTemplate",
    //                     query: {
    //                         pageNumber: pageParams.pageNumber,
    //                         pageSize: pageParams.pageSize,
    //                         name: pageParams.name,
    //                     },
    //                 });
    //             }
    //             pageParams.statusFilter = !pageParams.statusFilter; //toggle filter status
    //         }
    //     }
    // } catch (error) {
    //     console.log("ERROR: GETALLBYLIMIT testtemplate: " + error);
    // }
};

//update when page change (url)
// onUpdated(() => {
//     if (Object.keys(route.query).length === 0) {
//         pageParams.pageNumber = route.query.pageNumber || 1;
//         pageParams.pageSize = route.query.pageSize || 10;
//         pageParams.name = route.query.name?.toString() || "";
//         pageParams.statusFilter = true;

//         getData();
//     }
// });

// //change when page change (pageParams)
const onPaginationChange = (page: number, pageSize: number) => {
    pageParams.pageNumber = page;
    pageParams.pageSize = pageSize;
    pageParams.statusFilter = true;
    getData();
};

const onRefirectToUpdate = (id: string) => {
    router.push({ name: "User_TestTemplate_Update", params: { id } });
};

const onRemoveTestTemplate = (testTemplateId: string) => {
    Modal.confirm({
        title: "Are you sure to delete this test template?",
        content: "Please double check the important resources!",
        onOk: async () => {
            const result = await ApiFolder.DeleteTestTemplate(
                folderData.value.folderTestId,
                testTemplateId,
            );
            if (!result.data.success) {
                message.error(t("message.removed_failed"));
                return;
            }
            message.success(t("message.removed_successylly"));
            await getData();
        },
    });
};

/* delete folder */
const onOpenConfirmDelete = () => {
    Modal.confirm({
        title: "Are you sure to delete this folder?",
        content: h(
            "div",
            { style: "color: red" },
            "This action is inreversible, every related data will be erased forever. Careful!",
        ),
        centered: true,
        okText: "Confirm",
        onOk: async () => {
            let result = await ApiFolder.DeleteFolder(folderId.value.toString());
            if (!result.data.success) {
                message.error(t("message.deleted_failed"));
                return;
            }
            message.success(t("message.deleted_successfully"));
            router.push({ name: "User_Folder" });
        },
    });
};

//#region update folder modal

const rules = {
    name: [
        {
            required: true,
            message: "This field is required.",
            trigger: "change",
        },
        {
            max: 100,
            message: "Limit 100.",
            trigger: "change",
        },
    ],
};

const modal_update_open = ref(false);

const updateFolderFormRef = ref();
const updateFolderFormState = reactive({
    name: folderData.value.name || "123",
});

const isUpdateLoading = ref(false);
const onUpdateFolder = async () => {
    isUpdateLoading.value = true;
    try {
        await updateFolderFormRef.value?.validate(); //this will throw err to catch
        let result = await ApiFolder.Update(folderId.value.toString(), updateFolderFormState.name);
        if (!result.data.success) {
            message.error(t("message.updated_failed"));
            return;
        }
        message.success(t("message.updated_successfully"));
        modal_update_open.value = false;
        await getData();
    } catch (error) {
        console.log(error);
    } finally {
        isUpdateLoading.value = false;
    }
};
//#endregion

//#region share modal
import ShareModal from "@/shared/modals/ShareModal.vue";
import VISIBILITY from "@/constants/visibility";
const shareModalRef = ref<InstanceType<typeof ShareModal> | null>(null);

const onOpenShareModal = (template: TestTemplate) => {
    shareModalRef.value?.openModal();
};

//#endregion

onMounted(async () => {
    const sidebarActiveItem = "folder";
    emit("updateSidebar", sidebarActiveItem);

    // await getFolderData();
    //     await getData();
});
</script>
<template>
    <div class="page-container">
        <div class="title-container">
            <div class="main-title"><span>Library Folder Test Details</span> <br /></div>
            <div class="title-button-container">
                <a-button
                    type="primary"
                    class="ms-3 main-color-btn"
                    size="large"
                    @click="onOpenShareModal"
                >
                    <i class="me-2 bx bx-share-alt"></i>
                    {{ $t("detail_QS.buttons.share_quiz") }}
                </a-button>
                <a-button type="primary" class="ms-3 main-color-btn" size="large">
                    <i class="me-2 bx bx-plus"></i>
                    Create new test template
                </a-button>
            </div>
        </div>
        <div class="content">
            <div class="content-item">
                <div class="content-item-title">
                    <span>
                        Folder name
                        <i class="bx bx-edit" @click="modal_update_open = true"></i>
                    </span>
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
                    <div class="quiz-item" v-for="template in test_template_data">
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
                            <a-button type="primary" class="me-3 main-color-btn">
                                {{ $t("class_question_set.buttons.view") }}
                            </a-button>
                            <i
                                class="bx bx-edit"
                                @click="onRefirectToUpdate(template.testTemplateId)"
                            ></i>
                            <i
                                class="text-danger bx bx-trash-alt"
                                @click="onRemoveTestTemplate(template.testTemplateId)"
                            ></i>
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
            <div class="mt-4 content-item">
                <div class="content-item-title">
                    <div>
                        <span class="text-danger">{{ $t("class_member.danger_zone.title") }}</span>
                        <span>{{ $t("class_member.danger_zone.sub_title") }}</span>
                    </div>
                </div>
                <div class="danger-zone mt-3 p-4">
                    <div class="text-danger fs-6 fw-bold">Delete folder</div>
                    <div class="text-secondary">
                        {{ $t("class_member.danger_zone.warning_explain") }}
                    </div>
                    <a-button
                        class="mt-3"
                        type="primary"
                        danger
                        size="large"
                        @click="onOpenConfirmDelete"
                    >
                        Delete folder
                    </a-button>
                </div>
            </div>
        </div>
    </div>

    <a-modal
        centered
        wrap-class-name="medium-modal"
        :open="modal_update_open"
        @cancel="modal_update_open = false"
    >
        <div class="modal-container">
            <div class="modal-title-container">
                <a-row class="w-100 d-flex align-items-center">
                    <a-col :span="4">
                        <RouterLink @click="modal_update_open = false" :to="{ name: '' }">
                            <i class="bx bx-chevron-left navigator-back-button"></i>
                        </RouterLink>
                    </a-col>
                    <a-col class="main-title" :span="20">
                        <span>{{ t("folder_index.modal.create_title") }}</span>
                    </a-col>
                </a-row>
            </div>
            <a-form
                ref="updateFolderFormRef"
                layout="vertical"
                :rules="rules"
                :model="updateFolderFormState"
            >
                <Input
                    :label="'Folder name'"
                    :name="'name'"
                    v-model:value="updateFolderFormState.name"
                    :placeholder="t('folder_index.modal.create_folder_name_placeholder')"
                    :is-required="true"
                    :max-length="100"
                ></Input>
            </a-form>
        </div>
        <template #footer>
            <a-button
                :loading="isUpdateLoading"
                class="main-color-btn"
                key="submit"
                type="primary"
                @click="onUpdateFolder"
            >
                Update
            </a-button>
        </template>
    </a-modal>

    <ShareModal
        ref="shareModalRef"
        :id="folderId"
        :name="folderData.name"
        :mode="'folder'"
        :options="[VISIBILITY.PRIVATE]"
        :visibility="VISIBILITY.PRIVATE"
    />
</template>
<style scoped>
.danger-zone {
    background-color: #ef44441a;
    border-radius: 8px;
}
.title-container {
    width: auto;
}
.title-button-container {
    display: flex;
    margin-right: 36px;
}

.content-item-title i {
    cursor: pointer;
    transition: all 0.2s ease-in-out;
}
.content-item-title i:hover {
    opacity: 0.8;
}
</style>
