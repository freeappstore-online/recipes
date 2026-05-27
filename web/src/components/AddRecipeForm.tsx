import { useState } from "react";
import type { Recipe, Category, Difficulty, Tag, Ingredient } from "../data/types";
import { CATEGORY_INFO, TAG_LABELS } from "../data/types";

const ALL_CATEGORIES: Category[] = ["breakfast", "lunch", "dinner", "dessert", "snack", "drink"];
const ALL_DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard"];
const ALL_TAGS: Tag[] = [
  "vegetarian", "vegan", "gluten-free", "quick", "dairy-free",
  "high-protein", "low-carb", "comfort-food", "healthy", "meal-prep",
];

interface AddRecipeFormProps {
  onSave: (recipe: Recipe) => void;
  onCancel: () => void;
}

export default function AddRecipeForm({ onSave, onCancel }: AddRecipeFormProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Category>("dinner");
  const [servings, setServings] = useState(4);
  const [prepTime, setPrepTime] = useState(15);
  const [cookTime, setCookTime] = useState(30);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { name: "", amount: 1, unit: "" },
  ]);
  const [steps, setSteps] = useState<string[]>([""]);
  const [tags, setTags] = useState<Set<Tag>>(new Set());

  const inputStyle = {
    background: "var(--panel)",
    border: "1px solid var(--line)",
    color: "var(--ink)",
  };

  const updateIngredient = (index: number, field: keyof Ingredient, value: string | number) => {
    setIngredients((prev) =>
      prev.map((ing, i) => (i === index ? { ...ing, [field]: value } : ing)),
    );
  };

  const removeIngredient = (index: number) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  const addIngredient = () => {
    setIngredients((prev) => [...prev, { name: "", amount: 1, unit: "" }]);
  };

  const updateStep = (index: number, value: string) => {
    setSteps((prev) => prev.map((s, i) => (i === index ? value : s)));
  };

  const removeStep = (index: number) => {
    setSteps((prev) => prev.filter((_, i) => i !== index));
  };

  const addStep = () => {
    setSteps((prev) => [...prev, ""]);
  };

  const toggleTag = (tag: Tag) => {
    setTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) {
        next.delete(tag);
      } else {
        next.add(tag);
      }
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const validIngredients = ingredients.filter((ing) => ing.name.trim());
    const validSteps = steps.filter((s) => s.trim());
    if (validIngredients.length === 0 || validSteps.length === 0) return;

    const recipe: Recipe = {
      id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: name.trim(),
      category,
      servings,
      prepTime,
      cookTime,
      difficulty,
      ingredients: validIngredients,
      steps: validSteps,
      tags: [...tags],
    };

    onSave(recipe);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold" style={{ color: "var(--ink)" }}>
          Add New Recipe
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="text-sm font-medium cursor-pointer"
          style={{ color: "var(--muted)", background: "none", border: "none" }}
        >
          Cancel
        </button>
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: "var(--ink)" }}>
          Recipe Name *
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Grandma's Chocolate Chip Cookies"
          className="w-full px-3 py-2 text-sm rounded-lg outline-none"
          style={inputStyle}
          required
        />
      </div>

      {/* Category + Difficulty row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: "var(--ink)" }}>
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="w-full px-3 py-2 text-sm rounded-lg"
            style={inputStyle}
          >
            {ALL_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORY_INFO[cat].emoji} {CATEGORY_INFO[cat].label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: "var(--ink)" }}>
            Difficulty
          </label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
            className="w-full px-3 py-2 text-sm rounded-lg"
            style={inputStyle}
          >
            {ALL_DIFFICULTIES.map((d) => (
              <option key={d} value={d}>
                {d.charAt(0).toUpperCase() + d.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Servings + Times */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: "var(--ink)" }}>
            Servings
          </label>
          <input
            type="number"
            value={servings}
            onChange={(e) => setServings(Math.max(1, Number(e.target.value)))}
            min={1}
            className="w-full px-3 py-2 text-sm rounded-lg outline-none"
            style={inputStyle}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: "var(--ink)" }}>
            Prep Time (min)
          </label>
          <input
            type="number"
            value={prepTime}
            onChange={(e) => setPrepTime(Math.max(0, Number(e.target.value)))}
            min={0}
            className="w-full px-3 py-2 text-sm rounded-lg outline-none"
            style={inputStyle}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: "var(--ink)" }}>
            Cook Time (min)
          </label>
          <input
            type="number"
            value={cookTime}
            onChange={(e) => setCookTime(Math.max(0, Number(e.target.value)))}
            min={0}
            className="w-full px-3 py-2 text-sm rounded-lg outline-none"
            style={inputStyle}
          />
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: "var(--ink)" }}>
          Tags
        </label>
        <div className="flex flex-wrap gap-1.5">
          {ALL_TAGS.map((tag) => {
            const active = tags.has(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className="text-xs px-2.5 py-1 rounded-full cursor-pointer"
                style={{
                  background: active ? "var(--accent)" : "var(--panel)",
                  border: `1px solid ${active ? "var(--accent)" : "var(--line)"}`,
                  color: active ? "#fff" : "var(--muted)",
                }}
              >
                {TAG_LABELS[tag]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Ingredients */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: "var(--ink)" }}>
          Ingredients *
        </label>
        <div className="space-y-2">
          {ingredients.map((ing, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                type="number"
                value={ing.amount}
                onChange={(e) => updateIngredient(i, "amount", Number(e.target.value))}
                step="0.25"
                min={0}
                className="w-20 px-2 py-1.5 text-sm rounded-lg outline-none"
                style={inputStyle}
                placeholder="Amt"
              />
              <input
                type="text"
                value={ing.unit}
                onChange={(e) => updateIngredient(i, "unit", e.target.value)}
                className="w-24 px-2 py-1.5 text-sm rounded-lg outline-none"
                style={inputStyle}
                placeholder="Unit"
              />
              <input
                type="text"
                value={ing.name}
                onChange={(e) => updateIngredient(i, "name", e.target.value)}
                className="flex-1 px-2 py-1.5 text-sm rounded-lg outline-none"
                style={inputStyle}
                placeholder="Ingredient name"
              />
              {ingredients.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeIngredient(i)}
                  className="w-7 h-7 flex items-center justify-center rounded-full cursor-pointer text-xs"
                  style={{ color: "var(--error)", background: "none", border: "1px solid var(--error)" }}
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addIngredient}
          className="mt-2 text-xs font-medium cursor-pointer"
          style={{ color: "var(--accent)", background: "none", border: "none" }}
        >
          + Add Ingredient
        </button>
      </div>

      {/* Steps */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: "var(--ink)" }}>
          Steps *
        </label>
        <div className="space-y-2">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span
                className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold mt-1.5"
                style={{ background: "var(--accent)", color: "#fff" }}
              >
                {i + 1}
              </span>
              <textarea
                value={step}
                onChange={(e) => updateStep(i, e.target.value)}
                className="flex-1 px-3 py-2 text-sm rounded-lg outline-none resize-none"
                style={inputStyle}
                rows={2}
                placeholder={`Step ${i + 1}...`}
              />
              {steps.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeStep(i)}
                  className="w-7 h-7 flex items-center justify-center rounded-full cursor-pointer text-xs mt-1.5"
                  style={{ color: "var(--error)", background: "none", border: "1px solid var(--error)" }}
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addStep}
          className="mt-2 text-xs font-medium cursor-pointer"
          style={{ color: "var(--accent)", background: "none", border: "none" }}
        >
          + Add Step
        </button>
      </div>

      {/* Submit */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="flex-1 py-2.5 text-sm font-semibold rounded-lg cursor-pointer"
          style={{ background: "var(--accent)", color: "#fff", border: "none" }}
        >
          Save Recipe
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 text-sm font-medium rounded-lg cursor-pointer"
          style={{ background: "var(--panel)", border: "1px solid var(--line)", color: "var(--ink)" }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
