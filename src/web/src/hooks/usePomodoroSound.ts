import { useCallback, useRef } from 'react';

export const usePomodoroSound = () => {
    const audioContextRef = useRef<AudioContext | null>(null);

    const getAudioContext = useCallback(() => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        return audioContextRef.current;
    }, []);

    const createBeep = useCallback((frequency: number, duration: number, volume: number = 0.3) => {
        const audioContext = getAudioContext();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    }, [getAudioContext]);

    const createChime = useCallback((frequencies: number[], interval: number = 0.2) => {
        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                createBeep(freq, 0.5, 0.2);
            }, index * interval * 1000);
        });
    }, [createBeep]);

    const playStartSound = useCallback(() => {
        // Ascending chime for start
        createChime([523.25, 659.25, 783.99]); // C5, E5, G5
    }, [createChime]);

    const playWorkSound = useCallback(() => {
        // Energetic sound for work phase
        createChime([440, 554.37, 659.25, 783.99]); // A4, C#5, E5, G5
    }, [createChime]);

    const playBreakSound = useCallback(() => {
        // Relaxing sound for break phase
        createChime([349.23, 415.30, 523.25]); // F4, G#4, C5
    }, [createChime]);

    const playTickSound = useCallback(() => {
        // Subtle tick for countdown
        createBeep(800, 0.1, 0.1);
    }, [createBeep]);

    const playCompleteSound = useCallback(() => {
        // Completion fanfare
        const melody = [523.25, 587.33, 659.25, 698.46, 783.99, 880, 987.77, 1046.50]; // C5 to C6
        melody.forEach((freq, index) => {
            setTimeout(() => {
                createBeep(freq, 0.3, 0.25);
            }, index * 100);
        });
    }, [createBeep]);

    const playUrgentSound = useCallback(() => {
        // Urgent beeping for last 10 seconds
        createBeep(1000, 0.2, 0.3);
    }, [createBeep]);

    return {
        playStartSound,
        playWorkSound,
        playBreakSound,
        playTickSound,
        playCompleteSound,
        playUrgentSound
    };
};
