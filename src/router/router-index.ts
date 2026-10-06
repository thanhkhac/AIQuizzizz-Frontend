import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/AuthStore";

import adminRoutes from "./route-admin";
import userRoutes from "./route-user";

const indexRoutes = [
    {
        path: "/",
        name: "home",
        component: () => import("../views/public/home.vue"),
        meta: {
            title: "AI generated quiz & learning tools",
            description:
                "Online learning platform integrated AI tools for generating questions and analyzing documentation",
        },
    },
    {
        path: "/404",
        name: "404",
        component: () => import("@/views/public/404.vue"),
        meta: { title: "404" },
    },
    {
        path: "/login",
        name: "login",
        component: () => import("@/views/public/login.vue"),
        meta: { title: "login", layout: "authentication" }, //in case somae pages use same layout but keep default path
    },
    {
        path: "/register",
        name: "register",
        component: () => import("@/views/public/register.vue"),
        meta: {
            title: "register",
            layout: "authentication",
        },
    },
    {
        path: "/verify-email",
        name: "verify-email",
        component: () => import("@/views/public/verify-email.vue"),
        meta: { title: "verify-email", layout: "authentication" },
    },
    {
        path: "/forgot-password",
        name: "forgot-password",
        component: () => import("@/views/public/forgot-password.vue"),
        meta: { title: "forgot-password", layout: "authentication" },
    },
    {
        path: "/reset-password",
        name: "reset-password",
        component: () => import("@/views/public/reset-password.vue"),
        meta: { title: "reset-password", layout: "authentication" },
    },
    {
        //call back after google register
        path: "/create-password",
        name: "create-password",
        component: () => import("@/views/public/create-password.vue"),
        meta: { title: "forgot-password", layout: "authentication" },
    },
    {
        //call back after google login
        path: "/google-authentication-callback",
        name: "google-authentication-callback",
        component: () => import("@/views/public/google-authentication-callback.vue"),
        meta: { title: "" },
    },
    {
        path: "/not-allowed",
        name: "not-allowed",
        component: () => import("@/views/public/not-allowed.vue"),
        meta: { title: "" },
    },
    {
        path: "/:pathMatch(.*)*",
        redirect: "/404",
    },
];

const publicRoutes = [
    "home",
    "404",
    "login",
    "register",
    "verify-email",
    "forgot-password",
    "reset-password",
    "create-password",
    "google-authentication-callback",
    "not-allowed",
];
// const authRoutes = [];

const routes = [...adminRoutes, ...userRoutes, ...indexRoutes];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
});

const isAdminOrModerator = () => {
    const roles: string[] = useAuthStore().getUserInfo()?.roles ?? [];
    return roles.includes("Administrator") || roles.includes("Moderator");
};

//check claim before redirect
// Mỗi lần điều hướng chỉ gọi next() đúng một lần, và mọi chặn quyền đều xử lý ở đây (không gọi API trước khi chặn)
router.beforeEach((to, from, next) => {
    //meta-title
    document.title = "AIQuizizz | " + to.meta.title;

    const isLoggedIn = useAuthStore().checkUser();

    //check authentication + returnURL
    if (!isLoggedIn && !publicRoutes.includes(to.name as string)) {
        useAuthStore().returnURL = to.fullPath;
        useAuthStore().logOut();
        next({ name: "login" });
        return;
    }

    //đã đăng nhập mà vào trang login/register/callback -> về trang chính theo vai trò
    if (
        (to.name === "login" || to.name === "register" || to.name === "google-authentication-callback") &&
        isLoggedIn
    ) {
        next(isAdminOrModerator() ? { name: "Admin_Manager_Account" } : { name: "User_Dashboard" });
        return;
    }

    //mọi route dưới /admin (kể cả Admin_System_Settings) chỉ dành cho Administrator/Moderator
    if ((to.path === "/admin" || to.path.startsWith("/admin/")) && !isAdminOrModerator()) {
        next({ name: "404" });
        return;
    }

    next();
});

export default router;
