import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import Finance from '../pages/Finance.vue'
import English from '../pages/English.vue'
import RouteDetail from '../pages/RouteDetail.vue'
import Assessment from '../pages/Assessment.vue'
// School page removed; school picker is now integrated into Roadmap as a component
import ImmiGuide from '../pages/ImmiGuide.vue'
import GTE from '../pages/GTE.vue'
import Chatbot from '../pages/Chatbot.vue'
import Reminders from '../pages/Reminders.vue'
import WorkTypes from '../pages/WorkTypes.vue'
import NotFound from '../pages/NotFound.vue'
import Login from '../pages/Login.vue'
import Admin from '../pages/Admin.vue'
import Profile from '../pages/Profile.vue'
import Billing from '../pages/Billing.vue'
import BillingSuccess from '../pages/BillingSuccess.vue'
import Visas from '../pages/Visas.vue'
import RiskAndComplaints from '../pages/RiskAndComplaints.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/finance', name: 'Finance', component: Finance },
  { path: '/assessment', name: 'Assessment', component: Assessment },
  { path: '/login', name: 'Login', component: Login },
  { path: '/profile', name: 'Profile', component: Profile },
  { path: '/billing', name: 'Billing', component: Billing },
  { path: '/billing/success', name: 'BillingSuccess', component: BillingSuccess },
  { path: '/admin', name: 'Admin', component: Admin },
  // schools route removed (integrated into roadmap)
  { path: '/immi', name: 'ImmiGuide', component: ImmiGuide },
  { path: '/gte', name: 'GTE', component: GTE },
  { path: '/chatbot', name: 'Chatbot', component: Chatbot },
  { path: '/reminders', name: 'Reminders', component: Reminders },
  { path: '/work-types', name: 'WorkTypes', component: WorkTypes },
  { path: '/risk', name: 'RiskAndComplaints', component: RiskAndComplaints },
  { path: '/visas', name: 'Visas', component: Visas },
  { path: '/english', name: 'English', component: English },
  { path: '/route/:id', name: 'RouteDetail', component: RouteDetail },
  { path: '/templates', name: 'Templates', component: () => import('../pages/Templates.vue') },
  { path: '/review', name: 'ReviewRequest', component: () => import('../pages/ReviewRequest.vue') },

  // Learning steps (sequential)
  { path: '/learning', redirect: '/learning/step/1' },
  { path: '/learning/step/:id', name: 'LearningStep', component: () => import('../pages/LearningStep.vue') },
  { path: '/plan/create', name: 'PlanCreate', component: () => import('../pages/PlanCreate.vue') },
  { path: '/plan/:key', name: 'PlanViewer', component: () => import('../pages/PlanViewer.vue') },

  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard: require login for all routes except /login and /plan paths
router.beforeEach((to, from, next) => {
  if (to.path === '/login') return next()
  // Allow anonymous access to plan creation and viewing
  if (to.path.startsWith('/plan')) return next()
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
