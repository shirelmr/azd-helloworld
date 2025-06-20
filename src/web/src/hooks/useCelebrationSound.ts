import { useCallback } from 'react';

export const useCelebrationSound = () => {
    const playSuccessSound = useCallback(() => {
        try {
            // Create a simple success sound using Web Audio API
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            
            // Create success melody notes
            const playNote = (frequency: number, startTime: number, duration: number) => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.setValueAtTime(frequency, startTime);
                oscillator.type = 'sine';
                
                gainNode.gain.setValueAtTime(0, startTime);
                gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
                
                oscillator.start(startTime);
                oscillator.stop(startTime + duration);
            };
            
            const currentTime = audioContext.currentTime;
            
            // Play a cheerful success melody (C-E-G-C)
            playNote(523.25, currentTime, 0.2);        // C5
            playNote(659.25, currentTime + 0.15, 0.2); // E5
            playNote(783.99, currentTime + 0.3, 0.2);  // G5
            playNote(1046.5, currentTime + 0.45, 0.4); // C6
            
        } catch (error) {
            console.log('Audio not supported or failed:', error);
            // Fallback: use system beep if available
            if ('beep' in navigator) {
                (navigator as any).beep();
            }
        }
    }, []);

    const playCheerSound = useCallback(() => {
        try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            
            const playChord = (frequencies: number[], startTime: number, duration: number) => {
                frequencies.forEach(frequency => {
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);
                    
                    oscillator.frequency.setValueAtTime(frequency, startTime);
                    oscillator.type = 'triangle';
                    
                    gainNode.gain.setValueAtTime(0, startTime);
                    gainNode.gain.linearRampToValueAtTime(0.1, startTime + 0.01);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
                    
                    oscillator.start(startTime);
                    oscillator.stop(startTime + duration);
                });
            };
            
            const currentTime = audioContext.currentTime;
            
            // Play triumphant chord progression
            playChord([261.63, 329.63, 392.00], currentTime, 0.5);        // C Major
            playChord([293.66, 369.99, 440.00], currentTime + 0.3, 0.6); // D Major
            playChord([329.63, 415.30, 493.88], currentTime + 0.6, 0.8); // E Major
            
        } catch (error) {
            console.log('Audio not supported or failed:', error);
        }
    }, []);

    return {
        playSuccessSound,
        playCheerSound
    };
};

export default useCelebrationSound;
