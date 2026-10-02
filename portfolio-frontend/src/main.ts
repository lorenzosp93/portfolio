import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import "./index.css";
import { resetPortfolioMetadata } from "./composables/pageMetadata";
import { initTheme } from "./composables/theme";

initTheme();

if (window.location.pathname.startsWith("/writing/")) resetPortfolioMetadata();

const myApp = createApp(App);
const pinia = createPinia();

myApp.use(pinia);
myApp.mount("#app");
