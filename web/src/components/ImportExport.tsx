import { useState, useRef } from "react";
import type { Recipe } from "../data/types";
import { exportRecipesJSON, parseImportedRecipes } from "../lib/recipeHelpers";

interface ImportExportProps {
  customRecipes: Recipe[];
  allRecipes: Recipe[];
  onImport: (recipes: Recipe[]) => void;
  onClose: () => void;
}

export default function ImportExport({
  customRecipes,
  allRecipes,
  onImport,
  onClose,
}: ImportExportProps) {
  const [importText, setImportText] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleExportCustom = () => {
    const json = exportRecipesJSON(customRecipes);
    downloadJSON(json, "my-recipes.json");
  };

  const handleExportAll = () => {
    const json = exportRecipesJSON(allRecipes);
    downloadJSON(json, "all-recipes.json");
  };

  const downloadJSON = (json: string, filename: string) => {
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportText = () => {
    setError("");
    setSuccess("");
    const recipes = parseImportedRecipes(importText);
    if (!recipes) {
      setError("Invalid JSON format. Expecting an array of recipe objects.");
      return;
    }
    onImport(recipes);
    setSuccess(`Imported ${recipes.length} recipe(s) successfully!`);
    setImportText("");
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      setError("");
      setSuccess("");
      const recipes = parseImportedRecipes(text);
      if (!recipes) {
        setError("Invalid JSON file. Expecting an array of recipe objects.");
        return;
      }
      onImport(recipes);
      setSuccess(`Imported ${recipes.length} recipe(s) from file!`);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div
        className="w-full max-w-lg rounded-xl overflow-hidden"
        style={{ background: "var(--paper)" }}
      >
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--line)" }}>
          <h3 className="text-base font-bold" style={{ color: "var(--ink)" }}>
            Import / Export Recipes
          </h3>
          <button
            onClick={onClose}
            className="text-sm cursor-pointer"
            style={{ color: "var(--muted)", background: "none", border: "none" }}
          >
            Close
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Export section */}
          <div>
            <h4 className="text-sm font-semibold mb-2" style={{ color: "var(--ink)" }}>Export</h4>
            <div className="flex gap-2">
              <button
                onClick={handleExportAll}
                className="text-xs px-3 py-2 rounded-lg cursor-pointer"
                style={{ background: "var(--accent)", color: "#fff", border: "none" }}
              >
                Export All ({allRecipes.length})
              </button>
              {customRecipes.length > 0 && (
                <button
                  onClick={handleExportCustom}
                  className="text-xs px-3 py-2 rounded-lg cursor-pointer"
                  style={{ background: "var(--panel)", border: "1px solid var(--line)", color: "var(--ink)" }}
                >
                  Export Custom Only ({customRecipes.length})
                </button>
              )}
            </div>
          </div>

          {/* Import section */}
          <div>
            <h4 className="text-sm font-semibold mb-2" style={{ color: "var(--ink)" }}>Import</h4>

            {/* File import */}
            <input
              ref={fileRef}
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className="hidden"
            />
            <button
              onClick={() => fileRef.current?.click()}
              className="text-xs px-3 py-2 rounded-lg cursor-pointer mb-3"
              style={{ background: "var(--panel)", border: "1px solid var(--line)", color: "var(--ink)" }}
            >
              Choose JSON File
            </button>

            {/* Paste import */}
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="Or paste JSON here..."
              className="w-full px-3 py-2 text-xs rounded-lg outline-none resize-none font-mono"
              style={{ background: "var(--panel)", border: "1px solid var(--line)", color: "var(--ink)" }}
              rows={4}
            />
            <button
              onClick={handleImportText}
              disabled={!importText.trim()}
              className="mt-2 text-xs px-3 py-2 rounded-lg cursor-pointer"
              style={{
                background: importText.trim() ? "var(--accent)" : "var(--panel)",
                color: importText.trim() ? "#fff" : "var(--muted)",
                border: "none",
              }}
            >
              Import from Text
            </button>
          </div>

          {/* Feedback */}
          {error && (
            <p className="text-xs" style={{ color: "var(--error)" }}>{error}</p>
          )}
          {success && (
            <p className="text-xs" style={{ color: "var(--success)" }}>{success}</p>
          )}
        </div>
      </div>
    </div>
  );
}
