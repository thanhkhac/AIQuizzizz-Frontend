<script setup lang="ts">
import { ref, computed, onMounted, watch, reactive } from "vue";
import { useI18n } from "vue-i18n";
import Input from "../components/Common/Input.vue";

import VISIBILITY from "@/constants/visibility";
import PERMISSION from "@/constants/permissions";
import { message } from "ant-design-vue";

const { t } = useI18n();

const visibility = ref(false);

const openModal = () => {
    visibility.value = true;
};

const closeModal = () => {
    visibility.value = false;
};

defineExpose({
    openModal,
});

/* visibility-select */
const visibilityKeys = [VISIBILITY.PUBLIC, VISIBILITY.PRIVATE, VISIBILITY.IN_CLASS];
const visibility_options = computed(() =>
    visibilityKeys.map((key) => ({
        label: t(`share_modal.visibility.${key}.mode`),
        value: key,
    })),
);
const selected_visibility_option = ref(visibility_options.value[0].value);
const selected_visibility_explain = ref("");

watch(
    () => selected_visibility_option.value,
    (visibility) => {
        selected_visibility_explain.value = t(`share_modal.visibility.${visibility}.explain`);
    },
);

/* permission-select */
const permissionKeys = [PERMISSION.VIEW, PERMISSION.EDIT];
const permission_options = computed(() =>
    permissionKeys.map((key) => ({
        label: t(`share_modal.permission.${key}.mode`),
        value: key,
    })),
);
const selected_permission_option = ref(permission_options.value[0].value);

/* email sample for searching */
const user_sample = [
    { id: "1", email: "ducnthe173064@fpt.edu.vn", hasAccess: true },
    { id: "2", email: "ducnthe173064@fpt.edu.vn", hasAccess: true },
    { id: "4", email: "ducnguyen@gmail.com", hasAccess: true },
    { id: "5", email: "ducnguyen@gmail.com", hasAccess: true },
    { id: "6", email: "ducntan1234@gmail.com", hasAccess: false },
    { id: "7", email: "ducntan1234@gmail.com", hasAccess: false },
    { id: "8", email: "qwert@gmail.com", hasAccess: false },
    { id: "9", email: "qwert@gmail.com", hasAccess: false },
    { id: "10", email: "asdfg@gmail.com", hasAccess: false },
    { id: "11", email: "asdfg@gmail.com", hasAccess: false },
];

/* user sample for quiz permission */
const user_permission_sample = [
    {
        id: "1",
        fullName: "NguyenTanDuc",
        email: "ducnthe173064@fpt.edu.vn",
        permission: PERMISSION.EDIT,
    },
    {
        id: "2",
        fullName: "NguyenDuc",
        email: "ducnguyen@gmail.com",
        permission: PERMISSION.VIEW,
    },
];

/* class sample for InClass mode */
const user_class_sample = ref([
    {
        id: "1",
        name: "SEP490 - Summer 2025",
    },
    {
        id: "2",
        name: "MLN111 - Spring 2025",
    },
    {
        id: "3",
        name: "MLN121 - Spring 2025",
    },
]);

interface UserPermission {
    id: string;
    email: string;
    permission: string;
}
interface SearchUserWithEmail {
    id: string;
    email: string;
    hasAccess: boolean;
}

/**
 * Search user
 **/
const searchUserEmailValue = ref("");

/* use this for result */
const userFound = ref<SearchUserWithEmail[]>([]);

/* use this for temporary when mouse leave */
const lastSearchResult = ref<SearchUserWithEmail[]>([]);

/* use this for tracking whether mouse is in search components */
const searchUserResultRef = ref<HTMLElement | null>(null);

function handleMouseClickOutside(event: MouseEvent) {
    if (searchUserEmailValue.value && !searchUserResultRef.value?.contains(event.target as Node)) {
        userFound.value = [];
    } else {
        userFound.value = [...lastSearchResult.value];
    }
}

const onSearchUser = () => {
    if (!searchUserEmailValue.value.trim()) {
        userFound.value = [];
        lastSearchResult.value = [];
        return;
    }

    let result = user_sample.filter((x) =>
        x.email.includes(searchUserEmailValue.value.trim()),
    ) as SearchUserWithEmail[];

    userFound.value = result;
    lastSearchResult.value = [...result];
};

/* use this for query and generate list of user when mode = private */
const userWithPermission = ref<UserPermission[]>([]);

const onShareWithResultUser = (user: SearchUserWithEmail) => {
    user_permission_sample.push({
        id: user.id,
        email: user.email,
        fullName: user.email,
        permission: PERMISSION.VIEW,
    });
    user.hasAccess = true;
    message.success("Added successfully");

    //call api insert qs-user
    //message result
    //re-fetch the people access list
};

//change people permission
const onChangePeoplePermission = (peopleId: string, permission: string) => {
    //call api update qs-user
    //message result
    //re-fetch the people access list
};

/* remove people access */

const onConfirmRemovePeopleAccess = (id: string) => {
    //call api disable qs-user
    //message result
    //re-fetch the people access list
};

/* use this for add quiz to list class mode = InClass */

const shareClassState = reactive({
    checkAll: false,
    indeterminate: false,
    checkedList: [] as string[],
});

//checkboxes  / checkbox-all for sharing quiz with class
const onCheckAll = (event: any) => {
    Object.assign(shareClassState, {
        checkedList: event.target.checked ? user_class_sample.value?.map((x) => x.id) : [],
        indeterminate: false,
    });
};

watch(
    () => shareClassState.checkedList,
    (val) => {
        shareClassState.indeterminate =
            !!val.length && val.length < user_class_sample.value!.map((x) => x.id).length; //change to queried when it done
        shareClassState.checkAll = val.length === user_class_sample.value?.length;
    },
);

const onShareClass = () => {
    //call api create class-qs
    //message result
    //close pop-up
    closeModal();
};

onMounted(() => {
    document.addEventListener("click", handleMouseClickOutside);
    userWithPermission.value.push(...(user_permission_sample as UserPermission[]));

    selected_visibility_explain.value = t(
        `share_modal.visibility.${selected_visibility_option.value}.explain`,
    );
});
</script>
<template>
    <a-modal
        centered
        width="100%"
        wrap-class-name="medium-modal"
        :open="visibility"
        @cancel="closeModal"
    >
        <div
            :class="[
                'page-container',
                selected_visibility_option === VISIBILITY.PRIVATE ? 'larger' : '',
            ]"
        >
            <div class="title-container">
                <a-row class="w-100 d-flex align-items-center justify-content-between">
                    <a-col :span="1">
                        <RouterLink :to="{ name: '' }" @click="closeModal">
                            <i class="bx bx-chevron-left navigator-back-button"></i>
                        </RouterLink>
                    </a-col>
                    <a-col class="main-title" :span="22">
                        <span>{{ $t("share_modal.title") }}</span> <br />
                        <span>{{ $t("share_modal.sub_title") }}</span>
                    </a-col>
                </a-row>
            </div>
            <a-form layout="vertical">
                <a-row class="p-3 d-flex justify-content-between">
                    <a-col :span="24">
                        <a-form-item :label="$t('share_modal.component_title.visibility')">
                            <a-select
                                class="me-3"
                                v-model:value="selected_visibility_option"
                                style="width: 200px"
                            >
                                <a-select-option
                                    v-for="option in visibility_options"
                                    :value="option.value"
                                >
                                    {{ option.label }}
                                </a-select-option>
                            </a-select>
                            <div class="visibility-explain">{{ selected_visibility_explain }}</div>
                        </a-form-item>
                    </a-col>
                    <a-col
                        :span="24"
                        :class="[
                            'shareable-link-container',
                            selected_visibility_option === VISIBILITY.PUBLIC ? '' : 'd-none',
                        ]"
                    >
                        <a-qrcode value="AIQuizziz.com.vn" />
                        <div>
                            <a-input
                                class="share-link"
                                value="http://localhost:5173/user/library/1/Introduction%20to%20Biology"
                            />
                            <a-button class="mt-2 main-color-btn" type="primary">
                                <i class="me-3 bx bx-link-alt"></i>
                                {{ $t("share_modal.buttons.copy_link") }}
                            </a-button>
                        </div>
                    </a-col>
                    <a-col
                        :span="24"
                        :class="[selected_visibility_option === VISIBILITY.PRIVATE ? '' : 'd-none']"
                    >
                        <div class="search-user" ref="searchUserResultRef">
                            <Input
                                @change="onSearchUser"
                                :label="t('share_modal.component_title.share_with_email')"
                                v-model:value="searchUserEmailValue"
                                :placeholder="t('share_modal.other.search_email_placeholder')"
                            >
                                <template #icon>
                                    <i class="bx bx-envelope"></i>
                                </template>
                            </Input>
                            <div
                                :class="[
                                    'search-user-container',
                                    userFound.length <= 0 ? 'd-none' : '',
                                ]"
                            >
                                <div class="search-user-result">
                                    <div class="search-user-item" v-for="user in userFound">
                                        <div class="user-item-email">{{ user.email }}</div>
                                        <div
                                            :class="[
                                                'user-item-access',
                                                user.hasAccess ? 'd-none' : '',
                                            ]"
                                        >
                                            <a-button
                                                type="primary"
                                                class="main-color-btn"
                                                @click="onShareWithResultUser(user)"
                                            >
                                                <i class="bx bxs-user-plus"></i>
                                            </a-button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="list-item-section">
                            <div class="list-item-title">
                                {{ $t("share_modal.component_title.people_with_access") }}
                            </div>
                            <div class="list-item-container">
                                <template v-for="people in user_permission_sample">
                                    <div class="list-item">
                                        <img class="people-access-img" src="" alt="" />
                                        <div class="people-access-info">
                                            <span>{{ people.fullName }}</span>
                                            <span>{{ people.email }}</span>
                                        </div>
                                        <div class="people-access-permission">
                                            <a-select
                                                @change="
                                                    onChangePeoplePermission(
                                                        people.id,
                                                        people.permission,
                                                    )
                                                "
                                                style="width: 130px"
                                                v-model:value="people.permission"
                                            >
                                                <a-select-option
                                                    v-for="option in permission_options"
                                                    :value="option.value"
                                                >
                                                    {{ option.label }}
                                                </a-select-option>
                                            </a-select>
                                            <a-popconfirm
                                                :title="$t('share_modal.other.delete_warning')"
                                                :ok-text="$t('share_modal.buttons.yes')"
                                                :cancel-text="$t('share_modal.buttons.no')"
                                                @confirm="onConfirmRemovePeopleAccess(people.id)"
                                            >
                                                <i class="ms-2 text-danger bx bx-trash"></i>
                                            </a-popconfirm>
                                        </div>
                                    </div>
                                </template>
                            </div>
                        </div>
                    </a-col>

                    <a-col
                        :span="24"
                        :class="[
                            selected_visibility_option === VISIBILITY.IN_CLASS ? '' : 'd-none',
                        ]"
                    >
                        <div class="list-item-section">
                            <div class="list-item-title d-flex align-items-center">
                                <div
                                    :class="[
                                        'w-25 header-item',
                                        shareClassState.checkAll ? 'check-all' : '',
                                    ]"
                                >
                                    <a-checkbox
                                        @click="onCheckAll"
                                        v-model:checked="shareClassState.checkAll"
                                        :indeterminate="shareClassState.indeterminate"
                                    >
                                        {{
                                            $t("share_modal.buttons.check_all", {
                                                number: shareClassState.checkedList.length,
                                            })
                                        }}
                                    </a-checkbox>
                                </div>
                                <span>
                                    {{ $t("share_modal.component_title.share_with_class") }}
                                </span>
                            </div>
                            <div>
                                <a-checkbox-group
                                    class="list-item-container"
                                    v-model:value="shareClassState.checkedList"
                                >
                                    <template v-for="item in user_class_sample">
                                        <div class="list-item">
                                            <a-checkbox :value="item.id">
                                                <span>{{ item.name }}</span>
                                            </a-checkbox>
                                        </div>
                                    </template>
                                </a-checkbox-group>
                            </div>
                            <div class="mt-3 d-flex justify-content-end">
                                <a-button
                                    type="primary"
                                    class="main-color-btn"
                                    size="large"
                                    @click="onShareClass"
                                >
                                    {{ $t("share_modal.buttons.done") }}
                                </a-button>
                            </div>
                        </div>
                    </a-col>
                </a-row>
            </a-form>
        </div>
        <template #footer></template>
    </a-modal>
</template>
<style scoped>
.page-container {
    margin-left: 0px;
    transition: all 0.3s ease-in-out;
}

.page-container.larger {
    height: 650px;
}

.page-container::-webkit-scrollbar {
    width: 0px;
}

::v-deep(.ant-form-item-label label) {
    color: var(--text-color);
    font-weight: 500;
}

.visibility-explain {
    margin-top: 5px;
    color: var(--text-color-grey);
}

.shareable-link-container {
    display: flex;
    justify-content: space-between;
    align-items: start;
}

::v-deep(.ant-qrcode) {
    background-color: #fff !important;
}

.share-link {
    width: 350px;
    max-height: 40px;
    padding: 5px 10px;
    background-color: var(--form-item-background-color);
    border: 1px solid var(--border-color);
    color: var(--text-color);
    border-radius: 5px;
}

.search-user-container {
    position: relative;
    color: var(--text-color);
}

.search-user-result {
    background-color: var(--form-item-background-color);
    border: 1px solid var(--form-item-border-color);
    position: absolute;
    top: 0px;
    z-index: 10;
    width: 100%;
    margin: 0px;
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;
    overflow-y: scroll;
    box-shadow: 1px 0px 10px 1px var(--border-color);
    height: 300px;
}

.search-user-result::-webkit-scrollbar {
    width: 0px;
}

.search-user-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: var(--text-color);
    padding: 10px;
    cursor: pointer;
}

.search-user-item:hover {
    background-color: var(--form-item-border-color);
}

.user-item-access {
    display: flex;
    align-items: center;
}

.user-item-access i {
    font-size: 26px;
}

.list-item-section {
    color: var(--text-color);
    margin-top: 15px;
}

.list-item-title {
    font-size: 20px;
    font-weight: 500;
}

.list-item-container {
    margin-top: 10px;
    border: 1px solid var(--form-item-border-color);
    border-radius: 8px;
    height: 230px;
    max-height: 300px;
    overflow-y: scroll;
    display: flex;
    flex-direction: column;
}

.list-item-container::-webkit-scrollbar {
    width: 0px;
}

.list-item {
    padding: 10px;
    display: flex;
    align-items: center;
    flex-direction: row;
}

.list-item span {
    margin-left: 10px;
    color: var(--text-color);
}

.list-item:hover {
    background-color: var(--form-item-border-color);
}

.people-access-img {
    width: 40px;
    height: 40px;
    background-color: var(--text-color-white);
    border-radius: 50%;
    margin-right: 10px;
}

.people-access-info {
    display: flex;
    flex-direction: column;
}

.people-access-info span:first-child {
    color: var(--text-color);
    font-size: 16px;
    font-weight: 500;
}

.people-access-info span:last-child {
    color: var(--text-color-grey);
    font-size: 14px;
}

.people-access-permission {
    flex: 1;
    display: flex;
    justify-content: end;
    align-items: center;
}

.people-access-permission i {
    font-size: 20px;
    cursor: pointer;
}
</style>
