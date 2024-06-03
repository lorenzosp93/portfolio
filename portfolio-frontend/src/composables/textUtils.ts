import { CreatedBy } from "@/models/models.interface";
import { marked } from "marked";
import { computed } from "vue";
import markedKatex from "marked-katex-extension";

marked.use(markedKatex({ throwOnError: false }));

export function useTextUtils(props: {
  created_by?: CreatedBy;
  created_at?: string | Date;
  content: string;
}) {
  const created_by__fullname = computed(() => {
    if (props.created_by?.first_name || props.created_by?.last_name) {
      return `${props.created_by?.first_name} ${props.created_by?.last_name}`;
    }
  });

  const created_at__date = computed(() => {
    if (props.created_at) {
      let date = new Date(props.created_at);
      return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }
  });

  const html_content = computed(() => {
    return marked.parse(props.content);
  });
  return { html_content, created_at__date, created_by__fullname };
}
