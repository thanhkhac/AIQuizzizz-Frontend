<script setup>
import {computed, onMounted, reactive, ref} from "vue";
import ApiAuthentication from "@/api/ApiAuthentication";
import {message} from "ant-design-vue";
import {UserOutlined, LockOutlined, MailOutlined} from "@ant-design/icons-vue";

const formRef = ref();
const labelCol = {span: 24};
const wrapperCol = {span: 24};

const formState = reactive({
    email: "",
});

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
};

const onFinish = async () => {
    //call send email api
    //notification / message result
};
</script>
<template>
    <div class="authentication-item">
        <div class="authentication-item-title">
            <span>Forgot your password ?</span> <br />
            <span>
                Don't worry we got you 😉. <br />
                Enter your email address and we will send you instructions to reset your password.
            </span>
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
                <label>Email</label>
                <a-input
                    size="large"
                    v-model:value="formState.email"
                    placeholder="Địa chỉ email của bạn"
                >
                    <template #addonBefore>
                        <MailOutlined />
                    </template>
                </a-input>
            </a-form-item>
            <a-form-item>
                <a-button
                    size="large"
                    type="primary"
                    style="background-color: #9823f5; width: 100%"
                >
                    Send
                </a-button>
            </a-form-item>
        </a-form>
        <div class="authentication-item-navigator">
            Remember it ? <RouterLink :to="{name: 'login'}">Back to Sign In</RouterLink>
        </div>
    </div>
</template>
