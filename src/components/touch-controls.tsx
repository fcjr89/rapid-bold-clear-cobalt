import { useRef } from "react";
import { pulseCancel, pulseConfirm, setInjected } from "@/game/input";

function hold(codes: string[]) {
  return {
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault();
      (e.currentTarget as HTMLElement).classList.add("is-down");
      setInjected(codes, true);
    },
    onPointerUp: (e: React.PointerEvent) => {
      (e.currentTarget as HTMLElement).classList.remove("is-down");
      setInjected(codes, false);
    },
    onPointerLeave: (e: React.PointerEvent) => {
      (e.currentTarget as HTMLElement).classList.remove("is-down");
      setInjected(codes, false);
    },
    onPointerCancel: (e: React.PointerEvent) => {
      (e.currentTarget as HTMLElement).classList.remove("is-down");
      setInjected(codes, false);
    },
  };
}

export function TouchControls() {
  const root = useRef<HTMLDivElement>(null);
  return (
    <div className="touch-bar" ref={root} aria-hidden="false">
      <div className="dpad">
        <span />
        <button type="button" className="pad-btn" {...hold(["KeyW", "ArrowUp"])}>
          N
        </button>
        <span />
        <button type="button" className="pad-btn" {...hold(["KeyA", "ArrowLeft"])}>
          W
        </button>
        <button type="button" className="pad-btn" {...hold(["KeyS", "ArrowDown"])}>
          S
        </button>
        <button type="button" className="pad-btn" {...hold(["KeyD", "ArrowRight"])}>
          E
        </button>
        <span />
        <span />
        <span />
      </div>
      <div className="actions">
        <button
          type="button"
          className="action-btn b"
          onPointerDown={(e) => {
            e.preventDefault();
            pulseCancel();
          }}
        >
          X
        </button>
        <button
          type="button"
          className="action-btn"
          onPointerDown={(e) => {
            e.preventDefault();
            pulseConfirm();
          }}
        >
          Z
        </button>
      </div>
    </div>
  );
}
