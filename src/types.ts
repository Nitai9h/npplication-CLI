export interface PluginMetadata {
  name: string;
  id: string;
  version: string;
  description?: string;
  author?: string;
  time?: 'head' | 'body';
  type?: string;
  icon?: string;
  screen?: string;
  forced?: string;
  setting?: string;
  dependencies?: string;
  associations?: string;
  translates?: string;
  updateUrl?: string;
}

export interface CreatePluginOptions {
  name: string;
  description?: string;
  author?: string;
  type?: string;
  time?: 'head' | 'body';
  icon?: string;
  screen?: string;
  forced?: boolean;
  setting?: boolean;
  dependencies?: string;
  associations?: string;
  translates?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}
