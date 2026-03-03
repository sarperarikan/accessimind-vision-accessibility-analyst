'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AccessibilityContextType {
    isHighContrast: boolean;
    setHighContrast: (enabled: boolean) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: ReactNode }) {
    const [isHighContrast, setIsHighContrast] = useState<boolean>(false);

    useEffect(() => {
        const saved = localStorage.getItem('accessibility_high_contrast');
        if (saved === 'true') {
            setIsHighContrast(true);
        }
    }, []);

    const setHighContrast = (enabled: boolean) => {
        setIsHighContrast(enabled);
        localStorage.setItem('accessibility_high_contrast', String(enabled));
    };

    return (
        <AccessibilityContext.Provider value={{ isHighContrast, setHighContrast }}>
            {children}
        </AccessibilityContext.Provider>
    );
}

export function useAccessibility() {
    const context = useContext(AccessibilityContext);
    if (!context) {
        throw new Error('useAccessibility must be used within an AccessibilityProvider');
    }
    return context;
}
