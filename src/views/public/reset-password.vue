<script setup lang="ts">
import { reactive, ref } from "vue";
import ApiAuthentication from "@/api/ApiAuthentication";
import { notification } from "ant-design-vue";
import { LockOutlined, MailOutlined } from "@ant-design/icons-vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

const router = useRouter();

const { t } = useI18n();
const formRef = ref();
const labelCol = { span: 24 };
const wrapperCol = { span: 24 };

const formState = reactive({
    email: "",
    resetCode: "",
    password: "",
    confirmationPassword: "",
});

const button_loading = ref(false);

const rules = {
    email: [
        {
            required: true,
            message: t("auth.validation.required"),
            trigger: "change",
        },
        {
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: t("auth.validation.email"),
            trigger: "change",
        },
    ],

    resetCode: [
        {
            required: true,
            message: t("auth.validation.required"),
            trigger: "change",
        },
    ],

    password: [
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

    confirmationPassword: [
        {
            required: true,
            message: t("auth.validation.required"),
            trigger: "change",
        },
        {
            validator: (rule: any, value: string) => {
                if (value !== formState.password) {
                    return Promise.reject(t("auth.validation.confirm_password"));
                }
                return Promise.resolve();
            },
            trigger: "change",
        },
    ],
};

type NotificationType = "success" | "info" | "warning" | "error";
const showNotification = (type: NotificationType, message: string, description: string) => {
    notification[type]({
        message,
        description,
    });
};

const onFinish = () => {
    formRef.value.validate().then(async () => {
        try {
            button_loading.value = true;
            const result = await ApiAuthentication.ResetPassword({
                email: formState.email,
                resetCode: formState.resetCode,
                newPassword: formState.password,
            });
            if (result.data.success) {
                showNotification("success", "Reset password result", "Success");
                setTimeout(() => {
                    router.push({ name: "login" });
                }, 5000);
                return;
            }
            showNotification("error", "Reset password result", "ERROR");
        } catch (error) {
            console.log(error);
        } finally {
            button_loading.value = false;
        }
    });
};
</script>
<template>
    <div class="authentication-item">
        <div class="authentication-item-title">
            <span> {{ $t("auth.greetings.resetPassword") }}</span> <br />
            <span>{{ $t("auth.instructions.resetPassword") }}</span>
        </div>

        <a-form
            class="authentication-item-form"
            ref="formRef"
            :model="formState"
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
            :rules="rules"
        >
            <a-form-item label="" name="email">
                <label>{{ $t("auth.inputs.email") }}</label>
                <a-input
                    size="large"
                    v-model:value="formState.email"
                    :placeholder="$t('auth.inputs.email')"
                >
                    <template #addonBefore>
                        <MailOutlined />
                    </template>
                </a-input>
            </a-form-item>

            <a-form-item label="" name="resetCode">
                <label>{{ $t("auth.inputs.code") }}</label>
                <a-input
                    size="large"
                    v-model:value="formState.resetCode"
                    :placeholder="$t('auth.inputs.code_placeholder')"
                >
                    <template #addonBefore>
                        <MailOutlined />
                    </template>
                </a-input>
            </a-form-item>

            <a-form-item label="" name="password">
                <label>{{ $t("auth.inputs.new_password") }}</label>
                <a-input-password
                    size="large"
                    v-model:value="formState.password"
                    :placeholder="$t('auth.inputs.password')"
                >
                    <template #addonBefore>
                        <LockOutlined />
                    </template>
                </a-input-password>
            </a-form-item>
            <a-form-item label="" name="confirmationPassword">
                <label>{{ $t("auth.inputs.new_password_confirmation") }}</label>
                <a-input-password
                    size="large"
                    v-model:value="formState.confirmationPassword"
                    :placeholder="$t('auth.inputs.confirmPassword')"
                >
                    <template #addonBefore>
                        <LockOutlined />
                    </template>
                </a-input-password>
            </a-form-item>
            <a-form-item>
                <a-button
                    :loading="button_loading"
                    @click="onFinish"
                    size="large"
                    type="primary"
                    style="background-color: #9823f5; width: 100%"
                >
                    {{ $t("auth.buttons.resetPassword") }}
                </a-button>
            </a-form-item>
        </a-form>
        <div class="authentication-item-navigator">
            {{ $t("auth.navigators.reset_signIn_ins") }}
            <RouterLink :to="{ name: 'login' }">
                {{ $t("auth.navigators.back_signIn_link") }}
            </RouterLink>
        </div>
    </div>
</template>
