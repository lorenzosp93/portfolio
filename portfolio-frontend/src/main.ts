import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import "./index.css";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Draggable } from "gsap/Draggable";

const myApp = createApp(App);
const pinia = createPinia();

ScrollTrigger.config({
  ignoreMobileResize: true,
});
gsap.registerPlugin(ScrollTrigger, Draggable);
myApp.config.globalProperties.$gsap = gsap;
myApp.config.globalProperties.$drag = Draggable;
myApp.config.globalProperties.$str = ScrollTrigger;

myApp.use(pinia);
myApp.mount("#app");
