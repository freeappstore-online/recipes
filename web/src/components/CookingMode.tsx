import { useState, useEffect, useCallback, useRef } from "react";
import type { Recipe } from "../data/types";

interface CookingModeProps {
  recipe: Recipe;
  onExit: () => void;
}

export default function CookingMode({ recipe, onExit }: CookingModeProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState<number | null>(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalSteps = recipe.steps.length;

  // Timer effect
  useEffect(() => {
    if (timerRunning && timerSeconds !== null && timerSeconds > 0) {
      intervalRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev === null || prev <= 1) {
            setTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timerRunning, timerSeconds]);

  // Alert when timer reaches zero
  useEffect(() => {
    if (timerSeconds === 0 && !timerRunning && intervalRef.current !== null) {
      // Timer just finished
    }
  }, [timerSeconds, timerRunning]);

  const goNext = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((s) => s + 1);
      setTimerSeconds(null);
      setTimerRunning(false);
    }
  }, [currentStep, totalSteps]);

  const goPrev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
      setTimerSeconds(null);
      setTimerRunning(false);
    }
  }, [currentStep]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "Escape") {
        onExit();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goNext, goPrev, onExit]);

  const startTimer = (minutes: number) => {
    setTimerSeconds(minutes * 60);
    setTimerRunning(true);
  };

  const formatTimer = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const step = recipe.steps[currentStep];

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: "var(--paper)" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: "1px solid var(--line)" }}
      >
        <button
          onClick={onExit}
          className="text-sm font-medium cursor-pointer"
          style={{ color: "var(--error)", background: "none", border: "none" }}
        >
          Exit Cooking
        </button>
        <span className="text-sm font-medium" style={{ color: "var(--ink)" }}>
          {recipe.name}
        </span>
        <span className="text-sm" style={{ color: "var(--muted)" }}>
          {currentStep + 1}/{totalSteps}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1" style={{ background: "var(--line)" }}>
        <div
          className="h-full transition-all duration-300"
          style={{
            background: "var(--accent)",
            width: `${((currentStep + 1) / totalSteps) * 100}%`,
          }}
        />
      </div>

      {/* Step content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <div className="max-w-lg w-full text-center">
          <div
            className="w-12 h-12 flex items-center justify-center rounded-full mx-auto mb-6 text-lg font-bold"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            {currentStep + 1}
          </div>

          <p className="cooking-step" style={{ color: "var(--ink)" }}>
            {step}
          </p>

          {/* Timer controls */}
          <div className="mt-8">
            {timerSeconds !== null && timerSeconds > 0 ? (
              <div className="flex flex-col items-center gap-3">
                <span
                  className="text-4xl font-bold tabular-nums"
                  style={{ color: timerSeconds <= 10 ? "var(--error)" : "var(--accent)" }}
                >
                  {formatTimer(timerSeconds)}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTimerRunning(!timerRunning)}
                    className="text-sm px-4 py-2 rounded-lg cursor-pointer"
                    style={{
                      background: timerRunning ? "var(--warning)" : "var(--accent)",
                      color: "#fff",
                      border: "none",
                    }}
                  >
                    {timerRunning ? "Pause" : "Resume"}
                  </button>
                  <button
                    onClick={() => {
                      setTimerSeconds(null);
                      setTimerRunning(false);
                    }}
                    className="text-sm px-4 py-2 rounded-lg cursor-pointer"
                    style={{
                      background: "var(--panel)",
                      border: "1px solid var(--line)",
                      color: "var(--ink)",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : timerSeconds === 0 ? (
              <div className="flex flex-col items-center gap-2">
                <span className="text-lg font-bold" style={{ color: "var(--success)" }}>
                  Timer done!
                </span>
                <button
                  onClick={() => setTimerSeconds(null)}
                  className="text-sm px-4 py-2 rounded-lg cursor-pointer"
                  style={{ background: "var(--panel)", border: "1px solid var(--line)", color: "var(--ink)" }}
                >
                  Dismiss
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap justify-center gap-2">
                <span className="text-xs self-center mr-1" style={{ color: "var(--muted)" }}>
                  Set timer:
                </span>
                {[1, 2, 3, 5, 10, 15, 20, 30].map((min) => (
                  <button
                    key={min}
                    onClick={() => startTimer(min)}
                    className="text-xs px-3 py-1.5 rounded-lg cursor-pointer"
                    style={{
                      background: "var(--panel)",
                      border: "1px solid var(--line)",
                      color: "var(--ink)",
                    }}
                  >
                    {min}m
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div
        className="flex items-center justify-between px-6 py-4"
        style={{ borderTop: "1px solid var(--line)" }}
      >
        <button
          onClick={goPrev}
          disabled={currentStep === 0}
          className="flex items-center gap-1 text-sm font-medium px-4 py-2 rounded-lg cursor-pointer"
          style={{
            background: "var(--panel)",
            border: "1px solid var(--line)",
            color: currentStep === 0 ? "var(--line-strong)" : "var(--ink)",
          }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Previous
        </button>

        {/* Step dots */}
        <div className="hidden sm:flex gap-1.5">
          {recipe.steps.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setCurrentStep(i);
                setTimerSeconds(null);
                setTimerRunning(false);
              }}
              className="w-2.5 h-2.5 rounded-full cursor-pointer"
              style={{
                background: i === currentStep ? "var(--accent)" : i < currentStep ? "var(--success)" : "var(--line)",
                border: "none",
              }}
              aria-label={`Go to step ${i + 1}`}
            />
          ))}
        </div>

        <button
          onClick={currentStep === totalSteps - 1 ? onExit : goNext}
          className="flex items-center gap-1 text-sm font-medium px-4 py-2 rounded-lg cursor-pointer"
          style={{
            background: currentStep === totalSteps - 1 ? "var(--success)" : "var(--accent)",
            color: "#fff",
            border: "none",
          }}
        >
          {currentStep === totalSteps - 1 ? "Finish" : "Next"}
          {currentStep < totalSteps - 1 && (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
