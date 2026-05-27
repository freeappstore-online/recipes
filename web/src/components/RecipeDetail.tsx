import { useState } from "react";
import type { Recipe } from "../data/types";
import { CATEGORY_INFO, TAG_LABELS } from "../data/types";
import { scaleIngredients, formatAmount, formatTime } from "../lib/recipeHelpers";

interface RecipeDetailProps {
  recipe: Recipe;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onBack: () => void;
  onStartCooking: (recipe: Recipe) => void;
}

export default function RecipeDetail({
  recipe,
  isFavorite,
  onToggleFavorite,
  onBack,
  onStartCooking,
}: RecipeDetailProps) {
  const [servings, setServings] = useState(recipe.servings);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());

  const scaledIngredients = scaleIngredients(recipe.ingredients, recipe.servings, servings);
  const catInfo = CATEGORY_INFO[recipe.category];
  const totalTime = recipe.prepTime + recipe.cookTime;

  const toggleIngredient = (index: number) => {
    setCheckedIngredients((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back + Favorite */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm font-medium cursor-pointer"
          style={{ color: "var(--accent)", background: "none", border: "none" }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <button
          onClick={() => onToggleFavorite(recipe.id)}
          className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg cursor-pointer"
          style={{
            background: isFavorite ? "var(--warning)" : "var(--panel)",
            border: `1px solid ${isFavorite ? "var(--warning)" : "var(--line)"}`,
            color: isFavorite ? "#fff" : "var(--ink)",
          }}
        >
          <svg className="w-4 h-4" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
          {isFavorite ? "Favorited" : "Favorite"}
        </button>
      </div>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-full"
            style={{ background: catInfo.color + "20", color: catInfo.color }}
          >
            {catInfo.emoji} {catInfo.label}
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{ background: "var(--panel)", border: "1px solid var(--line)", color: "var(--muted)" }}
          >
            {recipe.difficulty}
          </span>
        </div>
        <h1 className="text-2xl font-bold mb-3" style={{ color: "var(--ink)" }}>
          {recipe.name}
        </h1>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {recipe.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: "var(--line)", color: "var(--muted)" }}
            >
              {TAG_LABELS[tag]}
            </span>
          ))}
        </div>

        {/* Timing cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg p-3 text-center" style={{ background: "var(--panel)", border: "1px solid var(--line)" }}>
            <p className="text-xs" style={{ color: "var(--muted)" }}>Prep</p>
            <p className="text-sm font-bold" style={{ color: "var(--ink)" }}>{formatTime(recipe.prepTime)}</p>
          </div>
          <div className="rounded-lg p-3 text-center" style={{ background: "var(--panel)", border: "1px solid var(--line)" }}>
            <p className="text-xs" style={{ color: "var(--muted)" }}>Cook</p>
            <p className="text-sm font-bold" style={{ color: "var(--ink)" }}>{formatTime(recipe.cookTime)}</p>
          </div>
          <div className="rounded-lg p-3 text-center" style={{ background: "var(--panel)", border: "1px solid var(--line)" }}>
            <p className="text-xs" style={{ color: "var(--muted)" }}>Total</p>
            <p className="text-sm font-bold" style={{ color: "var(--ink)" }}>{formatTime(totalTime)}</p>
          </div>
        </div>
      </div>

      {/* Serving adjuster */}
      <div
        className="flex items-center justify-between px-4 py-3 rounded-lg mb-6"
        style={{ background: "var(--panel)", border: "1px solid var(--line)" }}
      >
        <span className="text-sm font-medium" style={{ color: "var(--ink)" }}>Servings</span>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setServings(Math.max(1, servings - 1))}
            disabled={servings <= 1}
            className="w-8 h-8 flex items-center justify-center rounded-full cursor-pointer text-sm font-bold"
            style={{
              background: "var(--paper)",
              border: "1px solid var(--line)",
              color: servings <= 1 ? "var(--line)" : "var(--ink)",
            }}
          >
            -
          </button>
          <span className="text-lg font-bold w-8 text-center" style={{ color: "var(--accent)" }}>
            {servings}
          </span>
          <button
            onClick={() => setServings(servings + 1)}
            className="w-8 h-8 flex items-center justify-center rounded-full cursor-pointer text-sm font-bold"
            style={{
              background: "var(--paper)",
              border: "1px solid var(--line)",
              color: "var(--ink)",
            }}
          >
            +
          </button>
        </div>
      </div>

      {/* Ingredients */}
      <div className="mb-6">
        <h2 className="text-lg font-bold mb-3" style={{ color: "var(--ink)" }}>
          Ingredients
        </h2>
        <div className="space-y-1.5">
          {scaledIngredients.map((ing, i) => (
            <label
              key={i}
              className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer"
              style={{
                background: checkedIngredients.has(i) ? "var(--panel)" : "transparent",
              }}
            >
              <input
                type="checkbox"
                checked={checkedIngredients.has(i)}
                onChange={() => toggleIngredient(i)}
                className="w-4 h-4 rounded accent-[var(--accent)]"
              />
              <span
                className="text-sm"
                style={{
                  color: checkedIngredients.has(i) ? "var(--muted)" : "var(--ink)",
                  textDecoration: checkedIngredients.has(i) ? "line-through" : "none",
                }}
              >
                <strong>{formatAmount(ing.amount)} {ing.unit}</strong> {ing.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold" style={{ color: "var(--ink)" }}>
            Instructions
          </h2>
          <button
            onClick={() => onStartCooking(recipe)}
            className="text-xs font-medium px-3 py-1.5 rounded-lg cursor-pointer"
            style={{
              background: "var(--accent)",
              color: "#fff",
              border: "none",
            }}
          >
            Start Cooking Mode
          </button>
        </div>
        <ol className="space-y-3">
          {recipe.steps.map((step, i) => (
            <li key={i} className="flex gap-3">
              <span
                className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold"
                style={{ background: "var(--accent)", color: "#fff" }}
              >
                {i + 1}
              </span>
              <p className="text-sm leading-relaxed pt-0.5" style={{ color: "var(--ink)" }}>
                {step}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
