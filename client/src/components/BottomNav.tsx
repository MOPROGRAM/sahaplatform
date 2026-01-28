"use client";

import { Home, Search, PlusSquare, MessageSquare, UserCircle, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/lib/language-context";

export default function BottomNav() {
    const pathname = usePathname();

    const { t, theme, toggleTheme } = useLanguage();
    const navItems = [
        { label: t("home"), icon: <Home size={22} />, path: "/" },
        { label: t("categories"), icon: <Search size={22} />, path: "/ads" },
        { label: t("postAd"), icon: <PlusSquare size={26} />, path: "/post-ad", center: true },
        { label: t("messages"), icon: <MessageSquare size={22} />, path: "/messages" },
        { label: t("dashboard"), icon: <UserCircle size={22} />, path: "/dashboard" },
        { label: theme === "light" ? (t as any)["darkMode"] : (t as any)["lightMode"], icon: theme === "light" ? <Moon size={22} /> : <Sun size={22} />, action: toggleTheme },
    ];

    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-gray-800 px-4 py-2 flex justify-between items-center z-[100] shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
            {navItems.map((item, i) => (
                <Link
                    key={i}
                    href={item.path || "#"}
                    prefetch={false}
                    className={`flex flex-col items-center gap-1 ${item.center ? "-mt-10" : ""}`}
                    onClick={item.action}
                >
                    <div className={`p-2 rounded-full transition-all ${item.center
                        ? "bg-primary text-white shadow-lg shadow-primary/40 p-4 border-4 border-white dark:border-slate-900"
                        : pathname === item.path ? "text-primary" : "text-text-muted"
                        }`}>
                        {item.icon}
                    </div>
                    {!item.center && (
                        <span className={`text-[10px] font-bold ${pathname === item.path ? "text-primary" : "text-text-muted"}`}>
                            {item.label}
                        </span>
                    )}
                </Link>
            ))}
        </div>
    );
}
