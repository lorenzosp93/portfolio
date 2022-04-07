<template>
  <detail-card @card-closed="cardClosed" ref="detailCard">
    <template v-slot:title>
      {{ name }}
    </template>
    <template v-slot:extra-title-content>
      {{ start_date }} - {{ current ? "Present" : end_date }}
    </template>
    <template v-slot:subtitle>
      <div class="flex flex-wrap my-auto">
        <div class="font-bold text-lg mr-auto">
          {{ entity.name }}
        </div>
        <div class="text-md">
          {{ department }}
        </div>
      </div>
    </template>
    <template v-slot:inner-content>
      <h3 v-if="description" class="text-xl font-semibold mb-3">Description:</h3>
      <p v-html="description" />
      <h3 v-if="key_achievements" class="text-xl font-semibold my-3" >Key Achievements:</h3>
      <p v-html="key_achievements" />
      <h3 v-if="keywords.length > 0" class="text-lg font-semibold my-3">Keywords:</h3>
      <div class="flex overflow-x-auto mb-3">
        <div class="rounded-md shadow-md mx-3 p-3 bg-gray-100 dark:bg-gray-700" v-for="keyword in keywords" :key="keyword.name">
          {{ keyword.name }}
        </div>
      </div>
    </template>
  </detail-card>
</template>

<script>
import DetailCard from '../UI/DetailCard.vue'

export default {
  name: 'TimelineEntryDetail',
  components: {
    DetailCard
  },
  emits: [
    'cardClosed'
  ],
  methods: {
    cardClosed () {
      this.$emit('cardClosed');
    }
  },
  mounted () {
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
</style>
