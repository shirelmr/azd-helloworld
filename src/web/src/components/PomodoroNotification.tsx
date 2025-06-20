import React, { useState, useEffect, useCallback } from 'react';
import { Stack, Text } from '@fluentui/react';
import './PomodoroNotification.css';

export enum NotificationType {
    WORK_START = 'workStart',
    BREAK_START = 'breakStart',
    PHASE_COMPLETE = 'phaseComplete',
    LONG_BREAK_START = 'longBreakStart'
}

interface PomodoroNotificationProps {
    type: NotificationType;
    isVisible: boolean;
    onDismiss: () => void;
    phase: string;
    duration?: number;
}

const getNotificationContent = (type: NotificationType, phase: string) => {
    switch (type) {
        case NotificationType.WORK_START:
            return {
                title: '🍅 Time to Focus!',
                message: 'Let\'s get productive! Focus on your most important task.',
                icon: '🎯',
                color: '#ec4899'
            };
        case NotificationType.BREAK_START:
            return {
                title: '☕ Break Time!',
                message: 'Great work! Take a moment to rest and recharge.',
                icon: '😌',
                color: '#10b981'
            };
        case NotificationType.LONG_BREAK_START:
            return {
                title: '🌴 Long Break!',
                message: 'Excellent focus! Enjoy a longer break - you\'ve earned it!',
                icon: '🎉',
                color: '#3b82f6'
            };
        case NotificationType.PHASE_COMPLETE:
            return {
                title: '✅ Phase Complete!',
                message: `${phase} session completed successfully!`,
                icon: '🏆',
                color: '#8b5cf6'
            };
        default:
            return {
                title: 'Timer Update',
                message: 'Phase change',
                icon: '⏰',
                color: '#6b7280'
            };
    }
};

export const PomodoroNotification: React.FC<PomodoroNotificationProps> = ({
    type,
    isVisible,
    onDismiss,
    phase,
    duration = 5000
}) => {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onDismiss();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [isVisible, duration, onDismiss]);

    if (!isVisible) return null;    const content = getNotificationContent(type, phase);
    const notificationClass = `pomodoro-notification ${type}`;

    return (
        <div className="pomodoro-notification-overlay">
            <div className={notificationClass}>
                <Stack tokens={{ childrenGap: 15 }} styles={{ root: { textAlign: 'center' } }}>
                    <div className="pomodoro-notification-icon">
                        {content.icon}
                    </div>
                    <Text variant="xLarge" styles={{ root: { fontWeight: 'bold', color: content.color } }}>
                        {content.title}
                    </Text>
                    <Text variant="medium" styles={{ root: { color: 'var(--soft-pink-accent)' } }}>
                        {content.message}
                    </Text>
                    <div className="pomodoro-notification-progress">
                        <div className="pomodoro-notification-progress-bar" />
                    </div>
                </Stack>
            </div>
        </div>
    );
};

export const usePomodoroNotification = () => {
    const [notification, setNotification] = useState<{
        type: NotificationType;
        isVisible: boolean;
        phase: string;
    }>({
        type: NotificationType.WORK_START,
        isVisible: false,
        phase: ''
    });

    const showNotification = useCallback((type: NotificationType, phase: string) => {
        setNotification({
            type,
            isVisible: true,
            phase
        });

        // Request notification permission if not granted
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }

        // Show browser notification
        if (Notification.permission === 'granted') {
            const content = getNotificationContent(type, phase);
            new Notification(content.title, {
                body: content.message,
                icon: '/favicon.ico',
                badge: '/favicon.ico'
            });
        }
    }, []);

    const hideNotification = useCallback(() => {
        setNotification(prev => ({ ...prev, isVisible: false }));
    }, []);

    const NotificationComponent = useCallback(() => (
        <PomodoroNotification
            type={notification.type}
            isVisible={notification.isVisible}
            onDismiss={hideNotification}
            phase={notification.phase}
        />
    ), [notification.type, notification.isVisible, notification.phase, hideNotification]);

    return {
        showNotification,
        hideNotification,
        NotificationComponent
    };
};

export default PomodoroNotification;
