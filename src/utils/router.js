// router.js
import { createRouter, createWebHistory } from 'vue-router';

import SurveyListUser from '../views/user/SurveyList.vue';
import Login from '../views/common/Login.vue';
import SurveyPage from '../views/user/SurveyPage.vue';
import SurveyListAdmin from '../views/admin/SurveyList.vue';
const routes = [
    { path: '/', name: 'SurveyListUser',component: SurveyListUser},
    { path: '/login', name: 'Login',component: Login},
    { path: '/survey/:id', name: 'SurveyPage',component: SurveyPage},
    { path: '/admin', name: 'SurveyListAdmin',component: SurveyListAdmin},
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
