<template>
  <div class="snap-start snap-always container lg:h-screen relative flex w-screen mx-auto flex-wrap">
    <div class="class container flex flex-wrap mx-auto my-10">
      <h2 class="w-full mt-auto text-center text-xl font-bold  text-gray-600 dark:text-white">
        Thoughts from the blog.
      </h2>
      <p class="w-full mb-auto text-center text-gray-600 dark:text-gray-300">
        Who needs MySpace when you can create your own blog and write whatever comes to mind on it, right?
      </p>
    </div>
    <div class="p-auto container relative w-screen flex overflow-x-scroll no-scrollbar snap-x snap-mandatory scrolling-touch m-auto">
      <blog-entry  v-for="post in posts" :key="post.uuid" v-bind="post" />
    </div>
  </div>
</template>

<script>
import BlogEntry from './BlogEntry.vue';

export default {
  components: {BlogEntry},
  name: 'TheBlog',
  data () {
    return {
      posts: [],
    }
  },
  watch: {
    isVisible (value) {
      if (value && this.posts.length == 0) {
        this.loadPosts();
      }
    }
  },
  props: [
    "isVisible",
    "observer",
    "elementsInView",
  ],
  inject: [
  ],
  computed: {
  },
  methods: {
    loadPosts () {
      this.error = null;
      this.isLoading = true;
      const url = '/api/blog/post/';
      fetch(url).then(
        response => {
          if (response.ok) {
            return response.json();
          }
        }
      ).then(
        data => {
          this.posts = data;
          this.isLoading = false;
        }
      ).catch(
        error => {
          this.isLoading = false;
          this.error = "Something went wrong when loading the data...";
          console.log(error);
          setTimeout(this.loadEntries(), 5000);
        }
      )
    }
  },
  mounted() {
    this.observer.observe(this.$el);
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
