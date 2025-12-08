import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './styles.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)
// Dynamically load Google reCAPTCHA script if site key is provided
try {
	const siteKey = (import.meta as any).env?.VITE_RECAPTCHA_SITEKEY
	if (siteKey) {
		const s = document.createElement('script')
		s.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`
		s.async = true
		document.head.appendChild(s)
		console.log('reCAPTCHA script injected')
	}
} catch (e) {
	// ignore in non-vite environments
}

app.mount('#app')
