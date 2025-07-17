<script setup>
import ApiClass from "@/api/ApiClass";

import { ref, onMounted, reactive, computed, onUpdated } from "vue";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/stores/AuthStore";
import { useRoute } from "vue-router";

import Input from "@/shared/components/Common/Input.vue";
import { message } from "ant-design-vue";

const route = useRoute();
const authStore = useAuthStore();
const { t } = useI18n();

const emit = defineEmits(["updateSidebar"]);
const user = ref(authStore.getUserInfo());

const pageParams = reactive({
    pageNumber: route.params.pageNumber || 1,
    pageSize: route.params.pageSize || 10,
    name: route.params.name || "",
    shareMode: route.params.shareMode || "",
    totalCount: 0,
    statusFilter: false, //serve as a flag to check if pageParams is in url
});

const getData = async () => {
    try {
        let result = await ApiClass.GetAllByLimit(pageParams);
        if (result.data.isSucceeded) {
            data.value = result.data.data;
            pageParams.pageNumber = result.data.pageNumber;
            pageParams.pageSize = result.data.pageSize;
            pageParams.totalCount = result.data.totalCount;

            if (pageParams.statusFilter) {
                //check if filter is active
                if (pageParams.pageNumber > result.data.totalPages && pageParams.totalCount > 0) {
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
        console.log("ERROR: GETALLBYLIMIT doctorProfile." + error);
    }
};

//update when page change (url)
onUpdated(() => {
    if (Object.keys(route.query).length === 0) {
        pageParams.pageNumber = route.params.pageNumber || 1;
        pageParams.pageSize = route.params.pageSize || 10;
        pageParams.name = route.params.name || "";
        pageParams.shareMode = route.params.shareMode || "";
        pageParams.statusFilter = true;

        //getData();
    }
});

//change when page change (pageParams)
const onPaginationChange = (page, pageSize) => {
    pageParams.pageNumber = page;
    pageParams.pageSize = pageSize;
    pageParams.statusFilter = true;
    //getData();
};

const class_data_raw = ref([
    {
        id: "1234",
        name: "SEP490",
        topic: "Capstones project",
        owner: {
            id: "72474e9e-491e-455a-b498-4c28f7186d9f",
            name: "Nguyen Tan Duc",
        },
    },
    {
        id: "1235",
        name: "WED103",
        topic: "Web development",
        owner: {
            id: "a1b2c3d4-5678-9101-1121-314151617181",
            name: "Le Minh Tu",
        },
    },
    {
        id: "1236",
        name: "CCP101",
        topic: "Cloud computing",
        owner: {
            id: "b2c3d4e5-6789-1011-1213-141516171819",
            name: "Tran Van Hai",
        },
    },
    {
        id: "1237",
        name: "MLP123",
        topic: "Machine learning",
        owner: {
            id: "c3d4e5f6-7891-0111-2131-415161718192",
            name: "Pham Thi Thu",
        },
    },
    {
        id: "1238",
        name: "CSD201",
        topic: "Data structure and algorithm",
        owner: {
            id: "d4e5f6g7-8910-1112-1314-151617181920",
            name: "Vo Quang Huy",
        },
    },
    {
        id: "1239",
        name: "PRM392",
        topic: "Mobile programming",
        owner: {
            id: "e5f6g7h8-9101-1121-3141-516171819212",
            name: "Nguyen Thi Lan",
        },
    },
]);

const class_data = ref([]);

const optionKeys = ["all", "createdByMe", "sharedWithMe"];

const quiz_credit_options = computed(() =>
    optionKeys.map((key) => ({
        label: t(`question_sets_index.credit.${key}`),
        value: key,
    })),
);

const searchValue = ref("");
const selected_credit_option = ref(quiz_credit_options.value[0].value);

const onFilter = () => {
    let filteredData = class_data_raw.value.filter((item) => {
        const matches = item.name.toLowerCase().includes(searchValue.value.toLowerCase());
        if (!matches) return false;

        switch (selected_credit_option.value) {
            case "createdByMe":
                return item.owner.id === user.value.id;
            case "sharedWithMe":
                return item.owner.id !== user.value.id;
            default:
                return true;
        }
    });

    class_data.value = filteredData;
};

/* join modal */

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
    ],
};

const modal_join_class_open = ref(false);

const joinClassFornState = reactive({
    code: "",
});

const onJoinClass = async () => {
    if (!joinClassFornState.code.trim()) {
        message.error("Invalid class code");
        return;
    }

    //call api
};

/* create modal */

const modal_create_class_open = ref(false);

const createClassFornState = reactive({
    name: "",
});

const onCreateClass = async () => {
    if (!createClassFornState.name.trim()) {
        message.error("Invalid class name");
        return;
    }

    //call api
};

onMounted(() => {
    const sidebarActiveItem = "class";
    emit("updateSidebar", sidebarActiveItem);
    class_data.value = class_data_raw.value;
});
</script>

<template>
    <div class="page-container">
        <div class="title-container">
            <div>
                <span>{{ $t("question_sets_index.title") }}</span> <br />
                <span>
                    {{ $t("question_sets_index.sub_title") }}
                </span>
            </div>
            <div class="title-button-container">
                <a-button
                    type="primary"
                    class="main-color-btn"
                    size="large"
                    @click="modal_join_class_open = true"
                >
                    Join class
                    <i class="bx bx-log-in"></i>
                </a-button>
                <a-button
                    type="primary"
                    class="ms-3 main-color-btn"
                    size="large"
                    @click="modal_create_class_open = true"
                >
                    Create class
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
                            v-model:value="selected_credit_option"
                            style="width: 200px"
                            @change="onFilter"
                        >
                            <a-select-option
                                v-for="option in quiz_credit_options"
                                :value="option.value"
                            >
                                {{ option.label }}
                            </a-select-option>
                        </a-select>
                        <div style="width: 300px; padding: 0px">
                            <Input
                                @input="onFilter"
                                v-model="searchValue"
                                :placeholder="t('question_sets_index.search_placeholder')"
                            >
                                <template #icon>
                                    <i class="bx bx-search"></i>
                                </template>
                            </Input>
                        </div>
                    </div>
                </div>
                <div class="class-container">
                    <div class="class-item" v-for="item in class_data">
                        <div class="class-item-name">{{ item.name }}</div>
                        <div class="class-item-topic">{{ item.topic }}</div>
                        <div class="class-item-owner">
                            <i class="bx bxs-user"></i>
                            {{ item.owner.name }}
                        </div>
                    </div>
                </div>
                <div class="pagination-container">
                    <a-pagination
                        @change="onPaginationChange"
                        v-model:current="pageParams.pageNumber"
                        :total="pageParams.totalRecords"
                        :pageSize="pageParams.pageSize"
                        :show-total="(total, range) => `${range[0]}-${range[1]} of ${total} items`"
                        show-size-changer
                        show-quick-jumper
                        class="crud-layout-pagination"
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
                        <span>Join class</span>
                    </a-col>
                </a-row>
            </div>
            <a-form layout="vertical" :rules="rules">
                <a-form-item label="Class code" name="code">
                    <Input
                        v-model:value="joinClassFornState.code"
                        :placeholder="'Invitaion code'"
                        :is-required="true"
                    ></Input>
                </a-form-item>
            </a-form>
        </div>
        <template #footer>
            <a-button class="main-color-btn" key="submit" type="primary" @click="onJoinClass">
                Join
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
                        <span>Create new class</span>
                    </a-col>
                </a-row>
            </div>
            <a-form layout="vertical" :rules="rules">
                <a-form-item label="Class name" name="name">
                    <Input
                        v-model:value="createClassFornState.name"
                        :placeholder="'Class name'"
                        :is-required="true"
                    ></Input>
                </a-form-item>
            </a-form>
        </div>
        <template #footer>
            <a-button class="main-color-btn" key="submit" type="primary" @click="onCreateClass">
                Create
            </a-button>
        </template>
    </a-modal>
</template>

<style scoped>
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

::v-deep(.ant-form-item-label label) {
    color: var(--text-color);
}

::v-deep(.ant-pagination) {
    color: var(--text-color);
}

::v-deep(.ant-pagination-item-link) {
    color: var(--text-color) !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
}

::v-deep(.ant-pagination-item-active) {
    color: var(--main-color) !important;
    border-color: var(--main-color) !important;
}

::v-deep(.ant-pagination-disabled) {
    opacity: 0.5 !important;
}

.pagination-container {
    display: flex;
    justify-content: center;
}
</style>
