<template>
  <resume-panel :dataLoaded="data.length > 0" :ix="ix" :isLoading="isLoading">
    <template v-slot:content>
      <ol v-if="data.length > 0"
        class="relative grid grid-flow-row grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 py-3 px-8">
        <list-card type="project" class="mx-auto w-11/12" v-for="project in data" :key="project.uuid" v-bind="project"
          :isActive="isActive" />
      </ol>
    </template>
  </resume-panel>
</template>

<script>
import ListCard from '../../UI/Card/ListCard.vue';
import ResumePanel from '../../UI/Panels/ResumePanel.vue';

export default {
  components: {
    ListCard,
    ResumePanel
  },
  name: 'ResumeProjects',
  data () {
    return {
      data: [],
      isLoading: false,
      error: null
    }
  },
  props: [
    'isActive',
    'observer',
    'ix',
  ],
  inject: [
    'loadData'
  ],
  watch: {
    isActive (value) {
      if (value && !this.data.length && !this.isLoading) {
        this.isLoading = true;
        this.loadEntries(this.kind);
      }
    }
  },
  methods: {
    loadEntries () {
      let url = '/api/resume/projects/';
      this.loadData(url, this);
    }
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
