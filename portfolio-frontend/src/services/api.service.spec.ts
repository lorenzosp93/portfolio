import { beforeEach, describe, expect, it, vi } from "vitest";

const axiosMock = vi.hoisted(() => {
  const requestUse = vi.fn();
  const responseUse = vi.fn();
  const instance = {
    get: vi.fn(),
    post: vi.fn(),
    interceptors: {
      request: { use: requestUse },
      response: { use: responseUse },
    },
  };
  return { create: vi.fn(() => instance), instance, requestUse, responseUse };
});

vi.mock("axios", () => ({ default: { create: axiosMock.create } }));

import backendService from "./api.service";
import { ApiError } from "./http.client";

const requestHandler = axiosMock.requestUse.mock.calls[0][0];
const errorHandler = axiosMock.responseUse.mock.calls[0][1];

describe("API services", () => {
  beforeEach(() => {
    axiosMock.instance.get.mockReset();
    axiosMock.instance.post.mockReset();
    document.cookie = "csrftoken=; Max-Age=0; path=/";
  });

  it("adds the CSRF cookie to request headers", () => {
    document.cookie = "csrftoken=csrf-value; path=/";
    const config = { headers: {} };

    expect(requestHandler(config)).toBe(config);
    expect(config.headers).toEqual({ "X-CSRFToken": "csrf-value" });
  });

  it("normalizes Axios failures into ApiError", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const responseData = { message: "Please check the form" };

    await expect(
      errorHandler({ response: { status: 400, data: responseData } })
    ).rejects.toEqual(
      expect.objectContaining<ApiError>({
        name: "ApiError",
        message: "Please check the form",
        status: 400,
        data: responseData,
      })
    );
  });

  it("uses a pagination override link verbatim", async () => {
    axiosMock.instance.get.mockResolvedValue({ data: {} });

    await backendService.loadResumeEntries("experience", {
      limit: 5,
      overrideLink: "/api/resume/experience/?limit=5&offset=5",
    });

    expect(axiosMock.instance.get).toHaveBeenCalledWith(
      "/api/resume/experience/?limit=5&offset=5"
    );
  });

  it("posts contact forms and push subscriptions to their public endpoints", async () => {
    axiosMock.instance.post.mockResolvedValue({ data: {} });
    const contact = {
      first_name: "Jane",
      last_name: "Doe",
      email: "jane@example.com",
      content: "Hello",
    };
    const subscription = { endpoint: "https://push.example/subscription" };

    await backendService.postContactForm(contact);
    await backendService.postSubscription(subscription);

    expect(axiosMock.instance.post).toHaveBeenNthCalledWith(1, "/api/contacts/", contact);
    expect(axiosMock.instance.post).toHaveBeenNthCalledWith(2, "/api/subscribe/", subscription);
  });
});
