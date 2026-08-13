import { useEffect, useRef } from "react";

// Traps focus inside the modal and closes on Escape. Returns a ref for the modal root.
export function useFocusTrap(active: boolean, onClose?: () => void, restoreFocus = true) {
  const ref = useRef<HTMLDivElement>(null);
  const prevFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) return;
    prevFocus.current = document.activeElement as HTMLElement | null;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose?.();
        return;
      }
      if (e.key !== "Tab") return;
      const root = ref.current;
      if (!root) return;
      const focusables = Array.from(
        root.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
      ).filter((el) => !el.hasAttribute("disabled") && el.getAttribute("aria-hidden") !== "true");
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey, true);
    // Move focus into the modal
    const t = window.setTimeout(() => {
      (ref.current?.querySelector<HTMLElement>('input, select, textarea, button, [tabindex]:not([tabindex="-1"])'))?.focus();
    }, 10);

    return () => {
      document.removeEventListener("keydown", onKey, true);
      window.clearTimeout(t);
      if (restoreFocus) prevFocus.current?.focus();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return ref;
}
