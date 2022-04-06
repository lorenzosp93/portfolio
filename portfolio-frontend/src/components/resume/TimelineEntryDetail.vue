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
      <h3 class="text-xl font-semibold mb-3">Description:</h3>
      <p v-html="description" />
      <h3 class="text-xl font-semibold my-3" >Key Achievements:</h3>
      <p v-html="key_achievements" />
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
