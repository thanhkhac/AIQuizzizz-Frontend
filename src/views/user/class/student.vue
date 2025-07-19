<script setup lang="ts">
import ApiClass from "@/api/ApiClass";

import { ref, onMounted, reactive, computed, onUpdated } from "vue";
import { useI18n } from "vue-i18n";
import Input from "@/shared/components/Common/Input.vue";

import type { TableColumnType } from "ant-design-vue";
import type { Class } from "@/models/response/class/class";
import type { ClassStudent } from "@/models/response/class/classStudent";
import CLASS_STUDENT_SELECT_FIELD from "@/constants/classSelectFieldName";

import { useRoute, useRouter } from "vue-router";
import type ClassStudentPageParams from "@/models/request/class/classStudentPageParams";

const route = useRoute();
const router = useRouter();

const { t } = useI18n();
const emit = defineEmits(["updateSidebar"]);

const optionKeys = Object.values(CLASS_STUDENT_SELECT_FIELD);

const class_position_options = computed(() =>
    optionKeys.map((key) => ({
        label: t(`class_student.select_option.${key}`),
        value: key,
    })),
);

const classId = ref(route.params.id || "");
const classData = ref<Class>({
    classId: "",
    name: "",
    topic: "",
});

const pageParams = reactive({
    pageNumber: route.query.pageNumber || 1,
    pageSize: route.query.pageSize || 10,
    keyword: route.query.keyword?.toString() || "",
    fieldName: route.query.fieldName || class_position_options.value[0].value,
    totalCount: 0,
    statusFilter: false, //serve as a flag to check if pageParams is in url
});

const student_data = ref<ClassStudent[]>([]);

const getClassData = async () => {
    try {
        if (!classId.value) router.push({ name: "404" });

        let result = await ApiClass.GetById(classId.value.toString());
        if (!result.data.success) router.push({ name: "404" });

        classData.value = result.data.data;
    } catch (error) {
        console.log("ERROR: GETBYID class: " + error);
    }
};

const getData = async () => {
    try {
        let result = await ApiClass.GetAllStudentByLimit(
            classId.value.toString(),
            pageParams as ClassStudentPageParams,
        );
        if (result.data.success) {
            let resultData = result.data.data;
            student_data.value = resultData.items;
            pageParams.pageNumber = resultData.pageNumber;
            pageParams.pageSize = resultData.pageSize;
            pageParams.totalCount = resultData.totalCount;

            if (pageParams.statusFilter) {
                //check if filter is active
                if (pageParams.pageNumber > resultData.totalPages && pageParams.totalCount > 0) {
                    pageParams.pageNumber = 1;

                    router.push({
                        name: "User_Class_Student",
                        params: {
                            id: classId.value,
                        },
                        query: {
                            pageNumber: 1,
                            pageSize: pageParams.pageSize,
                            keyword: pageParams.keyword,
                            fieldName: pageParams.fieldName,
                        },
                    });
                } else {
                    router.push({
                        name: "User_Class_Student",
                        params: {
                            id: classId.value,
                        },
                        query: {
                            pageNumber: pageParams.pageNumber,
                            pageSize: pageParams.pageSize,
                            keyword: pageParams.keyword,
                            fieldName: pageParams.fieldName,
                        },
                    });
                }
                pageParams.statusFilter = !pageParams.statusFilter; //toggle filter status
            }
        }
    } catch (error) {
        console.log("ERROR: GETALLEXAMBYLIMIT class exam: " + error);
    }
};
//update when page change (url)
onUpdated(() => {
    if (Object.keys(route.query).length === 0) {
        pageParams.pageNumber = route.query.pageNumber || 1;
        pageParams.pageSize = route.query.pageSize || 10;
        pageParams.keyword = route.query.keyword?.toString() || "";
        pageParams.fieldName = route.query.fieldName || class_position_options.value[0].value;
        pageParams.statusFilter = true;

        getData();
    }
});

//change when page change (pageParams)
const onPaginationChange = (page: any, pageSize: any) => {
    pageParams.pageNumber = page;
    pageParams.pageSize = pageSize;
    pageParams.statusFilter = true;
    getData();
};

type MyColumn = TableColumnType<ClassStudent>;

const columns: MyColumn[] = [
    {
        title: "No",
        key: "no",
        customRender: (info: { index: number }) => info.index + 1,
    },
    {
        title: "FullName",
        dataIndex: "fullName",
        key: "fullName",
        sorter: (a: any, b: any) => a.fullName.localeCompare(b.fullName),
    },
    {
        title: "Email",
        dataIndex: "email",
        key: "email",
        sorter: (a: any, b: any) => a.email.localeCompare(b.email),
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

const optionDays = [1, 3, 5, 7, 30];

const code_limit_time = computed(() =>
    optionDays.map((key) => ({
        label: key + (key === 1 ? " day" : " days"),
        value: key,
    })),
);

const modal_invitation_open = ref(false);
const invitationFormState = reactive({
    classId: classId.value,
    code: "e3m3TR41fk+t",
    expiredTime: code_limit_time.value[0].value,
});

const isInvitaionLoading = ref(false);

const onOpenInvitationModal = () => {
    modal_invitation_open.value = true;
    //call api get current code
};

const onResetInvitation = () => {};

onMounted(async () => {
    const sidebarActiveItem = "class";
    emit("updateSidebar", sidebarActiveItem);

    await getClassData();
    await getData();
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
                            <span> {{ classData.name }} </span>
                            <span class="breadcrumb-item-topic"> {{ classData.topic }} </span>
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
                    <a-button
                        class="main-color-btn"
                        type="primary"
                        size="large"
                        @click="onOpenInvitationModal"
                    >
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
                            <RouterLink class="navigator-item" :to="{ name: 'User_Class_Quiz' }">
                                Quiz
                            </RouterLink>
                            <RouterLink class="navigator-item navigator-active" :to="{ name: '' }">
                                Student
                            </RouterLink>
                        </div>
                    </div>
                    <a-select
                        v-model:value="pageParams.fieldName"
                        style="width: 200px"
                        @change="getData"
                    >
                        <a-select-option
                            v-for="option in class_position_options"
                            :value="option.value"
                        >
                            {{ option.label }}
                        </a-select-option>
                    </a-select>
                    <div style="width: 300px; padding: 0px">
                        <Input
                            @input="getData"
                            v-model="pageParams.keyword"
                            :placeholder="t('question_sets_index.search_placeholder')"
                        >
                            <template #icon>
                                <i class="bx bx-search"></i>
                            </template>
                        </Input>
                    </div>
                </div>
                <a-table
                    :columns="columns"
                    :data-source="student_data"
                    row-key="studentId"
                    :pagination="false"
                >
                    <template #bodyCell="{ column, record }">
                        <template v-if="column.key === 'fullName'">
                            <div class="student-name-container">
                                <img class="student-image" :src="record.image" alt="" />
                                <div class="student-name">{{ record.fullName }}</div>
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
                                                Assign lecturer
                                            </a-menu-item>
                                            <a-menu-item key="2">
                                                <i class="bx bx-history"></i>
                                                History test
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
                <div class="pagination-container">
                    <a-pagination
                        @change="onPaginationChange"
                        v-model:current="pageParams.pageNumber"
                        :total="pageParams.totalCount"
                        :pageSize="pageParams.pageSize"
                        :show-total="
                            (total: any, range: any) => `${range[0]}-${range[1]} of ${total} items`
                        "
                        show-size-changer
                        show-quick-jumper
                        class="crud-layout-pagination"
                    ></a-pagination>
                </div>
            </div>
            <div class="mt-4 content-item">
                <div class="content-item-title">
                    <div>
                        <span class="text-danger">Danger Zone</span>
                        <span>Irreversible actions for your class</span>
                    </div>
                </div>
                <div class="danger-zone mt-3 p-4">
                    <div class="text-danger fs-6 fw-bold">Delete class</div>
                    <div class="text-secondary">
                        Once you delete your class, there is no going back. All your data will be
                        permanently removed
                    </div>
                    <a-button class="mt-3" type="primary" danger size="large">
                        Delete account
                    </a-button>
                </div>
            </div>
        </div>
    </div>
    <!-- invitation modal -->
    <a-modal
        width="750px"
        centered
        wrap-class-name="medium-modal"
        :open="modal_invitation_open"
        @cancel="modal_invitation_open = false"
    >
        <div class="modal-container">
            <div class="modal-title-container">
                <a-row class="w-100 d-flex align-items-center">
                    <a-col :span="2">
                        <RouterLink @click="modal_invitation_open = false" :to="{ name: '' }">
                            <i class="bx bx-chevron-left navigator-back-button"></i>
                        </RouterLink>
                    </a-col>
                    <a-col class="main-title" :span="22">
                        <span>Invite members</span> <br />
                        <span>Share link, QR code or invitation code to invite them.</span>
                    </a-col>
                </a-row>
            </div>
            <div class="modal-invitation-body">
                <a-qrcode :value="invitationFormState.code" class="invitation-body-qrcode" />
                <a-form layout="vertical" class="invitation-body-link">
                    <a-form-item label="Class code">
                        <div class="invitation-code-container">
                            <Input
                                v-model="invitationFormState.code"
                                :is-required="true"
                                :max-length="100"
                                :readonly="true"
                            ></Input>
                            <i class="bx bx-copy"></i>
                        </div>
                    </a-form-item>
                    <a-form-item label="Invitation link">
                        <div class="invitation-code-container">
                            <Input
                                v-model="invitationFormState.code"
                                :is-required="true"
                                :max-length="100"
                                :readonly="true"
                            ></Input>
                            <i class="bx bx-copy"></i>
                        </div>
                    </a-form-item>
                </a-form>
            </div>
            <a-divider>OR</a-divider>
        </div>
        <template #footer>
            <a-form layout="vertical" class="w-100 d-flex align-items-end justify-content-between">
                <a-form-item label="Time limit">
                    <a-select
                        v-model:value="invitationFormState.expiredTime"
                        style="width: 200px"
                        @change="getData"
                    >
                        <a-select-option v-for="option in code_limit_time" :value="option.value">
                            {{ option.label }}
                        </a-select-option>
                    </a-select>
                </a-form-item>
                <a-form-item>
                    <a-button
                        :loading="isInvitaionLoading"
                        class="main-color-btn"
                        key="submit"
                        type="primary"
                        @click="onResetInvitation"
                    >
                        Reset code
                    </a-button>
                </a-form-item>
            </a-form>
        </template>
    </a-modal>
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

.danger-zone {
    background-color: #ef44441a;
    border-radius: 8px;
}

.pagination-container {
    margin-top: 20px;
}

.invitation-code-container {
    display: flex;
    align-items: center;
}

.invitation-code-container i {
    color: var(--text-color);
    font-size: 18px;
    margin-left: 10px;
    padding: 8px;
    background-color: var(--form-item-background-color);
    border: 1px solid var(--form-item-border-color);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
}

.invitation-code-container i:hover {
    background-color: var(--main-color);
    border-color: var(--main-color);
}

.modal-invitation-body {
    display: flex;
    align-items: center;
    margin-top: 20px;
}

.invitation-body-link {
    flex: 1;
    margin-left: 20px;
}
::v-deep(.ant-qrcode) {
    background-color: #fff !important;
}

::v-deep(.ant-divider::before),
::v-deep(.ant-divider::after) {
    background-color: var(--text-color);
}

::v-deep(.ant-divider-inner-text) {
    color: var(--text-color);
}
</style>
