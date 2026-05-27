import { useState } from "react";
import type { DayOfWeek, MealPlan, MealSlot, Recipe } from "../data/types";
import { DAYS, DAY_LABELS, MEAL_SLOTS, MEAL_LABELS } from "../data/types";

interface MealPlannerProps {
  plan: MealPlan;
  allRecipes: Recipe[];
  onUpdatePlan: (plan: MealPlan) => void;
  onGenerateShoppingList: () => void;
}

export default function MealPlanner({
  plan,
  allRecipes,
  onUpdatePlan,
  onGenerateShoppingList,
}: MealPlannerProps) {
  const [assigningSlot, setAssigningSlot] = useState<{ day: DayOfWeek; slot: MealSlot } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const recipeMap = new Map(allRecipes.map((r) => [r.id, r]));

  const assignRecipe = (recipeId: string) => {
    if (!assigningSlot) return;
    const next = { ...plan };
    next[assigningSlot.day] = {
      ...next[assigningSlot.day],
      [assigningSlot.slot]: { recipeId },
    };
    onUpdatePlan(next);
    setAssigningSlot(null);
    setSearchQuery("");
  };

  const removeRecipe = (day: DayOfWeek, slot: MealSlot) => {
    const next = { ...plan };
    next[day] = { ...next[day], [slot]: null };
    onUpdatePlan(next);
  };

  const clearAll = () => {
    onUpdatePlan({
      mon: { breakfast: null, lunch: null, dinner: null },
      tue: { breakfast: null, lunch: null, dinner: null },
      wed: { breakfast: null, lunch: null, dinner: null },
      thu: { breakfast: null, lunch: null, dinner: null },
      fri: { breakfast: null, lunch: null, dinner: null },
      sat: { breakfast: null, lunch: null, dinner: null },
      sun: { breakfast: null, lunch: null, dinner: null },
    });
  };

  const filteredRecipes = allRecipes.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.category.includes(searchQuery.toLowerCase()),
  );

  const plannedCount = DAYS.reduce(
    (acc, day) => acc + MEAL_SLOTS.filter((slot) => plan[day][slot] !== null).length,
    0,
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold" style={{ color: "var(--ink)" }}>
            Meal Planner
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
            {plannedCount} meals planned this week
          </p>
        </div>
        <div className="flex gap-2">
          {plannedCount > 0 && (
            <>
              <button
                onClick={onGenerateShoppingList}
                className="text-xs font-medium px-3 py-1.5 rounded-lg cursor-pointer"
                style={{ background: "var(--accent)", color: "#fff", border: "none" }}
              >
                Generate Shopping List
              </button>
              <button
                onClick={clearAll}
                className="text-xs font-medium px-3 py-1.5 rounded-lg cursor-pointer"
                style={{ background: "none", border: "1px solid var(--error)", color: "var(--error)" }}
              >
                Clear All
              </button>
            </>
          )}
        </div>
      </div>

      {/* Weekly grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[640px]">
          {/* Header row */}
          <div className="grid grid-cols-8 gap-2 mb-2">
            <div />
            {DAYS.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-semibold py-2"
                style={{ color: "var(--ink)" }}
              >
                {DAY_LABELS[day]}
              </div>
            ))}
          </div>

          {/* Meal rows */}
          {MEAL_SLOTS.map((slot) => (
            <div key={slot} className="grid grid-cols-8 gap-2 mb-2">
              <div
                className="flex items-center text-xs font-semibold"
                style={{ color: "var(--muted)" }}
              >
                {MEAL_LABELS[slot]}
              </div>
              {DAYS.map((day) => {
                const entry = plan[day][slot];
                const recipe = entry ? recipeMap.get(entry.recipeId) : null;

                return (
                  <div
                    key={`${day}-${slot}`}
                    className="min-h-[60px] rounded-lg p-2 flex flex-col items-center justify-center cursor-pointer transition-colors"
                    style={{
                      background: recipe ? "var(--accent)" + "15" : "var(--panel)",
                      border: `1px solid ${recipe ? "var(--accent)" + "40" : "var(--line)"}`,
                    }}
                    onClick={() => {
                      if (recipe) {
                        removeRecipe(day, slot);
                      } else {
                        setAssigningSlot({ day, slot });
                      }
                    }}
                  >
                    {recipe ? (
                      <div className="text-center">
                        <p className="text-[10px] font-medium leading-tight" style={{ color: "var(--ink)" }}>
                          {recipe.name}
                        </p>
                        <p className="text-[9px] mt-0.5" style={{ color: "var(--muted)" }}>
                          tap to remove
                        </p>
                      </div>
                    ) : (
                      <span className="text-lg" style={{ color: "var(--line-strong)" }}>
                        +
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Recipe picker modal */}
      {assigningSlot && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div
            className="w-full max-w-md max-h-[70vh] rounded-xl overflow-hidden flex flex-col"
            style={{ background: "var(--paper)" }}
          >
            <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--line)" }}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold" style={{ color: "var(--ink)" }}>
                  {DAY_LABELS[assigningSlot.day]} - {MEAL_LABELS[assigningSlot.slot]}
                </h3>
                <button
                  onClick={() => {
                    setAssigningSlot(null);
                    setSearchQuery("");
                  }}
                  className="text-xs cursor-pointer"
                  style={{ color: "var(--muted)", background: "none", border: "none" }}
                >
                  Cancel
                </button>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search recipes..."
                className="w-full px-3 py-1.5 text-sm rounded-lg outline-none"
                style={{ background: "var(--panel)", border: "1px solid var(--line)", color: "var(--ink)" }}
                autoFocus
              />
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {filteredRecipes.map((r) => (
                <button
                  key={r.id}
                  onClick={() => assignRecipe(r.id)}
                  className="w-full text-left px-3 py-2 rounded-lg cursor-pointer mb-1 transition-colors"
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--ink)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--panel)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <p className="text-sm font-medium">{r.name}</p>
                  <p className="text-xs" style={{ color: "var(--muted)" }}>
                    {r.category} · {r.prepTime + r.cookTime}m · {r.servings} servings
                  </p>
                </button>
              ))}
              {filteredRecipes.length === 0 && (
                <p className="text-center text-sm py-4" style={{ color: "var(--muted)" }}>
                  No recipes found
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
