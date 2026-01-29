"use client";

import { useParams } from "next/navigation";
import AdDetailsContent from "../view/AdDetailsContent";

export function AdDetailsClientWrapper() {
    const params = useParams();
    const id = params.id as string;

    if (!id) {
        return <div className="p-10 text-center font-bold text-text-muted">جاري التحميل أو الإعلان غير موجود...</div>;
    }

    return <AdDetailsContent id={id} />;
}
