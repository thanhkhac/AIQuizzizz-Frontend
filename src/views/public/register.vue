<script setup lang="ts">
import google_logo from "@/assets/google_logo.png";

import { reactive, ref } from "vue";
import ApiAuthentication from "@/api/ApiAuthentication";
import { notification } from "ant-design-vue";
import { LockOutlined, MailOutlined } from "@ant-design/icons-vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

const google_client_id = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const { t } = useI18n();

const router = useRouter();

const formState = reactive({
    email: "",
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

const formRef = ref();
const labelCol = { span: 24 };
const wrapperCol = { span: 24 };

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
            let register_result = await ApiAuthentication.Register({
                email: formState.email,
                password: formState.password,
            });
            if (!register_result.data.success) return;

            let send_email_result = await ApiAuthentication.RequestEmailVerification({
                email: formState.email,
            });

            if (send_email_result.data.success) {
                showNotification("success", "Register result", "Success");

                sessionStorage.setItem("email", formState.email);
                router.push({ name: "verify-email" });
                return;
            }
            showNotification("error", "Register result", "ERROR");
        } catch (error) {
            console.log(error);
        } finally {
            button_loading.value = false;
        }
    });
};

const onGoogleRegister = async () => {
    const origin = window.location.origin;
    window.location
        .assign(`https://accounts.google.com/o/oauth2/v2/auth?client_id=${google_client_id}&redirect_uri=${origin}/google-authentication-callback&response_type=code&scope=openid%20email%20profile&access_type=offline&prompt=consent
`);
};
</script>
<template>
    <div class="authentication-item">
        <div class="authentication-item-title">
            <span> {{ $t("auth.greetings.signUp") }}</span> <br />
            <span>{{ $t("auth.instructions.signUp") }}</span>
        </div>

        <div class="authentication-item-external-login" @click="onGoogleRegister">
            <div class="external-login external-login-google">
                <div :style="{ backgroundImage: `url(${google_logo})` }"></div>
                <div>Google</div>
            </div>
        </div>
        <a-divider style="height: 1px; background-color: #d9d9d9">
            <span style="background-color: #fff; padding: 0px 10px">OR</span>
        </a-divider>
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
            <a-form-item label="" name="password">
                <label>{{ $t("auth.inputs.password") }}</label>
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
                <label>{{ $t("auth.inputs.confirmPassword") }}</label>
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
                    {{ $t("auth.buttons.signUp") }}
                </a-button>
            </a-form-item>
        </a-form>
        <div class="authentication-item-navigator">
            {{ $t("auth.navigators.signUp_signIn_ins") }}
            <RouterLink :to="{ name: 'login' }">
                {{ $t("auth.navigators.signIn_link") }}
            </RouterLink>
        </div>
    </div>
</template>
