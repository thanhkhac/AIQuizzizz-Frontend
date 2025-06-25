const userRoutes = [
    {
        path: "/user",
        component: () => import("@/shared/layouts/_userLayout.vue"),
        children: [
            {
                name: "User_Profile",
                path: "profile",
                meta: {title: "profile"},
                component: () => import("@/views/user/settings/profile.vue"),
            },
        ],
    },
];

export default userRoutes;
