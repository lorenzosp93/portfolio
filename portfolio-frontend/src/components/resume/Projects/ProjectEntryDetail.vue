<template>
  <detail-card @card-closed='cardClosed' :isOpen="isOpen">
    <template v-slot:title>
      {{ name }}
    </template>
    <template v-slot:extra-title-content>
      <p>
        {{ location }}
      </p>
    </template>
    <template v-slot:subtitle>
      <p>
        {{ status }}
      </p>
    </template>
    <template v-slot:inner-content>
      <div class="text-sm">
        <p v-html="content"/>
      </div>
    </template>
  </detail-card>
</template>

<script>
import DetailCard from '../../UI/Card/DetailCard.vue'

export default {
  components: {
    DetailCard,
  },
  name: 'ProjectEntryDetail',
  data () {
    return {
    }
  },
  props: [
    'name',
    'location',
    'picture',
    'content',
    'attachments',
    'status',
    'isOpen',
  ],
  emits: [
    'cardClosed'
  ],
  computed: {
    created_by__fullname () {
      return this.created_by?.firstname ?? '' + this.created_by?.lastname ?? ''
    },
    created_at_date () {
      let date = new Date(this.created_at)
      return date.toDateString()
    }
  },
  methods: {
    cardClosed () {
      this.$emit('cardClosed')
    },
  },
  mounted() {
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
