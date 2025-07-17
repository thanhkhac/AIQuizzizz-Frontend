<script setup lang="ts">
import { ref, onMounted, reactive, computed, onUpdated } from "vue";
import { useI18n } from "vue-i18n";
import Input from "@/shared/components/Common/Input.vue";
import type { TableColumnType } from "ant-design-vue";


const { t } = useI18n();
const emit = defineEmits(["updateSidebar"]);


interface Student {
    name: string;
    email: string;
    position: string;
    image: string;
}

const data: Student[] = [
    {
        name: "Nguyen Manh Hieu",
        email: "hieunm@gmail.com",
        position: "Owner",
        image: "",
    },
    {
        name: "Nguyen Khach Thanh",
        email: "thanhnk@gmail.com",
        position: "",
        image: "",
    },
    {
        name: "Nguyen Tan Duc",
        email: "ducnt@gmail.com",
        position: "",
        image: "",
    },
    {
        name: "Nguyen Manh Duong",
        email: "duongnm@gmail.com",
        position: "",
        image: "",
    },
    {
        name: "Pham Xuan Triuong",
        email: "truongpx@gmail.com",
        position: "",
        image: "",
    },
];

type MyColumn = TableColumnType<Student>;

const columns: MyColumn[] = [
    {
        title: "No",
        key: "no",
        customRender: (info: { index: number }) => info.index + 1,
    },
    {
        title: "Name",
        dataIndex: "name",
        key: "name",
        sorter: (a: any, b: any) => a.name.localeCompare(b.name),
    },
    {
        title: "Email",
        dataIndex: "email",
        key: "email",
        sorter: (a: any, b: any) => a.name.localeCompare(b.email),
    },
    {
        title: "Position",
        dataIndex: "position",
        key: "position",
    },
    {
        key: "action",
    },
];

const optionKeys = ["all", "createdByMe", "sharedWithMe"];

const quiz_credit_options = computed(() =>
    optionKeys.map((key) => ({
        label: t(`question_sets_index.credit.${key}`),
        value: key,
    })),
);

const searchValue = ref("");
const selected_credit_option = ref();

const onFilter = () => {
    // const filtered_data = quiz_data_raw.value.filter((quiz) => {
    //     const matchesSearch = quiz.title.toLowerCase().includes(searchValue.value.toLowerCase());
    //     if (!matchesSearch) return false;
    //     switch (selected_credit_option.value) {
    //         case "createdByMe":
    //             return quiz.createdBy === "me";
    //         case "sharedWithMe":
    //             return quiz.createdBy !== "me";
    //         default:
    //             return true;
    //     }
    // });
    // quiz_data.value = filtered_data;
};

onMounted(() => {
    const sidebarActiveItem = "class";
    emit("updateSidebar", sidebarActiveItem);
});
</script>
<template>
    <div class="page-container">
        <div class="title-container">
            <div class="breadcrumb-container">
                <ul>
                    <li class="title-breadcrumb-item">
                        <RouterLink :to="{ name: 'User_Class' }">
                            <span> Class </span>
                        </RouterLink>
                        <i class="bx bx-chevron-right"></i>
                    </li>
                    <li class="title-breadcrumb-item">
                        <RouterLink :to="{ name: '' }">
                            <span> SEP490 </span>
                        </RouterLink>
                    </li>
                </ul>
            </div>
        </div>
        <div class="content">
            <div class="content-item">
                <div class="content-item-title">
                    <div>
                        <span>Student Directory</span>
                        <span>View and manage all your students</span>
                    </div>
                    <a-button class="main-color-btn" type="primary" size="large">
                        <i class="me-2 bx bx-user-plus"></i>
                        Invite student
                    </a-button>
                </div>
                <div class="content-item-functions">
                    <div class="content-item-navigators">
                        <div class="navigator-container">
                            <RouterLink class="navigator-item active" :to="{ name: '' }">
                                {{ $t("question_sets_index.navigators.quiz") }}
                            </RouterLink>
                            <RouterLink class="navigator-item" :to="{ name: '' }">
                                Draft
                            </RouterLink>
                        </div>
                    </div>
                    <a-select
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
                <a-table :columns="columns" :data-source="data" row-key="key" :pagination="false">
                    <template #bodyCell="{ column, record }">
                        <template v-if="column.key === 'name'">
                            <div class="student-name-container">
                                <img class="student-image" :src="record.image" alt="" />
                                <div class="student-name">{{ record.name }}</div>
                            </div>
                        </template>
                        <template v-if="column.key === 'action'">
                            <div class="student-action">
                                <a-dropdown :trigger="['click']" :placement="'bottomRight'">
                                    <i
                                        class="bx bx-dots-vertical-rounded student-action-dropdown"
                                    ></i>
                                    <template #overlay>
                                        <a-menu class="drop-down-container">
                                            <a-menu-item key="0">
                                                <i class="bx bx-info-circle"></i>
                                                {{ $t("question_sets_index.buttons.detail") }}
                                            </a-menu-item>
                                            <a-menu-item key="1">
                                                <i class="bx bx-edit"></i>
                                                {{ $t("question_sets_index.buttons.edit") }}
                                            </a-menu-item>
                                            <a-menu-item key="2">
                                                <i class="bx bx-copy"></i>
                                                {{ $t("question_sets_index.buttons.dublicate") }}
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
                        </template>
                    </template>
                </a-table>
            </div>
        </div>
    </div>
</template>
<style>
.ant-table {
    background-color: var(--content-item-border-color) !important;
    border: 1px solid;
    border-color: var(--form-item-border-color) !important;
}

.ant-table-cell {
    background-color: var(--content-item-background-color) !important;
    border-color: var(--content-item-border-color) !important;
    color: var(--text-color) !important;
}

.ant-table-row {
    background-color: var(--content-item-background-color);
    border-color: var(--content-item-border-color);
    color: var(--text-color);
}
.ant-table-row:hover .ant-table-cell {
    background-color: var(--content-item-border-color) !important;
}
.ant-table-cell-row-hover {
    background-color: var(--content-item-border-color) !important;
}

.ant-table-column-sorter {
    color: var(--form-item-border-color) !important;
}

.ant-table-column-sorter-up.active {
    color: var(--main-color) !important;
}
.ant-table-column-sorter-down.active {
    color: var(--main-color) !important;
}
</style>

<style scoped>
.breadcrumb-container ul {
    display: flex;
    align-items: center;
    list-style: none;
    padding: 0px;
    margin: 0px;
}

.breadcrumb-container li,
a {
    color: var(--text-color) !important;
    font-size: 24px !important;
}

.title-breadcrumb-item {
    display: flex;
    align-items: center;
}

.title-breadcrumb-item a {
    font-size: 24px;
    text-decoration: none;
}
.title-breadcrumb-item:hover a {
    text-decoration: underline;
}

.title-breadcrumb-item i {
    margin: 0 10px;
    font-size: 26px;
    transform: translateY(2px);
}

.student-name-container {
    display: flex;
    align-items: center;
}

.student-image {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    padding: 5px;
    background-color: var(--text-color);
    border: 1px solid var(--form-item-border-color);
    margin-right: 10px;
}

.student-action {
    width: 100%;
    display: flex;
    justify-content: end;
}
.student-action-dropdown {
    font-size: 20px;
    padding: 6px;
    border-radius: 8px;
    border: 1px solid var(--form-item-border-color);
    cursor: pointer;
}

.content-item-functions {
    margin: 10px 0px;
    display: flex;
    align-items: end;
    justify-content: end;
    margin-right: 50px;
}

.content-item-navigators {
    flex: 1;
    justify-content: start;
    display: flex;
}

.navigator-container {
    height: 40px;
    border-radius: 8px;
    background-color: var(--content-item-children-background-color);
    border: 1px solid var(--content-item-border-color);
    display: flex;
}

.navigator-item {
    color: var(--text-color);
    text-decoration: none;
    height: 100%;
    width: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px !important;
}

.navigator-item:first-child {
    border-top-left-radius: 8px;
    border-bottom-left-radius: 8px;
    margin-right: 2px;
}

.navigator-item:last-child {
    border-top-right-radius: 8px;
    border-bottom-right-radius: 8px;
}

.navigator-item:hover {
    background-color: var(--main-color);
}

.active {
    background-color: var(--main-color);
}
</style>
