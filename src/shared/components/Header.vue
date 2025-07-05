<script setup>
import { ref, onMounted } from "vue";
import { useAuthStore } from "@/stores/AuthStore";
import SUPPORTED_LOCALES from "@/constants/languages";
import { useI18n } from "vue-i18n";

const { availableLocales, locale, setLocaleMessage } = useI18n();
const selectedLocale = ref("");

const authStore = useAuthStore();

const isUserLogged = authStore.checkUser();

const navbarFunction = () => {
    let x = document.getElementById("header");
    if (x.className === "header") {
        x.className += " responsive";
    } else {
        x.className = "header";
    }
};

onMounted(() => {
    selectedLocale.value = localStorage.getItem("locale") || "en";
});

async function switchLanguage(selectedLocale) {
    if (!availableLocales.includes(selectedLocale)) {
        const messages = await import(`@/locales/${selectedLocale}.json`);
        setLocaleMessage(selectedLocale, messages);
    }
    locale.value = selectedLocale;
    localStorage.setItem("locale", selectedLocale);
}
</script>
<template>
    <div class="header">
        <div class="header-logo">
            <RouterLink :to="{ name: 'home' }">AIQuizizz</RouterLink>
        </div>
        <ul class="header-navigator">
            <li>Quiz</li>
            <li>Weekly Quiz</li>
            <li>Rewards</li>
            <li>About</li>
            <li>
                <a href="javascript:void(0);" class="icon" @click="navbarFunction">
                    <i class="fa fa-bars"></i>
                </a>
            </li>
        </ul>
        <div
            class="header-authentication-navigator"
            :style="isUserLogged ? { display: 'none' } : {}"
        >
            <RouterLink :to="{ name: 'login' }">Sign In</RouterLink>
            <RouterLink :to="{ name: 'register' }">Register</RouterLink>
        </div>
        <a-select
            @change="switchLanguage"
            class="language-select"
            v-model:value="selectedLocale"
            :style="!isUserLogged ? { display: 'none' } : {}"
        >
            <a-select-option
                v-for="locale in SUPPORTED_LOCALES"
                :key="`locale-${locale.code}`"
                :value="locale.code"
            >
                <img class="language-img" :src="locale.imagePath" alt="img" />
                {{ locale.label }}
            </a-select-option>
        </a-select>
    </div>
</template>
<style scoped>
.header {
    display: flex;
    justify-content: space-between;
    padding: 10px 20px;
    background-color: var(--background-color);
    position: sticky;
    top: 0px;
    z-index: 100;
    color: var(--text-color);
    border-bottom: 1px solid var(--content-item-border-color);
}

.header-logo {
    font-size: 30px;
    font-style: normal;
    font-weight: 700;
    line-height: normal;
    letter-spacing: -0.3px;

    background: linear-gradient(97deg, #5813c1 -5.8%, #c45037 99.69%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.header-navigator {
    display: flex;
    list-style: none;
    align-items: center;
    justify-content: space-between;
    flex: 0.3;
    margin: 0;

    color: var(--text-color);
    font-size: 16px;
    font-style: normal;
    font-weight: 400;
    line-height: 100%; /* 16px */
}

.header-authentication-navigator {
    display: flex;
}

.header-authentication-navigator a {
    text-decoration: none;
    margin-left: 10px;
    padding: 8px 16px;
    border-radius: 10px;

    font-size: 14px;
    font-style: normal;
    font-weight: 500;
    color: var(--text-color);
    background-color: var(--background-color-white);

    display: flex;
    align-items: center;

    transition: all 0.2s ease-in-out;
}

.header-authentication-navigator a:nth-child(1):hover {
    background-color: var(--background-color-contrast);
    color: var(--text-color-contrast);
}

.header-authentication-navigator a:nth-child(2) {
    color: var(--text-color);
    background: linear-gradient(97deg, #5813c1 -5.8%, #c45037 99.69%);
    background-size: 200% 200%;
    background-position: 25% 50%;
    transition: background-position 0.3s ease-in;
}

.header-authentication-navigator a:nth-child(2):hover {
    background-position: 100% 50%;
}

@media screen and (max-width: 600px) {
    .header-navigator {
        display: none;
    }
}

.language-select {
    width: 200px;
    height: 100%;
    background-color: var(--background-color);
}

.language-img {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    object-fit: cover;
}

.language-select .ant-select-selector {
    background-color: var(--background-color);
    color: var(--text-color);
    border-color: var(--border-color);
}

::v-deep(.ant-select-selector) {
    padding: 5px 10px !important;
    height: auto !important;
}
</style>
