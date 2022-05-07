<template>
  <li @click="openDetails" class="mx-3 my-5 z-2">
    <span v-if="!isFirst" class="absolute ring-4 ring-white dark:ring-gray-900 mt-5 -left-2">
      <div class="w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-600 shadow-sm"></div>
    </span>
    <div class="timeline-entry p-3 bg-white rounded-lg  shadow-md dark:bg-gray-700 dark:border-gray-600 hover:scale-102.5 transition duration-300 ease-in-out cursor-pointer">
      <div class="justify-between items-center mb-3 sm:flex">
        <p class="text-xs sm:text-sm font-normal text-gray-400 sm:order-last sm:mb-0">
        {{ start_date__date }} — {{ end_date__date }}
        </p>
        <p class="font-semibold text-gray-900 dark:text-gray-300">
          {{ name }}
        </p>
        <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-300">
          {{ location }}
        </p>
      </div>
      <div class="p-2 flex text-xs sm:text-sm font-normal text-ellipsis text-gray-500 bg-gray-50 rounded-lg shadow-sm  dark:bg-gray-900  dark:text-gray-300   after:content-['_⏎'] after:ml-auto after:mt-auto after:text-gray-400" v-html="truncatedDescription" />
    </div>
    <timeline-entry-detail v-if="isActive" v-bind="$props" :end_date__date="end_date__date" :start_date__date="start_date__date" @card-closed="closeDetails" :open="detailsVisible" />
  </li>
</template>

<script>
import TimelineEntryDetail from './TimelineEntryDetail.vue';
export default {
  name: 'TimelineEntry',
  components: {TimelineEntryDetail},
  data () {
    return {
      detailsVisible: false,
      justClosed: false,
    }
  },
  computed: {
    truncatedDescription () {
      return this.description.slice(0, this.truncationAmount()).replace(/<\/?[^>]+(>|$)/g, " ") + (this.truncationAmount() < this.description.length ? '... ' : ' ')
    },
    start_date__date () {
      let date = new Date(this.start_date);
      return date.toLocaleDateString(undefined, {year: 'numeric', month: 'short', day: 'numeric'})
    },
    end_date__date () {
      if (this.current) {return 'Present'}
      let date = new Date(this.end_date);
      return date.toLocaleDateString(undefined, {year: 'numeric', month: 'short', day: 'numeric'})
    },
  },
  inject: [
    'truncationAmount'
  ],
  methods: {
    openDetails () {
      if (!this.justClosed) {
        this.detailsVisible = true;
      }
    },
    closeDetails () {
      this.justClosed = true;
      this.detailsVisible = false;
      setTimeout(() => this.justClosed = false, 100);
    }
  },
  props: {
    name: {
      type: String,
      required: true
    },
    uuid: String,
    start_date: {
      type: String,
      required: true
    },
    current: Boolean,
    end_date: String,
    location: {
      type: String,
      required: true
    },
    department: {
      type: String,
      default: ''
    },
    description: String,
    key_achievements: {
      type: String,
      default: ''
    },
    entity: {
      type: Object,
      required: true
    },
    project: Array,
    keywords: Array,
    attachments: Object,
    isFirst: Boolean,
    isActive: Boolean,
  },
  beforeUnmount () {
  },
  mounted () {
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
