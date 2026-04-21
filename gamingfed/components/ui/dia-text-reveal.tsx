"use client";

import {
  useEffect,
  useRef,
  useState,
  useMemo,
  type ComponentPropsWithoutRef,
} from "react";

import { cn } from "@/lib/utils";

const DEFAULT_COLORS = ["#c679c4", "#fa3d1d", "#ffb005", "#e1e1fe", "#0358f7"];
const BAND_HALF = 17;
const SWEEP_START = -BAND_HALF;
const SWEEP_END = 100 + BAND_HALF;

const sweepEase = (t: number) =>
  t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;

function buildGradient(pos: number, colors: string[], textColor: string) {
  const bandStart = pos - BAND_HALF;
  const bandEnd = pos + BAND_HALF;

  if (bandStart >= 100) {
    return `linear-gradient(90deg, ${textColor}, ${textColor})`;
  }
  const n = colors.length;
  const parts: string[] = [];

  if (bandStart > 0)
    parts.push(`${textColor} 0%`, `${textColor} ${bandStart.toFixed(2)}%`);

  colors.forEach((c, i) => {
    const pct = n === 1 ? pos : bandStart + (i / (n - 1)) * BAND_HALF * 2;
    parts.push(`${c} ${pct.toFixed(2)}%`);
  });

  if (bandEnd < 100)
    parts.push(`transparent ${bandEnd.toFixed(2)}%`, `transparent 100%`);

  return `linear-gradient(90deg, ${parts.join(", ")})`;
}

function measureWidths(el: HTMLElement, texts: string[]) {
  const ghost = el.cloneNode() as HTMLElement;
  Object.assign(ghost.style, {
    position: "absolute",
    visibility: "hidden",
    pointerEvents: "none",
    width: "auto",
    whiteSpace: "nowrap",
  });
  el.parentElement!.appendChild(ghost);
  const widths = texts.map((t) => {
    ghost.textContent = t;
    return ghost.getBoundingClientRect().width;
  });
  ghost.remove();
  return widths;
}

export interface DiaTextRevealProps
  extends Omit<ComponentPropsWithoutRef<"span">, "children" | "style"> {
  text: string | string[];
  colors?: string[];
  textColor?: string;
  duration?: number;
  delay?: number;
  repeat?: boolean;
  repeatDelay?: number;
  startOnView?: boolean;
  once?: boolean;
  className?: string;
  fixedWidth?: boolean;
  style?: React.CSSProperties;
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const fn = () => setReduced(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);
  return reduced;
}

export function DiaTextReveal({
  text,
  colors = DEFAULT_COLORS,
  textColor = "var(--foreground)",
  duration = 1.5,
  delay = 0,
  repeat = false,
  repeatDelay = 0.5,
  startOnView = true,
  once = true,
  className,
  fixedWidth = false,
  style: styleProp,
  ...props
}: DiaTextRevealProps) {
  const texts = Array.isArray(text) ? text : [text];
  const isMulti = texts.length > 1;
  const prefersReducedMotion = usePrefersReducedMotion();

  const spanRef = useRef<HTMLSpanElement>(null);
  const optsRef = useRef({
    colors,
    textColor,
    duration,
    delay,
    repeat,
    repeatDelay,
    texts,
  });
  optsRef.current = {
    colors,
    textColor,
    duration,
    delay,
    repeat,
    repeatDelay,
    texts,
  };

  const indexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const rafRef = useRef<number>(undefined);

  const [activeIndex, setActiveIndex] = useState(0);
  const [measuredWidths, setMeasuredWidths] = useState<number[]>([]);
  const [sweepPos, setSweepPos] = useState(SWEEP_START);
  const [inView, setInView] = useState(!startOnView);

  const backgroundImage = useMemo(
    () => buildGradient(sweepPos, colors, textColor),
    [sweepPos, colors, textColor],
  );

  const textKey = Array.isArray(text) ? text.join("\0") : text;
  useEffect(() => {
    const el = spanRef.current;
    if (!el || !isMulti) return;
    const list = Array.isArray(text) ? text : [text];
    setMeasuredWidths(measureWidths(el, list));
  }, [isMulti, textKey, text]);

  useEffect(() => {
    const el = spanRef.current;
    if (!el || !startOnView) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          setInView(true);
          if (once) obs.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [startOnView, once]);

  useEffect(() => {
    if (startOnView && !inView) return;

    let cancelled = false;
    const clearAnim = () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      clearTimeout(timerRef.current);
    };

    const runSweep = () => {
      if (cancelled) return;
      const {
        duration: dur,
        delay: del,
        repeat: rep,
        repeatDelay: repDel,
        texts: tx,
      } = optsRef.current;

      if (prefersReducedMotion) {
        setSweepPos(SWEEP_END);
        if (rep) {
          timerRef.current = setTimeout(() => {
            if (cancelled) return;
            const next = (indexRef.current + 1) % tx.length;
            indexRef.current = next;
            setActiveIndex(next);
            runSweep();
          }, repDel * 1000);
        }
        return;
      }

      setSweepPos(SWEEP_START);
      let animStart: number | null = null;

      const step = (now: number) => {
        if (cancelled) return;
        if (animStart === null) animStart = now;
        const elapsed = (now - animStart) / 1000;
        if (elapsed < del) {
          rafRef.current = requestAnimationFrame(step);
          return;
        }
        const u = Math.min((elapsed - del) / dur, 1);
        setSweepPos(SWEEP_START + (SWEEP_END - SWEEP_START) * sweepEase(u));
        if (u < 1) {
          rafRef.current = requestAnimationFrame(step);
          return;
        }
        if (!rep) return;
        timerRef.current = setTimeout(() => {
          if (cancelled) return;
          const next = (indexRef.current + 1) % tx.length;
          indexRef.current = next;
          setActiveIndex(next);
          runSweep();
        }, repDel * 1000);
      };

      rafRef.current = requestAnimationFrame(step);
    };

    runSweep();

    return () => {
      cancelled = true;
      clearAnim();
    };
  }, [inView, startOnView, prefersReducedMotion]);

  const fixedW =
    isMulti && fixedWidth && measuredWidths.length > 0
      ? Math.max(...measuredWidths)
      : undefined;

  const animatedW =
    isMulti && !fixedWidth && measuredWidths[activeIndex] != null
      ? measuredWidths[activeIndex]
      : undefined;

  return (
    <span
      ref={spanRef}
      className={cn(
        "align-bottom leading-[100%] text-inherit dia-text-reveal",
        isMulti && animatedW != null && "dia-text-reveal--width-anim",
        className,
      )}
      style={{
        transform: "translateY(-2px)",
        color: "transparent",
        backgroundClip: "text",
        WebkitBackgroundClip: "text",
        backgroundSize: "100% 100%",
        backgroundImage,
        ...(isMulti && {
          display: "inline-block",
          overflow: "hidden",
          whiteSpace: "nowrap",
          verticalAlign: "text-center",
          ...(fixedW != null && { width: fixedW }),
          ...(animatedW != null && { width: animatedW }),
        }),
        ...styleProp,
      }}
      {...props}
    >
      {texts[activeIndex]}
    </span>
  );
}
