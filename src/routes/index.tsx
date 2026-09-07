import { useEffect, useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { TouchControls } from "@/components/touch-controls";

export const Route = createFileRoute("/")({ component: Home });

const gameMod = typeof window !== "undefined" ? import("@/game/createGame") : null;

function Home() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let destroy: (() => void) | undefined;
    let alive = true;
    void (gameMod ?? import("@/game/createGame")).then(({ createGame, destroyGame }) => {
      if (!alive || !rootRef.current) return;
      rootRef.current.replaceChildren();
      createGame(rootRef.current);
      destroy = destroyGame;
      rootRef.current.querySelector("canvas")?.focus();
    });
    return () => {
      alive = false;
      destroy?.();
    };
  }, []);

  return (
    <main className="game-shell">
      <h1 className="sr-only">Baki The Hammer: Bloodlines of the Divide</h1>
      <div id="game-root" className="game-canvas" ref={rootRef}>
        <canvas width={480} height={270} className="boot-canvas" />
      </div>
      <TouchControls />
    </main>
  );
}
