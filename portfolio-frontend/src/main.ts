import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import "./index.css";

const myApp = createApp(App);
const pinia = createPinia();

myApp.use(pinia);
myApp.mount("#app");
