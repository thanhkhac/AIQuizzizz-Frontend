<script setup lang="ts">
import home_vector from "@/assets/home_vector.png";
</script>

<template>
    <div class="authentication-container">
        <div class="authentication-item">
            <div>
                <div
                    class="pattern pattern-top"
                    :style="{ backgroundImage: `url(${home_vector})` }"
                ></div>
                <div
                    class="pattern pattern-bottom"
                    :style="{ backgroundImage: `url(${home_vector})` }"
                ></div>
            </div>
            <div class="authentication-item-text">
                <RouterLink :to="{ name: 'home' }">AIQuizizz</RouterLink>
            </div>
        </div>
        <RouterView />
    </div>
</template>
<style>
.authentication-item:nth-child(1) {
    background-color: #000;
    height: 100vh;
    width: 50vw;
    position: relative;
}

.pattern {
    position: absolute;
    width: 100%;
    height: 300px;
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
    max-width: 440px; /* màn rộng: không kéo ô nhập dài vô tận */
}

.authentication-item-title {
    margin-bottom: 20px;
}

.authentication-item-title span {
    margin-bottom: 10px;
    font-style: normal;
    line-height: normal;
    letter-spacing: -0.24px;
}
.authentication-item-title span:nth-child(1) {
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
/* Nút đăng nhập Google: là <button> thật, nền "nổi" của theme (không trong suốt nên không lẫn với nền trang), viền đậm,
   hover/focus theo màu nhấn. Dùng chung token --c-* của theme sáng/tối. */
.external-login {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 12px;
    min-height: 44px;
    padding: 8px 20px;
    margin: 15px 0px;
    border-radius: 8px;
    border: 1px solid var(--c-border-strong);
    background-color: var(--c-surface-raised);
    color: var(--c-text);
    font-family: inherit;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition:
        background-color 0.2s,
        border-color 0.2s,
        box-shadow 0.2s;
}
.external-login:hover {
    border-color: var(--main-color);
    background-color: var(--c-surface);
}
.external-login:focus-visible {
    outline: none;
    border-color: var(--main-color);
    box-shadow: 0 0 0 2px var(--c-focus-ring);
}
.external-login-icon {
    flex: 0 0 auto;
    width: 20px;
    height: 20px;
    background-size: cover;
    background-repeat: no-repeat;
}

.authentication-item-form button {
    margin: 10px 0px;
}

/* Khoảng cách giữa các ô: thông báo lỗi không dính vào nhãn của ô kế tiếp */
.authentication-item-form .ant-form-item {
    margin-bottom: 20px;
}
.authentication-item-form .ant-form-item-with-help {
    margin-bottom: 14px;
}
.authentication-item-form .ant-form-item-explain {
    min-height: 22px;
    padding-top: 4px;
}

/* Icon đặt trong ô nhập (slot prefix) thay vì addon: email và mật khẩu cùng cấu trúc nên luôn cùng màu nền / viền */
.authentication-item-form .ant-input-affix-wrapper {
    border-radius: 8px;
    padding-inline: 12px;
}
.authentication-item-form .ant-input-prefix {
    margin-inline-end: 10px;
}
.authentication-item-form .ant-input-prefix .anticon {
    font-size: 16px;
    color: var(--c-text-muted);
}
.authentication-item-form .ant-input-affix-wrapper-focused .ant-input-prefix .anticon {
    color: var(--c-primary-text);
}

.authentication-item-form label {
    color: var(--text-color);
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
    margin-bottom: 10px;
}

.authentication-item-navigator a {
    color: var(--c-primary-text);
    padding: 0px 8px;
    font-weight: 500;
}

@media screen and (max-width: 600px) {
    .authentication-item:nth-child(1) {
        display: none;
    }
    .authentication-item:nth-child(2) {
        padding: 20px 30px;
        width: 100vw;
    }
    .authentication-item-external-login {
        flex-direction: column;
    }
    .external-login {
        width: 100%;
        margin-bottom: 5px;
    }
}
</style>
