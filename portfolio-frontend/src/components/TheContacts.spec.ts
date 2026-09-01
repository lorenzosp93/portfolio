import { flushPromises, mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

const backend = vi.hoisted(() => ({ postContactForm: vi.fn() }));
vi.mock("@/services/api.service", () => ({ default: backend }));
vi.mock("@/composables/visibilityObserver", () => ({
  useVisibilityObserver: vi.fn(),
}));

import TheContacts from "./TheContacts.vue";

const DetailCardStub = {
  props: ["isOpen"],
  template: `
    <div v-if="isOpen" data-test="detail-card">
      <slot name="title" />
      <slot name="subtitle" />
      <slot name="extra-title-content" />
      <slot name="inner-content" />
    </div>
  `,
};

async function openAndFillForm(wrapper: ReturnType<typeof mount>) {
  await wrapper.get('button[type="button"]').trigger("click");
  await wrapper.get("#first_name").setValue("Jane");
  await wrapper.get("#last_name").setValue("Doe");
  await wrapper.get("#email").setValue("jane@example.com");
  await wrapper.get("#content").setValue("Hello from the test suite");
}

describe("TheContacts", () => {
  beforeEach(() => {
    backend.postContactForm.mockReset();
  });

  it("keeps submission disabled until every field has a value", async () => {
    const wrapper = mount(TheContacts, {
      global: { stubs: { DetailCard: DetailCardStub } },
    });
    await wrapper.get('button[type="button"]').trigger("click");

    expect(wrapper.get('button[type="submit"]').attributes("disabled")).toBeDefined();

    await openAndFillForm(wrapper);

    expect(wrapper.get('button[type="submit"]').attributes("disabled")).toBeUndefined();
  });

  it("posts the form and resets it after success", async () => {
    backend.postContactForm.mockResolvedValue({});
    const wrapper = mount(TheContacts, {
      global: { stubs: { DetailCard: DetailCardStub } },
    });
    await openAndFillForm(wrapper);

    await wrapper.get('button[type="submit"]').trigger("click");
    await flushPromises();

    expect(backend.postContactForm).toHaveBeenCalledWith({
      first_name: "Jane",
      last_name: "Doe",
      email: "jane@example.com",
      content: "Hello from the test suite",
    });
    expect(wrapper.find('[data-test="detail-card"]').exists()).toBe(false);
  });

  it("shows field-level API errors and becomes retryable", async () => {
    backend.postContactForm.mockRejectedValue({
      data: {
        message: "Please check the form.",
        errors: { email: ["Enter a valid email address."] },
      },
    });
    const wrapper = mount(TheContacts, {
      global: { stubs: { DetailCard: DetailCardStub } },
    });
    await openAndFillForm(wrapper);

    await wrapper.get('button[type="submit"]').trigger("click");
    await flushPromises();

    expect(wrapper.text()).toContain(
      "Please check the form. email: Enter a valid email address."
    );
    expect(wrapper.get('button[type="submit"]').exists()).toBe(true);
  });
});
