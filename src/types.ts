export interface Message {
  role: 'user' | 'model' | 'system';
  content: string;
}

export interface Scenario {
  id: string;
  title: string;
  titleZh: string;
  description: string;
  icon: string;
}

export interface FavoriteSentence {
  id: string;
  original: string;
  polished?: string;
  translation: string;
  timestamp: number;
}
