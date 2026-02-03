import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState('surreal'); // Default to surreal

    useEffect(() => {
        // Check local storage on mount
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme && ['surreal', 'black'].includes(savedTheme)) {
            setTheme(savedTheme);
        } else {
            setTheme('surreal');
        }
    }, []);

    useEffect(() => {
        const root = window.document.documentElement;
        const body = window.document.body;
        const html = window.document.documentElement;

        // Remove all theme classes
        root.classList.remove('light-mode', 'black-mode', 'dark');

        if (theme === 'light') {
            root.classList.add('light-mode');
            body.style.backgroundColor = '#ffffff';
            html.style.backgroundColor = '#ffffff';
            root.style.setProperty('--bg-primary', '#ffffff');
        } else if (theme === 'black') {
            root.classList.add('black-mode');
            // Force pure black everywhere
            body.style.backgroundColor = '#000000';
            html.style.backgroundColor = '#000000';
            root.style.setProperty('--bg-primary', '#000000');
            // Force all elements to respect black background
            const allElements = document.querySelectorAll('*');
            allElements.forEach(el => {
                if (el.classList.contains('bg-void-900') || el.classList.contains('bg-void-950')) {
                    el.style.backgroundColor = '#000000';
                }
            });
        } else {
            // surreal (default)
            root.classList.add('dark');
            body.style.backgroundColor = '#030014';
            html.style.backgroundColor = '#030014';
            root.style.setProperty('--bg-primary', '#030014');
        }

        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        // Cycle through: surreal -> black -> surreal
        setTheme(prev => {
            if (prev === 'surreal') return 'black';
            return 'surreal';
        });
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
