import { defineStore } from "pinia";
import { useStorage, type RemovableRef } from "@vueuse/core";
import backendService from "@/services/api.service";
import {
  Experience,
  Education,
  Project,
  SkillCategory,
  ResumeTimeline,
} from "@/models/models.interface";
import { useResumeLimitOffset } from "@/composables/LimitOffset";
import { useGroupedData } from "@/composables/GroupedData";
import { type AxiosResponse } from "axios";
import { computed, ref } from "vue";

const TTL_MINUTES = 10080;

export const useExperienceStore = defineStore("experience", () => {
  const { data, getLimitOffsetEntries } = useResumeLimitOffset<Experience>(
    "experience",
    TTL_MINUTES
  );

  const results = computed(() => data.value.results);
  const total = computed(() => data.value.count);
  const { entities } = useGroupedData(results);

  return { entities, results, total, getLimitOffsetEntries };
});

export const useEducationStore = defineStore("education", () => {
  const { data, getLimitOffsetEntries } = useResumeLimitOffset<Education>(
    "education",
    TTL_MINUTES
  );
  const results = computed(() => data.value.results);
  const total = computed(() => data.value.count);
  const { entities } = useGroupedData(results);

  return { entities, results, total, getLimitOffsetEntries };
});

export const useProjectStore = defineStore("projects", () => {
  const { data, getLimitOffsetEntries } = useResumeLimitOffset<Project>(
    "projects",
    TTL_MINUTES
  );
  const projects = computed(() => data.value.results);
  const total = computed(() => data.value.count);

  return { projects, total, getLimitOffsetEntries };
});

export const useSkillStore = defineStore("skill", () => {
  const data: RemovableRef<SkillCategory[]> = useStorage("skill-data", []);

  async function getEntries() {
    return backendService
      .loadSkillCategory()
      .then((response: AxiosResponse<SkillCategory[]>) => {
        data.value = response.data;
      });
  }

  return { data, getEntries };
});


// One complete snapshot per visit; no persisted content or paginated geometry.
export const useTimelineStore = defineStore("resume-timeline", () => {
  const data = ref<ResumeTimeline | null>(null);
  const loading = ref(false);
  const error = ref("");
  let pending: Promise<void> | null = null;

  function load(): Promise<void> {
    if (pending) return pending;
    loading.value = true;
    error.value = "";
    pending = backendService.loadResumeTimeline()
      .then(response => { data.value = response.data; })
      .catch(() => { error.value = "The timeline couldn’t be loaded. Please try again."; })
      .finally(() => { loading.value = false; pending = null; });
    return pending;
  }
  return { data, loading, error, load };
});
