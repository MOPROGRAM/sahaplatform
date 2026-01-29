"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeSwitch() {
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    return (
        <div className="theme-switch">
            <input
                type="checkbox"
                className="theme-switch__checkbox"
                id="theme-switch"
                checked={theme === "dark"}
                onChange={() => setTheme(theme === "dark" ? "light" : "dark")}
            />
            <label className="theme-switch__container" htmlFor="theme-switch">
                <div className="theme-switch__circle-container">
                    <div className="theme-switch__sun-moon-container">
                        <div className="theme-switch__moon">
                            <div className="theme-switch__spot"></div>
                            <div className="theme-switch__spot"></div>
                            <div className="theme-switch__spot"></div>
                        </div>
                        <div className="theme-switch__clouds">
                            <span className="theme-switch__cloud"></span>
                            <span className="theme-switch__cloud"></span>
                            <span className="theme-switch__cloud"></span>
                        </div>
                    </div>
                </div>
                <div className="theme-switch__stars-container">
                    <svg
                        className="theme-switch__stars"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 100 100"
                        fill="currentColor"
                    >
                        <path d="M10 40 L15 35 L20 40 L15 30 Z" />
                        <path d="M30 20 L35 15 L40 20 L35 10 Z" />
                        <path d="M60 30 L65 25 L70 30 L65 20 Z" />
                        <path d="M80 50 L85 45 L90 50 L85 40 Z" />
                        <path d="M50 70 L55 65 L60 70 L55 60 Z" />
                    </svg>
                </div>
            </label>
        </div>
    );
}