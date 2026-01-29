"use client";

import Link from "next/link";
import { Home, Tag, MessageSquare, User, Settings } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

interface NavItem {
    href: string;
    label: string;
    icon: React.ReactNode;
}

interface NavigationMenuProps {
    className?: string;
}

export default function NavigationMenu({ className = "" }: NavigationMenuProps) {
    const { t } = useLanguage();
    const navItems: NavItem[] = [
        { href: "/", label: t('home'), icon: <Home size={24} /> },
        { href: "/ads", label: t('ads'), icon: <Tag size={24} /> },
        { href: "/messages", label: t('messages'), icon: <MessageSquare size={24} /> },
        { href: "/profile", label: t('settings'), icon: <User size={24} /> },
        { href: "/settings", label: t('settings'), icon: <Settings size={24} /> },
    ];
    return (
        <nav className={`nav-menu ${className}`}>
            {navItems.map((item) => (
                <Link key={item.href} href={item.href} className="nav-link">
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-title">{item.label}</span>
                </Link>
            ))}
        </nav>
    );
}