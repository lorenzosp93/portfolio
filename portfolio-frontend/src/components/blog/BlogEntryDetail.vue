<template>
  <detail-card @card-closed="cardClosed" :isOpen="isOpen">
    <template v-slot:title>
      {{ name }}
    </template>
    <template v-slot:extra-title-content>
      <p>
        {{ location ? location + " — " : ""
        }}<time>{{ created_at__date }}</time>
      </p>
    </template>
    <template v-slot:subtitle>
      <address>
        {{ created_by__fullname ?? created_by?.username }}
      </address>
    </template>
    <template v-slot:inner-content>
      <div class="px-3 prose dark:prose-invert">
        <div v-html="html_content" />
      </div>
    </template>
  </detail-card>
</template>

<script setup lang="ts">
import { useTextUtils } from "@/composables/textUtils";
import { Attachment, CreatedBy } from "@/models/models.interface";
import DetailCard from "../UI/Card/DetailCard.vue";

const props = defineProps<{
  name: string;
  created_at: Date | string | undefined;
  created_by: CreatedBy | undefined;
  location?: string;
  picture: string;
  content: string;
  attachments: Attachment[];
  isOpen: boolean;
}>();

const emit = defineEmits(["cardClosed"]);

const { html_content, created_at__date, created_by__fullname } =
  useTextUtils(props);

function cardClosed() {
  emit("cardClosed");
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
@import url("https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css");
</style>
