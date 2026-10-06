<script setup lang="ts">
import { onMounted } from "vue";
import { useAuthStore } from "@/stores/AuthStore";
import { sidebarOpen, toggleSidebarDrawer } from "@/shared/composables/useSidebar";

// showMenu: hiện nút hamburger (chỉ hiển thị < 992px) để mở sidebar dạng drawer
const props = defineProps<{ showMenu?: boolean }>();

const authStore = useAuthStore();

const isUserLogged = authStore.checkUser();

onMounted(() => {});
</script>
<template>
    <div class="header">
        <button
            v-if="props.showMenu"
            type="button"
            class="header-menu-btn"
            aria-label="Toggle navigation"
            :aria-expanded="sidebarOpen"
            @click="toggleSidebarDrawer"
        >
            <i :class="sidebarOpen ? 'bx bx-x' : 'bx bx-menu'"></i>
        </button>
        <div class="header-logo">
            <RouterLink :to="{ name: 'home' }">AIQuizizz</RouterLink>
        </div>
        <!-- <div class="header-navigator">
            <RouterLink :to="{ name: 'User_Dashboard' }">Dashboards</RouterLink>
            <RouterLink :to="{ name: 'User_Library' }">Library</RouterLink>
            <RouterLink :to="{ name: 'User_Class' }">Class</RouterLink>
        </div> -->
        <div
            class="header-authentication-navigator"
            :style="isUserLogged ? { display: 'none' } : {}"
        >
            <RouterLink class="main-color-btn-ghost" :to="{ name: 'login' }">Sign In</RouterLink>
            <RouterLink :to="{ name: 'register' }">Register</RouterLink>
        </div>
    </div>
</template>
<style scoped>
.header {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 60px;
    justify-content: space-between;
    padding: 10px 20px;
    background-color: var(--content-item-background-color);
    position: sticky;
    top: 0px;
    z-index: 100;
    color: var(--text-color);
    border-bottom: 1px solid var(--content-item-border-color);
}

.header-menu-btn {
    display: none;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    flex-shrink: 0;
    border: 1px solid var(--content-item-border-color);
    border-radius: 10px;
    background: transparent;
    color: var(--text-color);
    cursor: pointer;
}
.header-menu-btn i {
    font-size: 26px;
}

.header-logo {
    margin-right: auto;
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

/* .header-navigator {
    display: flex;
    list-style: none;
    align-items: center;
    justify-content: center;
    margin: 0;

    color: var(--text-color);
    font-size: 16px;
    font-style: normal;
    font-weight: 400;
    line-height: 100%; 

    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
}

.header-navigator a {
    color: var(--text-color);
    text-decoration: none;
    margin: 0px 10px;
    position: relative;
}

.header-navigator a::after {
    content: "";
    display: block;
    position: absolute;
    left: 0;
    bottom: -5px;
    width: 0;
    height: 3px;
    background: var(--main-color);
    transition: width 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 2px;
}

.header-navigator a:hover::after,
.header-navigator a:focus::after {
    width: 100%;
} */

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
    color: var(--c-page);
}

.header-authentication-navigator a:nth-child(2) {
    color: #fff;
    background: linear-gradient(97deg, #5813c1 -5.8%, #c45037 99.69%);
    background-size: 200% 200%;
    background-position: 25% 50%;
    transition: background-position 0.3s ease-in;
}

.header-authentication-navigator a:nth-child(2):hover {
    background-position: 100% 50%;
}

@media screen and (max-width: 991.98px) {
    .header-menu-btn {
        display: inline-flex;
    }
}

@media screen and (max-width: 600px) {
    .header {
        padding: 8px 12px;
    }
    .header-logo {
        font-size: 24px;
    }
    .header-authentication-navigator a {
        margin-left: 6px;
        padding: 8px 12px;
        min-height: 40px;
    }
}
</style>
