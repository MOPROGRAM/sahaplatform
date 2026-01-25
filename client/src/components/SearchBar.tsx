"use client";

import { Search, X } from "lucide-react";
import { useState } from "react";

interface SearchBarProps {
    placeholder?: string;
    value?: string;
    onChange?: (value: string) => void;
    onSearch?: (value: string) => void;
    className?: string;
}

export default function SearchBar({
    placeholder = "البحث...",
    value = "",
    onChange,
    onSearch,
    className = ""
}: SearchBarProps) {
    const [searchValue, setSearchValue] = useState(value);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setSearchValue(newValue);
        onChange?.(newValue);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch?.(searchValue);
    };

    const handleClear = () => {
        setSearchValue("");
        onChange?.("");
    };

    return (
        <form className={`search-form input-glow flex items-center bg-white border border-gray-200 rounded-full px-4 py-2 transition-all duration-300 w-full max-w-lg shadow-sm hover:shadow-md ${className}`} onSubmit={handleSubmit}>
            <Search className="text-text-muted w-5 h-5 shrink-0" />
            <input
                type="text"
                className="search-input w-full bg-transparent border-none outline-none px-3 text-sm font-medium text-gray-700 placeholder-gray-400"
                placeholder={placeholder}
                value={searchValue}
                onChange={handleChange}
            />
            {searchValue && (
                <button
                    type="button"
                    className="p-1 rounded-full hover:bg-card/30 text-text-muted hover:text-red-500 transition-colors"
                    onClick={handleClear}
                    aria-label="Clear Search"
                >
                    <X size={14} />
                </button>
            )}
        </form>
    );
}