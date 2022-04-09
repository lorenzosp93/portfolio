<template>
  <div class="m-6 justify-start bg-gray-50 rounded-lg shadow-md  dark:bg-gray-600 dark:border-gray-500 dark:text-gray-300 z-1">
    <span class="flex absolute mt-5 -left-4 justify-center items-center w-8 h-8 bg-white rounded-full ring-4 ring-white dark:ring-gray-900 dark:bg-gray-900">
      <img class="object-contain rounded-full shadow-lg" :src="entityPicture" :alt="entityName + 'logo'"/>
    </span>
    <h3 class="flex items-center mx-5 pt-5 align-text-bottom text-lg font-semibold text-gray-900 dark:text-white">{{ entityName }}</h3>
    <ol class="pb-1">
      <timeline-entry v-for="(entry, ix) in group[kind + 's']" :isFirst="ix === 0" :key="entry.uuid" v-bind="entry" />
    </ol>
  </div>
</template>

<script>
import TimelineEntry from './TimelineEntry.vue';
export default {
  name: 'TimelineGroup',
  components: {TimelineEntry},
  data () {
    return {
    }
  },
  computed: {
    entityName () {
      return this.group.name;
    },
    entityPicture () {
      return this.group.picture;
    },
  },
  methods: {
  },
  props: {
    groupKey: String,
    group: Object,
    kind: String,
  },
  mounted () {
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
