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
            Ad: {
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
                }
                Insert: {
                    id?: string
                    title: string
                    titleAr?: string | null
                    titleEn?: string | null
                    description: string
                    descriptionAr?: string | null
                    descriptionEn?: string | null
                    price?: number | null
                    currencyId?: string
                    category: string
                    location?: string | null
                    address?: string | null
                    paymentMethod?: string | null
                    cityId?: string | null
                    latitude?: number | null
                    longitude?: number | null
                    images?: string
                    video?: string | null
                    isBoosted?: boolean
                    isActive?: boolean
                    views?: number
                    userId: string
                    createdAt?: string
                    updatedAt?: string
                }
                Update: {
                    id?: string
                    title?: string
                    titleAr?: string | null
                    titleEn?: string | null
                    description?: string
                    descriptionAr?: string | null
                    descriptionEn?: string | null
                    price?: number | null
                    currencyId?: string
                    category?: string
                    location?: string | null
                    address?: string | null
                    paymentMethod?: string | null
                    cityId?: string | null
                    latitude?: number | null
                    longitude?: number | null
                    images?: string
                    video?: string | null
                    isBoosted?: boolean
                    isActive?: boolean
                    views?: number
                    userId?: string
                    createdAt?: string
                    updatedAt?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "ads_user_id_fkey"
                        columns: ["userId"]
                        isOneToOne: false
                        referencedRelation: "User"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "ads_city_id_fkey"
                        columns: ["cityId"]
                        isOneToOne: false
                        referencedRelation: "City"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "ads_currency_id_fkey"
                        columns: ["currencyId"]
                        isOneToOne: false
                        referencedRelation: "Currency"
                        referencedColumns: ["id"]
                    }
                ]
            }
            User: {
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
                    id: string
                    name?: string | null
                    email: string
                    createdAt?: string
                }
                Update: {
                    id?: string
                    name?: string | null
                    email?: string
                    createdAt?: string
                }
                Relationships: []
            }
            City: {
                Row: {
                    id: string
                    name: string
                    nameAr: string | null
                    nameEn: string | null
                }
                Insert: {
                    id: string
                    name: string
                    nameAr?: string | null
                    nameEn?: string | null
                }
                Update: {
                    id?: string
                    name?: string
                    nameAr?: string | null
                    nameEn?: string | null
                }
                Relationships: []
            }
            Currency: {
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
            Conversation: {
                Row: {
                    id: string
                    lastMessage: string | null
                    lastMessageTime: string
                    adId: string | null
                    createdAt: string
                    updatedAt: string
                }
                Insert: {
                    id?: string
                    lastMessage?: string | null
                    lastMessageTime?: string
                    adId?: string | null
                    createdAt?: string
                    updatedAt?: string
                }
                Update: {
                    id?: string
                    lastMessage?: string | null
                    lastMessageTime?: string
                    adId?: string | null
                    createdAt?: string
                    updatedAt?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "conversations_ad_id_fkey"
                        columns: ["adId"]
                        isOneToOne: false
                        referencedRelation: "Ad"
                        referencedColumns: ["id"]
                    }
                ]
            }
            Message: {
                Row: {
                    id: string
                    content: string
                    messageType: string
                    senderId: string
                    receiverId: string
                    conversationId: string
                    isRead: boolean
                    createdAt: string
                    fileUrl: string | null
                    fileName: string | null
                    fileSize: number | null
                }
                Insert: {
                    id?: string
                    content: string
                    messageType: string
                    senderId: string
                    receiverId: string
                    conversationId: string
                    isRead?: boolean
                    createdAt?: string
                    fileUrl?: string | null
                    fileName?: string | null
                    fileSize?: number | null
                }
                Update: {
                    id?: string
                    content?: string
                    messageType?: string
                    senderId?: string
                    receiverId?: string
                    conversationId?: string
                    isRead?: boolean
                    createdAt?: string
                    fileUrl?: string | null
                    fileName?: string | null
                    fileSize?: number | null
                }
                Relationships: [
                    {
                        foreignKeyName: "messages_sender_id_fkey"
                        columns: ["senderId"]
                        isOneToOne: false
                        referencedRelation: "User"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "messages_receiver_id_fkey"
                        columns: ["receiverId"]
                        isOneToOne: false
                        referencedRelation: "User"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "messages_conversation_id_fkey"
                        columns: ["conversationId"]
                        isOneToOne: false
                        referencedRelation: "Conversation"
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
                        foreignKeyName: "_conversation_participants_a_fkey"
                        columns: ["A"]
                        isOneToOne: false
                        referencedRelation: "Conversation"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "_conversation_participants_b_fkey"
                        columns: ["B"]
                        isOneToOne: false
                        referencedRelation: "User"
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
                Args: { adId: string }
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
