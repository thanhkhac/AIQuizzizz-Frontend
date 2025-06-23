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
            <span
                >You're finally here 😄.<br />
                Let's reset your password !
            </span>
            <br />
            <span>Enter a new password below to change your password.</span>
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
                <label>Password</label>
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
            <a-form-item label="" name="confirmationPassword">
                <label>Confirm Password</label>
                <a-input-password
                    size="large"
                    v-model:value="formState.confirmationPassword"
                    placeholder="Nhập lại mật khẩu"
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
                    Reset password
                </a-button>
            </a-form-item>
        </a-form>
        <div class="authentication-item-navigator">
            You're done yet ? <RouterLink :to="{name: 'login'}">Back to Sign In</RouterLink>
        </div>
    </div>
</template>
