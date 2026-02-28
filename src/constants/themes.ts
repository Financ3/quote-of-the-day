import { Category } from '../db/schema';

export interface CategoryTheme {
  gradient: [string, string, ...string[]];
  textColor: string;
  accentColor: string;
  label: string;
  icon: string;
}

export const THEMES: Record<Category | 'all', CategoryTheme> = {
  motivational: {
    gradient: ['#1a1a2e', '#16213e', '#0f3460'],
    textColor: '#e8d5b7',
    accentColor: '#f5a623',
    label: 'Motivational',
    icon: 'rocket',
  },
  demotivational: {
    gradient: ['#2d1b33', '#1a0a2e', '#0d0d1a'],
    textColor: '#c9b8d4',
    accentColor: '#9b59b6',
    label: 'Demotivational',
    icon: 'cloud-rain',
  },
  funny: {
    gradient: ['#1a3a1a', '#0d2b0d', '#1a4a1a'],
    textColor: '#d4e8b8',
    accentColor: '#7ed321',
    label: 'Funny',
    icon: 'smile',
  },
  fun_facts: {
    gradient: ['#1a2a3a', '#0d1b2e', '#0a2040'],
    textColor: '#b8d4e8',
    accentColor: '#4a90d9',
    label: 'Fun Facts',
    icon: 'book-open',
  },
  all: {
    gradient: ['#1a1a2e', '#16213e', '#0f3460'],
    textColor: '#e8e8e8',
    accentColor: '#ffffff',
    label: 'All Categories',
    icon: 'grid',
  },
};

export const CATEGORY_COLORS: Record<Category | 'all', string> = {
  motivational: '#f5a623',
  demotivational: '#9b59b6',
  funny: '#7ed321',
  fun_facts: '#4a90d9',
  all: '#ffffff',
};

export const WALLPAPER_WIDTH = 1080;
export const WALLPAPER_HEIGHT = 1920;
