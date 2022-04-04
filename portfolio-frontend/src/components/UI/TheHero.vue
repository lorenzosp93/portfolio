<template>
  <div class="flex flex-wrap m-5 snap-start snap-always justify-self-center text-black dark:text-white">
    
    <div class="flex-initial w-1/2 lg:w-1/3 m-auto" >
      <img class='m-auto ring-4 ring-white z-50 relative rounded-full' id="heroPicture" src="@/assets/hero.jpeg" :class="{'invisible': !isVisible}" alt="High res picture" @load="this.$emit('imageLoaded')">
      <h1 class="text-2xl m-5 font-bold text-center">Hi, I'm Lorenzo</h1>
    </div>
    <div></div>
    <div class="w-2/3 flex-initial lg:w-1/3 mt-5 m-auto">
      <h3 class="text-xl">About</h3>
      <div class="font-serif first-letter:text-2xl justify-between m-3 indent-5">
        <p v-if="!isLoading">{{ about }}</p>
        <p v-else>
          Loading...
        </p>
      </div>
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
    elementsInView: Array,
  },
  computed: {
    isVisible () {
      const e = this.elementsInView.filter(elem => elem.target.id == 'the-hero');
      if (e.length == 0) {return true}
      return !e.filter(elem => elem.intersectionRatio > 0)?.length == 0
    }
  },
  methods:{
  },
  mounted () {
    this.observer.observe(this.$el);
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
