import type { Ingredient, MealPlan, Recipe, ShoppingItem } from "../data/types";
import { DAYS, MEAL_SLOTS } from "../data/types";

/** Scale ingredients by a serving multiplier */
export function scaleIngredients(
  ingredients: Ingredient[],
  originalServings: number,
  targetServings: number,
): Ingredient[] {
  const factor = targetServings / originalServings;
  return ingredients.map((ing) => ({
    ...ing,
    amount: Math.round(ing.amount * factor * 100) / 100,
  }));
}

/** Format a number for display (e.g. 0.33 -> "1/3", 0.5 -> "1/2") */
export function formatAmount(amount: number): string {
  if (amount === 0) return "0";

  const whole = Math.floor(amount);
  const frac = amount - whole;

  const fractions: [number, string][] = [
    [0.125, "⅛"],
    [0.25, "¼"],
    [0.33, "⅓"],
    [0.5, "½"],
    [0.67, "⅔"],
    [0.75, "¾"],
  ];

  let fracStr = "";
  for (const [val, symbol] of fractions) {
    if (Math.abs(frac - val) < 0.05) {
      fracStr = symbol;
      break;
    }
  }

  if (fracStr) {
    return whole > 0 ? `${whole}${fracStr}` : fracStr;
  }
  // No matching fraction — just show the number
  if (Number.isInteger(amount)) return amount.toString();
  return amount.toFixed(amount < 1 ? 2 : 1);
}

/** Generate a shopping list from a meal plan */
export function generateShoppingList(
  plan: MealPlan,
  allRecipes: Recipe[],
): ShoppingItem[] {
  const recipeMap = new Map(allRecipes.map((r) => [r.id, r]));
  const aggregated = new Map<string, ShoppingItem>();

  for (const day of DAYS) {
    const dayPlan = plan[day];
    for (const slot of MEAL_SLOTS) {
      const entry = dayPlan[slot];
      if (!entry) continue;
      const recipe = recipeMap.get(entry.recipeId);
      if (!recipe) continue;

      for (const ing of recipe.ingredients) {
        const key = `${ing.name.toLowerCase()}|${ing.unit.toLowerCase()}`;
        const existing = aggregated.get(key);
        if (existing) {
          existing.amount += ing.amount;
        } else {
          aggregated.set(key, {
            name: ing.name,
            amount: ing.amount,
            unit: ing.unit,
            checked: false,
          });
        }
      }
    }
  }

  return [...aggregated.values()].sort((a, b) =>
    a.name.localeCompare(b.name),
  );
}

/** Format total time */
export function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

/** Export recipes as JSON blob */
export function exportRecipesJSON(recipes: Recipe[]): string {
  return JSON.stringify(recipes, null, 2);
}

/** Parse imported JSON, returning valid recipes or null */
export function parseImportedRecipes(json: string): Recipe[] | null {
  try {
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) return null;
    // Basic validation
    for (const r of parsed) {
      if (
        typeof r.id !== "string" ||
        typeof r.name !== "string" ||
        !Array.isArray(r.ingredients) ||
        !Array.isArray(r.steps)
      ) {
        return null;
      }
    }
    return parsed as Recipe[];
  } catch {
    return null;
  }
}
