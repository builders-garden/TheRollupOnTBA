import confetti from "canvas-confetti";

interface UseConfettiProps {
  duration?: number;
  particleCount?: number;
  spread?: number;
  colors?: string[];
  disableForReducedMotion?: boolean;
  shotFrequency?: number;
}

export function useConfetti({
  duration = 1000,
  particleCount = 35,
  spread = 70,
  colors = ["#FFD700", "#FFA500", "#FF6347", "#98FB98", "#87CEEB"],
  disableForReducedMotion = true,
  shotFrequency = 100,
}: UseConfettiProps) {
  // A function to generate a random number between a minimum and maximum value
  const randomInRange = (min: number, max: number) => {
    return Math.random() * (max - min) + min;
  };

  // Handle a single shot of confetti
  const singleShotConfetti = (
    ssOrigin: {
      x: number;
      y: number;
    },
    ssParticleCount?: number,
    ssSpread?: number,
    ssColors?: string[],
    ssDisableForReducedMotion?: boolean,
  ) => {
    confetti({
      particleCount: ssParticleCount || particleCount,
      spread: ssSpread || spread,
      colors: ssColors || colors,
      disableForReducedMotion:
        ssDisableForReducedMotion || disableForReducedMotion,
      origin: ssOrigin,
    });
  };

  // The function that starts the confetti animation
  const startConfetti = () => {
    const animationEnd = Date.now() + duration;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      // If the time left is less than or equal to 0, clear the interval and return
      // This is to stop the confetti animation
      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      confetti({
        particleCount,
        spread,
        origin: {
          x: randomInRange(0.1, 0.9),
          y: randomInRange(0.5, 1),
        },
        colors,
        disableForReducedMotion,
      });
    }, shotFrequency); // Increased interval speed

    // Return a function to stop the confetti animation
    return () => clearInterval(interval);
  };

  return {
    startConfetti,
    singleShotConfetti,
  };
}
