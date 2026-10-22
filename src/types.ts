export type CategoryType = 'all' | 'panini' | 'sandwich' | 'wrap' | 'sides_drinks';

export interface MenuItem {
  id: string;
  number: number;
  name: string;
  nameEn: string;
  nameIt?: string;
  category: 'panini' | 'sandwich' | 'wrap' | 'sides' | 'drinks';
  price: number;
  weight: number; // in grams
  image: string;
  ingredients: string[]; // with grams e.g. "Schiacciata 180g"
  ingredientsEn?: string[];
  ingredientsIt?: string[];
  description: string;
  descriptionEn: string;
  descriptionIt?: string;
  tags: string[];
  tagsIt?: string[];
  allergens?: string[];
  allergensIt?: string[];
  isPopular?: boolean;
  isSpicy?: boolean;
}

export interface CartItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  selectedExtras?: string[];
  removedIngredients?: string[];
  specialInstructions?: string;
  customSandwichDetails?: {
    bread: string;
    proteins: string[];
    cheeses: string[];
    veggies: string[];
    sauces: string[];
    totalWeight: number;
  };
}

export interface BuilderOption {
  id: string;
  name: string;
  nameEn: string;
  nameIt?: string;
  category: 'bread' | 'protein' | 'cheese' | 'veggies' | 'sauce';
  price: number;
  weight: number; // grams
  color: string;
  icon?: string;
}

export type Language = 'ro' | 'en' | 'it';

export interface BreadInventoryLog {
  id: string;
  timestamp: string;
  timeFormatted: string;
  type: 'online' | 'physical' | 'adjustment' | 'reset';
  quantity: number;
  note?: string;
  seller?: string;
}

export interface BreadInventoryState {
  date: string;
  dailyTarget: number;
  totalPhysicalSold: number;
  totalOnlineSold: number;
  remaining: number;
  isSoldOut: boolean;
  lastUpdated: string;
  logs: BreadInventoryLog[];
}
