<script setup lang="ts">
import ApiAuthentication from "@/api/ApiAuthentication";
import { useAuthStore } from "@/stores/AuthStore";

import { onMounted, reactive, h } from "vue";
import { useRoute, useRouter } from "vue-router";

import { message } from "ant-design-vue";
import { LoadingOutlined } from "@ant-design/icons-vue";

const google_client_id = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const origin = window.location.origin;

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const formState = reactive({
    authorizationCode: route.query.code || "",
    redirectUri: `${origin}/google-authentication-callback`,
});

onMounted(async () => {
    const returnURL = sessionStorage.getItem("returnURL") || "";

    if (!formState.authorizationCode) {
        sessionStorage.setItem("returnURL", returnURL); //set before leave
        window.location.assign(`https://accounts.google.com/o/oauth2/v2/auth
            ?client_id=${google_client_id}
            &redirect_uri=${formState.redirectUri}
            &response_type=code
            &scope=openid%20email%20profile
            &access_type=offline
            &prompt=consent
        `);
        return;
    }
    let login_result = await ApiAuthentication.GoogleLogin(formState);
    if (login_result.data.success) {
        if (!login_result.data.data.hasPassword) {
            message.success("Login successfully. Redirecting...");
            router.push({ name: "create-password" });
            return;
        }
        message.success("Login successfully. Redirecting...");

        //cannot use returnURL of authStore 'cause its new instance
        authStore.returnURL = returnURL;
        authStore.LoginSuccessful();
    } else {
        message.success("Login with google failed!");
        router.push({ name: "login" });
    }
});

const indicator = h(LoadingOutlined, {
    style: {
        fontSize: "100px",
        color: "var(--main-color)",
    },
    spin: true,
});
</script>
<template>
    <div
        style="width: 100vw; height: 100vh"
        class="d-flex justify-content-center align-items-center"
    >
        <a-spin size="large" :indicator="indicator" />
    </div>
</template>
