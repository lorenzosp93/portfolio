<template>
  <resume-panel :dataLoaded="data.length > 0" :isLoading="isLoading" :ix="ix">
    <template v-slot:content>
  <ol v-if="data.length > 0" class="relative grid grid-flow-row grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mx-10 my-8">
    <skills-category class="hover:scale-102.5" v-for="category in data" :key="category.name" v-bind="category" :isActive="isActive"> </skills-category>
  </ol>
    </template>
  </resume-panel>
</template>

<script>
import ResumePanel from '../../UI/Panels/ResumePanel.vue';
import SkillsCategory from './SkillsCategory.vue';

export default {
  components: {
    SkillsCategory,
    ResumePanel
  },
  name: 'ResumeSkills',
  data () {
    return {
      data: [],
      isLoading: false,
      error: null
    }
  },
  props: [
    'isActive',
    'observer',
    'ix',
  ],
  inject: [
    'loadData'
  ],
  watch: {
    isActive (value) {
      if (value && !this.data.length && !this.isLoading) {
        this.isloading = true;
        this.loadEntries();
      }
    }
  },
  methods: {
    loadEntries () {
      let url = '/api/resume/skillcategory/';
      this.loadData(url, this);
    }
  },
  created () {
  },
  mounted() {
    this.observer.observe(this.$el);
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
