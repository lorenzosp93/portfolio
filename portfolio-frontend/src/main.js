import { createApp } from 'vue'
import App from './App.vue'
import './index.css'
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Draggable } from "gsap/Draggable";


const myApp = createApp(App);

gsap.registerPlugin(ScrollTrigger, Draggable);
myApp.config.globalProperties.$gsap = gsap;
myApp.config.globalProperties.$drag = Draggable;

myApp.mount('#app');
