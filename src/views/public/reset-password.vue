<script setup lang="ts">
import {computed, onMounted, reactive, ref} from "vue";
import ApiAuthentication from "@/api/ApiAuthentication";
import ApiUser from "@/api/ApiUser";
import {message} from "ant-design-vue";
import {UserOutlined, LockOutlined, MailOutlined} from "@ant-design/icons-vue";

const formRef = ref();
const labelCol = {span: 24};
const wrapperCol = {span: 24};

const formState = reactive({
    password: "",
    confirmationPassword: "",
});

const rules = {
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

const onFinish = async () => {
    // call reset password api
    // notifcation / message result
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
                    {{ $t("auth.buttons.resetPassword") }}
                </a-button>
            </a-form-item>
        </a-form>
        <div class="authentication-item-navigator">
            {{ $t("auth.navigators.reset_signIn_ins") }}
            <RouterLink :to="{name: 'login'}">
                {{ $t("auth.navigators.back_signIn_link") }}
            </RouterLink>
        </div>
    </div>
</template>
