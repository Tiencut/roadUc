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
import NotFound from '../pages/NotFound.vue'
import Login from '../pages/Login.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/finance', name: 'Finance', component: Finance },
  { path: '/assessment', name: 'Assessment', component: Assessment },
  { path: '/login', name: 'Login', component: Login },
  { path: '/schools', name: 'SchoolPicker', component: SchoolPicker },
  { path: '/immi', name: 'ImmiGuide', component: ImmiGuide },
  { path: '/gte', name: 'GTE', component: GTE },
  { path: '/chatbot', name: 'Chatbot', component: Chatbot },
  { path: '/reminders', name: 'Reminders', component: Reminders },
  { path: '/english', name: 'English', component: English },
  { path: '/route/:id', name: 'RouteDetail', component: RouteDetail }
  , { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
