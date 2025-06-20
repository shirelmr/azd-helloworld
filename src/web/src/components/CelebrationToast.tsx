import React, { useState, useEffect, useCallback } from 'react';
import { MessageBar, MessageBarType } from '@fluentui/react';
import './CelebrationToast.css';

interface CelebrationToastProps {
    message: string;
    isVisible: boolean;
    onDismiss: () => void;
    duration?: number;
}

export const CelebrationToast: React.FC<CelebrationToastProps> = ({
    message,
    isVisible,
    onDismiss,
    duration = 3000
}) => {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onDismiss();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [isVisible, duration, onDismiss]);

    if (!isVisible) return null;    return (
        <div className="celebration-toast">
            <MessageBar
                messageBarType={MessageBarType.success}
                isMultiline={false}
                onDismiss={onDismiss}
                dismissButtonAriaLabel="Close"
            >
                🎉 {message} 🎉
            </MessageBar>
        </div>
    );
};

export const useCelebrationToast = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [message, setMessage] = useState('');

    const showCelebration = useCallback((celebrationMessage: string) => {
        setMessage(celebrationMessage);
        setIsVisible(true);
    }, []);

    const hideCelebration = useCallback(() => {
        setIsVisible(false);
    }, []);

    const ToastComponent = useCallback(() => (
        <CelebrationToast
            message={message}
            isVisible={isVisible}
            onDismiss={hideCelebration}
        />
    ), [message, isVisible, hideCelebration]);

    return {
        showCelebration,
        hideCelebration,
        ToastComponent
    };
};

export default CelebrationToast;
