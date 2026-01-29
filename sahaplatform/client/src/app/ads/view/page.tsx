"use client";

export const runtime = "edge";


import { useSearchParams } from "next/navigation";
import AdDetailsContent from "./AdDetailsContent";
import { Suspense } from "react";

function AdDetailsWrapper() {
    const searchParams = useSearchParams();
    const id = searchParams.get("id");

    if (!id) {
        return <div className="p-10 text-center font-bold text-text-muted">جاري التحميل أو الإعلان غير موجود...</div>; 
    }

    return <AdDetailsContent id={id} />;
}

export default function Page() {
    return (
        <Suspense fallback={<div className="p-10 text-center">جاري التحميل...</div>}>
            <AdDetailsWrapper />
        </Suspense>
    );
}
