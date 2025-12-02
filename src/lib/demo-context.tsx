"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type DemoContextType = {
    isDemoMode: boolean;
    toggleDemoMode: () => void;
};

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export function DemoProvider({ children }: { children: ReactNode }) {
    const [isDemoMode, setIsDemoMode] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    // Initialize demo mode from localStorage or environment variable
    useEffect(() => {
        const stored = localStorage.getItem("demo_mode");
        const envDemo = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

        if (stored !== null) {
            setIsDemoMode(stored === "true");
        } else if (envDemo) {
            setIsDemoMode(true);
        }

        setIsInitialized(true);
    }, []);

    const toggleDemoMode = () => {
        setIsDemoMode((prev) => {
            const newValue = !prev;
            localStorage.setItem("demo_mode", String(newValue));
            return newValue;
        });
    };

    // Don't render children until initialized to avoid hydration mismatch
    if (!isInitialized) {
        return null;
    }

    return (
        <DemoContext.Provider value={{ isDemoMode, toggleDemoMode }}>
            {children}
        </DemoContext.Provider>
    );
}

export function useDemoMode() {
    const context = useContext(DemoContext);
    if (context === undefined) {
        throw new Error("useDemoMode must be used within a DemoProvider");
    }
    return context;
}
