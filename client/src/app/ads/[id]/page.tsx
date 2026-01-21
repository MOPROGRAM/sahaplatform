"use client";

import { useParams } from "next/navigation";

export const dynamic = 'force-dynamic';
import AdDetailsContent from "../view/AdDetailsContent";
import { Suspense } from "react";

function AdDetailsWrapper() {
    const params = useParams();
    const id = params.id as string;

    if (!id) {
        return <div className="p-10 text-center font-bold text-gray-400">جاري التحميل أو الإعلان غير موجود...</div>;
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