export type Category = "breakfast" | "lunch" | "dinner" | "dessert" | "snack" | "drink";

export type Difficulty = "easy" | "medium" | "hard";

export type Tag =
  | "vegetarian"
  | "vegan"
  | "gluten-free"
  | "quick"
  | "dairy-free"
  | "high-protein"
  | "low-carb"
  | "comfort-food"
  | "healthy"
  | "meal-prep";

export interface Ingredient {
  name: string;
  amount: number;
  unit: string;
}

export interface Recipe {
  id: string;
  name: string;
  category: Category;
  servings: number;
  prepTime: number; // minutes
  cookTime: number; // minutes
  difficulty: Difficulty;
  ingredients: Ingredient[];
  steps: string[];
  tags: Tag[];
}

export interface MealPlanEntry {
  recipeId: string;
}

export type MealSlot = "breakfast" | "lunch" | "dinner";
export type DayOfWeek = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export type MealPlan = Record<DayOfWeek, Record<MealSlot, MealPlanEntry | null>>;

export interface ShoppingItem {
  name: string;
  amount: number;
  unit: string;
  checked: boolean;
  isCustom?: boolean;
}

export const DAYS: DayOfWeek[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
export const DAY_LABELS: Record<DayOfWeek, string> = {
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
  sun: "Sun",
};

export const MEAL_SLOTS: MealSlot[] = ["breakfast", "lunch", "dinner"];
export const MEAL_LABELS: Record<MealSlot, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
};

export const CATEGORY_INFO: Record<Category, { label: string; emoji: string; color: string }> = {
  breakfast: { label: "Breakfast", emoji: "\u{1F373}", color: "#f59e0b" },
  lunch: { label: "Lunch", emoji: "\u{1F96A}", color: "#10b981" },
  dinner: { label: "Dinner", emoji: "\u{1F35D}", color: "#ef4444" },
  dessert: { label: "Dessert", emoji: "\u{1F370}", color: "#ec4899" },
  snack: { label: "Snack", emoji: "\u{1F95C}", color: "#8b5cf6" },
  drink: { label: "Drink", emoji: "\u{1F375}", color: "#06b6d4" },
};

export const TAG_LABELS: Record<Tag, string> = {
  vegetarian: "Vegetarian",
  vegan: "Vegan",
  "gluten-free": "Gluten-Free",
  quick: "Quick",
  "dairy-free": "Dairy-Free",
  "high-protein": "High Protein",
  "low-carb": "Low Carb",
  "comfort-food": "Comfort Food",
  healthy: "Healthy",
  "meal-prep": "Meal Prep",
};
