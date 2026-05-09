declare module 'canvas-confetti' {
  export type Options = {
    particleCount?: number;
    spread?: number;
    origin?: { x?: number; y?: number };
    colors?: string[];
  };
  function confetti(options?: Options): void;
  export default confetti;
}
