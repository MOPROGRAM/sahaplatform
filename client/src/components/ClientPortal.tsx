"use client";

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface ClientPortalProps {
    children: React.ReactNode;
    selector?: string;
}

export default function ClientPortal({ children, selector = 'body' }: ClientPortalProps) {
    const [mounted, setMounted] = useState(false);
    const ref = useRef<Element | null>(null);

    useEffect(() => {
        ref.current = document.querySelector(selector);
        setMounted(true);
    }, [selector]);

    if (!mounted || !ref.current) return null;

    return createPortal(children, ref.current);
}
