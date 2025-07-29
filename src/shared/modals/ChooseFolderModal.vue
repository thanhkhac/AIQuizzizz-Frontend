<script setup lang="ts">
import ApiFolder from "@/api/ApiFolder";
import FOLDER_SHARE_MODE from "@/constants/folderShareMode";
import type FolderPageParams from "@/models/request/folder/folderPageParams";
import type { Folder } from "@/models/response/folder/folder";

import { ref, onMounted, reactive, computed, onUpdated } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";

import Input from "@/shared/components/Common/Input.vue";

const route = useRoute();
const router = useRouter();

const { t } = useI18n();

const optionKeys = Object.values(FOLDER_SHARE_MODE);

const folder_share_mode_options = computed(() =>
    optionKeys.map((key) => ({
        label: t(`folder_index.select_option.${key}`),
        value: key !== FOLDER_SHARE_MODE.ALL ? key : "",
    })),
);

//#region pagination
const folder_data = ref<Folder[]>([]);
const pageParams = reactive({
    pageNumber: route.query.pageNumber || 1,
    pageSize: route.query.pageSize || 10,
    folderName: route.query.folderName?.toString() || "",
    shareMode: route.query.shareMode || folder_share_mode_options.value[0].value,
    totalCount: 0,
    statusFilter: false, //serve as a flag to check if pageParams is in url
});
const getData = async () => {
    try {
        let result = await ApiFolder.GetAllByLimit(pageParams as FolderPageParams);
        if (result.data.success) {
            let resultData = result.data.data;
            folder_data.value = resultData.items;
            pageParams.pageNumber = resultData.pageNumber;
            pageParams.pageSize = resultData.pageSize;
            pageParams.totalCount = resultData.totalCount;

            // if (pageParams.statusFilter) {
            //     //check if filter is active
            //     if (pageParams.pageNumber > resultData.totalPages && pageParams.totalCount > 0) {
            //         pageParams.pageNumber = 1;

            //         router.push({
            //             name: "User_Folder",
            //             query: {
            //                 pageNumber: 1,
            //                 pageSize: pageParams.pageSize,
            //                 folderName: pageParams.folderName,
            //                 shareMode: pageParams.shareMode,
            //             },
            //         });
            //     } else {
            //         router.push({
            //             name: "User_Folder",
            //             query: {
            //                 pageNumber: pageParams.pageNumber,
            //                 pageSize: pageParams.pageSize,
            //                 folderName: pageParams.folderName,
            //                 shareMode: pageParams.shareMode,
            //             },
            //         });
            //     }
            //     pageParams.statusFilter = !pageParams.statusFilter; //toggle filter status
            // }
        }
    } catch (error) {
        console.log("ERROR: GETALLBYLIMIT folder: " + error);
    }
};

//update when page change (url)
onUpdated(() => {
    if (Object.keys(route.query).length === 0) {
        pageParams.pageNumber = route.query.pageNumber || 1;
        pageParams.pageSize = route.query.pageSize || 10;
        pageParams.folderName = route.query.folderName?.toString() || "";
        pageParams.shareMode = route.query.shareMode || folder_share_mode_options.value[0].value;
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
const modal_open = ref(false);

const openModal = () => {
    modal_open.value = true;
};

const closeModal = () => {
    modal_open.value = false;
};

//expose functions to main ref
defineExpose({
    openModal,
    closeModal,
});

const emit = defineEmits<{
    (e: "switchToTestTemplate"): void;
    (e: "openFolder", folder: Folder): void;
}>();

const handleSwitchToTestTemplate = () => {
    emit("switchToTestTemplate");
};

const handleOpenFolder = (folder: Folder) => {
    emit("openFolder", folder);
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
                        <span>Choose from folder test</span>
                    </a-col>
                </a-row>
            </div>
            <div class="content">
                <div class="content-item">
                    <div class="title-container">
                        <div class="main-title">
                            <span>{{ $t("folder_index.title") }}</span> <br />
                            <span>
                                {{ $t("folder_index.sub_title") }}
                            </span>
                        </div>
                    </div>
                    <div class="content-item-functions">
                        <div class="content-item-navigators">
                            <div class="navigator-container">
                                <RouterLink
                                    class="navigator-item navigator-active"
                                    :to="{ name: '' }"
                                >
                                    {{ $t("folder_index.navigators.folder") }}
                                </RouterLink>
                                <RouterLink
                                    class="navigator-item"
                                    :to="{ name: '' }"
                                    @click="handleSwitchToTestTemplate"
                                >
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
                                    v-for="option in folder_share_mode_options"
                                    :value="option.value"
                                >
                                    {{ option.label }}
                                </a-select-option>
                            </a-select>
                            <div style="width: 300px; padding: 0px">
                                <Input
                                    @input="getData"
                                    v-model="pageParams.folderName"
                                    :placeholder="t('class_index.other.search_class_placeholder')"
                                >
                                    <template #icon>
                                        <i class="bx bx-search"></i>
                                    </template>
                                </Input>
                            </div>
                        </div>
                    </div>
                    <div class="folder-container">
                        <template v-if="folder_data.length > 0">
                            <div
                                class="folder"
                                v-for="folder in folder_data"
                                @click="handleOpenFolder(folder)"
                            >
                                <div class="folder-icon">
                                    <div class="folder-top"></div>
                                    <div class="folder-body"></div>
                                </div>
                                <div class="folder-name">{{ folder.name }}</div>
                            </div>
                        </template>
                        <template v-else>
                            <div class="w-100 m-2 d-flex justify-content-center">
                                <a-empty>
                                    <template #description>
                                        <span> {{ $t("folder_index.other.no_data_matches") }}</span>
                                    </template>
                                </a-empty>
                            </div>
                        </template>
                    </div>
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
<style>
.medium-modal.large {
    .ant-modal {
        max-width: 70%;
    }
}
</style>
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
</style>
