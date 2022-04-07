<template>
  <div class="m-auto rounded-lg  max-w-screen-lg shadow-md bg-white dark:bg-gray-900">
    <div class="h-96  m-auto w-full" v-if="isLoading">
      <div class="animate-spin">
        <svg version="1.1" id="L9" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 100 100" enable-background="new 0 0 0 0" xml:space="preserve">
          <path fill="#fff" d="M73,50c0-12.7-10.3-23-23-23S27,37.3,27,50 M30.9,50c0-10.5,8.5-19.1,19.1-19.1S69.1,39.5,69.1,50" />
        </svg>
      </div>
    </div>
    <div class="relative p-auto w-full " v-else-if="entries.length > 0">
      <div class="absolute top-1/2" :class="{'-right-2.5': ix != 'last', '-left-2.5': ix != 'first'}">
        <div class="block w-10 h-1 rounded-lg  cursor-pointer bg-gray-300 rotate-90"/>
      </div>
      <ol class="relative border-l-2 border-gray-200 dark:border-gray-600 ml-5">
        <timeline-group
          v-for="group in entries"
          :key="group.uuid" :kind="kind" :groupKey="group.uuid" :group="group"
        />
      </ol>
    </div>
    <div class="h-96 w-32 m-auto" v-else-if="error || !isActive">
      <p>{{error}}</p>
      <a kind="button" @click.prevent="loadEntries(kind)">Try again!</a>
    </div>
    <div class="m-auto h-96 w-full" v-else>
      <p>No {{kind}}s found!</p>
    </div>
    
  </div>
</template>

<script>
import TimelineGroup from './TimelineGroup.vue';

export default {
  components: {
    TimelineGroup
  },
  name: 'ResumeTimeline',
  data () {
    return {
      entries: [],
      isLoading: false,
      error: null
    }
  },
  props: [
    'kind',
    'isActive',
    'observer',
    'ix',
  ],
  inject: [
  ],
  watch: {
    isActive (value) {
      if (value) {
        if (!this.entries.length)
        this.loadEntries(this.kind);
      }
    }
  },
  methods: {
    loadEntries (kind) {
      this.error = null;
      this.isLoading = true;
      const url = '/api/resume/entity-entries/' + kind + '/';
      fetch(url).then(
        response => {
          if (response.ok) {
            return response.json();
          }
        }
      ).then(
        data => {
          this.entries = data;
          this.isLoading = false;
        }
      ).catch(
        error => {
          this.isLoading = false;
          this.error = "Something went wrong when loading the data...";
          console.log(error);
          setTimeout(this.loadEntries(kind), 5000);
        }
      )
    },
  },
  created () {
  },
  mounted() {
    this.observer.observe(this.$el);
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
