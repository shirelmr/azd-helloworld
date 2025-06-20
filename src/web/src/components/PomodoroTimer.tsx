import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
    Stack, 
    Text, 
    PrimaryButton, 
    DefaultButton, 
    ProgressIndicator, 
    Panel,
    PanelType,
    IconButton,
    Dropdown,
    IDropdownOption
} from '@fluentui/react';
import { usePomodoroSound } from '../hooks/usePomodoroSound';
import { usePomodoroNotification, NotificationType } from './PomodoroNotification';
import './PomodoroTimer.css';

export enum PomodoroPhase {
    WORK = 'work',
    SHORT_BREAK = 'shortBreak',
    LONG_BREAK = 'longBreak'
}

interface PomodoroState {
    phase: PomodoroPhase;
    timeLeft: number;
    isRunning: boolean;
    isVisible: boolean;
    cycleCount: number;
    totalCycles: number;
}

interface PomodoroSettings {
    workDuration: number; // in minutes
    shortBreakDuration: number;
    longBreakDuration: number;
    cyclesUntilLongBreak: number;
}

const DEFAULT_SETTINGS: PomodoroSettings = {
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    cyclesUntilLongBreak: 4
};

const PomodoroTimer: React.FC = () => {
    const [state, setState] = useState<PomodoroState>({
        phase: PomodoroPhase.WORK,
        timeLeft: DEFAULT_SETTINGS.workDuration * 60,
        isRunning: false,
        isVisible: false,
        cycleCount: 0,
        totalCycles: 0
    });    const [settings, setSettings] = useState<PomodoroSettings>(DEFAULT_SETTINGS);
    const [showSettings, setShowSettings] = useState(false);
    const intervalRef = useRef<number | null>(null);
      const { 
        playStartSound, 
        playBreakSound, 
        playWorkSound, 
        playTickSound,
        playCompleteSound 
    } = usePomodoroSound();

    const { showNotification, NotificationComponent } = usePomodoroNotification();

    const formatTime = useCallback((seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }, []);

    const getPhaseInfo = useCallback((phase: PomodoroPhase) => {
        switch (phase) {
            case PomodoroPhase.WORK:
                return {
                    title: '🍅 Focus Time',
                    description: 'Time to focus and be productive!',
                    color: '#ec4899',
                    duration: settings.workDuration * 60
                };
            case PomodoroPhase.SHORT_BREAK:
                return {
                    title: '☕ Short Break',
                    description: 'Take a quick breather!',
                    color: '#10b981',
                    duration: settings.shortBreakDuration * 60
                };
            case PomodoroPhase.LONG_BREAK:
                return {
                    title: '🌴 Long Break',
                    description: 'Enjoy a longer rest!',
                    color: '#3b82f6',
                    duration: settings.longBreakDuration * 60
                };
        }
    }, [settings]);

    const nextPhase = useCallback(() => {
        setState(prevState => {
            let newPhase: PomodoroPhase;
            let newCycleCount = prevState.cycleCount;
            let newTotalCycles = prevState.totalCycles;

            if (prevState.phase === PomodoroPhase.WORK) {
                newCycleCount += 1;
                newTotalCycles += 1;
                
                if (newCycleCount >= settings.cyclesUntilLongBreak) {
                    newPhase = PomodoroPhase.LONG_BREAK;
                    newCycleCount = 0;
                } else {
                    newPhase = PomodoroPhase.SHORT_BREAK;
                }
            } else {
                newPhase = PomodoroPhase.WORK;
            }

            const phaseInfo = getPhaseInfo(newPhase);
              // Play appropriate sound and show notification
            if (newPhase === PomodoroPhase.WORK) {
                playWorkSound();
                showNotification(NotificationType.WORK_START, 'Work');
            } else if (newPhase === PomodoroPhase.LONG_BREAK) {
                playBreakSound();
                showNotification(NotificationType.LONG_BREAK_START, 'Long Break');
            } else {
                playBreakSound();
                showNotification(NotificationType.BREAK_START, 'Short Break');
            }

            return {
                ...prevState,
                phase: newPhase,
                timeLeft: phaseInfo.duration,
                cycleCount: newCycleCount,
                totalCycles: newTotalCycles,
                isRunning: false
            };
        });
    }, [settings, getPhaseInfo, playWorkSound, playBreakSound]);

    const startTimer = useCallback(() => {
        playStartSound();
        setState(prev => ({ ...prev, isRunning: true }));
    }, [playStartSound]);

    const pauseTimer = useCallback(() => {
        setState(prev => ({ ...prev, isRunning: false }));
    }, []);

    const resetTimer = useCallback(() => {
        setState(prev => ({
            ...prev,
            isRunning: false,
            timeLeft: getPhaseInfo(prev.phase).duration
        }));
    }, [getPhaseInfo]);

    const skipPhase = useCallback(() => {
        nextPhase();
    }, [nextPhase]);    useEffect(() => {
        if (state.isRunning && state.timeLeft > 0) {
            intervalRef.current = window.setInterval(() => {
                setState(prev => {
                    const newTimeLeft = prev.timeLeft - 1;
                    
                    // Play tick sound for last 10 seconds
                    if (newTimeLeft <= 10 && newTimeLeft > 0) {
                        playTickSound();
                    }
                      if (newTimeLeft <= 0) {
                        playCompleteSound();
                        // Show phase completion notification
                        const currentPhaseInfo = getPhaseInfo(prev.phase);
                        showNotification(NotificationType.PHASE_COMPLETE, currentPhaseInfo.title);
                        return { ...prev, timeLeft: 0, isRunning: false };
                    }
                    
                    return { ...prev, timeLeft: newTimeLeft };
                });
            }, 1000);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [state.isRunning, state.timeLeft, playTickSound, playCompleteSound]);

    // Auto-advance to next phase when timer reaches 0
    useEffect(() => {
        if (state.timeLeft === 0 && !state.isRunning) {
            const timer = setTimeout(() => {
                nextPhase();
            }, 2000); // Wait 2 seconds before auto-advancing

            return () => clearTimeout(timer);
        }
    }, [state.timeLeft, state.isRunning, nextPhase]);

    const phaseInfo = getPhaseInfo(state.phase);
    const progress = 1 - (state.timeLeft / phaseInfo.duration);

    const workDurationOptions: IDropdownOption[] = [
        { key: 15, text: '15 minutes' },
        { key: 20, text: '20 minutes' },
        { key: 25, text: '25 minutes' },
        { key: 30, text: '30 minutes' },
        { key: 45, text: '45 minutes' },
        { key: 60, text: '60 minutes' }
    ];

    const breakDurationOptions: IDropdownOption[] = [
        { key: 5, text: '5 minutes' },
        { key: 10, text: '10 minutes' },
        { key: 15, text: '15 minutes' },
        { key: 20, text: '20 minutes' },
        { key: 30, text: '30 minutes' }
    ];    return (
        <>
            <NotificationComponent />
            
            {/* Floating Timer Button */}
            <div className="pomodoro-floating-button">
                <IconButton
                    iconProps={{ iconName: 'Clock' }}
                    title="Focus Timer"
                    onClick={() => setState(prev => ({ ...prev, isVisible: true }))}
                    className="pomodoro-toggle-button"
                    styles={{
                        root: {
                            backgroundColor: phaseInfo.color,
                            color: 'white',
                            borderRadius: '50%',
                            width: '56px',
                            height: '56px',
                            fontSize: '18px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            border: 'none'
                        },
                        rootHovered: {
                            backgroundColor: phaseInfo.color,
                            transform: 'scale(1.1)'
                        }
                    }}
                />
                {state.isRunning && (
                    <div className="pomodoro-mini-timer">
                        {formatTime(state.timeLeft)}
                    </div>
                )}
            </div>

            {/* Main Timer Panel */}
            <Panel
                isOpen={state.isVisible}
                onDismiss={() => setState(prev => ({ ...prev, isVisible: false }))}
                type={PanelType.medium}
                headerText="🍅 Focus Timer"
                styles={{
                    main: { background: 'var(--soft-pink-background)' },
                    header: { background: 'var(--soft-pink-light)' },
                    content: { padding: '20px' }
                }}
            >
                <Stack tokens={{ childrenGap: 20 }}>
                    {/* Phase Display */}
                    <Stack 
                        className={`pomodoro-phase-display ${state.phase} ${state.isRunning ? 'running' : ''}`}
                        styles={{ root: { textAlign: 'center', padding: '20px', borderRadius: '12px' } }}
                    >
                        <Text variant="xxLarge" styles={{ root: { color: phaseInfo.color, fontWeight: 'bold' } }}>
                            {phaseInfo.title}
                        </Text>
                        <Text variant="large" styles={{ root: { color: 'var(--soft-pink-accent)', marginTop: '8px' } }}>
                            {phaseInfo.description}
                        </Text>
                    </Stack>

                    {/* Timer Display */}
                    <Stack className="pomodoro-timer-display" styles={{ root: { textAlign: 'center' } }}>
                        <Text 
                            className={`pomodoro-time ${state.isRunning ? 'running' : ''} ${state.timeLeft <= 10 ? 'urgent' : ''}`}
                            styles={{ 
                                root: { 
                                    fontSize: '4rem', 
                                    fontWeight: 'bold', 
                                    color: phaseInfo.color,
                                    textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                } 
                            }}
                        >
                            {formatTime(state.timeLeft)}
                        </Text>
                        <ProgressIndicator 
                            percentComplete={progress} 
                            styles={{
                                progressBar: { backgroundColor: phaseInfo.color },
                                progressTrack: { backgroundColor: 'var(--soft-pink-light)' }
                            }}
                        />
                    </Stack>

                    {/* Controls */}
                    <Stack horizontal horizontalAlign="center" tokens={{ childrenGap: 15 }}>
                        {!state.isRunning ? (
                            <PrimaryButton 
                                text="Start" 
                                iconProps={{ iconName: 'Play' }}
                                onClick={startTimer}
                                styles={{ root: { backgroundColor: phaseInfo.color, borderColor: phaseInfo.color } }}
                            />
                        ) : (
                            <DefaultButton 
                                text="Pause" 
                                iconProps={{ iconName: 'Pause' }}
                                onClick={pauseTimer}
                            />
                        )}
                        <DefaultButton 
                            text="Reset" 
                            iconProps={{ iconName: 'Refresh' }}
                            onClick={resetTimer}
                        />
                        <DefaultButton 
                            text="Skip" 
                            iconProps={{ iconName: 'Forward' }}
                            onClick={skipPhase}
                        />
                        <IconButton
                            iconProps={{ iconName: 'Settings' }}
                            title="Settings"
                            onClick={() => setShowSettings(true)}
                        />
                    </Stack>

                    {/* Stats */}
                    <Stack horizontal horizontalAlign="space-between" styles={{ root: { padding: '15px', backgroundColor: 'var(--soft-pink-light)', borderRadius: '8px' } }}>
                        <Stack styles={{ root: { textAlign: 'center' } }}>
                            <Text variant="large" styles={{ root: { fontWeight: 'bold', color: 'var(--soft-pink-accent)' } }}>
                                {state.totalCycles}
                            </Text>
                            <Text variant="small">Total Sessions</Text>
                        </Stack>
                        <Stack styles={{ root: { textAlign: 'center' } }}>
                            <Text variant="large" styles={{ root: { fontWeight: 'bold', color: 'var(--soft-pink-accent)' } }}>
                                {state.cycleCount}/{settings.cyclesUntilLongBreak}
                            </Text>
                            <Text variant="small">Until Long Break</Text>
                        </Stack>
                    </Stack>
                </Stack>
            </Panel>

            {/* Settings Panel */}
            <Panel
                isOpen={showSettings}
                onDismiss={() => setShowSettings(false)}
                type={PanelType.smallFixedNear}
                headerText="Timer Settings"
                styles={{
                    main: { background: 'var(--soft-pink-background)' },
                    header: { background: 'var(--soft-pink-light)' }
                }}
            >
                <Stack tokens={{ childrenGap: 20 }} styles={{ root: { padding: '20px 0' } }}>
                    <Dropdown
                        label="Work Duration"
                        selectedKey={settings.workDuration}
                        options={workDurationOptions}
                        onChange={(_, option) => option && setSettings(prev => ({ ...prev, workDuration: option.key as number }))}
                    />
                    <Dropdown
                        label="Short Break Duration"
                        selectedKey={settings.shortBreakDuration}
                        options={breakDurationOptions}
                        onChange={(_, option) => option && setSettings(prev => ({ ...prev, shortBreakDuration: option.key as number }))}
                    />
                    <Dropdown
                        label="Long Break Duration"
                        selectedKey={settings.longBreakDuration}
                        options={breakDurationOptions}
                        onChange={(_, option) => option && setSettings(prev => ({ ...prev, longBreakDuration: option.key as number }))}
                    />
                    <Dropdown
                        label="Cycles Until Long Break"
                        selectedKey={settings.cyclesUntilLongBreak}
                        options={[
                            { key: 2, text: '2 cycles' },
                            { key: 3, text: '3 cycles' },
                            { key: 4, text: '4 cycles' },
                            { key: 5, text: '5 cycles' },
                            { key: 6, text: '6 cycles' }
                        ]}
                        onChange={(_, option) => option && setSettings(prev => ({ ...prev, cyclesUntilLongBreak: option.key as number }))}
                    />
                </Stack>
            </Panel>
        </>
    );
};

export default PomodoroTimer;
