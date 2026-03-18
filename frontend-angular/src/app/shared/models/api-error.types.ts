export type APISource = 'google-books' | 'open-library' | 'local';

export interface APIError {
  message: string;
  source: APISource;
  statusCode?: number;
}
