<template>
  <div class="border-2 m-auto rounded-lg border-gray-700 max-w-screen-lg bg-white dark:bg-gray-900">
    <div class="h-96  m-auto w-full animate-pulse" v-if="isLoading">
      <p>Loading...</p>
    </div>
    <div class="p-auto w-full " v-else-if="entries.length > 0">
      <div class="absolute -right-2 top-1/2">
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
    'observer'
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
