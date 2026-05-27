import { useState, useMemo, useCallback } from "react";
import { builtInRecipes } from "./data";
import type {
  Recipe,
  Category,
  Difficulty,
  Tag,
  MealPlan,
  ShoppingItem,
} from "./data/types";
import {
  loadCustomRecipes,
  saveCustomRecipes,
  loadFavorites,
  saveFavorites,
  loadMealPlan,
  saveMealPlan,
  loadShoppingList,
  saveShoppingList,
} from "./lib/storage";
import { generateShoppingList } from "./lib/recipeHelpers";
import SearchBar from "./components/SearchBar";
import FilterBar from "./components/FilterBar";
import CategoryGrid from "./components/CategoryGrid";
import RecipeCard from "./components/RecipeCard";
import RecipeDetail from "./components/RecipeDetail";
import CookingMode from "./components/CookingMode";
import AddRecipeForm from "./components/AddRecipeForm";
import MealPlanner from "./components/MealPlanner";
import ShoppingList from "./components/ShoppingList";
import ImportExport from "./components/ImportExport";

type View =
  | { type: "home" }
  | { type: "browse"; category?: Category }
  | { type: "detail"; recipeId: string }
  | { type: "add-recipe" }
  | { type: "meal-planner" }
  | { type: "shopping-list" }
  | { type: "cooking"; recipe: Recipe };

type NavTab = "home" | "browse" | "planner" | "add";

export default function App() {
  // State
  const [customRecipes, setCustomRecipes] = useState<Recipe[]>(loadCustomRecipes);
  const [favorites, setFavorites] = useState<Set<string>>(loadFavorites);
  const [mealPlan, setMealPlan] = useState<MealPlan>(loadMealPlan);
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>(loadShoppingList);
  const [view, setView] = useState<View>({ type: "home" });
  const [search, setSearch] = useState("");
  const [showImportExport, setShowImportExport] = useState(false);

  // Filters
  const [filterCategory, setFilterCategory] = useState<Category | null>(null);
  const [filterTags, setFilterTags] = useState<Set<Tag>>(new Set());
  const [filterDifficulty, setFilterDifficulty] = useState<Difficulty | null>(null);
  const [filterMaxTime, setFilterMaxTime] = useState<number | null>(null);
  const [filterFavoritesOnly, setFilterFavoritesOnly] = useState(false);

  // All recipes combined
  const allRecipes = useMemo(
    () => [...builtInRecipes, ...customRecipes],
    [customRecipes],
  );

  // Filtered recipes (for browse view)
  const filteredRecipes = useMemo(() => {
    let results = allRecipes;

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      results = results.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.ingredients.some((ing) => ing.name.toLowerCase().includes(q)) ||
          r.tags.some((t) => t.includes(q)),
      );
    }

    // Category from browse view or filter
    const catFilter = view.type === "browse" && view.category ? view.category : filterCategory;
    if (catFilter) {
      results = results.filter((r) => r.category === catFilter);
    }

    // Tags
    if (filterTags.size > 0) {
      results = results.filter((r) =>
        [...filterTags].every((tag) => r.tags.includes(tag)),
      );
    }

    // Difficulty
    if (filterDifficulty) {
      results = results.filter((r) => r.difficulty === filterDifficulty);
    }

    // Max time
    if (filterMaxTime) {
      results = results.filter((r) => r.prepTime + r.cookTime <= filterMaxTime);
    }

    // Favorites
    if (filterFavoritesOnly) {
      results = results.filter((r) => favorites.has(r.id));
    }

    return results;
  }, [allRecipes, search, view, filterCategory, filterTags, filterDifficulty, filterMaxTime, filterFavoritesOnly, favorites]);

  // Handlers
  const toggleFavorite = useCallback(
    (id: string) => {
      setFavorites((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        saveFavorites(next);
        return next;
      });
    },
    [],
  );

  const handleSaveRecipe = useCallback(
    (recipe: Recipe) => {
      const next = [...customRecipes, recipe];
      setCustomRecipes(next);
      saveCustomRecipes(next);
      setView({ type: "detail", recipeId: recipe.id });
    },
    [customRecipes],
  );

  const handleUpdateMealPlan = useCallback((plan: MealPlan) => {
    setMealPlan(plan);
    saveMealPlan(plan);
  }, []);

  const handleUpdateShoppingList = useCallback((items: ShoppingItem[]) => {
    setShoppingItems(items);
    saveShoppingList(items);
  }, []);

  const handleGenerateShoppingList = useCallback(() => {
    const items = generateShoppingList(mealPlan, allRecipes);
    setShoppingItems(items);
    saveShoppingList(items);
    setView({ type: "shopping-list" });
  }, [mealPlan, allRecipes]);

  const handleImportRecipes = useCallback(
    (recipes: Recipe[]) => {
      // Give imported recipes new IDs to avoid collisions
      const imported = recipes.map((r) => ({
        ...r,
        id: `imported-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      }));
      const next = [...customRecipes, ...imported];
      setCustomRecipes(next);
      saveCustomRecipes(next);
    },
    [customRecipes],
  );

  const clearFilters = useCallback(() => {
    setFilterCategory(null);
    setFilterTags(new Set());
    setFilterDifficulty(null);
    setFilterMaxTime(null);
    setFilterFavoritesOnly(false);
  }, []);

  const handleTagToggle = useCallback((tag: Tag) => {
    setFilterTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) {
        next.delete(tag);
      } else {
        next.add(tag);
      }
      return next;
    });
  }, []);

  // Active recipe for detail view
  const activeRecipe = view.type === "detail"
    ? allRecipes.find((r) => r.id === view.recipeId)
    : null;

  // Nav tab helper
  const getActiveTab = (): NavTab => {
    if (view.type === "home") return "home";
    if (view.type === "browse" || view.type === "detail") return "browse";
    if (view.type === "meal-planner" || view.type === "shopping-list") return "planner";
    if (view.type === "add-recipe") return "add";
    return "home";
  };

  // Cooking mode is a full-screen overlay
  if (view.type === "cooking") {
    return (
      <CookingMode
        recipe={view.recipe}
        onExit={() => setView({ type: "detail", recipeId: view.recipe.id })}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen" style={{ background: "var(--paper)" }}>
      {/* Header */}
      <header
        className="shrink-0 flex items-center gap-3 px-4 py-3 lg:px-6"
        style={{ borderBottom: "1px solid var(--line)", background: "var(--glass)" }}
      >
        <button
          onClick={() => {
            setView({ type: "home" });
            setSearch("");
            clearFilters();
          }}
          className="text-lg font-bold cursor-pointer"
          style={{ color: "var(--ink)", background: "none", border: "none" }}
        >
          Recipe Book
        </button>
        <div className="flex-1 max-w-md ml-auto">
          <SearchBar
            value={search}
            onChange={(v) => {
              setSearch(v);
              if (v.trim() && view.type === "home") {
                setView({ type: "browse" });
              }
            }}
          />
        </div>
        <button
          onClick={() => setShowImportExport(true)}
          className="hidden sm:flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg cursor-pointer"
          style={{ background: "var(--panel)", border: "1px solid var(--line)", color: "var(--ink)" }}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Import/Export
        </button>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto px-4 py-5 lg:px-6">
        {/* ── Home View ── */}
        {view.type === "home" && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold" style={{ color: "var(--ink)" }}>
                Recipe Book & Meal Planner
              </h2>
              <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
                {allRecipes.length} recipes across 6 categories. Cook, plan, and shop.
              </p>
            </div>

            {/* Categories */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--ink)" }}>
                Browse by Category
              </h3>
              <CategoryGrid
                recipes={allRecipes}
                onSelectCategory={(cat) => setView({ type: "browse", category: cat })}
              />
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
              <button
                onClick={() => setView({ type: "browse" })}
                className="flex items-center gap-3 p-4 rounded-xl cursor-pointer text-left"
                style={{ background: "var(--panel)", border: "1px solid var(--line)" }}
              >
                <span className="text-2xl">&#128270;</span>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
                    All Recipes
                  </p>
                  <p className="text-xs" style={{ color: "var(--muted)" }}>
                    Search, filter & explore
                  </p>
                </div>
              </button>
              <button
                onClick={() => setView({ type: "meal-planner" })}
                className="flex items-center gap-3 p-4 rounded-xl cursor-pointer text-left"
                style={{ background: "var(--panel)", border: "1px solid var(--line)" }}
              >
                <span className="text-2xl">&#128197;</span>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
                    Meal Planner
                  </p>
                  <p className="text-xs" style={{ color: "var(--muted)" }}>
                    Plan your week
                  </p>
                </div>
              </button>
              <button
                onClick={() => setView({ type: "add-recipe" })}
                className="flex items-center gap-3 p-4 rounded-xl cursor-pointer text-left"
                style={{ background: "var(--panel)", border: "1px solid var(--line)" }}
              >
                <span className="text-2xl">&#10133;</span>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
                    Add Recipe
                  </p>
                  <p className="text-xs" style={{ color: "var(--muted)" }}>
                    Create your own
                  </p>
                </div>
              </button>
            </div>

            {/* Favorites preview */}
            {favorites.size > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
                    Your Favorites
                  </h3>
                  <button
                    onClick={() => {
                      setView({ type: "browse" });
                      setFilterFavoritesOnly(true);
                    }}
                    className="text-xs font-medium cursor-pointer"
                    style={{ color: "var(--accent)", background: "none", border: "none" }}
                  >
                    View all ({favorites.size})
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {allRecipes
                    .filter((r) => favorites.has(r.id))
                    .slice(0, 3)
                    .map((r) => (
                      <RecipeCard
                        key={r.id}
                        recipe={r}
                        isFavorite={true}
                        onToggleFavorite={toggleFavorite}
                        onSelect={(id) => setView({ type: "detail", recipeId: id })}
                      />
                    ))}
                </div>
              </div>
            )}

            {/* Recent / suggested */}
            <div>
              <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--ink)" }}>
                Quick & Easy
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {allRecipes
                  .filter((r) => r.tags.includes("quick") || r.prepTime + r.cookTime <= 20)
                  .slice(0, 6)
                  .map((r) => (
                    <RecipeCard
                      key={r.id}
                      recipe={r}
                      isFavorite={favorites.has(r.id)}
                      onToggleFavorite={toggleFavorite}
                      onSelect={(id) => setView({ type: "detail", recipeId: id })}
                    />
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Browse View ── */}
        {view.type === "browse" && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => {
                  setView({ type: "home" });
                  setSearch("");
                  clearFilters();
                }}
                className="flex items-center gap-1 text-sm font-medium cursor-pointer"
                style={{ color: "var(--accent)", background: "none", border: "none" }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Home
              </button>
              <span style={{ color: "var(--muted)" }}>/</span>
              <span className="text-sm font-medium" style={{ color: "var(--ink)" }}>
                {view.category
                  ? `${view.category.charAt(0).toUpperCase() + view.category.slice(1)} Recipes`
                  : "All Recipes"}
              </span>
            </div>

            <FilterBar
              selectedCategory={view.category ?? filterCategory}
              selectedTags={filterTags}
              selectedDifficulty={filterDifficulty}
              maxTime={filterMaxTime}
              showFavoritesOnly={filterFavoritesOnly}
              onCategoryChange={(cat) => {
                if (view.category) {
                  setView({ type: "browse", category: cat ?? undefined });
                } else {
                  setFilterCategory(cat);
                }
              }}
              onTagToggle={handleTagToggle}
              onDifficultyChange={setFilterDifficulty}
              onMaxTimeChange={setFilterMaxTime}
              onFavoritesToggle={() => setFilterFavoritesOnly(!filterFavoritesOnly)}
              onClearAll={() => {
                clearFilters();
                if (view.category) {
                  setView({ type: "browse" });
                }
              }}
            />

            <p className="text-xs my-3" style={{ color: "var(--muted)" }}>
              {filteredRecipes.length} recipe{filteredRecipes.length === 1 ? "" : "s"}
            </p>

            {filteredRecipes.length === 0 ? (
              <div className="text-center py-16 rounded-xl" style={{ background: "var(--panel)" }}>
                <p className="text-sm font-medium" style={{ color: "var(--ink)" }}>
                  No recipes match your filters
                </p>
                <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                  Try adjusting your search or filters
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredRecipes.map((r) => (
                  <RecipeCard
                    key={r.id}
                    recipe={r}
                    isFavorite={favorites.has(r.id)}
                    onToggleFavorite={toggleFavorite}
                    onSelect={(id) => setView({ type: "detail", recipeId: id })}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Detail View ── */}
        {view.type === "detail" && activeRecipe && (
          <RecipeDetail
            recipe={activeRecipe}
            isFavorite={favorites.has(activeRecipe.id)}
            onToggleFavorite={toggleFavorite}
            onBack={() => setView({ type: "browse" })}
            onStartCooking={(recipe) => setView({ type: "cooking", recipe })}
          />
        )}

        {/* ── Add Recipe ── */}
        {view.type === "add-recipe" && (
          <AddRecipeForm
            onSave={handleSaveRecipe}
            onCancel={() => setView({ type: "home" })}
          />
        )}

        {/* ── Meal Planner ── */}
        {view.type === "meal-planner" && (
          <div>
            <button
              onClick={() => setView({ type: "home" })}
              className="flex items-center gap-1 text-sm font-medium cursor-pointer mb-4"
              style={{ color: "var(--accent)", background: "none", border: "none" }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Home
            </button>
            <MealPlanner
              plan={mealPlan}
              allRecipes={allRecipes}
              onUpdatePlan={handleUpdateMealPlan}
              onGenerateShoppingList={handleGenerateShoppingList}
            />
          </div>
        )}

        {/* ── Shopping List ── */}
        {view.type === "shopping-list" && (
          <ShoppingList
            items={shoppingItems}
            onUpdateItems={handleUpdateShoppingList}
            onBack={() => setView({ type: "meal-planner" })}
          />
        )}
      </main>

      {/* Bottom navigation (mobile) */}
      <nav
        className="shrink-0 flex items-center justify-around px-2 py-2 sm:hidden"
        style={{ borderTop: "1px solid var(--line)", background: "var(--dock)" }}
      >
        {([
          { tab: "home" as NavTab, label: "Home", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
          { tab: "browse" as NavTab, label: "Browse", icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" },
          { tab: "planner" as NavTab, label: "Planner", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
          { tab: "add" as NavTab, label: "Add", icon: "M12 4v16m8-8H4" },
        ] as const).map(({ tab, label, icon }) => {
          const active = getActiveTab() === tab;
          return (
            <button
              key={tab}
              onClick={() => {
                if (tab === "home") { setView({ type: "home" }); setSearch(""); clearFilters(); }
                else if (tab === "browse") setView({ type: "browse" });
                else if (tab === "planner") setView({ type: "meal-planner" });
                else if (tab === "add") setView({ type: "add-recipe" });
              }}
              className="flex flex-col items-center gap-0.5 px-3 py-1 cursor-pointer"
              style={{ background: "none", border: "none", color: active ? "var(--accent)" : "var(--muted)" }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
              </svg>
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          );
        })}
      </nav>

      {/* Desktop footer */}
      <footer
        className="shrink-0 hidden sm:flex items-center justify-center px-4 py-2 text-xs"
        style={{ borderTop: "1px solid var(--line)", color: "var(--muted)" }}
      >
        Recipe Book — Free on FreeAppStore
      </footer>

      {/* Import/Export modal */}
      {showImportExport && (
        <ImportExport
          customRecipes={customRecipes}
          allRecipes={allRecipes}
          onImport={handleImportRecipes}
          onClose={() => setShowImportExport(false)}
        />
      )}
    </div>
  );
}
