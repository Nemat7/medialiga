import type { Position } from "@/types";
import { clsx } from "clsx";

const styles: Record<Position, string> = {
  GK: "bg-yellow-500/15 text-yellow-400",
  DEF: "bg-blue-500/15 text-blue-400",
  MID: "bg-green-500/15 text-green-400",
  FWD: "bg-red-500/15 text-red-400",
};

export default function PositionBadge({ position }: { position: Position }) {
  return (
    <span
      className={clsx(
        "text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wide",
        styles[position]
      )}
    >
      {position}
    </span>
  );
}
