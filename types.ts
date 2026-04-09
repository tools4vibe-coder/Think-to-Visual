
export interface Scene {
  number: number;
  description: string;
  shotType: string;
  movement: string;
  lighting: string;
  tone: string;
  prompt: string;
  visualNotes: string;
}

export interface StoryboardResponse {
  characterProfile: string;
  scenes: Scene[];
}

export type AppStatus = 'idle' | 'unauthorized' | 'analyzing' | 'visualizing' | 'completed' | 'error';
