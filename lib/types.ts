export interface Character {
  id: string;
  name: string;
  age: number;
  faction: string;
  lineage: string;
  primaryAbility: string;
  secondaryAbility: string;
  powerEfficiency: string;
  visualIndicators: string;
  heightRatio: number;
  outfitColors: string;
}

export interface Model {
  id: string;
  name: string;
  category: 'Characters' | 'Environments' | 'Props' | 'Vehicles';
  filePath: string;
  fileSize: number;
  polygonCount: number;
  isRigged: boolean;
  linkedCharacterId?: string;
}

export interface Book {
  id: string;
  number: number;
  title: string;
  order: number;
}

export interface Chapter {
  id: string;
  bookId: string;
  chapterNumber: number;
  title: string;
  content: string;
  status: 'draft' | 'in_review' | 'locked';
  order: number;
  wordCount: number;
  characterCount: number;
}

export interface Scene {
  id: string;
  bookId: string;
  chapterId: string;
  title: string;
  description: string;
  characterIds: string[];
  environmentId?: string;
  cameraShotType: string;
  dialogue: string;
  estimatedLength: number;
  status: 'scripted' | 'storyboarded' | 'previz' | 'animated' | 'rendered';
  order: number;
}

export type SceneStatus = Scene['status'];
export type ChapterStatus = Chapter['status'];
export type ModelCategory = Model['category'];
