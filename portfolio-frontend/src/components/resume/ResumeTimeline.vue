<template>
  <div class="border-2 rounded border-grey-600  bg-white dark:bg-gray-900">
    <div class="h-96 m-5 animate-pulse" v-if="isLoading">
      <p>Loading...</p>
    </div>
    <div v-else-if="entries.length > 0">
      <ol class="relative border-l-2 border-grey-200 m-5">
        <timeline-group
          v-for="group in entries"
          :key="group.uuid" :kind="kind" :groupKey="group.uuid" :group="group"
        />
      </ol>
    </div>
    <div class="h-96 m-5 animate-ping" v-else-if="error || !isActive">
      <p>{{error}}</p>
      <a kind="button" @click.prevent="loadEntries(kind)">Try again!</a>
    </div>
    <div v-else>
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
  watch: {
    isActive (value) {
      if (value) {
        if (!this.entries.length)
        this.loadEntries(this.kind);
      }
    }
  },
  methods: {
    loadEntries(kind) {
      this.error = null;
      this.isLoading = true;
      const url = 'http://localhost:8000/resume/entity-entries/' + kind + '/';
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
        }
      )
    },
  },
  mounted() {
    this.observer.observe(this.$el);
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
