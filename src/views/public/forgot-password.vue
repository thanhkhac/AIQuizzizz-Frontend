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
            <span> {{ $t("auth.greetings.forgotPassword") }} </span> <br />
            <span>
                {{ $t("auth.instructions.forgotPassword") }}
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
            <a-form-item>
                <a-button
                    size="large"
                    type="primary"
                    style="background-color: #9823f5; width: 100%"
                >
                    {{ $t("auth.buttons.send") }}
                </a-button>
            </a-form-item>
        </a-form>
        <div class="authentication-item-navigator">
            {{ $t("auth.navigators.forgot_signIn_ins") }}
            <RouterLink :to="{name: 'login'}">
               {{ $t("auth.navigators.back_signIn_link") }}
            </RouterLink>
        </div>
    </div>
</template>
