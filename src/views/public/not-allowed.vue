<script setup lang="ts">
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
                    {{ $t("now_allowed.libraryNavigator") }}
                </a>
            </div>
        </div>
    </div>
</template>
<style scoped>
.error-page {
    min-height: 100vh;
    background: linear-gradient(50deg, #5813c1 0%, #c45037 100%);
}
.error-container {
    max-width: 100% !important;
}
.error-code {
    font-size: 6rem;
    font-weight: 900;
    color: #fff;
}
.error-message {
    color: rgba(255, 255, 255, 0.92);
}
.btn-glass {
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: #fff;
    transition: all 0.3s ease;
}
.btn-glass:hover {
    background: rgba(255, 255, 255, 0.3);
    color: #fff;
}
</style>
