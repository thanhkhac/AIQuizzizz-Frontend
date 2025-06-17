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
    <div class="authentication-container">
        <div class="authentication-item">
            <div>
                <div class="pattern pattern-top"></div>
                <div class="pattern pattern-bottom"></div>
            </div>
            <div class="authentication-item-text">
                <RouterLink :to="{name: 'home'}">AIQuizizz</RouterLink>
            </div>
        </div>
        <div class="authentication-item">
            <div class="authentication-item-title">
                <span>Create Account</span> <br />
                <span>Create your account and start your journey with us</span>
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
                    <label>FullName</label>
                    <a-input
                        size="large"
                        v-model:value="formState.fullName"
                        placeholder="Tên đầy đủ"
                    >
                        <template #addonBefore>
                            <UserOutlined />
                        </template>
                    </a-input>
                </a-form-item>
                <a-form-item label="" name="username">
                    <label>Username or Email</label>
                    <a-input
                        size="large"
                        v-model:value="formState.username"
                        placeholder="Tên đăng nhập hoặc email"
                    >
                        <template #addonBefore>
                            <MailOutlined />
                        </template>
                    </a-input>
                </a-form-item>
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
                        placeholder="Mật khẩu"
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
                        Sign Up
                    </a-button>
                </a-form-item>
            </a-form>
            <div class="authentication-item-navigator">
                Already have an account? <RouterLink :to="{name: 'login'}">Sign In</RouterLink>
            </div>
        </div>
    </div>
</template>

<style scoped>
.authentication-item:nth-child(1) {
    background-color: var(--background-color);
    height: 100vh;
    width: 50vw;
    position: relative;
}

.pattern {
    position: absolute;
    width: 100%;
    height: 300px;
    background-image: url("src/assets/home_vector.png");
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    left: 0;
    pointer-events: none;
}

.pattern-top {
    top: 0;
    transform: rotate(180deg);
}

.pattern-bottom {
    bottom: 0;
}

.authentication-container {
    display: flex;
}

.authentication-item-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    font-size: 60px;
    font-style: normal;
    font-weight: 700;
    line-height: normal;
    letter-spacing: -0.293px;
    background: linear-gradient(95deg, #5813c1 48.05%, #c45037 96.24%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.authentication-item:nth-child(2) {
    width: 50vw;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 20px 100px;
}

.authentication-item:nth-child(2) > * {
    width: 100%;
}

.authentication-item-title {
    margin-bottom: 20px;
}

.authentication-item-title span {
    margin-bottom: 10px;
    font-style: normal;
    line-height: normal;
    letter-spacing: -0.24px;
    color: #667085;
}
.authentication-item-title span:nth-child(1) {
    color: var(--background-color);
    font-size: 30px;
    font-weight: 600;
}

.authentication-item-title span:nth-child(2) {
    font-size: 14px;
    font-weight: 500;
}
.authentication-item-external-login {
    display: flex;
    justify-content: space-between;
}
.external-login {
    width: calc(100% / 2 - 10px);
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 8px 20px;
    margin: 15px 0px;
    border-radius: 8px;
    border: 1px solid #ddd;
    font-size: 18px;
    font-weight: 400;
    cursor: pointer;
}
.external-login:hover {
    background-color: #eee;
}

.external-login div:nth-child(1) {
    margin-right: 20px;
    width: 20px;
    height: 20px;
    background-size: cover;
    background-repeat: no-repeat;
}

.external-login-google div:nth-child(1) {
    background-image: url("src/assets/google_logo.png");
}
.external-login-facebook div:nth-child(1) {
    background-image: url("src/assets/facebook_logo.png");
}

.authentication-item-form button {
    margin: 10px 0px;
}

.authentication-item-form label {
    color: #101010;
    font-size: 16px;
    font-style: normal;
    font-weight: 500;
    line-height: normal;
    letter-spacing: -0.16px;
    margin-bottom: 8px;
}

.authentication-item-navigator {
    display: flex;
    justify-content: center;
    align-items: center;
    color: #101010;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
    letter-spacing: -0.14px;
}
.authentication-item-navigator a {
    color: var(--main-color);
    padding: 0px 8px;
    font-weight: 500;
}
</style>
