<template>
  <detail-card @card-closed="cardClosed" :isOpen="isOpen">
    <template v-slot:title>
      {{ name }}
    </template>
    <template v-slot:extra-title-content>
      <p>
        {{ location ? location + " — " : ""
        }}<time :datetime="created_at_iso">{{ created_at__date }}</time>
        · {{ reading_minutes }} min read
      </p>
    </template>
    <template v-slot:subtitle>
      <div class="flex flex-wrap items-center justify-between gap-2">
        <address class="not-italic">
          {{ created_by__fullname || created_by?.username }}
        </address>
        <button
          v-if="shareUrl"
          type="button"
          class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium text-teal ring-1 ring-teal/30 transition hover:bg-teal/10 dark:text-tealSoft dark:ring-tealSoft/30"
          @click="share"
        >
          <check-icon v-if="copied" class="h-4 w-4" aria-hidden="true" />
          <share-icon v-else class="h-4 w-4" aria-hidden="true" />
          <span aria-live="polite">{{ copied ? "Link copied" : "Share" }}</span>
        </button>
      </div>
    </template>
    <template v-slot:inner-content>
      <div class="px-3 prose dark:prose-invert">
        <div v-html="html_content" />
      </div>
    </template>
  </detail-card>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { CheckIcon, ShareIcon } from "@heroicons/vue/24/outline";
import { useTextUtils } from "@/composables/textUtils";
import { Attachment, CreatedBy } from "@/models/models.interface";
import DetailCard from "../UI/Card/DetailCard.vue";

const props = defineProps<{
  name: string;
  slug?: string;
  created_at: Date | string | undefined;
  created_by: CreatedBy | undefined;
  location?: string;
  picture: string;
  content: string;
  attachments: Attachment[];
  isOpen: boolean;
}>();

const emit = defineEmits(["cardClosed"]);

const { html_content, created_at__date, created_by__fullname, reading_minutes } =
  useTextUtils(props);

const created_at_iso = computed(() =>
  props.created_at ? new Date(props.created_at).toISOString() : undefined
);

const shareUrl = computed(() =>
  props.slug ? `${window.location.origin}/?post=${encodeURIComponent(props.slug)}` : null
);

const copied = ref(false);

async function share() {
  if (!shareUrl.value) return;
  try {
    if (navigator.share) {
      await navigator.share({ title: props.name, url: shareUrl.value });
      return;
    }
    await navigator.clipboard.writeText(shareUrl.value);
    copied.value = true;
    window.setTimeout(() => (copied.value = false), 2000);
  } catch {
    // The user dismissed the share sheet or clipboard access was denied.
  }
}

function cardClosed() {
  emit("cardClosed");
}
</script>
