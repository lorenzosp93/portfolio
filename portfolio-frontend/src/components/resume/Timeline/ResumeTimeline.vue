<template>
  <resume-panel @load-entries="loadEntries(kind)" :ix="ix" :dataLoaded="data.length > 0" :isLoading="isLoading">
    <template v-slot:content>
      <ol v-if="data.length > 0" class="relative border-l border-gray-200 dark:border-gray-600 ml-5 py-1">
        <timeline-group v-for="entity in entities" :key="entity.uuid" :kind="kind" :groupKey="entity.uuid"
          :group="entity" :isActive="isActive" />
        <div v-if="data.length < total && !isLoading" @click="loadEntries(kind)"
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
import TimelineGroup from './TimelineGroup.vue';
import ResumePanel from '../../UI/Panels/ResumePanel.vue';

export default {
  components: {
    TimelineGroup,
    ResumePanel,
  },
  name: 'ResumeTimeline',
  data () {
    return {
      data: [],
      groups: {},
      entities: [],
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
    'loadData',
    'entriesLimit',
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
      let url = `/api/resume/${kind}/?limit=${this.entriesLimit()}&offset=${offset}`;
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
  computed: {
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
