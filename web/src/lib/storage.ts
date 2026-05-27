import type { MealPlan, Recipe, ShoppingItem } from "../data/types";

const KEYS = {
  customRecipes: "recipes-app-custom-recipes",
  favorites: "recipes-app-favorites",
  mealPlan: "recipes-app-meal-plan",
  shoppingList: "recipes-app-shopping-list",
} as const;

// ── Custom Recipes ───────────────────────────────────────────────

export function loadCustomRecipes(): Recipe[] {
  try {
    const raw = localStorage.getItem(KEYS.customRecipes);
    if (!raw) return [];
    return JSON.parse(raw) as Recipe[];
  } catch {
    return [];
  }
}

export function saveCustomRecipes(recipes: Recipe[]): void {
  localStorage.setItem(KEYS.customRecipes, JSON.stringify(recipes));
}

// ── Favorites ────────────────────────────────────────────────────

export function loadFavorites(): Set<string> {
  try {
    const raw = localStorage.getItem(KEYS.favorites);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

export function saveFavorites(favorites: Set<string>): void {
  localStorage.setItem(KEYS.favorites, JSON.stringify([...favorites]));
}

// ── Meal Plan ────────────────────────────────────────────────────

export function createEmptyMealPlan(): MealPlan {
  return {
    mon: { breakfast: null, lunch: null, dinner: null },
    tue: { breakfast: null, lunch: null, dinner: null },
    wed: { breakfast: null, lunch: null, dinner: null },
    thu: { breakfast: null, lunch: null, dinner: null },
    fri: { breakfast: null, lunch: null, dinner: null },
    sat: { breakfast: null, lunch: null, dinner: null },
    sun: { breakfast: null, lunch: null, dinner: null },
  };
}

export function loadMealPlan(): MealPlan {
  try {
    const raw = localStorage.getItem(KEYS.mealPlan);
    if (!raw) return createEmptyMealPlan();
    return JSON.parse(raw) as MealPlan;
  } catch {
    return createEmptyMealPlan();
  }
}

export function saveMealPlan(plan: MealPlan): void {
  localStorage.setItem(KEYS.mealPlan, JSON.stringify(plan));
}

// ── Shopping List ────────────────────────────────────────────────

export function loadShoppingList(): ShoppingItem[] {
  try {
    const raw = localStorage.getItem(KEYS.shoppingList);
    if (!raw) return [];
    return JSON.parse(raw) as ShoppingItem[];
  } catch {
    return [];
  }
}

export function saveShoppingList(items: ShoppingItem[]): void {
  localStorage.setItem(KEYS.shoppingList, JSON.stringify(items));
}
