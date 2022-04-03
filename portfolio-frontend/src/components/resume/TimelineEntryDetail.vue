<template>
  <Teleport to="body">
    <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"/>
  </Teleport>
</template>

<script>
export default {
  name: 'TimelineEntryDetail',
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
    attachments: Object
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
