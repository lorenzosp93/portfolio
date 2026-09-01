import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";

const backend = vi.hoisted(() => ({
  loadResumeEntries: vi.fn(),
  loadBlogEntries: vi.fn(),
  loadSkillCategory: vi.fn(),
}));
vi.mock("@/services/api.service", () => ({ default: backend }));

import { useBlogStore } from "./blog.store";
import { useExperienceStore, useSkillStore } from "./resume.store";
import type { BlogPost, Experience, SkillCategory } from "@/models/models.interface";

describe("content stores", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("groups loaded experience entries by entity", async () => {
    const entry = {
      uuid: "experience-one",
      entity: { uuid: "company", name: "Company", picture: "company.webp" },
    } as Experience;
    backend.loadResumeEntries.mockResolvedValue({
      data: { count: 1, next: null, results: [entry] },
    });
    const store = useExperienceStore();

    await store.getLimitOffsetEntries(5);

    expect(store.total).toBe(1);
    expect(store.results).toEqual([entry]);
    expect(store.entities).toEqual([
      expect.objectContaining({ uuid: "company", childs: [entry] }),
    ]);
  });

  it("exposes the total and posts returned by the blog endpoint", async () => {
    const post = { uuid: "post-one", name: "Post" } as BlogPost;
    backend.loadBlogEntries.mockResolvedValue({
      data: { count: 7, next: null, results: [post] },
    });
    const store = useBlogStore();

    await store.getBlogEntries(5);

    expect(store.posts).toEqual([post]);
    expect(store.total).toBe(7);
  });

  it("stores skill categories returned by the API", async () => {
    const categories: SkillCategory[] = [
      { name: "Languages", description: "", skills: [] },
    ];
    backend.loadSkillCategory.mockResolvedValue({ data: categories });
    const store = useSkillStore();

    await store.getEntries();

    expect(store.data).toEqual(categories);
  });
});
