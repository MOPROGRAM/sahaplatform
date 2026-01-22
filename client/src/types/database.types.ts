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
                    title_ar: string | null
                    title_en: string | null
                    description: string
                    description_ar: string | null
                    description_en: string | null
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
                    created_at: string
                }
                Insert: {
                    id: string
                    name?: string | null
                    email: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string | null
                    email?: string
                    created_at?: string
                }
                Relationships: []
            }
            cities: {
                Row: {
                    id: string
                    name: string
                    name_ar: string | null
                    name_en: string | null
                }
                Insert: {
                    id: string
                    name: string
                    name_ar?: string | null
                    name_en?: string | null
                }
                Update: {
                    id?: string
                    name?: string
                    name_ar?: string | null
                    name_en?: string | null
                }
                Relationships: []
            }
            currencies: {
                Row: {
                    id: string
                    code: string
                    symbol: string
                    name: string
                }
                Insert: {
                    id: string
                    code: string
                    symbol: string
                    name: string
                }
                Update: {
                    id?: string
                    code?: string
                    symbol?: string
                    name?: string
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
                    message_type: string
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
                        foreignKeyName: "messages_sender_id_fkey"
                        columns: ["sender_id"]
                        isOneToOne: false
                        referencedRelation: "users"
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
                        foreignKeyName: "messages_conversation_id_fkey"
                        columns: ["conversation_id"]
                        isOneToOne: false
                        referencedRelation: "conversations"
                        referencedColumns: ["id"]
                    }
                ]
            }
            _conversation_participants: {
                Row: {
                    a: string
                    b: string
                }
                Insert: {
                    a: string
                    b: string
                }
                Update: {
                    a?: string
                    b?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "_conversation_participants_a_fkey"
                        columns: ["a"]
                        isOneToOne: false
                        referencedRelation: "conversations"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "_conversation_participants_b_fkey"
                        columns: ["b"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
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
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}