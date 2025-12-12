import type { CSSProperties } from "react";

type Line = {
  left: string;
  widthPx: number;
  opacity: number;
  blurPx: number;
  rotate: string;
  duration: string;
  delay: string;
  color: string;
};

const lines: Line[] = [
  {
    left: "8%",
    widthPx: 1,
    opacity: 0.45,
    blurPx: 0.2,
    rotate: "-12deg",
    duration: "22s",
    delay: "-16s",
    color: "rgba(88,28,135,0.55)",
  },
  {
    left: "14%",
    widthPx: 3,
    opacity: 0.42,
    blurPx: 0.3,
    rotate: "-16deg",
    duration: "28s",
    delay: "-8s",
    color: "rgba(88,28,135,0.5)",
  },
  {
    left: "22%",
    widthPx: 1,
    opacity: 0.36,
    blurPx: 0.4,
    rotate: "-6deg",
    duration: "30s",
    delay: "-22s",
    color: "rgba(88,28,135,0.42)",
  },
  {
    left: "30%",
    widthPx: 3,
    opacity: 0.40,
    blurPx: 0.35,
    rotate: "8deg",
    duration: "26s",
    delay: "-14s",
    color: "rgba(88,28,135,0.48)",
  },
  {
    left: "37%",
    widthPx: 1,
    opacity: 0.30,
    blurPx: 0.6,
    rotate: "12deg",
    duration: "34s",
    delay: "-10s",
    color: "rgba(88,28,135,0.34)",
  },
  {
    left: "46%",
    widthPx: 3,
    opacity: 0.44,
    blurPx: 0.25,
    rotate: "4deg",
    duration: "24s",
    delay: "-18s",
    color: "rgba(88,28,135,0.52)",
  },
  {
    left: "54%",
    widthPx: 1,
    opacity: 0.32,
    blurPx: 0.55,
    rotate: "-4deg",
    duration: "32s",
    delay: "-26s",
    color: "rgba(88,28,135,0.34)",
  },
  {
    left: "62%",
    widthPx: 3,
    opacity: 0.40,
    blurPx: 0.35,
    rotate: "-12deg",
    duration: "28s",
    delay: "-20s",
    color: "rgba(88,28,135,0.46)",
  },
  {
    left: "70%",
    widthPx: 1,
    opacity: 0.28,
    blurPx: 0.65,
    rotate: "-2deg",
    duration: "36s",
    delay: "-28s",
    color: "rgba(88,28,135,0.32)",
  },
  {
    left: "78%",
    widthPx: 3,
    opacity: 0.42,
    blurPx: 0.3,
    rotate: "10deg",
    duration: "25s",
    delay: "-12s",
    color: "rgba(88,28,135,0.5)",
  },
  {
    left: "86%",
    widthPx: 1,
    opacity: 0.34,
    blurPx: 0.55,
    rotate: "14deg",
    duration: "33s",
    delay: "-24s",
    color: "rgba(88,28,135,0.36)",
  },
  {
    left: "93%",
    widthPx: 3,
    opacity: 0.40,
    blurPx: 0.35,
    rotate: "6deg",
    duration: "27s",
    delay: "-15s",
    color: "rgba(88,28,135,0.46)",
  },
];

export function FloatingLinesBackground() {
  return (
    <div aria-hidden className="rb-floating-lines">
      <div className="rb-floating-lines__vignette" />
      {lines.map((line, idx) => (
        <span
          key={idx}
          className="rb-floating-line"
          style={
            {
              left: line.left,
              ["--rb-line-width" as string]: `${line.widthPx}px`,
              ["--rb-line-opacity" as string]: String(line.opacity),
              ["--rb-line-blur" as string]: `${line.blurPx}px`,
              ["--rb-line-rotate" as string]: line.rotate,
              ["--rb-line-duration" as string]: line.duration,
              ["--rb-line-delay" as string]: line.delay,
              ["--rb-line-color" as string]: line.color,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
