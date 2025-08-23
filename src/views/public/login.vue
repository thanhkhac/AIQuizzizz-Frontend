<script setup lang="ts">
import google_logo from "@/assets/google_logo.png";

import { reactive, ref } from "vue";
import { useAuthStore } from "@/stores/AuthStore";
import ApiAuthentication from "@/api/ApiAuthentication";
import { message } from "ant-design-vue";
import { LockOutlined, MailOutlined } from "@ant-design/icons-vue";
import { useI18n } from "vue-i18n";

const google_client_id = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const { t } = useI18n();

const authStore = useAuthStore();

const formRef = ref();
const labelCol = { span: 24 };
const wrapperCol = { span: 24 };

const formState = reactive({
    email: "",
    password: "",
});

const button_loading = ref(false);

const rules = {
    email: [
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
    ],
};

const onFinish = () => {
    formRef.value.validate().then(async () => {
        try {
            button_loading.value = true;
            let login_result = await ApiAuthentication.Login(formState);

            if (login_result.data.success) {
                message.success("Login successfully. Redirecting...");
                authStore.LoginSuccessful();
            }
        } catch (error) {
            console.log(error);
        } finally {
            button_loading.value = false;
        }
    });
};
const onGoogleLogin = async () => {
    sessionStorage.setItem("returnURL", authStore.returnURL); //set before leave
    const origin = window.location.origin;
    window.location
        .assign(`https://accounts.google.com/o/oauth2/v2/auth?client_id=${google_client_id}&redirect_uri=${origin}/google-authentication-callback&response_type=code&scope=openid%20email%20profile&access_type=offline&prompt=consent
`);
};
</script>
<template>
    <div class="authentication-item">
        <div class="authentication-item-title">
            <span> {{ $t("auth.greetings.signIn") }}</span> <br />
            <span>{{ $t("auth.instructions.signIn") }}</span>
        </div>

        <div class="authentication-item-external-login">
            <div class="external-login external-login-google" @click="onGoogleLogin">
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
                    placeholder="Your email address..."
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
                    placeholder="Mật khẩu"
                >
                    <template #addonBefore>
                        <LockOutlined />
                    </template>
                </a-input-password>
            </a-form-item>
            <a-form-item>
                <a-button
                    class="main-color-btn"
                    :loading="button_loading"
                    @click="onFinish"
                    size="large"
                    type="primary"
                    style="width: 100%"
                >
                    {{ $t("auth.buttons.signIn") }}
                </a-button>
            </a-form-item>
        </a-form>
        <div class="authentication-item-navigator">
            {{ $t("auth.navigators.signUp_signIn_ins") }}
            <RouterLink :to="{ name: 'register' }">
                {{ $t("auth.navigators.signUp_link") }}
            </RouterLink>
        </div>
        <div class="authentication-item-navigator">
            <RouterLink :to="{ name: 'forgot-password' }">
                {{ $t("auth.navigators.signIn_forgot_link") }}
            </RouterLink>
        </div>
    </div>
</template>
