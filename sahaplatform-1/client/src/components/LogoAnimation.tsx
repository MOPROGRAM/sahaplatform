"use client";

interface LogoAnimationProps {
    text?: string;
    className?: string;
}

export default function LogoAnimation({
    text = "SAHA",
    className = ""
}: LogoAnimationProps) {
    return (
        <div className={`logo-wrapper ${className}`}>
            <div className="logo-loader" />
            {text.split('').map((letter, index) => (
                <span key={index} className="logo-letter">
                    {letter}
                </span>
            ))}
        </div>
    );
}