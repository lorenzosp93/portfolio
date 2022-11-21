import { createApp } from 'vue'
import App from './App.vue'
import './index.css'
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { Draggable } from "gsap/Draggable";


const myApp = createApp(App);

gsap.registerPlugin(ScrollTrigger, Draggable, ScrollSmoother);
myApp.config.globalProperties.$gsap = gsap;
myApp.config.globalProperties.$drag = Draggable;
myApp.config.globalProperties.$str = ScrollTrigger;
myApp.config.globalProperties.$ssm = ScrollTrigger;

myApp.mount('#app');
