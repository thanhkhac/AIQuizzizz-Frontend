import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/AuthStore";

import adminRoutes from "./route-admin";
import userRoutes from "./route-user";

const indexRoutes = [
    {
        path: "/",
        name: "home",
        component: import("../views/public/home.vue"),
        meta: { title: "home" },
    },
    {
        path: "/404",
        name: "404",
        component: import("@/views/public/404.vue"),
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
        meta: { title: "register", layout: "authentication" },
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

//check claim before redirect
router.beforeEach(async (to, from, next) => {
    //meta-title
    document.title = "AIQuizizz | " + to.meta.title;

    //check authentication + returnURL
    if (!useAuthStore().checkUser() && !publicRoutes.includes(to.name as string)) {
        useAuthStore().returnURL = to.fullPath;
        useAuthStore().logOut();
        next({ name: "login" });
        return;
    }

    //test redirect
    // authRoutes.includes(to.name?.toString() ?? "")
    if (
        (to.name === "login" || to.name === "google-authentication-callback") &&
        useAuthStore().checkUser()
    ) {
        // if (useAuthStore().user_info.claims.includes("Admin_Dashboard_View")) {
        if (
            useAuthStore().getUserInfo().roles.includes("Administrator") ||
            useAuthStore().getUserInfo().roles.includes("Moderator")
        ) {
            next({ name: "Admin_Manager_Account" });
        } else {
            next({ name: "/" });
        }
        return;
    }

    //default admin routes
    const adminClaimRoutes = {
        Admin_User_View: "Admin_User_Create",
        Admin_User_Create: "Admin_User_Create",
        Admin_User_Update: "Admin_User_Update",
        Admin_Dashboards_View: "Admin_Dashboards_View",
        Admin_Manager_Account: "Admin_Manager_Account",
        Admin_Manager_Class: "Admin_Manager_Class",
        Admin_Manager_Subscription: "Admin_Manager_Subscription",
    };

    //type for ts only
    type AdminRouteName =
        | "Admin_User_View"
        | "Admin_User_Create"
        | "Admin_User_Update"
        | "Admin_Dashboards_View"
        | "Admin_Manager_Account"
        | "Admin_Manager_Class"
        | "Admin_Manager_Subscription";

    //function to check to.name is one of admin routes
    const isAdminRouteName = (name: any): name is AdminRouteName => {
        return name in adminClaimRoutes;
    };

    //filter check claim
    if (isAdminRouteName(to.name)) {
        // const claimKey = adminClaimRoutes[to.name];

        // if (useAuthStore().getUserInfo().claims[claimKey] === "1") {
        //     next();
        // }

        if (
            useAuthStore().getUserInfo().roles.includes("Administrator") ||
            useAuthStore().getUserInfo().roles.includes("Moderator")
        ) {
            next();
        }
        next({ name: "404" });
        return;
    }
    next();
});

export default router;
