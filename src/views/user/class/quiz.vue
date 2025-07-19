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
                        <RouterLink :to="{ name: '' }" class="breadcrumb-item-class">
                            <span> SEP490 </span>
                            <span class="breadcrumb-item-topic"> Capstone project </span>
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
                            <RouterLink class="navigator-item" :to="{ name: 'User_Class_Exam' }">
                                Exam
                            </RouterLink>
                            <RouterLink class="navigator-item navigator-active" :to="{ name: '' }">
                                Quiz
                            </RouterLink>
                            <RouterLink class="navigator-item" :to="{ name: 'User_Class_Student' }">
                                Student
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
                                            <a-menu-item key="1">
                                                <i class="bx bxs-id-card"></i>
                                                {{ $t("question_sets_index.buttons.edit") }}
                                            </a-menu-item>
                                            <a-menu-item key="2">
                                                <i class="bx bx-history"></i>
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
<style scoped>
.breadcrumb-container li,
a {
    color: var(--text-color) !important;
    font-size: 24px !important;
}

.navigator-item {
    font-size: 14px !important;
}
</style>
