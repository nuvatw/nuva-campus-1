export interface StoryLog {
  id: string;
  log_date: string;      // YYYY-MM-DD
  log_time: string;      // HH:mm:ss
  location: string;
  content: string;
  recorder: string;
  created_at: string;
  updated_at: string;
}

export interface StoryTemplate {
  id: string;
  name: string;
  location: string;
  content: string;
  recorder: string;
  created_at: string;
}

export interface CreateStoryLogInput {
  log_date: string;
  log_time: string;
  location: string;
  content: string;
  recorder: string;
}

export interface CreateTemplateInput {
  name: string;
  location: string;
  content: string;
  recorder: string;
}
