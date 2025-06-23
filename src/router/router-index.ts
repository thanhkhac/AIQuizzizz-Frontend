import {createRouter, createWebHistory} from "vue-router";
import {useAuthStore} from "@/stores/AuthStore";

import adminRoutes from "./route-admin";
import userRoutes from "./route-user";

const indexRoutes = [
    {
        path: "/",
        name: "home",
        component: import("../views/public/home.vue"),
        meta: {title: "home"},
    },
    {
        path: "/404",
        name: "404",
        component: import("@/views/public/404.vue"),
    },
    {
        path: "/login",
        name: "login",
        component: () => import("@/views/public/login.vue"),
        meta: {title: "login", layout: "authentication"}, //in case somae pages use same layout but keep default path
    },
    {
        path: "/register",
        name: "register",
        component: () => import("@/views/public/register.vue"),
        meta: {title: "register", layout: "authentication"},
    },
    {
        path: "/forgot-password",
        name: "forgot-password",
        component: () => import("@/views/public/forgot-password.vue"),
        meta: {title: "forgot-password", layout: "authentication"},
    },
    {
        path: "/reset-password",
        name: "reset-password",
        component: () => import("@/views/public/reset-password.vue"),
        meta: {title: "reset-password", layout: "authentication"},
    },
    {
        path: "/:pathMatch(.*)*",
        redirect: "/404",
    },
];

const publicRoutes = [
    "home",
    "login",
    "register",
    "forgot-password",
    "reset-password",
    "create-password",
    "create-profile",
    "404",
];

const routes = [...adminRoutes, ...userRoutes, ...indexRoutes];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
});

//check claim before redirect
router.beforeEach(async (to, from, next) => {
    //meta-title
    document.title = "YourApp-" + to.meta.title;

    //check authentication + returnURL
    if (!useAuthStore().checkUser() && !publicRoutes.includes(to.name as string)) {
        useAuthStore().returnURL = to.fullPath;
        useAuthStore().logOut();
        next({name: "login"});
        return;
    }

    //test redirect
    if (to.name === "login" && useAuthStore().checkUser()) {
        if (useAuthStore().user_info.claims.includes("Admin_Dashboard_View")) {
            next({name: "Admin_Dashboards_View"});
        } else {
            next({name: "404"});
        }
        return;
    }

    //default admin routes
    const adminClaimRoutes = {
        Admin_User_View: "Admin_User_Create",
        Admin_User_Create: "Admin_User_Create",
        Admin_User_Update: "Admin_User_Update",
        Admin_Dashboards_View: "Admin_Dashboards_View",
    };

    //type for ts only
    type AdminRouteName =
        | "Admin_User_View"
        | "Admin_User_Create"
        | "Admin_User_Update"
        | "Admin_Dashboards_View";

    //function to check to.name is one of admin routes
    const isAdminRouteName = (name: any): name is AdminRouteName => {
        return name in adminClaimRoutes;
    };

    //filter check claim
    if (isAdminRouteName(to.name)) {
        const claimKey = adminClaimRoutes[to.name];

        if (useAuthStore().getUserInfo().claims[claimKey] === "1") {
            next();
        }
        next({name: "404"});
        return;
    }
    next();
});

export default router;
