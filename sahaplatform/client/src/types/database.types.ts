export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            ads: {
                Row: {
                    id: string
                    title: string
                    description: string
                    price: number | null
                    currency_id: string
                    category: string
                    location: string | null
                    address: string | null
                    payment_method: string | null
                    city_id: string | null
                    latitude: number | null
                    longitude: number | null
                    images: string
                    video: string | null
                    is_boosted: boolean
                    is_active: boolean
                    views: number
                    author_id: string
                    created_at: string
                    updated_at: string
                    sub_category: string | null
                }
                Insert: {
                    id?: string
                    title: string
                    title_ar?: string | null
                    title_en?: string | null
                    description: string
                    description_ar?: string | null
                    description_en?: string | null
                    price?: number | null
                    currency_id?: string
                    category: string
                    location?: string | null
                    address?: string | null
                    payment_method?: string | null
                    city_id?: string | null
                    latitude?: number | null
                    longitude?: number | null
                    images?: string
                    video?: string | null
                    is_boosted?: boolean
                    is_active?: boolean
                    views?: number
                    author_id: string
                    created_at?: string
                    updated_at?: string
                    sub_category?: string | null
                }
                Update: {
                    id?: string
                    title?: string
                    title_ar?: string | null
                    title_en?: string | null
                    description?: string
                    description_ar?: string | null
                    description_en?: string | null
                    price?: number | null
                    currency_id?: string
                    category?: string
                    location?: string | null
                    address?: string | null
                    payment_method?: string | null
                    city_id?: string | null
                    latitude?: number | null
                    longitude?: number | null
                    images?: string
                    video?: string | null
                    is_boosted?: boolean
                    is_active?: boolean
                    views?: number
                    author_id?: string
                    created_at?: string
                    updated_at?: string
                    sub_category?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "ads_author_id_fkey"
                        columns: ["author_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "ads_city_id_fkey"
                        columns: ["city_id"]
                        isOneToOne: false
                        referencedRelation: "cities"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "ads_currency_id_fkey"
                        columns: ["currency_id"]
                        isOneToOne: false
                        referencedRelation: "currencies"
                        referencedColumns: ["id"]
                    }
                ]
            }
            users: {
                Row: {
                    id: string
                    name: string | null
                    email: string
                    role: string | null
                    user_type: string | null
                    verified: boolean | null
                    created_at: string
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    name?: string | null
                    email: string
                    created_at?: string
                    updated_at?: string | null
                    role?: string | null
                    user_type?: string | null
                    verified?: boolean | null
                }
                Update: {
                    id?: string
                    name?: string | null
                    email?: string
                    created_at?: string
                    updated_at?: string | null
                    role?: string | null
                    user_type?: string | null
                    verified?: boolean | null
                }
                Relationships: []
            }
            cities: {
                Row: {
                    id: string
                    name: string
                    name_ar: string | null
                    name_en: string | null
                    country_id: string
                    latitude: number | null
                    longitude: number | null
                    is_active: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    name_ar?: string | null
                    name_en?: string | null
                    country_id: string
                    latitude?: number | null
                    longitude?: number | null
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    name_ar?: string | null
                    name_en?: string | null
                    country_id?: string
                    latitude?: number | null
                    longitude?: number | null
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "cities_country_id_fkey"
                        columns: ["country_id"]
                        isOneToOne: false
                        referencedRelation: "countries"
                        referencedColumns: ["id"]
                    }
                ]
            }
            currencies: {
                Row: {
                    id: string
                    code: string
                    symbol: string
                    name: string
                    name_ar: string
                    name_en: string
                    is_active: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    code: string
                    symbol: string
                    name: string
                    name_ar: string
                    name_en: string
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    code?: string
                    symbol?: string
                    name?: string
                    name_ar?: string
                    name_en?: string
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Relationships: []
            }
            conversations: {
                Row: {
                    id: string
                    last_message: string | null
                    last_message_time: string
                    ad_id: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    last_message?: string | null
                    last_message_time?: string
                    ad_id?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    last_message?: string | null
                    last_message_time?: string
                    ad_id?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "conversations_ad_id_fkey"
                        columns: ["ad_id"]
                        isOneToOne: false
                        referencedRelation: "ads"
                        referencedColumns: ["id"]
                    }
                ]
            }
            messages: {
                Row: {
                    id: string
                    content: string
                    message_type: string
                    sender_id: string
                    receiver_id: string
                    conversation_id: string
                    is_read: boolean
                    created_at: string
                    file_url: string | null
                    file_name: string | null
                    file_size: number | null
                }
                Insert: {
                    id?: string
                    content: string
                    message_type?: string
                    sender_id: string
                    receiver_id: string
                    conversation_id: string
                    is_read?: boolean
                    created_at?: string
                    file_url?: string | null
                    file_name?: string | null
                    file_size?: number | null
                }
                Update: {
                    id?: string
                    content?: string
                    message_type?: string
                    sender_id?: string
                    receiver_id?: string
                    conversation_id?: string
                    is_read?: boolean
                    created_at?: string
                    file_url?: string | null
                    file_name?: string | null
                    file_size?: number | null
                }
                Relationships: [
                    {
                        foreignKeyName: "messages_conversation_id_fkey"
                        columns: ["conversation_id"]
                        isOneToOne: false
                        referencedRelation: "conversations"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "messages_receiver_id_fkey"
                        columns: ["receiver_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "messages_sender_id_fkey"
                        columns: ["sender_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            _ConversationParticipants: {
                Row: {
                    A: string
                    B: string
                }
                Insert: {
                    A: string
                    B: string
                }
                Update: {
                    A?: string
                    B?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "_ConversationParticipants_A_fkey"
                        columns: ["A"]
                        isOneToOne: false
                        referencedRelation: "conversations"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "_ConversationParticipants_B_fkey"
                        columns: ["B"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            countries: {
                Row: {
                    id: string
                    name: string
                    name_ar: string | null
                    name_en: string | null
                    code: string
                    phone_code: string
                    currency_id: string
                    flag: string | null
                    is_active: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    name_ar?: string | null
                    name_en?: string | null
                    code: string
                    phone_code: string
                    currency_id: string
                    flag?: string | null
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    name_ar?: string | null
                    name_en?: string | null
                    code?: string
                    phone_code?: string
                    currency_id?: string
                    flag?: string | null
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "countries_currency_id_fkey"
                        columns: ["currency_id"]
                        isOneToOne: false
                        referencedRelation: "currencies"
                        referencedColumns: ["id"]
                    }
                ]
            }
            payments: {
                Row: {
                    id: string
                    user_id: string
                    amount: number
                    currency_id: string
                    status: string
                    payment_method: string
                    transaction_id: string
                    description: string
                    subscription_id: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    amount: number
                    currency_id: string
                    status?: string
                    payment_method: string
                    transaction_id: string
                    description: string
                    subscription_id?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    amount?: number
                    currency_id?: string
                    status?: string
                    payment_method?: string
                    transaction_id?: string
                    description?: string
                    subscription_id?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "payments_currency_id_fkey"
                        columns: ["currency_id"]
                        isOneToOne: false
                        referencedRelation: "currencies"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "payments_subscription_id_fkey"
                        columns: ["subscription_id"]
                        isOneToOne: false
                        referencedRelation: "subscriptions"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "payments_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            subscription_requests: {
                Row: {
                    id: string
                    user_id: string | null
                    user_name: string | null
                    user_email: string | null
                    user_phone: string | null
                    package_name: string | null
                    package_price: string | null
                    message: string | null
                    status: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id?: string | null
                    user_name?: string | null
                    user_email?: string | null
                    user_phone?: string | null
                    package_name?: string | null
                    package_price?: string | null
                    message?: string | null
                    status?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string | null
                    user_name?: string | null
                    user_email?: string | null
                    user_phone?: string | null
                    package_name?: string | null
                    package_price?: string | null
                    message?: string | null
                    status?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "subscription_requests_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            subscriptions: {
                Row: {
                    id: string
                    user_id: string
                    plan_name: string
                    plan_type: string
                    price: number
                    currency_id: string
                    status: string
                    start_date: string
                    end_date: string
                    auto_renew: boolean
                    payment_id: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    plan_name: string
                    plan_type: string
                    price: number
                    currency_id?: string
                    status?: string
                    start_date?: string
                    end_date: string
                    auto_renew?: boolean
                    payment_id?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    plan_name?: string
                    plan_type?: string
                    price?: number
                    currency_id?: string
                    status?: string
                    start_date?: string
                    end_date?: string
                    auto_renew?: boolean
                    payment_id?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "subscriptions_currency_id_fkey"
                        columns: ["currency_id"]
                        isOneToOne: false
                        referencedRelation: "currencies"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "subscriptions_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            verification_tokens: {
                Row: {
                    identifier: string
                    token: string
                    expires: string
                }
                Insert: {
                    identifier: string
                    token: string
                    expires: string
                }
                Update: {
                    identifier?: string
                    token?: string
                    expires?: string
                }
                Relationships: []
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            increment_ad_views: {
                Args: { ad_id: string }
                Returns: undefined
            }
            update_ad_view_count: {
                Args: { ad_id: string }
                Returns: undefined
            }
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}
