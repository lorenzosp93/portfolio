<template>
  <div class="bg-gray-100 dark:bg-gray-700 absolute">
    <the-hero v-if="!error && settings" :about="settings[0].about_text" :isLoading="isLoading" :error="error" :observer="observer" id='the-hero' />
    <the-navbar :isVisible="isNavbarVisible" id='the-navbar' :elementsInView="elementsInView">
    </the-navbar>
    <the-resume :observer="observer" :elementsInView="elementsInView" id="the-resume" />
  </div>
</template>

<script>
import TheNavbar from './components/UI/TheNavbar.vue'
import TheHero from './components/UI/TheHero.vue'
import TheResume from './components/resume/TheResume.vue'

export default {
  name: 'App',
  components: {
    TheNavbar,
    TheHero,
    TheResume
  },
  data () {
    return{
      settings: null,
      isLoading: false,
      error: null,
      observer: null,
      elementsInView: [],
    }
  },
  computed: {
    isNavbarVisible () {
      return !this.elementsInView.includes('the-hero')
    }
  },
  methods: {
    loadSettings () {
      this.error = null;
      this.isLoading = true;
      const url = 'http://localhost:8000/site/settings/';
      fetch(url).then(
        response => {
          if (response.ok) {
            return response.json();
          }
          console.log(response)
        }
      ).then(
        data => {
          this.settings = data;
          this.isLoading = false;
        }
      ).catch(
        error => {
          this.isLoading = false;
          this.error = "Something went wrong when loading the site settings...";
          console.log(error);
        }
      )
    },
    onElementObserved (entries) {
      const active = entries.filter(e => e.isIntersecting);
      if (active.length > 0) {
        this.elementsInView = [];
        active.forEach(
          elem => {
            this.elementsInView.push(elem.target.attributes.id.value);
          }
        )
      }
    }
  },
  created () {
    this.observer = new IntersectionObserver(
      this.onElementObserved,
      {
        threshold: [0.25, 0.75]
      }
    );
  },
  beforeUnmount () {
    this.observer.disconnect();
  },
  mounted () {
    this.loadSettings();
  }
}
</script>

<style>
#app {
  font-family: Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
