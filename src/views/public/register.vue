<script setup lang="ts">
import { reactive, ref } from "vue";
import { useAuthStore } from "@/stores/AuthStore";
import ApiAuthentication from "@/api/ApiAuthentication";
import { message, notification } from "ant-design-vue";
import { LockOutlined, MailOutlined } from "@ant-design/icons-vue";

import { useRouter } from "vue-router";

const router = useRouter();
const authStore = useAuthStore();

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
            message: "Vui lòng không để trống mục này.",
            trigger: "change",
        },
        {
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: "Vui lòng nhập đúng định dạng email",
            trigger: "change",
        },
    ],
    password: [
        {
            required: true,
            message: "Vui lòng không để trống mục này.",
            trigger: "change",
        },
        {
            pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/,
            message:
                "Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.",
            trigger: "change",
        },
    ],
    confirmationPassword: [
        {
            validator: (rule: any, value: string) => {
                if (value !== formState.password) {
                    return Promise.reject("Mật khẩu xác nhận không khớp.");
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

const onFinish = async () => {
    try {
        button_loading.value = true;
        var register_result = await ApiAuthentication.Register({
            email: formState.email,
            password: formState.password,
        });
        if (!register_result.data.success) return;

        var send_email_result = await ApiAuthentication.RequestEmailVerification({
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
};
</script>
<template>
    <div class="authentication-item">
        <div class="authentication-item-title">
            <span> {{ $t("auth.greetings.signUp") }}</span> <br />
            <span>{{ $t("auth.instructions.signUp") }}</span>
        </div>

        <div class="authentication-item-external-login">
            <div class="external-login external-login-google">
                <div></div>
                <div>Google</div>
            </div>
            <div class="external-login external-login-facebook">
                <div></div>
                <div>Facebook</div>
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
