<template>
  <detail-card @card-closed="cardClosed" ref="detailCard" :isOpen="open">
    <template v-slot:title>
      {{ name }}
    </template>
    <template v-slot:extra-title-content>
      <time> {{ start_date__date }} — {{ end_date__date }} </time>
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
      <div class="px-3 pb-5 prose dark:prose-invert">
        <h3 v-if="description" class="mb-3">Description:</h3>
        <p v-html="parse(description ?? '')" />
        <h3 v-if="key_achievements" class="my-3">Key Achievements:</h3>
        <p v-html="parse(key_achievements)" />
        <h3 v-if="keywords && keywords.length > 0" class="my-3">Keywords:</h3>
        <div class="flex overflow-x-scroll overflow-y-hidden pb-1 no-scrollbar">
          <div
            class="rounded-lg shadow-md mx-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 whitespace-nowrap"
            v-for="keyword in keywords"
            :key="keyword.name"
          >
            {{ keyword.name }}
          </div>
        </div>
      </div>
    </template>
  </detail-card>
</template>

<script lang="ts">
import { marked } from "marked";
import DetailCard from "../../UI/Card/DetailCard.vue";
import { defineComponent } from "vue";
import { Keyword } from "@/models/models.interface";

export default defineComponent({
  name: "TimelineEntryDetail",
  components: {
    DetailCard,
  },
  emits: ["cardClosed"],
  methods: {
    cardClosed() {
      this.$emit("cardClosed");
    },
    parse(text: string) {
      return marked.parse(text);
    },
  },
  props: {
    name: {
      type: String,
      required: true,
    },
    uuid: String,
    start_date: {
      type: String,
      required: true,
    },
    current: Boolean,
    end_date: String,
    location: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      default: "",
    },
    description: String,
    key_achievements: {
      type: String,
      default: "",
    },
    entity: {
      type: Object,
      required: true,
    },
    project: Array,
    keywords: Array<Keyword>,
    attachments: Object,
    isFirst: Boolean,
    open: Boolean,
    isActive: Boolean,
    start_date__date: String,
    end_date__date: String,
  },
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
