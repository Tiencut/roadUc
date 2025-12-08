import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import Finance from '../pages/Finance.vue'
import English from '../pages/English.vue'
import RouteDetail from '../pages/RouteDetail.vue'
import Assessment from '../pages/Assessment.vue'
import SchoolPicker from '../pages/SchoolPicker.vue'
import ImmiGuide from '../pages/ImmiGuide.vue'
import GTE from '../pages/GTE.vue'
import Chatbot from '../pages/Chatbot.vue'
import Reminders from '../pages/Reminders.vue'
import WorkTypes from '../pages/WorkTypes.vue'
import NotFound from '../pages/NotFound.vue'
import Login from '../pages/Login.vue'
import Admin from '../pages/Admin.vue'
import Profile from '../pages/Profile.vue'
import Visas from '../pages/Visas.vue'
import RiskAndComplaints from '../pages/RiskAndComplaints.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/finance', name: 'Finance', component: Finance },
  { path: '/assessment', name: 'Assessment', component: Assessment },
  { path: '/login', name: 'Login', component: Login },
  { path: '/profile', name: 'Profile', component: Profile },
  { path: '/admin', name: 'Admin', component: Admin },
  { path: '/schools', name: 'SchoolPicker', component: SchoolPicker },
  { path: '/immi', name: 'ImmiGuide', component: ImmiGuide },
  { path: '/gte', name: 'GTE', component: GTE },
  { path: '/chatbot', name: 'Chatbot', component: Chatbot },
  { path: '/reminders', name: 'Reminders', component: Reminders },
  { path: '/work-types', name: 'WorkTypes', component: WorkTypes },
  { path: '/risk', name: 'RiskAndComplaints', component: RiskAndComplaints },
  { path: '/visas', name: 'Visas', component: Visas },
  { path: '/english', name: 'English', component: English },
  { path: '/route/:id', name: 'RouteDetail', component: RouteDetail }
  , { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard: require login for all routes except /login
router.beforeEach((to, from, next) => {
  if (to.path === '/login') return next()
  try {
    const stored = localStorage.getItem('rtu_user')
    if (!stored) return next({ path: '/login', query: { redirect: to.fullPath } })
    // Protect /admin: require admin role
    if (to.path === '/admin') {
      try {
        const parsed = JSON.parse(stored)
        if (!parsed || parsed.role !== 'admin') return next({ path: '/login', query: { redirect: to.fullPath } })
      } catch (e) {
        return next({ path: '/login', query: { redirect: to.fullPath } })
      }
    }
  } catch (e) {
    return next({ path: '/login', query: { redirect: to.fullPath } })
  }
  return next()
})

export default router
