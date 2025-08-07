const userRoutes = [
    {
        path: "/user",
        component: () => import("@/shared/layouts/_userLayout.vue"),
        children: [
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
                path: "question-set/:id",
                component: () => import("@/views/user/question_sets/detail.vue"),
                meta: {
                    title: "updateQS",
                },
            },
            {
                name: "User_Class",
                path: "class",
                component: () => import("@/views/user/class/index.vue"),
                meta: {
                    title: "class",
                },
            },
            {
                name: "User_Class_Student",
                path: "class/:id/student",
                component: () => import("@/views/user/class/student.vue"),
                meta: {
                    title: "student",
                },
            },
            {
                name: "User_Class_Exam",
                path: "class/:id/exam",
                component: () => import("@/views/user/class/exam.vue"),
                meta: {
                    title: "exam",
                },
            },
            {
                name: "User_Class_Quiz",
                path: "class/:id/quiz",
                component: () => import("@/views/user/class/quiz.vue"),
                meta: {
                    title: "quiz",
                },
            },
            {
                name: "User_Folder",
                path: "folder",
                component: () => import("@/views/user/folder/index.vue"),
                meta: {
                    title: "folder",
                },
            },
            {
                name: "User_TestTemplate",
                path: "test-template",
                component: () => import("@/views/user/test_template/index.vue"),
                meta: {
                    title: "test-template",
                },
            },
            {
                name: "User_Folder_Detail",
                path: "folder/:id",
                component: () => import("@/views/user/folder/detail.vue"),
                meta: {
                    title: "folder-detail",
                },
            },
            {
                name: "User_Schedule",
                path: "schedule",
                component: () => import("@/views/user/schedule.vue"),
                meta: {
                    title: "schedule",
                },
            },
        ],
    },
    {
        name: "User_QuestionSet_Create",
        path: "/user/question-set/create",
        component: () => import("@/views/user/question_sets/create.vue"),
        meta: {
            title: "createQS",
        },
    },
    {
        name: "User_QuestionSet_Update",
        path: "/user/question-set/:id/update",
        component: () => import("@/views/user/question_sets/update.vue"),
        meta: {
            title: "updateQS",
        },
    },
    {
        name: "User_QuestionSet_Learn",
        path: "/user/question-set/learn/:id",
        component: () => import("@/views/user/question_sets/learn.vue"),
        meta: {
            title: "learn",
        },
    },
    {
        name: "User_QuestionSet_Test",
        path: "/user/question-set/practice-test/:id",
        component: () => import("@/views/user/question_sets/test.vue"),
        meta: {
            title: "test",
        },
    },
    {
        name: "User_QuestionSet_Search",
        path: "/user/question-set/search",
        component: () => import("@/views/user/question_sets/search.vue"),
        meta: {
            title: "search",
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
        path: "/user/test/:id/attempt",
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
