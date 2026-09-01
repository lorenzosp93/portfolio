import { beforeEach, describe, expect, it, vi } from "vitest";

const backend = vi.hoisted(() => ({
  loadResumeEntries: vi.fn(),
  loadBlogEntries: vi.fn(),
}));

vi.mock("@/services/api.service", () => ({ default: backend }));

import { useBlogLimitOffset, useResumeLimitOffset } from "./LimitOffset";
import type { BlogPost, Experience } from "@/models/models.interface";

const experience = (uuid: string) =>
  ({ uuid, entity: { uuid: "entity", name: "Entity", picture: "" } }) as Experience;

const post = (uuid: string) => ({ uuid }) as BlogPost;

describe("limit/offset loading", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("loads and appends resume pages, then stops when next is null", async () => {
    backend.loadResumeEntries
      .mockResolvedValueOnce({
        data: { count: 2, next: "/api/resume/experience/?limit=1&offset=1", results: [experience("one")] },
      })
      .mockResolvedValueOnce({
        data: { count: 2, next: null, results: [experience("two")] },
      });
    const { data, getLimitOffsetEntries } = useResumeLimitOffset<Experience>(
      "experience",
      60
    );

    await getLimitOffsetEntries(1);
    await getLimitOffsetEntries(1);
    await getLimitOffsetEntries(1);

    expect(backend.loadResumeEntries).toHaveBeenNthCalledWith(1, "experience", {
      limit: 1,
      overrideLink: undefined,
    });
    expect(backend.loadResumeEntries).toHaveBeenNthCalledWith(2, "experience", {
      limit: 1,
      overrideLink: "/api/resume/experience/?limit=1&offset=1",
    });
    expect(backend.loadResumeEntries).toHaveBeenCalledTimes(2);
    expect(data.value.results.map(({ uuid }) => uuid)).toEqual(["one", "two"]);
    expect(data.value.count).toBe(2);
  });

  it("replaces expired cached results before loading", async () => {
    localStorage.setItem(
      "experience-data",
      JSON.stringify({ count: 1, next: null, results: [experience("stale")] })
    );
    localStorage.setItem("experience-expiry", String(Date.now() - 1));
    backend.loadResumeEntries.mockResolvedValue({
      data: { count: 1, next: null, results: [experience("fresh")] },
    });
    const { data, getLimitOffsetEntries } = useResumeLimitOffset<Experience>(
      "experience",
      60
    );

    await getLimitOffsetEntries(5);

    expect(data.value.results.map(({ uuid }) => uuid)).toEqual(["fresh"]);
  });

  it("uses an unexpired populated cache without requesting it again", async () => {
    localStorage.setItem(
      "experience-data",
      JSON.stringify({ count: 1, next: null, results: [experience("cached")] })
    );
    localStorage.setItem("experience-expiry", String(Date.now() + 60_000));
    const { data, getLimitOffsetEntries } = useResumeLimitOffset<Experience>(
      "experience",
      60
    );

    await getLimitOffsetEntries(5);

    expect(backend.loadResumeEntries).not.toHaveBeenCalled();
    expect(data.value.results[0].uuid).toBe("cached");
  });

  it("updates the blog total from the API response", async () => {
    backend.loadBlogEntries.mockResolvedValue({
      data: { count: 12, next: null, results: [post("post-one")] },
    });
    const { data, getLimitOffsetEntries } = useBlogLimitOffset("blog");

    await getLimitOffsetEntries(5, 60);

    expect(data.value.count).toBe(12);
    expect(data.value.results).toEqual([post("post-one")]);
  });
});
