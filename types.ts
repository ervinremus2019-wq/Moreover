
export interface Note {
  id: string;
  title: string;
  content: string;
  folderId?: string;
  tags: string[];
  updatedAt: number;
  isFavorite: boolean;
  coverImage?: string;
}

export interface Folder {
  id: string;
  name: string;
  color: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
}

export interface SearchResult {
  title: string;
  uri: string;
}
