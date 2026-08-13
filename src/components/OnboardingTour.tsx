import { useEffect, useMemo, useState } from "react";

export type TourStep = {
  target: string;
  title: string;
  body: string;
  align?: "below" | "above" | "left" | "right";
  action?: () => void;
};

export const FIRST_RUN_KEY = "bukkyai.tour.done.v1";

type Props = {
  active: boolean;
  steps: TourStep[];
  onClose: () => void;
};

export default function OnboardingTour(p: Props) {
  const [idx, setIdx] = useState(0);
  const [box, setBox] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  const step = p.steps[idx];

  useEffect(() => {
    if (!p.active) return;
    setIdx(0);
  }, [p.active]);

  useEffect(() => {
    if (!p.active || !step) return;
    const el = document.querySelector(step.target);
    const update = () => {
      if (!el) {
        setBox(null);
        return;
      }
      const r = el.getBoundingClientRect();
      setBox({ top: r.top + window.scrollY, left: r.left + window.scrollX, width: r.width, height: r.height });
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, { passive: true });
    const t = window.setTimeout(update, 60);
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
    step.action?.();
    if (idx + 1 < total) setIdx(idx + 1);
    else p.onClose();
  };

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
          <div className="tour-title">{step.title}</div>
          <div className="tour-body">{step.body}</div>
          <div className="tour-actions">
            <button className="btn btn-ghost btn-sm" onClick={p.onClose}>
              {idx === 0 ? "Skip" : "Done"}
            </button>
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

export function tourCompleted(): boolean {
  try {
    return localStorage.getItem(FIRST_RUN_KEY) === "1";
  } catch {
    return true;
  }
}

export function markTourDone(): void {
  try {
    localStorage.setItem(FIRST_RUN_KEY, "1");
  } catch {}
}
