"use client";

import React from 'react';

type Props = React.ComponentPropsWithoutRef<'select'> & {
  label?: string;
  hint?: string;
  className?: string;
};

export default function DepthSelect({ label, hint, className = '', children, ...props }: Props) {
  return (
    <div className={`flex flex-col ${className}`}>
      {label && <label className="text-[10px] font-black text-text-main uppercase tracking-widest mb-1">{label}</label>}
      <select {...props} className={`w-full p-3 rounded-md border border-border-color bg-card text-text-main outline-none focus:border-primary transition-all shadow-inner ${props.className || ''}`}>
        {children}
      </select>
      {hint && <span className="text-[10px] text-text-muted mt-1">{hint}</span>}
    </div>
  );
}
