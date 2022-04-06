import { createApp } from 'vue'
import App from './App.vue'
import './index.css'
import lax from "lax.js";

const myApp = createApp(App);
myApp.config.globalProperties.$lax = lax;

myApp.mount('#app');
