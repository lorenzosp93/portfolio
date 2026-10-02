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
      <div class="mt-3 flex flex-wrap items-center justify-between gap-2">
        <address class="not-italic">
          {{ created_by__fullname || created_by?.username }}
        </address>
        <button
          v-if="shareUrl"
          type="button"
          class="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-teal ring-1 ring-teal/30 transition hover:bg-teal/10 dark:text-tealSoft dark:ring-tealSoft/30"
          @click="share"
        >
          <check-icon v-if="copied" class="h-4 w-4" aria-hidden="true" />
          <share-icon v-else class="h-4 w-4" aria-hidden="true" />
          <span aria-live="polite">{{ copied ? "Link copied" : "Share" }}</span>
        </button>
        <a v-if="shareError && shareUrl" :href="shareUrl" class="text-sm text-teal underline dark:text-tealSoft">Open article link</a>
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
import { computed, ref, watch, onBeforeUnmount } from "vue";
import { CheckIcon, ShareIcon } from "@heroicons/vue/24/outline";
import { useTextUtils } from "@/composables/textUtils";
import { Attachment, CreatedBy } from "@/models/models.interface";
import DetailCard from "../UI/Card/DetailCard.vue";

const props = defineProps<{
  name: string;
  slug?: string;
  canonicalUrl?: string;
  created_at: Date | string | undefined;
  created_by: CreatedBy | undefined;
  location?: string;
  picture: string | null;
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
  props.canonicalUrl || (props.slug ? `${window.location.origin}/?post=${encodeURIComponent(props.slug)}` : null)
);

const copied = ref(false);
const shareError = ref(false);
let copyTimer: ReturnType<typeof setTimeout>;
let restoreMetadata: (() => void) | undefined;
function updateMetadata() {
  restoreMetadata?.();
  restoreMetadata = undefined;
  if (!props.isOpen) return;
  const title = document.title;
  document.title = `${props.name} — Lorenzo Spinelli`;
  const changes: (() => void)[] = [];
  function set(selector: string, tag: string, attributes: Record<string, string>) {
    const existing = document.head.querySelector<HTMLElement>(selector);
    const element = existing || document.createElement(tag);
    const original = existing?.outerHTML;
    Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
    if (!existing) document.head.appendChild(element);
    changes.push(() => { if (original) element.outerHTML = original; else element.remove(); });
  }
  const text = document.createElement('div');
  text.innerHTML = html_content.value;
  const description = (text.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 200);
  set('meta[name="description"]', 'meta', { name: 'description', content: description });
  set('meta[property="og:title"]', 'meta', { property: 'og:title', content: props.name });
  set('meta[property="og:description"]', 'meta', { property: 'og:description', content: description });
  set('meta[property="og:type"]', 'meta', { property: 'og:type', content: 'article' });
  if (shareUrl.value) set('meta[property="og:url"]', 'meta', { property: 'og:url', content: shareUrl.value });
  const image = props.picture || `${window.location.origin}/og-image.jpg`;
  set('meta[property="og:image"]', 'meta', { property: 'og:image', content: image });
  set('meta[name="twitter:title"]', 'meta', { name: 'twitter:title', content: props.name });
  set('meta[name="twitter:description"]', 'meta', { name: 'twitter:description', content: description });
  set('meta[name="twitter:image"]', 'meta', { name: 'twitter:image', content: image });
  if (shareUrl.value) set('link[rel="canonical"]', 'link', { rel: 'canonical', href: shareUrl.value });
  restoreMetadata = () => { document.title = title; changes.forEach(undo => undo()); };
}
watch(() => props.isOpen, updateMetadata, { immediate: true });
onBeforeUnmount(() => { clearTimeout(copyTimer); restoreMetadata?.(); });

async function share() {
  if (!shareUrl.value) return;
  try {
    if (navigator.share) {
      await navigator.share({ title: props.name, url: shareUrl.value });
      return;
    }
    await navigator.clipboard.writeText(shareUrl.value);
    shareError.value = false;
    copied.value = true;
    clearTimeout(copyTimer);
    copyTimer = setTimeout(() => (copied.value = false), 2000);
  } catch (error) {
    if ((error as DOMException).name !== "AbortError") shareError.value = true;
  }
}

function cardClosed() {
  emit("cardClosed");
}
</script>
