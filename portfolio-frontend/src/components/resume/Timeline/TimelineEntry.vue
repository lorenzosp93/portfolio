<template>
  <li @click="openDetails" class="mx-3 my-5 z-2">
      <span v-if="!isFirst" class="absolute ring-2 ring-white dark:ring-gray-900 mt-5 -left-2  dark:bg-gray-700">
        <div class="w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-900 shadow-sm"></div>
      </span>
      <div class="timeline-entry p-3 bg-white rounded-lg  shadow-md dark:bg-gray-700 dark:border-gray-600">
        <div class="justify-between items-center mb-3 sm:flex">
          <time class="mb-1 text-sm font-normal text-gray-400 sm:order-last sm:mb-0">
          {{ start_date }} - {{ end_date ? end_date : current ? 'Present' : '' }}
          </time>
          <div class="font-semibold text-gray-900 dark:text-gray-300">
            {{ name }}
          </div>
          <div class="text-sm text-gray-500 dark:text-gray-300">
            {{ department ? department + ', ' : '' }}{{ location }}
          </div>
        </div>
        <div class="p-2 flex text-sm font-normal text-ellipsis text-gray-500 bg-gray-50 rounded-lg border border-gray-200 dark:bg-gray-900 dark:border-gray-500 dark:text-gray-300" v-html="truncatedDescription" />
      </div>
    <timeline-entry-detail v-bind="$props" @card-closed="closeDetails" v-if="detailsVisible" />
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
      return this.description.slice(0, this.truncationAmount) + '...'
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
      setTimeout(() => this.justClosed = false, 1000);
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
  },
  mounted () {
    this.$lax.addElements(
      ['.timeline-entry'],
      {
        scrollY: {
          translateX: [
            ['elInY', 'elCenterY'],
            {
              500: [20, 0],
              900: [25, 0],
              1400: [50, 0],
            },
            {
              inertia: 10,
            }
          ],
          // scale: [
          //   []
          // ]
        }
      }
    )
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>