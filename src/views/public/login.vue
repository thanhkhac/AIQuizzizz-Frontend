<script setup>
import {computed, onMounted, reactive, ref} from "vue";
import {useAuthStore} from "@/stores/AuthStore";
import ApiAuthentication from "@/api/ApiAuthentication";
import ApiUser from "@/api/ApiUser";
import {message} from "ant-design-vue";

const authStore = useAuthStore();

const formState = reactive({
    username: "",
    password: "",
});

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
    <div class="auth-container">
        <div class="container">
            <div class="row d-flex justify-content-between login_form">
                <div class="col-md-6 auth-form">
                    <div class="nav-container">
                        <RouterLink class="navigation-chosen" :to="{name: 'login'}"
                            >Login</RouterLink
                        >
                        <!-- <RouterLink :to="{name: 'register'}">Register</RouterLink> -->
                    </div>
                    <hr />
                    <section>
                        <form
                            @submit.prevent="onFinish"
                            id="account"
                            method="post"
                            class="form-login"
                        >
                            <div class="form-group mt-3">
                                <label for="email">Email/Username</label>
                                <input
                                    v-model="formState.username"
                                    id="email"
                                    class="form-control"
                                    placeholder="Email/Username"
                                />
                            </div>
                            <div class="form-group mt-3">
                                <label for="password">Password</label>
                                <input
                                    type="password"
                                    v-model="formState.password"
                                    id="password"
                                    class="form-control"
                                    placeholder="Password"
                                />
                            </div>
                            <div class="form-group mt-5">
                                <a-button @click="onFinish" type="primary">Login</a-button>
                            </div>
                            <div class="form-group mt-3 d-flex justify-content-between text-center">
                                <!-- <RouterLink class="w-100" :to="{name: 'forgot-password'}"
                                    >Forgot password ?</RouterLink
                                > -->
                            </div>
                        </form>
                    </section>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.img_container {
    position: relative;
    width: 450px;
    height: 450px;
    object-fit: contain;
    margin: 0 auto;
    border-radius: 50%;
    --radius: 250px;
}
.external_login_container {
    width: 100%;
}

.external_login_item {
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #ea4335;
    padding: 8px 0px;
    border-radius: 5px;
    color: #ea4335;
    cursor: pointer;
}
.external_login_item:hover {
    color: #fff;
    background: #ea4335;
}
.external_login_item i {
    font-size: 25px;
    margin-right: 10px;
}
</style>
