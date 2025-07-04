<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { useAuthStore } from "@/stores/AuthStore";
import ApiAuthentication from "@/api/ApiAuthentication";
import ApiUser from "@/api/ApiUser";
import { message } from "ant-design-vue";
import { UserOutlined, LockOutlined, MailOutlined } from "@ant-design/icons-vue";

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
    ],
};

const onFinish = async () => {
    try {
        button_loading.value = true;
        var login_result = await ApiAuthentication.Login(formState);
        console.log(login_result);
        if (login_result.data.isSucceeded) {
            message.success(login_result.data.message);
            authStore.LoginSuccessful();
        }
    } catch (error) {
    } finally {
        button_loading.value = false;
    }
};
</script>
<template>
    <div class="authentication-item">
        <div class="authentication-item-title">
            <span> {{ $t("auth.greetings.signIn") }}</span> <br />
            <span>{{ $t("auth.instructions.signIn") }}</span>
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
            <a-form-item label="" name="username">
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
                    :loading="button_loading"
                    @click="onFinish"
                    size="large"
                    type="primary"
                    style="background-color: #9823f5; width: 100%"
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
