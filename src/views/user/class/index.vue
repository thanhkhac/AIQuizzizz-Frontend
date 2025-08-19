<script setup lang="ts">
import ApiClass from "@/api/ApiClass";
import CLASS_SHARE_MODE from "@/constants/classShareMode";
import type ClassPageParams from "@/models/request/class/classPageParams";

import { ref, onMounted, reactive, computed, onUpdated, watch } from "vue";
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
const user = ref(authStore.getUserInfo());

const optionKeys = Object.values(CLASS_SHARE_MODE);

const class_credit_options = computed(() =>
    optionKeys.map((key) => ({
        label: t(`class_index.select_option.${key}`),
        value: key !== CLASS_SHARE_MODE.ALL ? key : "",
    })),
);

const pageParams = reactive({
    pageNumber: route.query.pageNumber || 1,
    pageSize: route.query.pageSize || 10,
    name: route.query.name?.toString() || "",
    shareMode: route.query.shareMode || class_credit_options.value[0].value,
    totalCount: 0,
    statusFilter: false, //serve as a flag to check if pageParams is in url
});

interface ClassData {
    classId: string;
    name: string;
    topic: string;
    owner: string;
}
const class_data = ref<ClassData[]>([]);
const loading = ref(false);
const getData = async () => {
    try {
        loading.value = true;
        let result = await ApiClass.GetAllByLimit(pageParams as ClassPageParams);
        if (result.data.success) {
            let resultData = result.data.data;
            class_data.value = resultData.items;
            pageParams.pageNumber = resultData.pageNumber;
            pageParams.pageSize = resultData.pageSize;
            pageParams.totalCount = resultData.totalCount;

            if (pageParams.statusFilter) {
                //check if filter is active
                if (pageParams.pageNumber > resultData.totalPages && pageParams.totalCount > 0) {
                    pageParams.pageNumber = 1;

                    router.push({
                        name: "User_Class",
                        query: {
                            pageNumber: 1,
                            pageSize: pageParams.pageSize,
                            name: pageParams.name,
                            shareMode: pageParams.shareMode,
                        },
                    });
                } else {
                    router.push({
                        name: "User_Class",
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
        console.log("ERROR: GETALLBYLIMIT class: " + error);
    } finally {
        loading.value = false;
    }
};

//update when page change (url)
// onUpdated(() => {
//     if (Object.keys(route.query).length === 0) {
//         pageParams.pageNumber = route.query.pageNumber || 1;
//         pageParams.pageSize = route.query.pageSize || 10;
//         pageParams.name = route.query.name?.toString() || "";
//         pageParams.shareMode = route.query.shareMode || class_credit_options.value[0].value;
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
        pageParams.shareMode = route.query.shareMode || class_credit_options.value[0].value;
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

//rules for both modal
const rules = {
    code: [
        {
            required: true,
            message: "This field is required.",
            trigger: "change",
        },
    ],
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
    topic: [
        {
            max: 100,
            message: "Limit 100",
            trigger: "change",
        },
    ],
};

/* join modal */
const modal_join_class_open = ref(false);

const joinClassFormRef = ref();
const joinClassFormState = reactive({
    code: "",
});

const isJoinLoading = ref(false);
const onJoinClass = async () => {
    isJoinLoading.value = true;
    try {
        await joinClassFormRef.value.validate(); //this will throw err to catch
        const result = await ApiClass.JoinClass(joinClassFormState);
        if (!result.data.success) {
            message.error(t("message.join_class_failed"));
            return;
        }
        modal_join_class_open.value = false;
        message.success(t("message.join_class_successfully"));
        await getData();
    } catch (error) {
        console.log(error);
    } finally {
        isJoinLoading.value = false;
    }
};

/* create modal */
const modal_create_class_open = ref(false);

const createClassFormRef = ref();
const createClassFormState = reactive({
    name: "",
    topic: "",
});

const isCreateLoading = ref(false);
const onCreateClass = async () => {
    isCreateLoading.value = true;
    try {
        await createClassFormRef.value.validate(); //this will throw err to catch
        let result;

        if (createClassFormState.topic) {
            result = await ApiClass.Create({
                name: createClassFormState.name,
                topic: createClassFormState.topic,
            });
        } else {
            result = await ApiClass.Create({
                name: createClassFormState.name,
            });
        }

        if (!result.data.success) {
            message.error("Create class failed");
            return;
        }
        modal_create_class_open.value = false;
        message.success("Create class successfully.");
        await getData();
    } catch (error) {
        console.log(error);
    } finally {
        isCreateLoading.value = false;
    }
};

const onRedirectToClassDetail = (classId: string) => {
    router.push({
        name: "User_Class_Exam",
        params: {
            id: classId,
        },
    });
};

onMounted(async () => {
    const sidebarActiveItem = "class";
    emit("updateSidebar", sidebarActiveItem);
    await getData();
});
</script>

<template>
    <div class="page-container">
        <div class="title-container">
            <div class="main-title">
                <span>{{ $t("class_index.title") }}</span> <br />
                <span>
                    {{ $t("class_index.sub_title") }}
                </span>
            </div>
            <div class="title-button-container">
                <a-button
                    type="primary"
                    class="main-color-btn"
                    size="large"
                    @click="modal_join_class_open = true"
                >
                    {{ $t("class_index.buttons.join_class") }}
                    <i class="bx bx-log-in"></i>
                </a-button>
                <a-button
                    type="primary"
                    class="ms-3 main-color-btn"
                    size="large"
                    @click="modal_create_class_open = true"
                >
                    {{ $t("class_index.buttons.create_class") }}
                    <i class="bx bx-plus"></i>
                </a-button>
            </div>
        </div>
        <div class="content">
            <div class="content-item">
                <div class="content-item-functions">
                    <div class="filter-container">
                        <a-select
                            class="me-3"
                            v-model:value="pageParams.shareMode"
                            style="width: 200px"
                            @change="getData"
                        >
                            <a-select-option
                                v-for="option in class_credit_options"
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
                <template v-if="loading" class="class-container">
                    <a-skeleton active :loading="loading"></a-skeleton>
                    <a-skeleton active :loading="loading"></a-skeleton>
                    <a-skeleton active :loading="loading"></a-skeleton>
                </template>
                <div v-else class="class-container">
                    <template v-if="class_data.length > 0">
                        <div
                            class="class-item"
                            v-for="item in class_data"
                            @click="onRedirectToClassDetail(item.classId)"
                        >
                            <div class="class-item-name">{{ item.name }}</div>
                            <div class="class-item-topic">{{ item.topic }}</div>
                            <div class="class-item-owner">
                                <i class="bx bxs-user"></i>
                                {{ item.owner }}
                            </div>
                        </div>
                    </template>
                    <template v-else>
                        <div class="w-100 m-2 d-flex justify-content-center">
                            <a-empty>
                                <template #description>
                                    <span> {{ $t("class_index.other.no_data_matches") }}</span>
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
                            (total: number, range: number[]) =>
                                `${range[0]}-${range[1]} of ${total} ${t('class_index.other.items')}`
                        "
                        show-size-changer
                        class="crud-layout-pagination"
                        :locale="{
                            items_per_page: t('class_index.other.pages'),
                        }"
                    ></a-pagination>
                </div>
            </div>
        </div>
    </div>

    <a-modal
        centered
        wrap-class-name="medium-modal"
        :open="modal_join_class_open"
        @cancel="modal_join_class_open = false"
    >
        <div class="modal-container">
            <div class="modal-title-container">
                <a-row class="w-100 d-flex align-items-center">
                    <a-col :span="4">
                        <RouterLink @click="modal_join_class_open = false" :to="{ name: '' }">
                            <i class="bx bx-chevron-left navigator-back-button"></i>
                        </RouterLink>
                    </a-col>
                    <a-col class="main-title" :span="20">
                        <span>{{ t("class_index.modal.join_title") }}</span>
                    </a-col>
                </a-row>
            </div>
            <a-form
                ref="joinClassFormRef"
                :model="joinClassFormState"
                layout="vertical"
                :rules="rules"
            >
                <Input
                    :label="t('class_index.modal.join_class_code_label')"
                    :name="'code'"
                    v-model:value="joinClassFormState.code"
                    :placeholder="t('class_index.modal.join_class_code_placeholder')"
                    :is-required="true"
                ></Input>
            </a-form>
        </div>
        <template #footer>
            <a-button
                :loading="isJoinLoading"
                class="main-color-btn"
                key="submit"
                type="primary"
                @click="onJoinClass"
            >
                {{ t("class_index.buttons.join") }}
            </a-button>
        </template>
    </a-modal>

    <!-- create modal -->
    <a-modal
        centered
        wrap-class-name="medium-modal"
        :open="modal_create_class_open"
        @cancel="modal_create_class_open = false"
    >
        <div class="modal-container">
            <div class="modal-title-container">
                <a-row class="w-100 d-flex align-items-center">
                    <a-col :span="4">
                        <RouterLink @click="modal_create_class_open = false" :to="{ name: '' }">
                            <i class="bx bx-chevron-left navigator-back-button"></i>
                        </RouterLink>
                    </a-col>
                    <a-col class="main-title" :span="20">
                        <span>{{ t("class_index.modal.create_title") }}</span>
                    </a-col>
                </a-row>
            </div>
            <a-form
                ref="createClassFormRef"
                layout="vertical"
                :rules="rules"
                :model="createClassFormState"
            >
                <a-form-item>
                    <Input
                        :label="t('class_index.modal.create_class_name_label')"
                        :name="'name'"
                        v-model:value="createClassFormState.name"
                        :placeholder="t('class_index.modal.create_class_name_placeholder')"
                        :is-required="true"
                        :max-length="100"
                    ></Input>
                </a-form-item>
                <a-form-item>
                    <Input
                        :label="t('class_index.modal.create_class_topic_label')"
                        :name="'topic'"
                        v-model:value="createClassFormState.topic"
                        :placeholder="t('class_index.modal.create_class_topic_placeholder')"
                        :max-length="100"
                    ></Input>
                </a-form-item>
            </a-form>
        </div>
        <template #footer>
            <a-button
                :loading="isCreateLoading"
                class="main-color-btn"
                key="submit"
                type="primary"
                @click="onCreateClass"
            >
                {{ t("class_index.buttons.create") }}
            </a-button>
        </template>
    </a-modal>
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

.class-container {
    display: flex;
    flex-wrap: wrap;
    padding: 10px 0px;
}

.class-item {
    width: calc(100% / 3 - 50px);
    height: 130px;
    padding: 10px;
    background-color: var(--content-item-background-color);
    border: 1px solid var(--form-item-border-color);
    border-radius: 8px;
    margin: 10px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
}
.class-item:hover {
    border-color: var(--main-color);
}
.class-item:hover .class-item-name {
    color: var(--main-color);
    text-decoration: underline;
}

.class-item-name {
    font-size: 24px;
    font-weight: 700;
    color: var(--text-color);
    text-decoration: none;
    transition: all 0.2s ease-in-out;
}

.class-item-topic {
    flex: 1;
    font-size: 14px;
    color: var(--text-color-grey);
    transition: all 0.2s ease-in-out;
}

.class-item-owner {
    border-top: 1px solid var(--form-item-border-color);
    font-size: 14px;
    padding-top: 10px;
    display: flex;
    align-items: center;
}
.class-item-owner i {
    font-size: 20px;
    margin-right: 10px;
}

::v-deep(.ant-empty-footer) {
    display: flex;
    justify-content: center;
}
</style>
