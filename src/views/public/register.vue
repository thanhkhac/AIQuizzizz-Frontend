<script setup lang="ts">
import {computed, onMounted, reactive, ref} from "vue";
import {useAuthStore} from "@/stores/AuthStore";
import ApiAuthentication from "@/api/ApiAuthentication";
import ApiUser from "@/api/ApiUser";
import {message} from "ant-design-vue";
import {UserOutlined, LockOutlined, MailOutlined} from "@ant-design/icons-vue";

const authStore = useAuthStore();

const formState = reactive({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmationPassword: "",
});

const rules = {
    fullName: [
        {
            required: true,
            message: "Vui lòng không để trống mục này.",
            trigger: "change",
        },
    ],
    username: [
        {
            required: true,
            message: "Vui lòng không để trống mục này.",
            trigger: "change",
        },
    ],
    email: [
        {
            required: true,
            message: "Vui lòng không để trống mục này.",
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
const labelCol = {span: 24};
const wrapperCol = {span: 24};

const onFinish = async () => {
    var login_result = await ApiAuthentication.Login(formState);
    console.log(login_result);
    if (login_result.data.isSucceeded) {
        message.success(login_result.data.message);
        authStore.LoginSuccessful();
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
            <a-form-item label="" name="fullName">
                <label>{{ $t("auth.inputs.fullName") }}</label>
                <a-input
                    size="large"
                    v-model:value="formState.fullName"
                    :placeholder="$t('auth.inputs.fullName')"
                >
                    <template #addonBefore>
                        <UserOutlined />
                    </template>
                </a-input>
            </a-form-item>
            <a-form-item label="" name="username">
                <label>{{ $t("auth.inputs.username") }}</label>
                <a-input
                    size="large"
                    v-model:value="formState.username"
                    :placeholder="$t('auth.inputs.username')"
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
            <RouterLink :to="{name: 'login'}">
                {{ $t("auth.navigators.signIn_link") }}
            </RouterLink>
        </div>
    </div>
</template>
