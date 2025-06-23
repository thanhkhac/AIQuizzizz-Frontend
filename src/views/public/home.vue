<script setup lang="ts">
import {StarOutlined, AppstoreOutlined} from "@ant-design/icons-vue";
import Header from "@/shared/components/Header.vue";
</script>
<template>
    <Header />
    <div class="background">
        <div class="pattern pattern-top"></div>
        <div class="pattern pattern-bottom"></div>
        <div class="w-100 h-100 d-flex justify-content-between align-items-center">
            <div class="eclipse eclipse-left"></div>
            <div class="eclipse eclipse-right"></div>
        </div>
        <div class="content-container">
            <div class="d-flex flex-column justify-content-center align-items-center">
                <div class="content-item">
                    <!-- <div class="content-item-icon">⭐</div> -->
                    ✨
                    <div>The ultimate quiz experience</div>
                </div>
                <div class="content-item">Learn, Quiz, <span>Earn Rewards</span></div>
                <div class="content-item">
                    Join thousands of students and teachers on the ultimate quiz platform. Test your
                    knowledge, compete with peers, and win exciting rewards
                </div>
                <div class="content-item">
                    <RouterLink :to="{}"> Get Started </RouterLink>
                    <RouterLink :to="{}"> Explore Quizzes </RouterLink>
                </div>
            </div>
        </div>
    </div>
    <div class="background background-responsive">
        <div class="content-container">
            <div class="d-flex flex-column justify-content-center align-items-center">
                <div class="content-item">
                    <!-- <div class="content-item-icon">⭐</div> -->
                    <AppstoreOutlined style="color: #ac63e6" />
                    <i class="bxr bx-science"></i>
                    <div>Categories</div>
                </div>
                <div class="content-item">Explore <span>Quiz Categories</span></div>
                <div class="content-item">
                    Discover quizzes across various subjects to test and expand your knowledge
                </div>
                <div class="content-item">
                    <div class="category-item-container">
                        <div class="category-item">
                            <i class="bx bx-atom category-item-icon"></i>
                            <div class="category-item-content">
                                <span>Science & Tech</span>
                                <br />
                                <span>
                                    Test your knowledge in science & tech with our challenging
                                    quizzes
                                </span>
                                <br />
                                <RouterLink :to="{}">
                                    Explore Quizzes <i class="bx bx-right-arrow-alt"></i>
                                </RouterLink>
                            </div>
                        </div>
                        <div class="category-item">
                            <i class="bx bx-math category-item-icon"></i>
                            <div class="category-item-content">
                                <span>Mathematics</span>
                                <br />
                                <span>
                                    Test your knowledge in mathematics with our challenging quizzes
                                </span>
                                <br />
                                <RouterLink :to="{}">
                                    Explore Quizzes <i class="bx bx-right-arrow-alt"></i>
                                </RouterLink>
                            </div>
                        </div>
                        <div class="category-item">
                            <i class="bx bxs-flask category-item-icon"></i>
                            <div class="category-item-content">
                                <span>Chemistry</span>
                                <br />
                                <span>
                                    Test your knowledge in chemistry with our challenging quizzes
                                </span>
                                <br />
                                <RouterLink :to="{}">
                                    Explore Quizzes <i class="bx bx-right-arrow-alt"></i>
                                </RouterLink>
                            </div>
                        </div>
                        <div class="category-item">
                            <i class="bx bx-dna category-item-icon"></i>
                            <div class="category-item-content">
                                <span>Biology</span>
                                <br />
                                <span>
                                    Test your knowledge in biology with our challenging quizzes
                                </span>
                                <br />
                                <RouterLink :to="{}">
                                    Explore Quizzes <i class="bx bx-right-arrow-alt"></i>
                                </RouterLink>
                            </div>
                        </div>
                        <div class="category-item">
                            <i class="bx bx-globe category-item-icon"></i>
                            <div class="category-item-content">
                                <span>General Knowledge</span>
                                <br />
                                <span>
                                    Test your knowledge in general knowledge with our challenging
                                    quizzes
                                </span>
                                <br />
                                <RouterLink :to="{}">
                                    Explore Quizzes <i class="bx bx-right-arrow-alt"></i>
                                </RouterLink>
                            </div>
                        </div>
                        <div class="category-item">
                            <i class="bx bx-news category-item-icon"></i>
                            <div class="category-item-content">
                                <span>Current Affairs</span>
                                <br />
                                <span>
                                    Test your knowledge in current affairs with our challenging
                                    quizzes
                                </span>
                                <br />
                                <RouterLink :to="{}">
                                    Explore Quizzes
                                    <i class="bx bx-right-arrow-alt"></i>
                                </RouterLink>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="background background-responsive">
        <div class="content-container">
            <div class="d-flex flex-column justify-content-center align-items-center">
                <div class="content-item">
                    <StarOutlined style="color: #ac63e6" />
                    <i class="bxr bx-science"></i>
                    <div>Features</div>
                </div>
                <div class="content-item">Why <span>AIQuizizz</span></div>
                <div class="content-item">
                    Discover quizzes across various subjects to test and expand your knowledge
                </div>
                <div class="content-item">
                    <div class="feature-item-container">
                        <div class="feature-item">
                            <i class="bx bx-brain feature-item-icon"></i>
                            <div class="category-item-content">
                                <span>Personalized Learning</span>
                                <br />
                                <span>
                                    Adaptive quizzes that adjust to your knowledge level and
                                    learning pace
                                </span>
                            </div>
                        </div>
                        <div class="feature-item">
                            <i class="bx bx-gift feature-item-icon"></i>
                            <div class="category-item-content">
                                <span>Reward System</span>
                                <br />
                                <span>
                                    Earn points, badges, and real rewards for your achievements
                                </span>
                            </div>
                        </div>
                        <div class="feature-item">
                            <i class="bx bxs-group feature-item-icon"></i>
                            <div class="category-item-content">
                                <span>Teacher Dashboard</span>
                                <br />
                                <span>
                                    Comprehensive tools for educators to create and manage quizzes
                                </span>
                            </div>
                        </div>
                        <div class="feature-item">
                            <i class="bx bx-signal-5 feature-item-icon"></i>
                            <div class="category-item-content">
                                <span>Progress Tracking</span>
                                <br />
                                <span>
                                    Adaptive quizzes that adjust to your knowledge level and
                                    learning pace
                                </span>
                            </div>
                        </div>
                        <div class="feature-item">
                            <i class="bx bx-trophy feature-item-icon"></i>
                            <div class="category-item-content">
                                <span>Competitive Leaderboards</span>
                                <br />
                                <span>
                                    Compete with peers and climb the ranks in various categories
                                </span>
                            </div>
                        </div>
                        <div class="feature-item">
                            <i class="bx bx-mobile-alt feature-item-icon"></i>
                            <div class="category-item-content">
                                <span>Mobile Friendly</span>
                                <br />
                                <span> Access your quizzes anytime, anywhere on any device </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="background">
        <div class="w-100 d-flex justify-content-center">
            <div class="banner">
                <div class="banner-item">
                    <div>Ready to Start Your Quiz Journey?</div>
                    <div>
                        Join thousands of students and teachers. Sign up today and get access to all
                        features
                    </div>
                    <div>
                        <RouterLink :to="{}">Create account</RouterLink>
                        <RouterLink :to="{}">Explore Quizzes</RouterLink>
                    </div>
                </div>
                <div class="banner-item">
                    <div class="banner-item-img"></div>
                </div>
            </div>
        </div>
    </div>
</template>

<style>
:root {
    --background-color: #000;
    --background-color-white: #fff;
    --background-color-white-hovered: #eee;
    --background-color-gradient: linear-gradient(95deg, #5813c1 48.05%, #c45037 96.24%);

    --background-sub-color1: #ac63e6;
    --background-sub-color2: #c45037;

    --text-color-white: #fff;
    --text-color-black: #000;

    --main-color: #9823f5;

    --category-1st-color: #3b82f6;
    --category-2st-color: #22c55e;
    --category-3st-color: #a855f7;
    --category-4st-color: #ec4899;
    --category-5st-color: #f59e0b;
    --category-6st-color: #ef4444;
}
</style>
<style scoped>
.background {
    height: 100vh;
    background-color: #000;
    overflow-x: hidden;
    position: relative;
}

.pattern {
    position: absolute;
    width: 100vw;
    height: 300px;
    background-image: url("src/assets/home_vector.png");
    background-size: cover;
    background-repeat: no-repeat;
    left: 0;
    pointer-events: none;
}

.pattern-top {
    top: 0;
    transform: rotate(180deg);
}

.pattern-bottom {
    bottom: 0;
}

.eclipse {
    width: 300px;
    height: 300px;
    border-radius: 300px;
    filter: blur(250px);
    animation: colorShift 5s ease-in-out infinite alternate;
}

.eclipse-left {
    background: var(--background-sub-color1);
}
.eclipse-right {
    background: var(--background-sub-color2);
}

@keyframes colorShift {
    0% {
        background: var(--background-sub-color1);
    }
    25% {
        background: #b956a2;
    }
    50% {
        background: var(--background-sub-color2);
    }
    75% {
        background: #b956a2;
    }
    100% {
        background: var(--background-sub-color1);
    }
}

.content-container {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

.content-item {
    color: var(--text-color-white);
    text-align: center;
    margin: 15px 0px;
}

.content-item:first-child {
    border-radius: 20px;
    background: #161618;
    display: inline-flex;
    padding: 4px 12px;
    justify-content: center;
    align-items: center;
    gap: 12px;
}
.content-item:nth-child(2) {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 60px;
    font-style: normal;
    font-weight: 700;
    line-height: normal;
}
.content-item:nth-child(2) span {
    background: var(--background-color-gradient);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}
.content-item:nth-child(3) {
    width: 600px;
}
.content-item:nth-child(4) a {
    display: inline-flex;
    padding: 10px 30px;
    justify-content: center;
    align-items: center;
    text-decoration: none;
    border-radius: 10px;
    background-color: #fff;
    margin: 0 10px;
    color: #000;
    font-weight: 500;
}

.content-item:nth-child(4) a:nth-child(2):hover {
    background-color: #eee;
}

.content-item:nth-child(4) a:first-child {
    background: linear-gradient(97deg, #5813c1 -5.8%, #c45037 99.69%);
    color: var(--text-color);
    background-size: 200% 200%;
    background-position: 0% 50%;
    transition: background-position 0.3s ease-in;
}
.content-item:nth-child(4) a:first-child:hover {
    background-position: 50% 100%;
}

.category-item-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
}

.content-item:nth-child(4) {
    width: 100vw;
    padding: 0px 20px;
}

.category-item {
    display: flex;
    width: calc(100vw / 3 - 50px);
    padding: 10px;
    margin: 10px;
    border-radius: 8px;
    border: 4px solid #241f20;
    background: #241f20;
}

.category-item-icon {
    display: flex;
    width: 50px;
    height: 50px;
    justify-content: center;
    align-items: center;
    flex-shrink: 0;
    aspect-ratio: 1/1;
    font-size: 30px;
    border-radius: 50%;
    margin: 8px;
}

.category-item:nth-child(1) {
    border-top-color: var(--category-1st-color);
}
.category-item:nth-child(1) i {
    background-color: var(--category-1st-color);
}
.category-item:nth-child(1) a {
    color: var(--category-1st-color);
}

.category-item:nth-child(2) {
    border-top-color: var(--category-2st-color);
}
.category-item:nth-child(2) i {
    background-color: var(--category-2st-color);
}
.category-item:nth-child(2) a {
    color: var(--category-2st-color);
}

.category-item:nth-child(3) {
    border-top-color: var(--category-3st-color);
}
.category-item:nth-child(3) i {
    background-color: var(--category-3st-color);
}
.category-item:nth-child(3) a {
    color: var(--category-3st-color);
}

.category-item:nth-child(4) {
    border-top-color: var(--category-4st-color);
}
.category-item:nth-child(4) i {
    background-color: var(--category-4st-color);
}
.category-item:nth-child(4) a {
    color: var(--category-4st-color);
}

.category-item:nth-child(5) {
    border-top-color: var(--category-5st-color);
}
.category-item:nth-child(5) i {
    background-color: var(--category-5st-color);
}
.category-item:nth-child(5) a {
    color: var(--category-5st-color);
}

.category-item:nth-child(6) {
    border-top-color: var(--category-6st-color);
}
.category-item:nth-child(6) i {
    background-color: var(--category-6st-color);
}
.category-item:nth-child(6) a {
    color: var(--category-6st-color);
}

.category-item-content {
    text-align: start;
    margin-left: 10px;
}

.category-item-content span:nth-child(1) {
    font-size: 18px;
    font-style: normal;
    font-weight: 700;
    line-height: normal;
}

.category-item-content span:nth-child(3) {
    color: #cccccc;
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
}
.category-item-content a {
    padding: 0 !important;
    background-color: transparent !important;
    margin: 0 !important;
    margin-top: 10px !important;
    font-size: 14px !important;
    align-items: center !important;
    justify-content: start !important;
    text-align: center !important;
    font-weight: 600 !important;
}

.category-item-content i {
    background-color: transparent !important;
    transform: translateY(1px);
    font-size: 18px;
}

.feature-item-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
}

.feature-item {
    display: flex;
    width: calc(100vw / 3 - 50px);
    padding: 10px;
    margin: 10px;
    border-radius: 8px;
    border: 4px solid #241f20;
    background: #241f20;
    flex-direction: column;
    justify-content: start;
    align-items: start;
}

.feature-item-icon {
    display: flex;
    width: 50px;
    height: 50px;
    justify-content: center;
    align-items: center;
    flex-shrink: 0;
    aspect-ratio: 1/1;
    font-size: 25px;
    border-radius: 50%;
    margin: 8px;
}

.feature-item:nth-child(1) i {
    background: #261544;
    color: #5c00ff;
}
.feature-item:nth-child(4) i {
    background-color: #183826;
    color: #00ff70;
}
.feature-item:nth-child(2) i {
    background-color: #432521;
    color: #f15540;
}
.feature-item:nth-child(3) i {
    background-color: #1d2b44;
    color: #005cff;
}
.feature-item:nth-child(5) i {
    background-color: #45321a;
    color: #ff8e00;
}
.feature-item:nth-child(6) i {
    background-color: #332244;
    color: #7f00ff;
}

.banner {
    width: calc(100% - 65px);
    border-radius: 20px;
    background: linear-gradient(97deg, #5813c1 -5.8%, #c45037 99.69%);
    padding: 30px;
    display: flex;
    justify-content: space-between;
}
.banner-item div {
    margin: 16px 0px;
}
.banner-item div:nth-child(1) {
    width: 400px;
    color: #fff;
    font-size: 36px;
    font-style: normal;
    font-weight: 700;
    line-height: normal;
}

.banner-item div:nth-child(2) {
    width: 550px;
    color: #ccc;
    font-size: 18px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
}

.banner-item a {
    display: inline-flex;
    padding: 10px 30px;
    justify-content: center;
    align-items: center;
    margin-right: 15px;
    background-color: var(--background-color-white);
    border-radius: 10px;
    color: var(--text-color-black);
    text-decoration: none;
    font-weight: 500;
}

.banner-item a:nth-child(2) {
    background-color: transparent;
    border: 2px solid #fff;
    color: var(--text-color-white);
}
.banner-item a:nth-child(1):hover {
    background-color: var(--background-color-white-hovered);
}

.banner-item-img {
    width: 700px;
    height: 220px;
    background-image: url("src/assets/banner_image.png");
    background-size: cover;
    background-position: center;
    border-radius: 20px;
    padding: 0 350px;
}

@media screen and (max-width: 600px) {
    .content-item:nth-child(2) {
        font-size: 30px;
    }
    .content-item:nth-child(3) {
        width: 400px;
    }
    .category-item {
        width: calc(100vw / 1 - 50px);
    }
    .feature-item {
        width: calc(100vw / 1 - 50px);
        display: flex;
        flex-direction: row;
    }

    .background-responsive {
        height: 135vh;
    }

    .banner {
        flex-direction: row;
        justify-content: center;
    }

    .banner-item div:nth-child(1) {
        font-size: 32px;
        width: 300px;
    }
    .banner-item div:nth-child(2) {
        width: 300px;
    }

    .banner-item a {
        display: flex;
        margin-bottom: 10px;
    }

    .banner-item-img {
        display: none;
    }
}
</style>
