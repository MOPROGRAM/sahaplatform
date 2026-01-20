"use client";

import Link from "next/link";
import { Home, Tag, MessageSquare, User, Settings } from "lucide-react";

interface NavItem {
    href: string;
    label: string;
    icon: React.ReactNode;
}

interface NavigationMenuProps {
    className?: string;
}

const navItems: NavItem[] = [
    { href: "/", label: "الرئيسية", icon: <Home size={24} /> },
    { href: "/ads", label: "الإعلانات", icon: <Tag size={24} /> },
    { href: "/messages", label: "الرسائل", icon: <MessageSquare size={24} /> },
    { href: "/profile", label: "الملف", icon: <User size={24} /> },
    { href: "/settings", label: "الإعدادات", icon: <Settings size={24} /> },
];

export default function NavigationMenu({ className = "" }: NavigationMenuProps) {
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