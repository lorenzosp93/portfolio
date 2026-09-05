import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import "./index.css";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const myApp = createApp(App);
const pinia = createPinia();

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({
  ignoreMobileResize: true,
});
// Expose the registered instance for the browser-level animation regression tests.
myApp.config.globalProperties.$str = ScrollTrigger;
myApp.use(pinia);
myApp.mount("#app");
