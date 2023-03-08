<template>
  <detail-card @card-closed="cardClosed" :isOpen="isOpen">
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
      <div class="px-3 prose dark:prose-invert">
        <p v-html="html_content" />
      </div>
    </template>
  </detail-card>
</template>

<script setup lang="ts">
import { useTextUtils } from "@/composables/textUtils";
import { Attachment } from "@/models/models.interface";
import DetailCard from "../../UI/Card/DetailCard.vue";

const props = defineProps<{
  name: string;
  location?: string;
  picture: string;
  content: string;
  attachments?: Attachment[];
  status?: string;
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
<style scoped></style>
