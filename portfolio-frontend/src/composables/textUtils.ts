import { CreatedBy } from "@/models/models.interface";
import { computed, ref, watch } from "vue";
import { readingMinutes, renderMarkdown, renderRichMarkdown } from "./markdown";

export function useTextUtils(props: {
  created_by?: CreatedBy;
  created_at?: string | Date;
  content: string;
}) {
  const created_by__fullname = computed(() => {
    if (props.created_by?.first_name || props.created_by?.last_name) {
      return `${props.created_by?.first_name} ${props.created_by?.last_name}`;
    }
    return "";
  });

  const created_at__date = computed(() => {
    if (props.created_at) {
      const date = new Date(props.created_at);
      return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }
    return "";
  });

  // Render synchronously first; upgrade to KaTeX output if the text has math.
  const html_content = ref(renderMarkdown(props.content));
  watch(
    () => props.content,
    async (content) => {
      const rendered = await renderRichMarkdown(content);
      if (content === props.content) html_content.value = rendered;
    },
    { immediate: true }
  );

  const reading_minutes = computed(() => readingMinutes(props.content));

  return { html_content, created_at__date, created_by__fullname, reading_minutes };
}
