const adminRoutes = [
    {
        path: "/admin",
        // redirect: { path: "/admin/dashboards" },
        component: () => import("@/shared/layouts/_adminLayout.vue"),
        children: [
            {
                name: "Admin_Dashboards_View",
                path: "dashboards",
                meta: { title: "Dashboards" },
                component: () => import("@/views/admin/dashboards.vue"),
            },
            /**
             * User
             * **/
            {
                name: "Admin_User_View",
                path: "user",
                meta: { title: "User" },
                component: () => import("@/views/admin/user/index.vue"),
            },
            {
                name: "Admin_User_Create",
                path: "user-create",
                meta: { title: "User-Create" },
                component: () => import("@/views/admin/user/create.vue"),
            },
            {
                name: "Admin_User_Update",
                path: "user-update/:id",
                meta: { title: "User-Update" },
                component: () => import("@/views/admin/user/update.vue"),
            },
            {
                name: "Admin_Manager_Account",
                path: "account-manager",
                meta: { title: "Manager Account" },
                component: () => import("@/views/admin/account/manage_acc.vue"),
            },
        ],
    },
];

export default adminRoutes;
