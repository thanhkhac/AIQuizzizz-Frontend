const userRoutes = [
    {
        path: "/user",
        component: () => import("@/shared/layouts/_userLayout.vue"),
        children: [
            // {
            //     name: "User_Settings_Profile",
            //     path: "settings/profile",
            //     component: () => import("@/views/user/settings/profile.vue"),
            //     meta: { title: "profile" },
            // },
            // {
            //     name: "User_Settings_Security",
            //     path: "settings/security",
            //     component: () => import("@/views/user/settings/security.vue"),
            //     meta: { title: "profile" },
            // },
            // {
            //     name: "User_Settings_Appearance",
            //     path: "settings/appearance",
            //     component: () => import("@/views/user/settings/appearance.vue"),
            //     meta: { title: "profile" },
            // },
            // {
            //     name: "User_Settings_Subscription",
            //     path: "settings/subscription",
            //     component: () => import("@/views/user/settings/subscription.vue"),
            //     meta: { title: "profile" },
            // },
            {
                name: "User_Settings",
                path: "settings",
                component: () => import("@/views/user/settings/settings.vue"),
                meta: { title: "profile" },
            },
            {
                name: "User_Dashboard",
                path: "dashboards",
                component: () => import("@/views/user/dashboards.vue"),
                meta: { title: "dashboards" },
            },
            {
                name: "User_Library",
                path: "library",
                component: () => import("@/views/user/question_sets/index.vue"),
                meta: { title: "library" },
            },
            {
                name: "User_QuestionSet_Detail",
                path: "/user/library/:id",
                component: () => import("@/views/user/question_sets/detail.vue"),
                meta: {
                    title: "updateQS",
                },
            },
            {
                name: "User_Class",
                path: "/user/class",
                component: () => import("@/views/user/class/index.vue"),
                meta: {
                    title: "class",
                },
            },
            {
                name: "User_Class_Student",
                path: "/user/class/student", //test
                // path: "/user/class/:id/student", //real
                component: () => import("@/views/user/class/student.vue"),
                meta: {
                    title: "student",
                },
            },
        ],
    },
    {
        name: "User_QuestionSet_Create",
        path: "/user/library/create",
        component: () => import("@/views/user/question_sets/create.vue"),
        meta: {
            title: "createQS",
        },
    },
    {
        name: "User_QuestionSet_Learn",
        path: "/user/learn/:id",
        component: () => import("@/views/user/question_sets/learn.vue"),
        meta: {
            title: "learn",
        },
    },
];

export default userRoutes;
