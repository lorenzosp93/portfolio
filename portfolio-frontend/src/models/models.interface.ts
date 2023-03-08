export interface LimitOffsetOptions {
  overrideLink?: string;
  limit: number;
}

export interface ContactForm {
  first_name: string;
  last_name: string;
  email: string;
  content: string;
}

export interface Attachment {
  name: string;
  url: string;
}

export interface Entity {
  uuid: string;
  name: string;
  picture: string;
}

export interface Keyword {
  name: string;
}

export interface Experience {
  uuid: string;
  name: string;
  start_date: string;
  end_date: string;
  location: string;
  department: string;
  description: string;
  key_achievements: string;
  entity: Entity;
  projects: Project[];
  keywords: Keyword[];
  attachments: Attachment[];
  current: boolean;
}

export interface Education {
  uuid: string;
  name: string;
  start_date: string;
  end_date: string;
  location: string;
  description: string;
  entity: Entity;
  projects: Project[];
  keywords: Keyword[];
  attachments: Attachment[];
  current: boolean;
}

export interface Project {
  uuid: string;
  name: string;
  description: string;
  content: string;
  attachments: Attachment[];
  picture: string;
  status: string;
}

export interface Skill {
  name: string;
  category?: string;
  url: string;
  level: number;
}

export interface SkillCategory {
  name: string;
  description: string;
  skills: Skill[];
}

export interface CreatedBy {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
}

export interface BlogPost {
  uuid: string;
  name: string;
  created_at: Date | string;
  location: string;
  picture: string;
  content: string;
  attachments: Attachment[];
  created_by: CreatedBy;
}

export interface LimitOffsetResult<T> {
  count: number;
  next: string;
  previous?: string;
  results: T[];
}
