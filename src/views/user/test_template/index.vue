<script setup lang="ts">
import ApiTestTemplate from "@/api/ApiTestTemplate";

import FOLDER_SHARE_MODE from "@/constants/folderShareMode";
import type TestTemplatePageParams from "@/models/request/testTemplate/testTemplatePageParams";
import type { TestTemplate } from "@/models/response/testTemplate/testTemplate";

import { ref, onMounted, reactive, computed, onUpdated } from "vue";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/stores/AuthStore";
import { useRoute, useRouter } from "vue-router";

import Input from "@/shared/components/Common/Input.vue";
import { message } from "ant-design-vue";

const route = useRoute();
const router = useRouter();

const authStore = useAuthStore();
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
onUpdated(() => {
    if (Object.keys(route.query).length === 0) {
        pageParams.pageNumber = route.query.pageNumber || 1;
        pageParams.pageSize = route.query.pageSize || 10;
        pageParams.name = route.query.name?.toString() || "";
        pageParams.shareMode = route.query.shareMode || share_mode_options.value[0].value;
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

const onRefirectToCreate = () => {
    router.push({ name: "User_TestTemplate_Create" });
};

const onRefirectToUpdate = (id: string) => {
    router.push({ name: "User_TestTemplate_Update", params: { id } });
};

onMounted(async () => {
    const sidebarActiveItem = "folder";
    emit("updateSidebar", sidebarActiveItem);
    await getData();
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
                            <a-dropdown :trigger="['click']">
                                <i class="bx bx-dots-vertical-rounded ant-dropdown-link"></i>
                                <template #overlay>
                                    <a-menu class="drop-down-container">
                                        <a-menu-item key="0">
                                            <i class="bx bx-info-circle"></i>
                                            {{ $t("question_sets_index.buttons.detail") }}
                                        </a-menu-item>
                                        <a-menu-item key="1" @click="onRefirectToUpdate(template.testTemplateId)">
                                            <i class="bx bx-edit"></i>
                                            {{ $t("question_sets_index.buttons.edit") }}
                                        </a-menu-item>
                                        <a-menu-divider style="background-color: #ddd" />
                                        <a-menu-item key="3">
                                            <span class="d-flex align-items-center">
                                                <i class="bx bx-trash-alt"></i>
                                                {{ $t("question_sets_index.buttons.delete") }}
                                            </span>
                                        </a-menu-item>
                                    </a-menu>
                                </template>
                            </a-dropdown>
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
</template>
<style scoped>
.title-container {
    width: auto;
}

.title-button-container {
    display: flex;
    margin-right: 36px;
}

.content-item-functions {
    margin: 10px 0px;
    display: flex;
    align-items: end;
    justify-content: end;
}

.filter-container {
    display: flex;
    justify-content: end;
    align-items: center;
}

.quiz-item {
    background-color: var(--content-item-children-background-color);
    margin: 10px 0px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 10px;
    display: flex;
    align-items: center;
    cursor: pointer;
}

.quiz-item:hover {
    border: 1px solid var(--main-color);
}

.quiz-item i {
    font-size: 18px;
}

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
    background: #221a32;
    color: #7c3aed;
    margin-right: 12px;
}

.quiz-item-title {
    font-size: 18px;
    font-weight: 600;
}

.quiz-item-description {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-color-grey);
}

.quiz-item-info {
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.quiz-item-info i {
    font-size: 14px;
}

.quiz-info-detail {
    margin-top: 5px;
    padding-top: 5px;
}

.quiz-item-questions {
    width: 120px;
}

.quiz-item-created-by {
    flex: 1;
    margin-left: 50px;
    color: var(--text-color-grey);
}

.exam-item-actions {
    flex: 1;
    display: flex;
    justify-content: end;
    align-items: center;
}
</style>
