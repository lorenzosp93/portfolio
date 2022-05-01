<template>
  <resume-panel :dataLoaded="data.length > 0" :ix="ix" :isLoading="isLoading">
    <template v-slot:content>
      <ol v-if="data.length > 0"
        class="relative grid grid-flow-row grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mx-10 my-8">
        <list-card type="project" class="mx-auto" v-for="project in data" :key="project.uuid" v-bind="project"
          :isActive="isActive" />
        <div v-if="data.length < total && !isLoading" @click="loadEntries"
          class="h-10 w-10 bg-gray-200 dark:bg-gray-600 shadow-md rounded-full mx-auto stroke-1 fill-gray-500 dark:fill-white animate-bounce cursor-pointer">
          <svg class="h-7 w-7 block m-auto pt-3.5" version="1.1" xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 1000 1000" xml:space="preserve">
            <g>
              <path
                d="M34.6,228.4L472,481c8.8,5.1,18.5,7.1,28,6.4c9.5,0.7,19.2-1.3,28-6.4l437.4-252.6c23.7-13.7,31.6-44.3,17.7-68.4c-13.9-24.1-44.4-32.5-68.1-18.8L500,380.9L84.9,141.2C61.2,127.5,30.8,136,16.9,160C2.9,184.1,10.9,214.7,34.6,228.4z" />
              <path
                d="M915.1,519L500,758.7L84.9,519c-23.7-13.7-54.2-5.2-68.1,18.8c-13.9,24.1-6,54.7,17.7,68.4L472,858.8c8.8,5.1,18.5,7.1,28,6.4c9.5,0.7,19.2-1.3,28-6.4l437.4-252.6c23.7-13.7,31.6-44.3,17.7-68.4C969.2,513.8,938.8,505.4,915.1,519z" />
            </g>
          </svg>
        </div>
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
      error: null,
      total: 0,
    }
  },
  props: [
    'isActive',
    'observer',
    'ix',
  ],
  inject: [
    'loadData',
    'entriesLimit',
  ],
  emits: [
    'loadComplete'
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
      let offset = this.data.length;
      let url = `/api/resume/projects/?limit=${this.entriesLimit()}&offset=${offset}`;
      this.loadData(url, this, true).then( () => {this.$emit('loadComplete')});
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
