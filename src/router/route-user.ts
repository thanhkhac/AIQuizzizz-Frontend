const userRoutes = [
    {
        path: "/user",
        component: () => import("@/shared/layouts/_userLayout.vue"),
        children: [
            {
                name: "User_Profile",
                path: "profile",
                component: () => import("@/views/user/settings/profile.vue"),
                meta: {title: "profile"},
            },
            {
                name: "User_Dashboard",
                path: "dashboards",
                component: () => import("@/views/user/dashboards.vue"),
                meta: {title: "dashboards"},
            },
            {
                name: "User_Library",
                path: "library",
                component: () => import("@/views/user/question_sets/index.vue"),
                meta: {title: "library"},
            },
            // {
            //     name: "User_QuestionSet_Create",
            //     path: "library/create",
            //     component: () => import("@/views/user/question_sets/create.vue"),
            //     meta: {title: "createQS"},
            // },
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
];

export default userRoutes;
