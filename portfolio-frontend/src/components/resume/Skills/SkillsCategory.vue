<template>
  <div class="justify-start bg-gray-50 rounded-lg shadow-md  dark:bg-gray-600 dark:border-gray-500 dark:text-gray-300 z-1">
    <h3 class="items-center mx-3 pt-3 align-text-bottom text-lg font-semibold text-gray-900 dark:text-white">{{ name }}</h3>
    <p class="text-sm text-gray-700 dark:text-gray-200 mx-3 pb-3">
      {{ description }}
    </p>
    <ul class="pb-1">
      <skills-entry  v-for="skill in skills" :key="skill.name" v-bind="skill" :isActive="isActive"> </skills-entry>
    </ul>
  </div>
</template>

<script>
import SkillsEntry from './SkillsEntry.vue'
export default {
  name: 'SkillsCategory',
  components: {SkillsEntry},
  data () {
    return {
    }
  },
  computed: {
  },
  methods: {
  },
  props: ['name', 'description', 'skills', 'isActive'],
  mounted () {
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
