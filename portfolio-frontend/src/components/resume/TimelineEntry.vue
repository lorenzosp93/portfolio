<template>
  <li class="mb-10 ml-6">
    <div v-if="!isFirst" class="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -left-2 border border-white dark:border-gray-900 dark:bg-gray-700"></div>

    <div class="p-4 bg-white rounded-lg border border-gray-200 shadow-sm dark:bg-gray-700 dark:border-gray-600">
      <div class="justify-between items-center mb-3 sm:flex">
        <time class="mb-1 text-xs font-normal text-gray-400 sm:order-last sm:mb-0">
        {{ start_date }} - {{ end_date ? end_date : current ? 'Present' : '' }}
        </time>
        <div class="text-sm font-normal text-gray-500 dark:text-gray-300">
          {{ name }}{{ department ? ' - ' + department : '' }}, {{ location }}
        </div>
      </div>
      <div class="p-3 text-xs italic font-normal text-gray-500 bg-gray-50 rounded-lg border border-gray-200 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-300">
        {{ description }}
      </div>
      <div class="mt-3">
        <a v-bind="$props" @click.prevent="toggleDetails">
          <div class="p-2 m-auto rounded-lg dark:bg-gray-800 bg-white">
            More Details
          </div>
        </a>
      </div>
    </div>
    <timeline-entry-detail v-if="detailsVisible" />
  </li>
</template>

<script>
import TimelineEntryDetail from './TimelineEntryDetail.vue';
export default {
  name: 'TimelineEntry',
  components: {TimelineEntryDetail},
  data () {
    return {
      detailsVisible: false
    }
  },
  methods: {
    toggleDetails () {
      this.detailsVisible = !this.detailsVisible;
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
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.container {
  border: 1em;
}
</style>
