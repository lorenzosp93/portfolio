<template>
  <div @click="toggleDetails" class="snap-center m-5 container w-3/5 md:w-1/3 flex-none rounded-2xl border-1 border-gray-200 shadow-md dark:bg-gray-600 bg-white" :class="{'pointe-events-none': detailsVisible}">
    <img class="object-cover aspect-video w-full overflow-hidden rounded-t-2xl pb-1 border-b-2 border-gray-300" :src="picture" :alt="'Picture for ' + name">
    <div class="flex flex-wrap p-3 w-full text-lg text-black dark:text-white">
      <p class="text-xs w-full text-gray-400">
        {{ location }}
      </p>
      <h2 class="font-semibold w-full text-gray-900 dark:text-white">{{ name }}</h2>
      <p v-html:="truncatedContent" class="text-sm my-3 w-full text-ellipsis" />
    </div>
    <blog-entry-detail @card-closed="toggleDetails" v-if="detailsVisible" :name="name" :created_at="created_at" :created_by="created_by" :location="location" :picture="picture" :content="content" :attachments="attachments"/>
  </div>
</template>

<script>
import BlogEntryDetail from './BlogEntryDetail.vue'

export default {
  components: {BlogEntryDetail},
  name: 'BlogEntry',
  data () {
    return {
      detailsVisible: false,
    }
  },
  computed: {
    truncatedContent () {
      return this.content.slice(0, this.truncationAmount) + '...' 
    }
  },
  inject: [
    'truncationAmount'
  ],
  props: [
    'uuid', 
    'name',
    'created_at',
    'created_by',
    'location',
    'picture',
    'content',
    'attachments',
  ],
  methods: {
    toggleDetails () {
      this.detailsVisible = !this.detailsVisible;
    }
  },
  mounted() {
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
