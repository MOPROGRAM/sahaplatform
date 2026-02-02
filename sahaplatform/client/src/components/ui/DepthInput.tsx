"use client";

import React from 'react';

type Props = React.ComponentPropsWithoutRef<'input'> & {
  label?: string;
  hint?: string;
  className?: string;
};

export default function DepthInput({ label, hint, className = '', ...props }: Props) {
  return (
    <div className={`flex flex-col ${className}`}>
      {label && <label className="text-[10px] font-black text-text-main uppercase tracking-widest mb-1">{label}</label>}
      <input
        {...props}
        className={`w-full p-3 rounded-md border border-border-color bg-card text-text-main outline-none focus:border-primary transition-all shadow-inner ${props.className || ''}`}
      />
      {hint && <span className="text-[10px] text-text-muted mt-1">{hint}</span>}
    </div>
  );
}