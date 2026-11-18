import { createRouter, createWebHistory } from 'vue-router'
import Portal from '../components/Portal.vue'
import { routePaths } from './paths'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: routePaths.home, name: 'home', component: Portal },
    { path: routePaths.internships, name: 'internships', component: Portal },
    { path: routePaths.fresherJobs, name: 'fresher-jobs', component: Portal },
    { path: routePaths.myApplications, name: 'my-applications', component: Portal },
    { path: routePaths.savedJobs, name: 'saved-jobs', component: Portal },
  ],
})

export default router
