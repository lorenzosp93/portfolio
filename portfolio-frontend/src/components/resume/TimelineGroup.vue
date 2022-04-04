<template>
  <div class="m-6 justify-start bg-gray-50 rounded-lg border border-gray-200 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-300">
    <span class="flex absolute mt-5 -left-4 justify-center items-center w-8 h-8 bg-white rounded-full ring-1  ring-white dark:ring-gray-900 dark:bg-gray-900">
      <img class="object-contain rounded-full shadow-lg" :src="entityPicture" :alt="entityName + 'logo'"/>
    </span>
    <h3 class="m-5 flex items-center mb-1 text-lg font-semibold text-gray-900 dark:text-white">{{ entityName }}</h3>
    <div v-if="kind === 'experience'" >
      <timeline-entry v-for="(entry, ix) in group.experiences" :isFirst="ix === 0" :key="entry.uuid" v-bind="entry" />
    </div>
    <div v-else>
      <timeline-entry v-for="(entry, ix) in group.educations" :isFirst="ix === 0" :key="entry.uuid" v-bind="entry" />
    </div>
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
