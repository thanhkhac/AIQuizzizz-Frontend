<template>
    <div class="error-page d-flex align-items-center justify-content-center">
        <div class="error-container text-center p-4">
            <h1 class="error-code mb-0">404</h1>
            <h2 class="display-6 error-message mb-3">{{ $t("404.errorMessage") }}</h2>
            <p class="lead error-message mb-5">
                {{ $t("404.errorDescription") }}
            </p>
            <div class="d-flex justify-content-center gap-3">
                <a href="/" class="btn btn-glass px-4 py-2">{{ $t("404.homePageNavigator") }}</a>
            </div>
        </div>
    </div>
</template>
<style>
.error-page {
    min-height: 100vh;
    background: linear-gradient(50deg, #5813c1 0%, #c45037 100%);
}

.error-container {
    max-width: 600px;
}

.error-code {
    font-size: 12rem;
    font-weight: 900;
    background: linear-gradient(to right, #fff, rgba(255, 255, 255, 0.5));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: pulse 2s infinite;
}

.error-message {
    color: rgba(255, 255, 255, 0.9);
}

@keyframes pulse {
    0% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.05);
    }

    100% {
        transform: scale(1);
    }
}

.btn-glass {
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: white;
    transition: all 0.3s ease;
}

.btn-glass:hover {
    background: rgba(255, 255, 255, 0.3);
    color: white;
}
</style>
