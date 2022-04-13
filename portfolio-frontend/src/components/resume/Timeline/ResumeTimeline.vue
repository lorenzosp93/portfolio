<template>
  <div class="m-auto mt-5 rounded-lg max-w-screen-lg shadow-md bg-white dark:bg-gray-900 py-1">
    <div class="relative p-auto w-full overflow-hidden">
      <div class="absolute top-1/2 -right-2.5 md:hidden" :class="{'hidden': ix == 'last'}">
        <div class="block w-10 h-1 rounded-lg  cursor-grab active:cursor-grabbing bg-gray-300 rotate-90"/>
      </div>
      <div class="absolute top-1/2 -left-2.5 md:hidden" :class="{'hidden': ix == 'first'}">
        <div class="block w-10 h-1 rounded-lg  cursor-grab active:cursor-grabbing bg-gray-300 rotate-90"/>
      </div>
      <ol v-if="data.length > 0" class="relative border-l border-gray-200 dark:border-gray-600 ml-5 py-1">
        <timeline-group
          v-for="entity in entities"
          :key="entity.uuid" :kind="kind" :groupKey="entity.uuid" :group="entity" :isActive="isActive"
        />
        <div v-if="data.length < total && !isLoading" @click="loadEntries(kind)" class="h-10 w-10 bg-gray-200 dark:bg-gray-600 shadow-md rounded-full mx-auto stroke-1 fill-gray-500 dark:fill-white animate-bounce">
          <svg class="h-7 w-7 block m-auto pt-3.5" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 1000 1000" xml:space="preserve">
          <g><path d="M34.6,228.4L472,481c8.8,5.1,18.5,7.1,28,6.4c9.5,0.7,19.2-1.3,28-6.4l437.4-252.6c23.7-13.7,31.6-44.3,17.7-68.4c-13.9-24.1-44.4-32.5-68.1-18.8L500,380.9L84.9,141.2C61.2,127.5,30.8,136,16.9,160C2.9,184.1,10.9,214.7,34.6,228.4z"/><path d="M915.1,519L500,758.7L84.9,519c-23.7-13.7-54.2-5.2-68.1,18.8c-13.9,24.1-6,54.7,17.7,68.4L472,858.8c8.8,5.1,18.5,7.1,28,6.4c9.5,0.7,19.2-1.3,28-6.4l437.4-252.6c23.7-13.7,31.6-44.3,17.7-68.4C969.2,513.8,938.8,505.4,915.1,519z"/></g>
          </svg>
        </div>
      </ol>
      <div class="p-10 m-auto" v-if="isLoading">
        <svg role="status" class="mx-auto w-10 h-10 text-gray-200 animate-spin dark:text-gray-400 fill-gray-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
        </svg>
      </div>
      <div v-else-if="!data.length" class="p-10 m-auto">
        <div @click="loadEntries(kind)"  class="rounded-3xl text-white p-3 bg-gray-300 dark:bg-gray-500">
          Unable to load, click to retry.
        </div>
      </div>
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
      data: [],
      groups: {},
      entities: [],
      limit: 3,
      isLoading: false,
      error: null,
      total: 0,
    }
  },
  props: [
    'kind',
    'isActive',
    'observer',
    'ix',
  ],
  inject: [
    'loadData'
  ],
  watch: {
    isActive (value) {
      if (value) {
        if (!this.data.length && !this.isLoading) {
          this.isLoading = true;
          this.loadEntries(this.kind);
        }
      }
    }
  },
  methods: {
    loadEntries (kind) {
      let offset = this.data.length;
      let url = `/api/resume/${kind}/?limit=${this.limit}&offset=${offset}`;
      this.loadData(url, this, true).then( () => {
        this.data.forEach(el => {
          el.entityId = el.entity.uuid;
        });
        this.groups = this.groupBy(this.data, 'entityId');
        let entities = Object.keys(this.groups);
        entities.forEach(en => {
          if (!this.entities.filter(old => { return old.uuid == en }).length) {
            this.entities.push(this.data.find(el => {
              return el.entityId == en;
            }).entity);
          }
        })
        this.entities.forEach(en => {
          en[this.kind] = this.groups[en.uuid];
        })
      });
      this.counter += 1;
    },
    groupBy (xs, key) {
      return xs.reduce((rv, x) => {
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
      }, {});
    },
  },
  created () {
  },
  beforeUnmount () {
    this.$lax.removeDriver('scrollYdiv');
  },
  mounted() {
    this.observer.observe(this.$el);
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
