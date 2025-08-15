<script setup lang="ts">
import ApiClass from "@/api/ApiClass";

import { ref, onMounted, reactive, computed, onUpdated, h, watch } from "vue";
import { useI18n } from "vue-i18n";
import Input from "@/shared/components/Common/Input.vue";

import { message, Modal, type TableColumnType } from "ant-design-vue";
import type { Class } from "@/models/response/class/class";
import type { ClassStudent } from "@/models/response/class/classStudent";
import CLASS_STUDENT_SELECT_FIELD from "@/constants/classSelectFieldName";
import CLASS_STUDENT_POSITION from "@/constants/classStudentPosition";

import { useRoute, useRouter } from "vue-router";
import type ClassStudentPageParams from "@/models/request/class/classStudentPageParams";
import Validator from "@/services/Validator";

const route = useRoute();
const router = useRouter();

const { t } = useI18n();
const emit = defineEmits(["updateSidebar"]);

//#region init data

const optionKeys = Object.values(CLASS_STUDENT_SELECT_FIELD);

const class_position_options = computed(() =>
    optionKeys.map((key) => ({
        label: t(`class_member.select_option.${key}`),
        value: key,
    })),
);

const classId = ref(route.params.id || "");
const classData = ref<Class>({
    classId: "",
    name: "",
    topic: "",
});
const loading = ref(false);

type MyColumn = TableColumnType<ClassStudent>;

const columns: MyColumn[] = [
    {
        title: "No",
        key: "no",
        customRender: (info: { index: number }) => info.index + 1,
    },
    {
        title: t("class_member.column.fullName"),
        dataIndex: "fullName",
        key: "fullName",
        sorter: (a: any, b: any) => a.fullName.localeCompare(b.fullName),
    },
    {
        title: t("class_member.column.email"),
        dataIndex: "email",
        key: "email",
        sorter: (a: any, b: any) => a.email.localeCompare(b.email),
    },
    {
        title: t("class_member.column.position"),
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
        label:
            key +
            (key === 1 ? t("class_member.other.day_singular") : t("class_member.other.day_plural")),
        value: key,
    })),
);

const getClassData = async () => {
    try {
        if (!Validator.isValidGuid(classId.value.toString())) {
            router.push({ name: "404" });
            return;
        }
        if (!classId.value) router.push({ name: "404" });

        let result = await ApiClass.GetById(classId.value.toString());
        if (!result.data.success) router.push({ name: "404" });

        classData.value = result.data.data;
    } catch (error) {
        console.log("ERROR: GETBYID class: " + error);
    }
};
const userRoleInClass = ref<string>("");
const getPermission = async () => {
    try {
        const result = await ApiClass.GetUserPermission(classData.value.classId);
        if (result.data.success) {
            userRoleInClass.value = result.data.data;
        }
    } catch (error) {
        console.log(error);
    }
};

//#endregion

//#region student pagination

const pageParams = reactive({
    pageNumber: route.query.pageNumber || 1,
    pageSize: route.query.pageSize || 10,
    keyword: route.query.keyword?.toString() || "",
    fieldName: route.query.fieldName || class_position_options.value[0].value,
    totalCount: 0,
    statusFilter: false, //serve as a flag to check if pageParams is in url
});

const student_data = ref<ClassStudent[]>([]);

const getData = async () => {
    try {
        loading.value = true;
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
    } finally {
        loading.value = false;
    }
};
//update when page change (url)
// onUpdated(() => {
//     if (Object.keys(route.query).length === 0) {
//         pageParams.pageNumber = route.query.pageNumber || 1;
//         pageParams.pageSize = route.query.pageSize || 10;
//         pageParams.keyword = route.query.keyword?.toString() || "";
//         pageParams.fieldName = route.query.fieldName || class_position_options.value[0].value;
//         pageParams.statusFilter = true;

//         getData();
//     }
// });

watch(
    () => Object.keys(route.query).length,
    () => {
        pageParams.pageNumber = route.query.pageNumber || 1;
        pageParams.pageSize = route.query.pageSize || 10;
        pageParams.keyword = route.query.keyword?.toString() || "";
        pageParams.fieldName = route.query.fieldName || class_position_options.value[0].value;
        pageParams.statusFilter = true;

        getData();
    },
);

//change when page change (pageParams)
const onPaginationChange = (page: any, pageSize: any) => {
    pageParams.pageNumber = page;
    pageParams.pageSize = pageSize;
    pageParams.statusFilter = true;
    getData();
};

//#endregion

//#region inivation
const modal_invitation_open = ref(false);
const invitationFormState = reactive({
    classId: classId.value,
    code: "",
    expiredTime: code_limit_time.value[0].value,
});
const inivitationLink = ref("");
const isInvitaionLoading = ref(false);
const onOpenInvitationModal = async () => {
    //call api get current code
    await getInvitationCode();
    modal_invitation_open.value = true;
};

const getInvitationCode = async () => {
    const result = await ApiClass.GetInivationCode(classId.value.toString());
    if (result.data.data) {
        invitationFormState.code = result.data.data;
        inivitationLink.value =
            window.location.origin + `/user/class/invitation/${invitationFormState.code}`;
    }
};

const onResetInvitation = async () => {
    const result = await ApiClass.CreateNewInvitation(invitationFormState);
    if (result.data.success) {
        message.success(t("message.created_new_invitation"));
        onOpenInvitationModal();
    } else {
        message.error(t("message.created_failed"));
    }
};

const onCopyInvitationCode = (mode: string) => {
    if (!invitationFormState.code) return;
    let content = invitationFormState.code;

    if (mode === "link") {
        content = inivitationLink.value;
    }
    navigator.clipboard
        .writeText(content)
        .then(() => {
            message.success(t("message.copied"));
        })
        .catch(() => {
            message.error(t("message.copied_failed"));
        });
};

//#endregion

/* delete class member */
const onConfirmDeleteMember = (userId: string) => {
    Modal.confirm({
        title: t("class_member.modal.delete_member_title"),
        content: t("class_member.modal.delete_member_content"),
        centered: true,
        okText: t("sidebar.buttons.ok"),
        cancelText: t("sidebar.buttons.cancel"),
        onOk: async () => {
            let result = await ApiClass.DeleteClassMember(
                classId.value.toString(),
                userId.toString(),
            );
            if (!result.data.success) {
                message.error(t("message.removed_failed"));
                return;
            }
            message.success(t("message.removed_successfully"));
            await getData();
        },
    });
};

const onConfirmUpdateMemberPosition = (userId: string, position: string) => {
    Modal.confirm({
        title: t("class_member.modal.update_member_title"),
        content: t("class_member.modal.update_member_content"),

        centered: true,
        okText: t("sidebar.buttons.ok"),
        cancelText: t("sidebar.buttons.cancel"),
        onOk: async () => {
            let result = await ApiClass.UpdateClassMemberPosition(
                classId.value.toString(),
                userId.toString(),
                position,
            );
            if (!result.data.success) {
                message.error(t("message.updated_failed"));
                return;
            }
            message.success(t("message.updated_successfully"));
            await getData();
        },
    });
};

/* delete class */
const onOpenConfirmDeleteClass = () => {
    Modal.confirm({
        title: t("class_member.danger_zone.warning"),
        content: h("div", { style: "color: red" }, t("class_member.danger_zone.warning_explain")),
        centered: true,
        okText: t("sidebar.buttons.ok"),
        cancelText: t("sidebar.buttons.cancel"),
        onOk: async () => {
            let result = await ApiClass.Delete(classId.value.toString());
            if (!result.data.success) {
                message.error(t("message.deleted_failed"));
                return;
            }
            message.success(t("message.deleted_successfully"));
            router.push({ name: "User_Class" });
        },
    });
};

onMounted(async () => {
    const sidebarActiveItem = "class";
    emit("updateSidebar", sidebarActiveItem);

    await getClassData();
    await getPermission();
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
                            <span>{{ $t("class_index.title") }}</span> <br />
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
                        <span>{{ $t("class_member.title") }}</span>
                        <span>{{ $t("class_member.sub_title") }}</span>
                    </div>
                    <a-button
                        v-if="userRoleInClass !== CLASS_STUDENT_POSITION.STUDENT"
                        class="main-color-btn"
                        type="primary"
                        size="large"
                        @click="onOpenInvitationModal"
                    >
                        <i class="me-2 bx bx-user-plus"></i>
                        {{ $t("class_member.buttons.invite_member") }}
                    </a-button>
                </div>
                <div class="content-item-functions">
                    <div class="content-item-navigators">
                        <div class="navigator-container">
                            <RouterLink class="navigator-item" :to="{ name: 'User_Class_Exam' }">
                                {{ $t("class_index.navigators.exam") }}
                            </RouterLink>
                            <RouterLink class="navigator-item" :to="{ name: 'User_Class_Quiz' }">
                                {{ $t("class_index.navigators.quiz") }}
                            </RouterLink>
                            <RouterLink class="navigator-item navigator-active" :to="{ name: '' }">
                                {{ $t("class_index.navigators.member") }}
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
                            :placeholder="t('class_member.other.search_placeholder')"
                        >
                            <template #icon>
                                <i class="bx bx-search"></i>
                            </template>
                        </Input>
                    </div>
                </div>
                <template v-if="loading">
                    <a-skeleton :loading="loading"></a-skeleton>
                    <a-skeleton :loading="loading"></a-skeleton>
                    <a-skeleton :loading="loading"></a-skeleton>
                </template>
                <template v-else>
                    <a-table
                        v-if="student_data.length > 0"
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
                            <template v-if="column.key === 'position'">
                                {{ $t(`class_member.position.${record.position}`) }}
                            </template>
                            <template v-if="column.key === 'action'">
                                <div
                                    v-if="userRoleInClass === CLASS_STUDENT_POSITION.OWNER"
                                    class="student-action"
                                >
                                    <a-tooltip
                                        v-if="record.position === CLASS_STUDENT_POSITION.STUDENT"
                                    >
                                        <template #title>
                                            {{ $t("class_member.buttons.assign_lecturer") }}
                                        </template>
                                        <i
                                            style="cursor: pointer"
                                            class="bx bxs-id-card"
                                            @click="
                                                onConfirmUpdateMemberPosition(
                                                    record.studentId,
                                                    CLASS_STUDENT_POSITION.TEACHER,
                                                )
                                            "
                                        ></i>
                                    </a-tooltip>
                                    <a-tooltip v-else>
                                        <template #title>
                                            {{ $t("class_member.buttons.remove_lecturer") }}
                                        </template>
                                        <i
                                            class="text-danger bx bxs-id-card"
                                            @click="
                                                onConfirmUpdateMemberPosition(
                                                    record.studentId,
                                                    CLASS_STUDENT_POSITION.STUDENT,
                                                )
                                            "
                                        ></i>
                                    </a-tooltip>
                                    <a-tooltip>
                                        <template #title>
                                            {{ $t("question_sets_index.buttons.delete") }}
                                        </template>
                                        <i
                                            class="text-danger bx bx-trash-alt"
                                            @click="onConfirmDeleteMember(record.studentId)"
                                        ></i>
                                    </a-tooltip>
                                </div>
                            </template>
                        </template>
                    </a-table>
                    <template v-else>
                        <div class="w-100 d-flex justify-content-center">
                            <a-empty>
                                <template #description>
                                    <span> {{ $t("class_index.other.no_data_matches") }}</span>
                                </template>
                            </a-empty>
                        </div>
                    </template>
                </template>
                <div class="pagination-container">
                    <a-pagination
                        @change="onPaginationChange"
                        v-model:current="pageParams.pageNumber"
                        :total="pageParams.totalCount"
                        :pageSize="pageParams.pageSize"
                        :show-total="
                            (total: any, range: any) =>
                                `${range[0]}-${range[1]} of ${total} ${t('class_member.other.items')}`
                        "
                        show-size-changer
                        show-quick-jumper
                        class="crud-layout-pagination"
                        :locale="{
                            items_per_page: t('class_index.other.pages'),
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
                    <div class="text-danger fs-6 fw-bold">
                        {{ $t("class_member.danger_zone.warning") }}
                    </div>
                    <div class="text-secondary">
                        {{ $t("class_member.danger_zone.warning_explain") }}
                    </div>
                    <a-button
                        class="mt-3"
                        type="primary"
                        danger
                        size="large"
                        @click="onOpenConfirmDeleteClass"
                    >
                        {{ $t("class_member.buttons.delete_class") }}
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
                        <span>{{ $t("class_member.modal.title") }}</span> <br />
                        <span>{{ $t("class_member.modal.sub_title") }}</span>
                    </a-col>
                </a-row>
            </div>
            <div class="modal-invitation-body">
                <a-qrcode :value="invitationFormState.code" class="invitation-body-qrcode" />
                <a-form layout="vertical" class="invitation-body-link">
                    <a-form-item :label="t('class_member.modal.class_code_label')">
                        <div class="invitation-code-container">
                            <Input
                                v-model="invitationFormState.code"
                                :is-required="true"
                                :max-length="100"
                                :readonly="true"
                            ></Input>
                            <i class="bx bx-copy" @click="onCopyInvitationCode('code')"></i>
                        </div>
                    </a-form-item>
                    <a-form-item :label="t('class_member.modal.invitation_link')">
                        <div class="invitation-code-container">
                            <Input
                                v-model="inivitationLink"
                                :is-required="true"
                                :max-length="100"
                                :readonly="true"
                            ></Input>
                            <i class="bx bx-copy" @click="onCopyInvitationCode('link')"></i>
                        </div>
                    </a-form-item>
                </a-form>
            </div>
            <a-divider>{{ $t("class_member.modal.or") }}</a-divider>
        </div>
        <template #footer>
            <a-form layout="vertical" class="w-100 d-flex align-items-end justify-content-between">
                <a-form-item :label="t('class_member.modal.time_limit_label')">
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
                        {{ $t("class_member.buttons.reset_code") }}
                    </a-button>
                </a-form-item>
            </a-form>
        </template>
    </a-modal>
</template>
<style scoped>
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

::v-deep(.ant-empty-description) {
    color: var(--text-color) !important;
}

.student-action i {
    font-size: 20px;
    margin: 0px 10px;
    cursor: pointer;
}
</style>
