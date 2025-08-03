<script setup lang="ts">
import { ref, onMounted, computed, reactive, nextTick, watch } from "vue";
import { useI18n } from "vue-i18n";
import Input from "@/shared/components/Common/Input.vue";
import ApiAdmin from "../../../../src/api/ApiAdmin";
import type ManageAccountsParams from "../../../../src/models/request/admin/manageAccountsParams";
import type ManageAccountsResp from "../../../../src/models/response/admin/manageAccountsResp";
import debounce from "lodash/debounce";
import { Modal } from "ant-design-vue";

const emit = defineEmits(["updateSidebar"]);

const { t } = useI18n();

// select box for account status
const optionKeysAccStatus = ["all", "active", "ban"];
const account_status_credit_options = computed(() =>
    optionKeysAccStatus.map((key) => ({
        label: t(`admin.manage_acc.acc_status.${key}`),
        value: key,
    })),
);
const selected_acc_status_option = ref(account_status_credit_options.value[0].value);

// select box for user role
const optionKeysAccRole = ["all", "Administrator", "Moderator", "User"];
const account_role_credit_options = computed(() =>
    optionKeysAccRole.map((key) => ({
        label: t(`admin.manage_acc.acc_role.${key}`),
        value: key,
    })),
);
const selected_acc_role_option = ref(account_role_credit_options.value[0].value);

const searchValue = ref("");

const onFilter = async () => {
    console.log({
        search: searchValue.value,
        status: selected_acc_status_option.value,
        role: selected_acc_role_option.value,
    });

    payloadGetUsers.keyword = searchValue.value;
    if (selected_acc_status_option.value === "all") {
        delete payloadGetUsers.IsBanned;
    } else {
        payloadGetUsers.IsBanned = selected_acc_status_option.value === "ban";
    }
    payloadGetUsers.role =
        selected_acc_role_option.value === "all" ? "" : selected_acc_role_option.value;
    getUsersData();
};

watch(
    searchValue,
    debounce((Val) => {
        onFilter();
    }, 300),
);

const columns = [
    {
        title: "ID",
        dataIndex: "id",
        customRender: ({ index }: { index: number }) => index + 1,
        width: 50,
        align: "center",
    },
    {
        title: "Fullname",
        dataIndex: "fullName",
        key: "fullName",
        sorter: (a: { fullName: string }, b: { fullName: string }) =>
            a.fullName.localeCompare(b.fullName),
        width: 350,
        align: "center",
    },
    {
        title: "Email",
        dataIndex: "email",
        key: "email",
        sorter: (a: { email: string }, b: { email: string }) => a.email.localeCompare(b.email),
        width: 450,
        align: "center",
    },
    {
        title: "Token",
        dataIndex: "token",
        key: "token",
        sorter: (a: { token: number }, b: { token: number }) => a.token - b.token,
        width: 100,
        align: "center",
    },
    {
        title: "Role",
        dataIndex: "role",
        key: "role",
        sorter: (a: { role: string }, b: { role: string }) => a.role.localeCompare(b.role),
        defaultSortOrder: "ascend",
        width: 100,
        align: "center",
    },
    { title: "Ban", key: "ban", width: 120, align: "center" },
];

onMounted(() => {
    const sidebarActiveItem = "account";
    emit("updateSidebar", sidebarActiveItem);
    getUsersData();
});

// data cho bảng để hiển thị
const dataSource = ref<ManageAccountsResp[]>([]);

async function onToggle(record: ManageAccountsResp) {
    // console.log("Toggle active:", record.isBanned);
    // console.log("Toggle active:", record.id);
    try {
        if (!record.isBanned) {
            Modal.confirm({
                title: "Confirm Active User",
                content: "Are you sure you want to activate this user?",
                centered: true,
                onOk: async () => {
                    await ApiAdmin.ActiveUser(record.id);
                    await getUsersData();
                },
                onCancel: async () => {
                    await getUsersData();
                },
            });
        } else {
            Modal.confirm({
                title: "Confirm Ban User",
                content: "Are you sure you want to ban this user?",
                centered: true,
                onOk: async () => {
                    await ApiAdmin.BanUser(record.id);
                    await getUsersData();
                },
                onCancel: async () => {
                    await getUsersData();
                },
            });
        }
    } catch (error) {
        console.error("Toggle active ERROR:", error);
    }
}

async function onPromoteToModerator(record: ManageAccountsResp) {
    try {
        console.log("Promote uid: ", record.id);
        Modal.confirm({
            title: "Promote User to Moderator",
            content: "Are you sure you want to promote this user to Moderator?",
            centered: true,
            onOk: async () => {
                await ApiAdmin.AssignRole(record.id, { role: "Moderator" });
                await getUsersData();
            },
            onCancel: async () => {
                await getUsersData();
            },
        });
    } catch (error) {
        console.error("Promote to Moderator:", error);
    }
}

async function onDemoteToUser(record: ManageAccountsResp) {
    try {
        console.log("Demote uid: ", record.id);
        Modal.confirm({
            title: "Demote Moderator to User",
            content: "Are you sure you want to demote this moderator to User?",
            centered: true,
            onOk: async () => {
                await ApiAdmin.AssignRole(record.id, { role: "User" });
                await getUsersData();
            },
            onCancel: async () => {
                await getUsersData();
            },
        });
    } catch (error) {
        console.error("Toggle active ERROR:", error);
    }
}

const payloadGetUsers = reactive<ManageAccountsParams>({
    fieldName: "Email",
    keyword: "",
    pageNumber: 1,
    pageSize: 15,
});

const getUsersData = async () => {
    try {
        let result = await ApiAdmin.GetAllUser(payloadGetUsers);
        if (result.data.success) {
            dataSource.value = result.data.data.items;
        }
    } catch (error) {
        console.log("ERROR: GETALLBYLIMIT testtemplate: " + error);
    }
};
</script>

<template>
    <div class="page-container">
        <!-- header title -->
        <div class="title-container">
            <a-row class="w-100">
                <a-col class="main-title" :span="20">
                    <span>{{ t(`admin.manage_acc.title`) }}</span>
                </a-col>
            </a-row>
        </div>

        <div class="content">
            <!-- filter area -->
            <div class="filter-input-item">
                <!-- filter text input  -->
                <div class="filter-input-full">
                    <Input
                        class="custom-input"
                        v-model:value="searchValue"
                        :placeholder="t('admin.manage_acc.search_placeholder')"
                    >
                        <template #icon>
                            <i class="bx bx-search"></i>
                        </template>
                    </Input>
                </div>

                <!-- filter account status -->
                <a-select
                    style="width: calc(19%)"
                    v-model:value="selected_acc_status_option"
                    @change="onFilter"
                >
                    <a-select-option
                        v-for="option in account_status_credit_options"
                        :key="option.value"
                        :value="option.value"
                    >
                        {{ option.label }}
                    </a-select-option>
                </a-select>

                <!-- filter account role -->
                <a-select
                    style="width: calc(19%)"
                    v-model:value="selected_acc_role_option"
                    @change="onFilter"
                >
                    <a-select-option
                        v-for="option in account_role_credit_options"
                        :key="option.value"
                        :value="option.value"
                    >
                        {{ option.label }}
                    </a-select-option>
                </a-select>
            </div>

            <!-- table list account -->
            <div class="account-table">
                <a-table :data-source="dataSource" :columns="columns" row-key="id">
                    <template #bodyCell="{ column, record }">
                        <template v-if="column.key === 'ban'">
                            <div class="action-cell">
                                <!-- icon assign moderator -->
                                <i
                                    v-if="record.role === 'Moderator'"
                                    class="bx bx-id-card"
                                    title="Demote moderator to User"
                                    style="color: #ff002e; font-size: 25px"
                                    @click="onDemoteToUser(record)"
                                ></i>

                                <!-- icon assign user -->
                                <i
                                    v-if="record.role === 'User'"
                                    class="bx bx-id-card"
                                    title="Promote user to Moderator"
                                    style="color: #fff; font-size: 25px"
                                    @click="onPromoteToModerator(record)"
                                ></i>

                                <!-- button ban.active user -->
                                <a-switch
                                    v-if="record.role !== 'Administrator'"
                                    v-model:checked="record.isBanned"
                                    title="Ban/Active"
                                    :checked-children="''"
                                    :un-checked-children="''"
                                    @change="onToggle(record)"
                                />
                            </div>
                        </template>
                    </template>
                </a-table>
                <!-- <div class="pagination-container">
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
                </div> -->
            </div>
        </div>
    </div>
</template>

<style scoped>
.filter-input-item {
    width: calc(100% - 60px);
    margin: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
}
.filter-input-full {
    width: 100%;
}
.custom-input {
    width: 100%;
    background-color: var(--content-item-background-color);
    border: 1px solid var(--content-item-border-color);
    color: var(--text-color);
    border-radius: 8px;
    color: var(--text-color);
}
.account-table {
    width: calc(100% - 60px);
    margin: 8px;
}
.action-cell {
    display: flex;
    justify-content: center;
    align-content: center;
}
.account-table :deep(.ant-table) {
    background-color: var(--content-item-background-color);
    border-radius: 8px;
    overflow: hidden;
}

.account-table :deep(.ant-table-thead > tr > th) {
    background-color: var(--border-color);
    color: var(--text-color);
    font-weight: 600;
    padding: 12px 16px;
}

::v-deep(.ant-empty-description) {
    color: var(--text-color) !important;
}
</style>
