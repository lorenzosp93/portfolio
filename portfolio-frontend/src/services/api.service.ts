import { type AxiosResponse } from "axios";
import { HttpClient } from "./http.client";
import type {
  LimitOffsetOptions,
  LimitOffsetResult,
  SkillCategory,
  BlogPost,
  ContactForm,
  SiteSettings,
} from "@/models/models.interface";

const API_URL: string = import.meta.env.VITE_APP_BACKEND_URL;

class ApiClient extends HttpClient {
  constructor() {
    super(API_URL);
  }
}

class BackendService extends ApiClient {
  async getLimitOffset<T>(
    resourceURL: string,
    options: LimitOffsetOptions
  ): Promise<AxiosResponse<LimitOffsetResult<T>>> {
    // DRF builds `next` from the Host the origin saw (the Tailscale funnel, not
    // the public domain), so keep only its path and query.
    if (options.overrideLink?.length) {
      const { pathname, search } = new URL(options.overrideLink, window.location.origin);
      return this.instance.get(`${pathname}${search}`);
    }
    return this.instance.get(`${resourceURL}?limit=${options.limit}`);
  }

  async loadResumeEntries<T>(
    kind: "experience" | "education" | "projects",
    options: LimitOffsetOptions
  ): Promise<AxiosResponse<LimitOffsetResult<T>>> {
    return this.getLimitOffset<T>(`/api/resume/${kind}/`, options);
  }

  async loadSkillCategory(): Promise<AxiosResponse<SkillCategory[]>> {
    return this.instance.get("/api/resume/skillcategory/");
  }

  async loadBlogEntries(
    options: LimitOffsetOptions
  ): Promise<AxiosResponse<LimitOffsetResult<BlogPost>>> {
    return this.getLimitOffset<BlogPost>(`/api/blog/post/`, options);
  }

  async loadBlogPostBySlug(
    slug: string
  ): Promise<AxiosResponse<LimitOffsetResult<BlogPost>>> {
    return this.instance.get("/api/blog/post/", { params: { slug, limit: 1 } });
  }

  async loadSiteSettings(): Promise<AxiosResponse<SiteSettings>> {
    return this.instance.get("/api/settings/1/");
  }

  async postSubscription(
    subscription: PushSubscriptionJSON
  ): Promise<AxiosResponse<LimitOffsetResult<BlogPost>>> {
    return this.instance.post(`/api/subscribe/`, subscription);
  }

  async postContactForm(form: ContactForm): Promise<AxiosResponse> {
    return this.instance.post("/api/contacts/", form);
  }
}

export default new BackendService();
