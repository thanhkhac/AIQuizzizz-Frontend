<script setup lang="ts">
import { useRouter } from "vue-router";
const router = useRouter();
const onRedirectToSubcription = () => {
    sessionStorage.setItem("setting_key", "Subscription");
    router.push({ name: "User_Settings" });
};
</script>

<template>
    <div class="error-page d-flex align-items-center justify-content-center">
        <div class="error-container text-center p-4">
            <h1 class="error-code mb-0">{{ $t("now_allowed.main_msg") }}</h1>
            <h2 class="display-6 error-message mb-3">
                {{ $t("now_allowed.errorMessage") }}
            </h2>
            <p class="lead error-message mb-5">{{ $t("now_allowed.errorDescription") }}</p>
            <div class="d-flex justify-content-center gap-3">
                <a href="/user/library" class="btn btn-glass px-4 py-2">
                    {{ $t("now_allowed.libraryNavigator") }}</a
                >
                <a @click="onRedirectToSubcription" class="btn btn-glass px-4 py-2">
                    {{ $t("now_allowed.subscriptionNavigator") }}</a
                >
            </div>
        </div>
    </div>
</template>
<style scoped>
.error-container {
    max-width: 100% !important;
}
.error-code {
    font-size: 6rem;
}
</style>
