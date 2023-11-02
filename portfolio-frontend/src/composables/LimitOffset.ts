import { useStorage, type RemovableRef } from "@vueuse/core";
import backendService from "@/services/api.service";
import { AxiosResponse } from "axios";
import type {
  BlogPost,
  Education,
  Experience,
  LimitOffsetResult,
  Project,
} from "@/models/models.interface";
import { cacheInvalidation } from "./utilities/cacheInvalidation";

function useExpiry(resource: string) {
  const expiry: RemovableRef<number> = useStorage(
    `${resource}-expiry`,
    Date.now()
  );

  function setExpiry(ttlInMinutes: number) {
    const exp = new Date();
    exp.setTime(exp.getTime() + ttlInMinutes * 1000 * 60);
    expiry.value = exp.valueOf();
  }
  return { expiry, setExpiry };
}

function useLimitOffset<T>(resource: string) {
  const data: RemovableRef<LimitOffsetResult<T>> = useStorage(
    `${resource}-data`,
    {
      count: 0,
      next: "",
      results: [],
    }
  );

  return { data };
}

type ResumeLimitOffsetType = Experience | Education | Project;

export function useResumeLimitOffset<T extends ResumeLimitOffsetType>(
  resource: "experience" | "education" | "projects",
  ttlInMinutes: number
) {
  const { data } = useLimitOffset<T>(resource);
  const { expiry, setExpiry } = useExpiry(resource);

  async function getLimitOffsetEntries(limit: number) {
    cacheInvalidation<T>(data, expiry);
    if (!data.value.results.length || data.value.next?.length) {
      return backendService
        .loadResumeEntries<T>(resource, {
          limit,
          overrideLink: data.value.next.length ? data.value.next : undefined,
        })
        .then((response: AxiosResponse<LimitOffsetResult<T>>) => {
          data.value.count = response.data.count;
          data.value.results = [
            ...data.value.results,
            ...response.data.results,
          ];
          data.value.next = response.data.next;
          setExpiry(ttlInMinutes);
        });
    }
  }

  return { data, getLimitOffsetEntries };
}

export function useBlogLimitOffset(resource: string) {
  const { data } = useLimitOffset<BlogPost>(resource);

  const { expiry, setExpiry } = useExpiry(resource);

  async function getLimitOffsetEntries(limit: number, ttlInMinutes: number) {
    cacheInvalidation(data, expiry);
    if (!data.value.results.length || data.value.next?.length)
      return backendService
        .loadBlogEntries({
          limit,
          overrideLink: data.value.next.length ? data.value.next : undefined,
        })
        .then((response: AxiosResponse<LimitOffsetResult<BlogPost>>) => {
          data.value.results = [
            ...data.value.results,
            ...response.data.results,
          ];
          data.value.next = response.data.next;
          setExpiry(ttlInMinutes);
        });
  }

  return { data, getLimitOffsetEntries };
}
