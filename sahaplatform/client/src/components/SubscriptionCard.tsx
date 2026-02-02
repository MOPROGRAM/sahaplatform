"use client";

import { useLanguage } from "@/lib/language-context";

interface SubscriptionCardProps {
    name: string;
    price: string;
    currency?: string;
    features: string[];
    popular?: boolean;
    onSubscribe?: () => void;
    className?: string;
}

export default function SubscriptionCard({
    name,
    price,
    currency = "SAR",
    features,
    popular = false,
    onSubscribe,
    className = ""
}: SubscriptionCardProps) {
    const { language } = useLanguage();

    return (
        <div className={`subscription-card ${popular ? 'ring-2 ring-primary' : ''} ${className}`}>
            {popular && (
                <div className="absolute top-4 left-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {language === 'ar' ? 'الأكثر شعبية' : 'most popular'}
                </div>
            )}

            <div className="card-header">
                <h3 className="plan-name">{name}</h3>
                <div className="plan-price">
                    {price} <span className="text-sm font-normal">{currency}</span>
                </div>
            </div>

            <div className="plan-features">
                {features.map((feature, index) => (
                    <div key={index} className="feature">
                        {feature}
                    </div>
                ))}
            </div>

            <div className="card-footer">
                <button className="btn-subscribe" onClick={onSubscribe}>
                    {language === 'ar' ? 'ط·آ§ط·آ´ط·ع¾ط·آ±ط¸ئ’ ط·آ§ط¸â€‍ط·آ¢ط¸â€ ' : 'subscribe now'}
                </button>
            </div>
        </div>
    );
}