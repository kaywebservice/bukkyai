import { useEffect, useMemo, useState } from "react";

export type TourStep = {
  target: string;
  title: string;
  body: string;
  align?: "below" | "above" | "left" | "right";
  prepare?: () => void;
};

export const TOUR_COUNT_KEY = "bukkyai.tour.count";
export const TOUR_OFF_KEY = "bukkyai.tour.off";
export const MAX_SHOWS = 3;

export function tourTurnedOff(): boolean {
  try {
    return localStorage.getItem(TOUR_OFF_KEY) === "1";
  } catch {
    return false;
  }
}

export function tourCount(): number {
  try {
    return Number(localStorage.getItem(TOUR_COUNT_KEY) || 0);
  } catch {
    return 0;
  }
}

export function tourCanShow(): boolean {
  return !tourTurnedOff() && tourCount() < MAX_SHOWS;
}

export function markTourShown(): void {
  try {
    localStorage.setItem(TOUR_COUNT_KEY, String(tourCount() + 1));
  } catch {}
}

export function turnOffTour(): void {
  try {
    localStorage.setItem(TOUR_OFF_KEY, "1");
  } catch {}
}

type Props = {
  active: boolean;
  steps: TourStep[];
  onClose: () => void;
  onTurnOff?: () => void;
};

export default function OnboardingTour(p: Props) {
  const [idx, setIdx] = useState(0);
  const [box, setBox] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  const step = p.steps[idx];

  useEffect(() => {
    if (p.active) setIdx(0);
  }, [p.active]);

  // Prepare the target (e.g. switch to its tab), then measure.
  useEffect(() => {
    if (!p.active || !step) return;
    step.prepare?.();
    const el = document.querySelector(step.target);
    const update = () => {
      const target = document.querySelector(step.target);
      if (!target) {
        setBox(null);
        return;
      }
      const r = target.getBoundingClientRect();
      setBox({ top: r.top + window.scrollY, left: r.left + window.scrollX, width: r.width, height: r.height });
    };
    void el;
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, { passive: true });
    const t = window.setTimeout(update, 120);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update);
      window.clearTimeout(t);
    };
  }, [p.active, step]);

  const tip = useMemo(() => {
    if (!box || !step) return null;
    const gap = 12;
    let top = 0;
    let left = box.left;
    if (step.align === "above") {
      top = box.top - gap;
    } else if (step.align === "left") {
      top = box.top + box.height / 2;
      left = box.left - gap;
    } else if (step.align === "right") {
      top = box.top + box.height / 2;
      left = box.left + box.width + gap;
    } else {
      top = box.top + box.height + gap;
    }
    return { top, left };
  }, [box, step]);

  if (!p.active || !step) return null;

  const total = p.steps.length;
  const onNext = () => {
    if (idx + 1 < total) setIdx(idx + 1);
    else p.onClose();
  };
  const onTurnOff = p.onTurnOff;

  return (
    <div className="tour-root">
      <div className="tour-shade" onClick={p.onClose} />
      {box && (
        <div
          className="tour-highlight"
          style={{
            top: box.top - 6,
            left: box.left - 6,
            width: box.width + 12,
            height: box.height + 12,
          }}
        />
      )}
      {tip && (
        <div className="tour-tip" style={{ top: tip.top, left: tip.left }}>
          <div className="tour-step-dots">
            {p.steps.map((_, i) => (
              <span key={i} className={`tour-dot${i === idx ? " active" : ""}`} />
            ))}
          </div>
          <div className="tour-step-count">
            {idx + 1} / {total}
          </div>
          <div className="tour-title">{step.title}</div>
          <div className="tour-body">{step.body}</div>
          <div className="tour-actions">
            <button className="btn btn-ghost btn-sm" onClick={p.onClose}>
              {idx === 0 ? "Skip" : "Done"}
            </button>
            {onTurnOff && (
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  onTurnOff();
                  p.onClose();
                }}
              >
                Don't show again
              </button>
            )}
            <button className="btn btn-primary btn-sm" onClick={onNext}>
              {idx + 1 < total ? "Next" : "Let's go"}
            </button>
          </div>
          {idx > 0 && (
            <button className="tour-back" onClick={() => setIdx(idx - 1)}>
              ← Back
            </button>
          )}
        </div>
      )}
    </div>
  );
}
