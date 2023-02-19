<template>
  <div class="py-3 px-5 flex">
    <p class="text-md text-black dark:text-white">
      {{ name }}
    </p>
    <div
      class="ml-auto w-1/2 rounded-md border border-black dark:border-white overflow-x-hidden"
    >
      <div
        class="py-3 h-full bg-gray-600 dark:bg-gray-300 origin-left -translate-x-10"
        :class="{ 'translate-x-0 ease-in duration-1000': loadAnimation }"
        :style="{ width: (level + 1) * 20 + '%' }"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "SkillsEntry",
  components: {},
  data() {
    return {
      loadAnimation: false,
    };
  },
  watch: {
    isActive(value) {
      if (value) {
        setTimeout(() => (this.loadAnimation = true), 300);
      } else {
        this.loadAnimation = false;
      }
    },
  },
  computed: {},
  methods: {},
  props: ["name", "category", "url", "level", "isActive"],
  mounted() {
    setTimeout(() => (this.loadAnimation = true), 500);
  },
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
