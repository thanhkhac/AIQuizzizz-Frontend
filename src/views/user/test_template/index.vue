<script setup lang="ts">
import ApiTestTemplate from "@/api/ApiTestTemplate";

import FOLDER_SHARE_MODE from "@/constants/folderShareMode";
import type TestTemplatePageParams from "@/models/request/testTemplate/testTemplatePageParams";
import type { TestTemplate } from "@/models/response/testTemplate/testTemplate";

import { ref, onMounted, reactive, computed, onUpdated, nextTick, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/stores/AuthStore";
import { useRoute, useRouter } from "vue-router";

import Input from "@/shared/components/Common/Input.vue";
import { message, Modal } from "ant-design-vue";

const route = useRoute();
const router = useRouter();

const { t } = useI18n();

const emit = defineEmits(["updateSidebar"]);

const optionKeys = Object.values(FOLDER_SHARE_MODE);

const share_mode_options = computed(() =>
    optionKeys.map((key) => ({
        label: t(`folder_index.select_option.${key}`),
        value: key !== FOLDER_SHARE_MODE.ALL ? key : "",
    })),
);
const test_template_data = ref<TestTemplate[]>([]);
const pageParams = reactive({
    pageNumber: route.query.pageNumber || 1,
    pageSize: route.query.pageSize || 10,
    name: route.query.name?.toString() || "",
    shareMode: route.query.shareMode || share_mode_options.value[0].value,
    totalCount: 0,
    statusFilter: false, //serve as a flag to check if pageParams is in url
});

const getData = async () => {
    try {
        let result = await ApiTestTemplate.GetAllByLimit(pageParams as TestTemplatePageParams);
        if (result.data.success) {
            let resultData = result.data.data;
            test_template_data.value = resultData.items;
            pageParams.pageNumber = resultData.pageNumber;
            pageParams.pageSize = resultData.pageSize;
            pageParams.totalCount = resultData.totalCount;

            if (pageParams.statusFilter) {
                //check if filter is active
                if (pageParams.pageNumber > resultData.totalPages && pageParams.totalCount > 0) {
                    pageParams.pageNumber = 1;

                    router.push({
                        name: "User_TestTemplate",
                        query: {
                            pageNumber: 1,
                            pageSize: pageParams.pageSize,
                            name: pageParams.name,
                            shareMode: pageParams.shareMode,
                        },
                    });
                } else {
                    router.push({
                        name: "User_TestTemplate",
                        query: {
                            pageNumber: pageParams.pageNumber,
                            pageSize: pageParams.pageSize,
                            name: pageParams.name,
                            shareMode: pageParams.shareMode,
                        },
                    });
                }
                pageParams.statusFilter = !pageParams.statusFilter; //toggle filter status
            }
        }
    } catch (error) {
        console.log("ERROR: GETALLBYLIMIT testtemplate: " + error);
    }
};

//update when page change (url)
// onUpdated(() => {
//     if (Object.keys(route.query).length === 0) {
//         pageParams.pageNumber = route.query.pageNumber || 1;
//         pageParams.pageSize = route.query.pageSize || 10;
//         pageParams.name = route.query.name?.toString() || "";
//         pageParams.shareMode = route.query.shareMode || share_mode_options.value[0].value;
//         pageParams.statusFilter = true;

//         getData();
//     }
// });

watch(
    () => Object.keys(route.query).length,
    () => {
        pageParams.pageNumber = route.query.pageNumber || 1;
        pageParams.pageSize = route.query.pageSize || 10;
        pageParams.name = route.query.name?.toString() || "";
        pageParams.shareMode = route.query.shareMode || share_mode_options.value[0].value;
        pageParams.statusFilter = true;

        getData();
    },
);

//change when page change (pageParams)
const onPaginationChange = (page: number, pageSize: number) => {
    pageParams.pageNumber = page;
    pageParams.pageSize = pageSize;
    pageParams.statusFilter = true;
    getData();
};

const onRefirectToCreate = () => {
    router.push({ name: "User_TestTemplate_Create" });
};

const onRefirectToDetail = async (id: string) => {
    // await getPermission(id);
    // if (!permission.value.canView) {
    //     message.warning("You don't have permission to perform this function!");
    //     return;
    // }
    router.push({ name: "User_TestTemplate_Detail", params: { id } });
};

// const onDelete = async (id: string) => {
//     await getPermission(id);
//     if (!permission.value.canDelete) {
//         message.warning("You don't have permission to perform this function!");
//         return;
//     }

//     // if (permission.value.canEdit) router.push({ name: "User_TestTemplate_Update", params: { id } });
//     // else {
//     //     message.warning("You don't have permission to perform this function!");
//     // }

//     Modal.confirm({
//         title: "Are you sure to delete this test template?",
//         content: "Please double check the important resources!",
//         okText: t("sidebar.buttons.ok"),
//         cancelText: t("sidebar.buttons.cancel"),
//         onOk: async () => {
//             const result = await ApiTestTemplate.Delete(id);
//             if (!result.data.success) return;
//             message.success("Removed successfully!");
//             await getData();
//         },
//     });
// };

//#region permission
const permission = ref({
    canEdit: false,
    canDelete: false,
});
const getPermission = async (testTemplateId: string) => {
    const result = await ApiTestTemplate.GetPermissions(testTemplateId);
    if (result.data.success) {
        permission.value = result.data.data;
    }
};
//#endregion

import ShareModal from "@/shared/modals/ShareModal.vue";
import VISIBILITY from "@/constants/visibility";
const shareModalRef = ref<InstanceType<typeof ShareModal> | null>(null);

const onOpenShareModal = async (template: TestTemplate) => {
    chosenTemplate.value = template;
    await getPermission(chosenTemplate.value.testTemplateId);
    if (!permission.value.canEdit) {
        message.warning("You don't have permission to perform this function!");
        return;
    }
    await nextTick();
    shareModalRef.value?.openModal();
};

const chosenTemplate = ref<TestTemplate>({
    testTemplateId: "",
    name: "",
    createBy: "",
    numberOfQuestion: 0,
    dateCreated: "",
    description: "",
});

//#endregion

onMounted(async () => {
    const sidebarActiveItem = "folder";
    emit("updateSidebar", sidebarActiveItem);
    await getData();
    chosenTemplate.value = test_template_data.value[0];
});
</script>
<template>
    <div class="page-container">
        <div class="title-container">
            <div class="main-title">
                <span>{{ $t("folder_index.title") }}</span> <br />
                <span>
                    {{ $t("folder_index.sub_title") }}
                </span>
            </div>
            <div class="title-button-container">
                <a-button
                    type="primary"
                    class="ms-3 main-color-btn"
                    size="large"
                    @click="onRefirectToCreate"
                >
                    Create new template
                    <i class="bx bx-plus"></i>
                </a-button>
            </div>
        </div>
        <div class="content">
            <div class="content-item">
                <div class="content-item-functions">
                    <div class="content-item-navigators">
                        <div class="navigator-container">
                            <RouterLink class="navigator-item" :to="{ name: 'User_Folder' }">
                                {{ $t("folder_index.navigators.folder") }}
                            </RouterLink>
                            <RouterLink class="navigator-item navigator-active" :to="{ name: '' }">
                                {{ $t("folder_index.navigators.test_template") }}
                            </RouterLink>
                        </div>
                    </div>
                    <div class="filter-container">
                        <a-select
                            class="me-3"
                            v-model:value="pageParams.shareMode"
                            style="width: 200px"
                            @change="getData"
                        >
                            <a-select-option
                                v-for="option in share_mode_options"
                                :value="option.value"
                            >
                                {{ option.label }}
                            </a-select-option>
                        </a-select>
                        <div style="width: 300px; padding: 0px">
                            <Input
                                @input="getData"
                                v-model="pageParams.name"
                                :placeholder="t('question_sets_index.search_placeholder')"
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
                        @click="onRefirectToDetail(template.testTemplateId)"
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
                                    {{ template.createBy }}
                                </div>
                            </div>
                        </div>
                        <!-- <div class="exam-item-actions">
                            <i class="bx bx-share-alt" @click="onOpenShareModal(template)"></i>
                            <i
                                class="bx bx-detail"
                                @click="onRefirectToDetail(template.testTemplateId)"
                            ></i>
                            <i
                                class="bx bx-edit"
                                @click="onRefirectToUpdate(template.testTemplateId)"
                            ></i>
                            <i
                                class="text-danger bx bx-trash-alt"
                                @click="onDelete(template.testTemplateId)"
                            ></i>
                        </div> -->
                    </div>
                </div>
                <template v-else>
                    <div class="w-100 d-flex justify-content-center">
                        <a-empty>
                            <template #description>
                                <span> {{ $t("class_index.other.no_data_matches") }}</span>
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
                                `${range[0]}-${range[1]} of ${total} ${t('test_template_index.other.items')}`
                        "
                        show-size-changer
                        class="crud-layout-pagination"
                        :locale="{
                            items_per_page: t('folder_index.other.pages'),
                        }"
                    ></a-pagination>
                </div>
            </div>
        </div>
    </div>
    <ShareModal
        ref="shareModalRef"
        :id="chosenTemplate.testTemplateId"
        :name="chosenTemplate.name"
        :mode="'template'"
        :options="[VISIBILITY.PRIVATE]"
        :visibility="VISIBILITY.PRIVATE"
    />
</template>
<style scoped>
.quiz-item-icon {
    display: flex;
    width: 35px;
    height: 35px;
    justify-content: center;
    align-items: center;
    flex-shrink: 0;
    aspect-ratio: 1/1;
    font-size: 16px;
    border-radius: 50%;
    background: var(--main-color-theme);
    color: var(--main-color);
    margin-right: 12px;
}

.exam-item-actions i {
    font-size: 20px;
    margin: 0px 10px;
    cursor: pointer;
}
</style>
