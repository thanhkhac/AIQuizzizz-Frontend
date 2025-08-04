<script setup lang="ts">
import ApiAuthentication from "@/api/ApiAuthentication";

import { ref, reactive, createVNode } from "vue";

import { message, Modal } from "ant-design-vue";
import { ExclamationCircleOutlined } from "@ant-design/icons-vue";
import { useAuthStore } from "@/stores/AuthStore";

import { useI18n } from "vue-i18n";
const { t } = useI18n();

const authStore = useAuthStore();

const changePasswordFormState = reactive({
    currentPassword: "",
    newPassword: "",
    newPasswordConfirmation: "",
});

const formRef = ref();
const rules = {
    currentPassword: [
        {
            required: true,
            message: t("auth.validation.required"),
            trigger: "change",
        },
    ],
    newPassword: [
        {
            required: true,
            message: t("auth.validation.required"),
            trigger: "change",
        },
        {
            pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/,
            message: t("auth.validation.password"),
            trigger: "change",
        },
    ],
    newPasswordConfirmation: [
        {
            required: true,
            message: t("auth.validation.required"),
            trigger: "change",
        },
        {
            validator: (rule: any, value: string) => {
                if (value !== changePasswordFormState.newPassword) {
                    return Promise.reject(t("auth.validation.confirm_password"));
                }
                return Promise.resolve();
            },
            trigger: "change",
        },
    ],
};

const onFinishChangePassword = () => {
    formRef.value
        .validate()
        .then(() => {
            showModalConfirmation();
        })
        .catch((error: any) => {});
};

const showModalConfirmation = () => {
    Modal.confirm({
        title: "Change password ?",
        content: "After changing password you will have to login again.",
        icon: createVNode(ExclamationCircleOutlined),
        okText: "Yes",
        cancelText: "Cancel",
        onOk: async () => {
            const result = await ApiAuthentication.ChangePassword({
                currentPassword: changePasswordFormState.currentPassword,
                newPassword: changePasswordFormState.newPassword,
            });

            if (result.data.success) {
                message.success("Change password successfully!");
                authStore.logOut();
                return;
            }
            message.success("Change password failed!");
        },
    });
};
</script>

<template>
    <div class="content">
        <div class="content-item">
            <div class="content-item-title">
                <div>
                    <span>Account Security</span>
                    <span>Manage your account settings and preferences</span>
                </div>
            </div>
            <a-form
                class="mt-3"
                ref="formRef"
                :model="changePasswordFormState"
                :rules="rules"
                layout="vertical"
            >
                <a-row>
                    <a-col :span="10">
                        <a-form-item name="currentPassword" label="Current password">
                            <a-input-password
                                size="large"
                                v-model:value="changePasswordFormState.currentPassword"
                            ></a-input-password>
                        </a-form-item>
                        <a-form-item name="newPassword" label="New password">
                            <a-input-password
                                size="large"
                                v-model:value="changePasswordFormState.newPassword"
                            ></a-input-password>
                        </a-form-item>
                        <a-form-item
                            name="newPasswordConfirmation"
                            label="New password confirmation"
                        >
                            <a-input-password
                                size="large"
                                v-model:value="changePasswordFormState.newPasswordConfirmation"
                            ></a-input-password>
                        </a-form-item>
                    </a-col>
                </a-row>
                <a-row>
                    <a-col :span="24" class="mt-4">
                        <a-form-item>
                            <a-button
                                @click="onFinishChangePassword"
                                class="main-color-btn"
                                type="primary"
                                size="large"
                            >
                                Change password
                            </a-button>
                        </a-form-item>
                    </a-col>
                </a-row>
            </a-form>
        </div>
        <div class="mt-4 content-item">
            <div class="content-item-title">
                <div>
                    <span class="text-danger">Danger Zone</span>
                    <span>Irreversible actions for your account</span>
                </div>
            </div>
            <div class="danger-zone mt-3 p-4">
                <div class="text-danger fs-6 fw-bold">Delete account</div>
                <div class="text-secondary">
                    Once you delete your account, there is no going back. All your data will be
                    permanently removed
                </div>
                <a-button class="mt-3" type="primary" danger size="large">Delete account</a-button>
            </div>
        </div>
    </div>
</template>
<style scoped>
.external-service-item {
    width: 40px;
    height: 40px;
    background-color: var(--background-color-contrast);
    padding: 8px;
    border-radius: 50%;
}

.danger-zone {
    background-color: #ef44441a;
    border-radius: 8px;
}

::v-deep(.ant-form-item-label label) {
    color: var(--text-color) !important;
    font-weight: 500;
}

::v-deep(.ant-input-password) {
    background-color: var(--form-item-background-color) !important;
    border-color: var(--form-item-border-color) !important;
}

::v-deep(.ant-input-password:hover) {
    border-color: var(--form-item-border-color) !important;
}

::v-deep(.ant-input-password input) {
    background-color: var(--form-item-background-color) !important;
    color: var(--text-color);
}

::v-deep(.ant-input-password-icon) {
    color: var(--text-color-grey) !important;
}
</style>
