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
                path: "/user/class/:id/student",
                component: () => import("@/views/user/class/student.vue"),
                meta: {
                    title: "student",
                },
            },
            {
                name: "User_Class_Exam",
                path: "/user/class/:id/exam",
                component: () => import("@/views/user/class/exam.vue"),
                meta: {
                    title: "exam",
                },
            },
            {
                name: "User_Class_Quiz",
                path: "/user/class/:id/quiz",
                component: () => import("@/views/user/class/quiz.vue"),
                meta: {
                    title: "quiz",
                },
            },
            {
                name: "User_Folder",
                path: "/user/folder",
                component: () => import("@/views/user/folder/index.vue"),
                meta: {
                    title: "folder",
                },
            },
            {
                name: "User_TestTemplate",
                path: "/user/test-template",
                component: () => import("@/views/user/test_template/index.vue"),
                meta: {
                    title: "test-template",
                },
            },
            {
                name: "User_Folder_Detail",
                path: "/user/folder/:id",
                component: () => import("@/views/user/folder/detail.vue"),
                meta: {
                    title: "folder-detail",
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
        name: "User_QuestionSet_Update",
        path: "/user/library/:id/update",
        component: () => import("@/views/user/question_sets/update.vue"),
        meta: {
            title: "updateQS",
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
    {
        name: "User_QuestionSet_Test",
        path: "/user/practice-test/:id",
        component: () => import("@/views/user/question_sets/test.vue"),
        meta: {
            title: "test",
        },
    },
    {
        name: "User_TestTemplate_Create",
        path: "/user/test-template/create",
        component: () => import("@/views/user/test_template/create.vue"),
        meta: {
            title: "test-template-create",
        },
    },
    {
        name: "User_TestTemplate_Update",
        path: "/user/test-template/:id/update",
        component: () => import("@/views/user/test_template/update.vue"),
        meta: {
            title: "test-template-create",
        },
    },
    {
        name: "User_Test_Create",
        path: "/user/class/:id/test/create",
        component: () => import("@/views/user/test/create.vue"),
        meta: {
            title: "create-test",
        },
    },
    {
        name: "User_Test_Update",
        path: "/user/test/:id/update",
        component: () => import("@/views/user/test/update.vue"),
        meta: {
            title: "update-test",
        },
    },
    {
        name: "User_Test_Attempt",
        path: "/user/test/attempt",
        component: () => import("@/views/user/test/attempt.vue"),
        meta: {
            title: "attempt-test",
        },
    },
    {
        name: "User_Class_Invitation_Callback",
        path: "/user/class/invitation/:code",
        component: () => import("@/views/user/class/invitation-callback.vue"),
        meta: {
            title: "attempt-test",
        },
    },
];

export default userRoutes;
