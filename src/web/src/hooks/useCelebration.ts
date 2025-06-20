import { useCallback } from 'react';
import confetti from 'canvas-confetti';

export const useCelebration = () => {
    const celebrate = useCallback(() => {
        // Create a burst of confetti
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        function randomInRange(min: number, max: number) {
            return Math.random() * (max - min) + min;
        }

        const interval = setInterval(() => {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);

            // Since particles fall down, start a bit higher than random
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
            });
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
            });
        }, 250);
    }, []);

    const celebrateBasic = useCallback(() => {
        // Simple confetti burst from center
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    }, []);

    const celebrateFireworks = useCallback(() => {
        // Fireworks-style celebration
        const count = 200;
        const defaults = {
            origin: { y: 0.7 }
        };

        function fire(particleRatio: number, opts: confetti.Options) {
            confetti({
                ...defaults,
                ...opts,
                particleCount: Math.floor(count * particleRatio)
            });
        }

        fire(0.25, {
            spread: 26,
            startVelocity: 55,
        });

        fire(0.2, {
            spread: 60,
        });

        fire(0.35, {
            spread: 100,
            decay: 0.91,
            scalar: 0.8
        });

        fire(0.1, {
            spread: 120,
            startVelocity: 25,
            decay: 0.92,
            scalar: 1.2
        });

        fire(0.1, {
            spread: 120,
            startVelocity: 45,
        });
    }, []);

    const celebrateRealistic = useCallback(() => {
        // Realistic confetti cannon
        const end = Date.now() + (1 * 1000);

        // Go Buckeyes!
        const colors = ['#bb0000', '#ffffff', '#00bb00', '#0000bb', '#ffff00', '#ff00ff'];

        function frame() {
            confetti({
                particleCount: 2,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: colors
            });
            confetti({
                particleCount: 2,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: colors
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        }

        frame();
    }, []);    const celebrateRandom = useCallback(() => {
        // Randomly choose a celebration type
        const celebrations = [celebrateBasic, celebrateFireworks, celebrateRealistic, celebrate];
        const randomIndex = Math.floor(Math.random() * celebrations.length);
        celebrations[randomIndex]();
    }, [celebrateBasic, celebrateFireworks, celebrateRealistic, celebrate]);

    return {
        celebrate,
        celebrateBasic,
        celebrateFireworks,
        celebrateRealistic,
        celebrateRandom
    };
};

export default useCelebration;
