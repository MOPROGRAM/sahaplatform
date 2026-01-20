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
        <form className={`search-form ${className}`} onSubmit={handleSubmit}>
            <input
                type="text"
                className="search-input"
                placeholder={placeholder}
                value={searchValue}
                onChange={handleChange}
            />
            {searchValue && (
                <button
                    type="button"
                    className="search-reset"
                    onClick={handleClear}
                    aria-label="مسح البحث"
                >
                    <X size={16} />
                </button>
            )}
            <Search />
        </form>
    );
}