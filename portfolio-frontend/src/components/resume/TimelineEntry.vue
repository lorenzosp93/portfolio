<template>
  <li @click="toggleDetails" class="mx-3 my-5 z-2" :class="{'pointer-events-none': detailsVisible}">
    <div v-if="!isFirst" class="absolute w-4 h-4 bg-gray-200 rounded-full mt-5 -left-2 border border-white dark:border-gray-900 dark:bg-gray-700"></div>
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
      <div class="p-2 flex text-sm font-normal text-gray-500 bg-gray-50 rounded-lg border border-gray-200 dark:bg-gray-900 dark:border-gray-500 dark:text-gray-300" v-html="truncatedDescription" />
    </div>
    <timeline-entry-detail v-bind="$props" @card-closed="toggleDetails" v-if="detailsVisible" />
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
  computed: {
    truncatedDescription () {
      return this.description.slice(0, this.truncationAmount) + '...'
    },
  },
  inject: [
    'truncationAmount'
  ],
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
  },
  mounted () {
    this.$lax.addElements(
      ['.timeline-entry'],
      {
        scrollY: {
          translateX: [
            ['elInY', 'elCenterY'],
            {
              500: [30, 0],
              900: [50, 0],
              1400: [70, 0],
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
