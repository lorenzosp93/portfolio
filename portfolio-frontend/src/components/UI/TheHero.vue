<template>
  <div class="m-5 justify-self-center text-black dark:text-white">
    <img src="" alt="High res picture">
    <h1 class="font-bold">Hi, I'm Lorenzo</h1>
    <div class="h-96"></div>
    <h3>About</h3>
    <div class="font-serif justify-between m-3 indent-3">
      <p v-if="!isLoading">{{ about }}</p>
      <p v-else>
        Loading...
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TheHero',
  data () {
    return {}
  },
  props: {
    about: String,
    isLoading: Boolean,
    error: String,
    observer: Object,
  },
  mounted () {
    this.observer.observe(this.$el);
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
