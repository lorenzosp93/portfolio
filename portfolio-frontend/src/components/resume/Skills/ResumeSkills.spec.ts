import { flushPromises, mount } from "@vue/test-utils";
import { reactive, ref } from "vue";
import { beforeEach, describe, expect, it, vi } from "vitest";

const skillStore = reactive({
  data: [],
  getEntries: vi.fn(),
});

vi.mock("@/stores/resume.store", () => ({
  useSkillStore: () => skillStore,
}));
vi.mock("@/composables/visibilityObserver", () => ({
  useVisibilityObserver: () => ({ isActive: ref(false) }),
}));
vi.mock("@/composables/breakpoint", () => ({
  useBreakpoints: () => ref("xl"),
}));

import ResumeSkills from "./ResumeSkills.vue";

const ResumePanelStub = {
  props: ["isLoading", "dataLoaded"],
  emits: ["loadEntries"],
  template: `
    <div>
      <button data-test="retry" @click="$emit('loadEntries')">Retry</button>
      <span data-test="loading">{{ isLoading }}</span>
      <slot name="content" />
    </div>
  `,
};

describe("ResumeSkills", () => {
  beforeEach(() => {
    skillStore.data = [];
    skillStore.getEntries.mockReset();
  });

  it("clears loading after a failure so the request can be retried", async () => {
    skillStore.getEntries
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce(undefined);
    const wrapper = mount(ResumeSkills, {
      props: { ix: "last" },
      global: {
        stubs: {
          ResumePanel: ResumePanelStub,
          SkillsCategory: true,
        },
      },
    });

    await wrapper.get('[data-test="retry"]').trigger("click");
    await flushPromises();
    expect(wrapper.get('[data-test="loading"]').text()).toBe("false");

    await wrapper.get('[data-test="retry"]').trigger("click");
    await flushPromises();

    expect(skillStore.getEntries).toHaveBeenCalledTimes(2);
  });
});
