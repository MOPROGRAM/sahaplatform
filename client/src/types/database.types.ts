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
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}