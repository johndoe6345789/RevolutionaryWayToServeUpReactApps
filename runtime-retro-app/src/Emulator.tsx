import React, { useEffect, useRef, useState } from "react";
import { Chip8 } from "./chip8.ts";
import type { Game } from "./games.ts";

const keys = ["1", "2", "3", "c", "4", "5", "6", "d", "7", "8", "9", "e", "a", "0", "b", "f"];

export default function Emulator({ game }: { game: Game }): React.JSX.Element {
  const machineRef = useRef(new Chip8(game.rom));
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [presses, setPresses] = useState(0);

  useEffect(() => { machineRef.current = new Chip8(game.rom); setPresses(0); }, [game.id]);
  useEffect(() => {
    let animation = 0;
    const frame = (): void => {
      const machine = machineRef.current;
      machine.run();
      if (machine.changed && canvasRef.current) {
        const context = canvasRef.current.getContext("2d");
        if (context) {
          context.fillStyle = "#05070d"; context.fillRect(0, 0, 640, 320);
          context.fillStyle = game.accent === "pink" ? "#ff5cba" : game.accent === "amber" ? "#ffca5c" : "#5cf6ff";
          machine.display.forEach((pixel, index) => { if (pixel) context.fillRect((index % 64) * 10, Math.floor(index / 64) * 10, 9, 9); });
        }
        machine.changed = false;
      }
      animation = requestAnimationFrame(frame);
    };
    animation = requestAnimationFrame(frame);
    return (): void => cancelAnimationFrame(animation);
  }, [game.id, game.accent]);

  const press = (value: number): void => { machineRef.current.key(value); setPresses((count) => count + 1); };
  return <section className="console-shell" aria-label={`${game.title} emulator`}>
    <div className="console-top"><span>RUNTIME CHIP-8 / 700HZ</span><span data-testid="key-count">INPUT {presses.toString().padStart(3, "0")}</span></div>
    <canvas ref={canvasRef} width="640" height="320" className="screen" />
    <div className="keypad" aria-label="CHIP-8 keypad">{keys.map((key, value) => <button key={key} onClick={() => press(value)} aria-label={`Key ${key}`}>{key.toUpperCase()}</button>)}</div>
    <p className="control-copy">{game.controls}. The program above is executing inside a real CHIP-8 interpreter written in runtime-loaded TypeScript.</p>
  </section>;
}
