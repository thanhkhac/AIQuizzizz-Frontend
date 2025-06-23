<script setup>
const navbarFunction = () => {
    var x = document.getElementById("header");
    if (x.className === "header") {
        x.className += " responsive";
    } else {
        x.className = "header";
    }
};
</script>
<template>
    <div class="header">
        <div class="header-logo">
            <RouterLink :to="{name: 'home'}">AIQuizizz</RouterLink>
        </div>
        <ul class="header-navigator">
            <li>Quiz</li>
            <li>Weekly Quiz</li>
            <li>Rewards</li>
            <li>About</li>
            <li>
                <a href="javascript:void(0);" class="icon" @click="navbarFunction">
                    <i class="fa fa-bars"></i>
                </a>
            </li>
        </ul>
        <div class="header-authentication-navigator">
            <RouterLink :to="{name: 'login'}">Sign In</RouterLink>
            <RouterLink :to="{name: 'register'}">Register</RouterLink>
        </div>
    </div>
</template>
<style scoped>
.header {
    display: flex;
    justify-content: space-between;
    padding: 10px 20px;
    background-color: var(--background-color);
    position: sticky;
    top: 0px;
    z-index: 1;
    color: #fff;
    border-bottom: 1px solid #2a2a2a;
}

.header-logo {
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

.header-navigator {
    display: flex;
    list-style: none;
    align-items: center;
    justify-content: space-between;
    flex: 0.3;
    margin: 0;

    color: #fff;
    font-size: 16px;
    font-style: normal;
    font-weight: 400;
    line-height: 100%; /* 16px */
}

.header-authentication-navigator {
    display: flex;
}

.header-authentication-navigator a {
    text-decoration: none;
    margin-left: 10px;
    padding: 8px 16px;
    background-color: red;
    border-radius: 10px;

    font-size: 14px;
    font-style: normal;
    font-weight: 500;
    color: #000;
    background-color: var(--background-color-white);
}

.header-authentication-navigator a:nth-child(1):hover {
    background-color: #eee;
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

@media screen and (max-width: 600px) {
    .header-navigator {
        display: none;
    }
}
</style>
