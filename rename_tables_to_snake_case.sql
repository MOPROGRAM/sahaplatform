-- =============================================
-- SAHA PLATFORM - Rename Tables and Columns to snake_case (Revised)
-- =============================================
-- This script renames PascalCase tables and columns to snake_case
-- and updates foreign key constraints.
-- It is designed to be idempotent and handle cases where renames might have partially occurred.
-- Run this in Supabase SQL Editor.
-- WARNING: Ensure you have a backup of your database before running this script.
-- =============================================

-- Step 1: Drop existing foreign key constraints that reference PascalCase tables or columns
-- This is necessary before renaming tables/columns to avoid errors.

-- Drop constraints from tables that might reference PascalCase tables/columns
ALTER TABLE IF EXISTS "public"."Ad" DROP CONSTRAINT IF EXISTS "Ad_city_id_fkey";
ALTER TABLE IF EXISTS "public"."Ad" DROP CONSTRAINT IF EXISTS "Ad_currency_id_fkey";
ALTER TABLE IF EXISTS "public"."Ad" DROP CONSTRAINT IF EXISTS "Ad_author_id_fkey";

ALTER TABLE IF EXISTS "public"."City" DROP CONSTRAINT IF EXISTS "City_countryId_fkey";

ALTER TABLE "public"."Conversation" DROP CONSTRAINT IF EXISTS "Conversation_ad_id_fkey";

ALTER TABLE IF EXISTS "public"."Country" DROP CONSTRAINT IF EXISTS "Country_currencyId_fkey";

ALTER TABLE IF EXISTS "public"."Message" DROP CONSTRAINT IF EXISTS "Message_conversation_id_fkey";
ALTER TABLE "public"."Message" DROP CONSTRAINT IF EXISTS "Message_sender_id_fkey";
ALTER TABLE "public"."Message" DROP CONSTRAINT IF EXISTS "Message_receiver_id_fkey";

ALTER TABLE IF EXISTS "public"."Payment" DROP CONSTRAINT IF EXISTS "Payment_currencyId_fkey";
ALTER TABLE IF EXISTS "public"."Payment" DROP CONSTRAINT IF EXISTS "Payment_subscriptionId_fkey";

ALTER TABLE IF EXISTS "public"."Subscription" DROP CONSTRAINT IF EXISTS "Subscription_currencyId_fkey";

ALTER TABLE IF EXISTS "public"."_conversation_participants" DROP CONSTRAINT IF EXISTS "_conversation_participants_conversation_id_fkey";
ALTER TABLE IF EXISTS "public"."_conversation_participants" DROP CONSTRAINT IF EXISTS "_conversation_participants_user_id_fkey";

ALTER TABLE IF EXISTS "public"."subscription_requests" DROP CONSTRAINT IF EXISTS "subscription_requests_user_id_fkey";


-- Step 2: Rename tables from PascalCase to snake_case
-- Check if table exists before renaming to avoid errors.

DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'Account') THEN ALTER TABLE "public"."Account" RENAME TO "accounts"; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'Ad') THEN ALTER TABLE "public"."Ad" RENAME TO "ads"; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'City') THEN ALTER TABLE "public"."City" RENAME TO "cities_temp"; END IF; END $$; -- Rename to a temporary name first
DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'Conversation') THEN ALTER TABLE "public"."Conversation" RENAME TO "conversations"; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'Country') THEN ALTER TABLE "public"."Country" RENAME TO "countries"; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'Currency') THEN ALTER TABLE "public"."Currency" RENAME TO "currencies_temp"; END IF; END $$; -- Rename to a temporary name first
DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'Message') THEN ALTER TABLE "public"."Message" RENAME TO "messages"; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'Payment') THEN ALTER TABLE "public"."Payment" RENAME TO "payments"; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'Session') THEN ALTER TABLE "public"."Session" RENAME TO "sessions"; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'Subscription') THEN ALTER TABLE "public"."Subscription" RENAME TO "subscriptions"; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'User') THEN ALTER TABLE "public"."User" RENAME TO "users"; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'VerificationToken') THEN ALTER TABLE "public"."VerificationToken" RENAME TO "verification_tokens"; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = '_ConversationToUser') THEN ALTER TABLE "public"."_ConversationToUser" RENAME TO "_conversation_to_user"; END IF; END $$;

-- Step 3: Rename columns from PascalCase to snake_case in newly renamed tables

-- accounts table columns
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'accounts' AND column_name = 'userId') THEN ALTER TABLE "public"."accounts" RENAME COLUMN "userId" TO "user_id"; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'accounts' AND column_name = 'providerAccountId') THEN ALTER TABLE "public"."accounts" RENAME COLUMN "providerAccountId" TO "provider_account_id"; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'accounts' AND column_name = 'expires_at') THEN ALTER TABLE "public"."accounts" ALTER COLUMN "expires_at" TYPE BIGINT; END IF; END $$;
-- Removed: DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'accounts' AND column_name = 'token_type') THEN ALTER TABLE "public"."accounts" RENAME COLUMN "token_type" TO "token_type"; END IF; END $$; -- Already snake_case or renamed
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'accounts' AND column_name = 'session_state') THEN ALTER TABLE "public"."accounts" RENAME COLUMN "session_state" TO "session_state"; END IF; END $$;

-- cities_temp table columns (will become cities)
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cities_temp' AND column_name = 'nameAr') THEN ALTER TABLE "public"."cities_temp" RENAME COLUMN "nameAr" TO "name_ar"; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cities_temp' AND column_name = 'nameEn') THEN ALTER TABLE "public"."cities_temp" RENAME COLUMN "nameEn" TO "name_en"; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cities_temp' AND column_name = 'countryId') THEN ALTER TABLE "public"."cities_temp" RENAME COLUMN "countryId" TO "country_id"; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cities_temp' AND column_name = 'isActive') THEN ALTER TABLE "public"."cities_temp" RENAME COLUMN "isActive" TO "is_active"; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cities_temp' AND column_name = 'createdAt') THEN ALTER TABLE "public"."cities_temp" RENAME COLUMN "createdAt" TO "created_at"; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cities_temp' AND column_name = 'updatedAt') THEN ALTER TABLE "public"."cities_temp" RENAME COLUMN "updatedAt" TO "updated_at"; END IF; END $$;

-- currencies_temp table columns (will become currencies)
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'currencies_temp' AND column_name = 'nameAr') THEN ALTER TABLE "public"."currencies_temp" RENAME COLUMN "nameAr" TO "name_ar"; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'currencies_temp' AND column_name = 'nameEn') THEN ALTER TABLE "public"."currencies_temp" RENAME COLUMN "nameEn" TO "name_en"; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'currencies_temp' AND column_name = 'isActive') THEN ALTER TABLE "public"."currencies_temp" RENAME COLUMN "isActive" TO "is_active"; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'currencies_temp' AND column_name = 'createdAt') THEN ALTER TABLE "public"."currencies_temp" RENAME COLUMN "createdAt" TO "created_at"; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'currencies_temp' AND column_name = 'updatedAt') THEN ALTER TABLE "public"."currencies_temp" RENAME COLUMN "updatedAt" TO "updated_at"; END IF; END $$;

-- countries table columns
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'countries' AND column_name = 'nameAr') THEN ALTER TABLE "public"."countries" RENAME COLUMN "nameAr" TO "name_ar"; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'countries' AND column_name = 'nameEn') THEN ALTER TABLE "public"."countries" RENAME COLUMN "nameEn" TO "name_en"; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'countries' AND column_name = 'phoneCode') THEN ALTER TABLE "public"."countries" RENAME COLUMN "phoneCode" TO "phone_code"; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'countries' AND column_name = 'currencyId') THEN ALTER TABLE "public"."countries" RENAME COLUMN "currencyId" TO "currency_id"; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'countries' AND column_name = 'isActive') THEN ALTER TABLE "public"."countries" RENAME COLUMN "isActive" TO "is_active"; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'countries' AND column_name = 'createdAt') THEN ALTER TABLE "public"."countries" RENAME COLUMN "createdAt" TO "created_at"; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'countries' AND column_name = 'updatedAt') THEN ALTER TABLE "public"."countries" RENAME COLUMN "updatedAt" TO "updated_at"; END IF; END $$;

-- messages table columns
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'messageType') THEN ALTER TABLE "public"."messages" RENAME COLUMN "messageType" TO "message_type"; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'senderId') THEN ALTER TABLE "public"."messages" RENAME COLUMN "senderId" TO "sender_id"; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'receiverId') THEN ALTER TABLE "public"."messages" RENAME COLUMN "receiverId" TO "receiver_id"; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'conversationId') THEN ALTER TABLE "public"."messages" RENAME COLUMN "conversationId" TO "conversation_id"; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'isRead') THEN ALTER TABLE "public"."messages" RENAME COLUMN "isRead" TO "is_read"; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'createdAt') THEN ALTER TABLE "public"."messages" RENAME COLUMN "createdAt" TO "created_at"; END IF; END $$;

-- payments table columns
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'userId') THEN ALTER TABLE "public"."payments" RENAME COLUMN "userId" TO "user_id"; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'currencyId') THEN ALTER TABLE "public"."payments" RENAME COLUMN "currencyId" TO "currency_id"; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'paymentMethod') THEN ALTER TABLE "public"."payments" RENAME COLUMN "paymentMethod" TO "payment_method"; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'transactionId') THEN ALTER TABLE "public"."payments" RENAME COLUMN "transactionId" TO "transaction_id"; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'subscriptionId') THEN ALTER TABLE "public"."payments" RENAME COLUMN "subscriptionId" TO "subscription_id"; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'createdAt') THEN ALTER TABLE "public"."payments" RENAME COLUMN "createdAt" TO "created_at"; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'updatedAt') THEN ALTER TABLE "public"."payments" RENAME COLUMN "updatedAt" TO "updated_at"; END IF; END $$;

-- sessions table columns
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessions' AND column_name = 'sessionToken') THEN ALTER TABLE "public"."sessions" RENAME COLUMN "sessionToken" TO "session_token"; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessions' AND column_name = 'userId') THEN ALTER TABLE "public"."sessions" RENAME COLUMN "userId" TO "user_id"; END IF; END $$;

-- subscriptions table columns
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'userId') THEN ALTER TABLE "public"."subscriptions" RENAME COLUMN "userId" TO "user_id"; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'planName') THEN ALTER TABLE "public"."subscriptions" RENAME COLUMN "planName" TO "plan_name"; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'planType') THEN ALTER TABLE "public"."subscriptions" RENAME COLUMN "planType" TO "plan_type"; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'currencyId') THEN ALTER TABLE "public"."subscriptions" RENAME COLUMN "currencyId" TO "currency_id"; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'startDate') THEN ALTER TABLE "public"."subscriptions" RENAME COLUMN "startDate" TO "start_date"; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'endDate') THEN ALTER TABLE "public"."subscriptions" RENAME COLUMN "endDate" TO "end_date"; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'autoRenew') THEN ALTER TABLE "public"."subscriptions" RENAME COLUMN "autoRenew" TO "auto_renew"; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'paymentId') THEN ALTER TABLE "public"."subscriptions" RENAME COLUMN "paymentId" TO "payment_id"; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'createdAt') THEN ALTER TABLE "public"."subscriptions" RENAME COLUMN "createdAt" TO "created_at"; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'updatedAt') THEN ALTER TABLE "public"."subscriptions" RENAME COLUMN "updatedAt" TO "updated_at"; END IF; END $$;

-- verification_tokens table columns
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'verification_tokens' AND column_name = 'expires') THEN ALTER TABLE "public"."verification_tokens" ALTER COLUMN "expires" TYPE TIMESTAMP(3) WITH TIME ZONE; END IF; END $$;

-- _conversation_to_user table columns
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = '_conversation_to_user' AND column_name = 'A') THEN ALTER TABLE "public"."_conversation_to_user" RENAME COLUMN "A" TO "conversation_id"; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = '_conversation_to_user' AND column_name = 'B') THEN ALTER TABLE "public"."_conversation_to_user" RENAME COLUMN "B" TO "user_id"; END IF; END $$;

-- Step 4: Rename temporary tables to their final snake_case names
DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'cities_temp') THEN ALTER TABLE "public"."cities_temp" RENAME TO "cities"; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'currencies_temp') THEN ALTER TABLE "public"."currencies_temp" RENAME TO "currencies"; END IF; END $$;

-- Step 5: Re-add foreign key constraints with correct snake_case table and column names

-- accounts table foreign keys
ALTER TABLE "public"."accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"(id) ON DELETE CASCADE;
ALTER TABLE "public"."accounts" ADD CONSTRAINT "accounts_provider_provider_account_id_key" UNIQUE ("provider", "provider_account_id");

-- ads table foreign keys
ALTER TABLE "public"."ads" ADD CONSTRAINT "ads_city_id_fkey" FOREIGN KEY (city_id) REFERENCES "public"."cities"(id);
ALTER TABLE "public"."ads" ADD CONSTRAINT "ads_currency_id_fkey" FOREIGN KEY (currency_id) REFERENCES "public"."currencies"(id);
ALTER TABLE "public"."ads" ADD CONSTRAINT "ads_author_id_fkey" FOREIGN KEY (author_id) REFERENCES "public"."users"(id);

-- cities table foreign keys
ALTER TABLE "public"."cities" ADD CONSTRAINT "cities_country_id_fkey" FOREIGN KEY (country_id) REFERENCES "public"."countries"(id);

-- conversations table foreign keys
ALTER TABLE "public"."conversations" ADD CONSTRAINT "conversations_ad_id_fkey" FOREIGN KEY (ad_id) REFERENCES "public"."ads"(id);

-- countries table foreign keys
ALTER TABLE "public"."countries" ADD CONSTRAINT "countries_currency_id_fkey" FOREIGN KEY (currency_id) REFERENCES "public"."currencies"(id);

-- messages table foreign keys
ALTER TABLE "public"."messages" ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY (conversation_id) REFERENCES "public"."conversations"(id);
ALTER TABLE "public"."messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY (sender_id) REFERENCES "public"."users"(id);
ALTER TABLE "public"."messages" ADD CONSTRAINT "messages_receiver_id_fkey" FOREIGN KEY (receiver_id) REFERENCES "public"."users"(id);

-- payments table foreign keys
ALTER TABLE "public"."payments" ADD CONSTRAINT "payments_currency_id_fkey" FOREIGN KEY (currency_id) REFERENCES "public"."currencies"(id);
ALTER TABLE "public"."payments" ADD CONSTRAINT "payments_subscription_id_fkey" FOREIGN KEY (subscription_id) REFERENCES "public"."subscriptions"(id);

-- sessions table foreign keys
ALTER TABLE "public"."sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"(id) ON DELETE CASCADE;
ALTER TABLE "public"."sessions" ADD CONSTRAINT "sessions_session_token_key" UNIQUE ("session_token");

-- subscriptions table foreign keys
ALTER TABLE "public"."subscriptions" ADD CONSTRAINT "subscriptions_currency_id_fkey" FOREIGN KEY (currency_id) REFERENCES "public"."currencies"(id);
ALTER TABLE "public"."subscriptions" ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"(id);

-- verification_tokens table foreign keys
ALTER TABLE "public"."verification_tokens" ADD CONSTRAINT "verification_tokens_token_key" UNIQUE ("token");
ALTER TABLE "public"."verification_tokens" ADD CONSTRAINT "verification_tokens_identifier_token_key" UNIQUE ("identifier", "token");

-- _conversation_participants table foreign keys
ALTER TABLE "public"."_conversation_participants" ADD CONSTRAINT "_conversation_participants_conversation_id_fkey" FOREIGN KEY (conversation_id) REFERENCES "public"."conversations"(id);
ALTER TABLE "public"."_conversation_participants" ADD CONSTRAINT "_conversation_participants_user_id_fkey" FOREIGN KEY (user_id) REFERENCES "public"."users"(id);

-- _conversation_to_user table foreign keys
ALTER TABLE "public"."_conversation_to_user" ADD CONSTRAINT "_conversation_to_user_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"(id) ON DELETE CASCADE;
ALTER TABLE "public"."_conversation_to_user" ADD CONSTRAINT "_conversation_to_user_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"(id) ON DELETE CASCADE;
ALTER TABLE "public"."_conversation_to_user" ADD CONSTRAINT "_conversation_to_user_pkey" PRIMARY KEY ("conversation_id", "user_id");

-- subscription_requests table foreign keys
ALTER TABLE "public"."subscription_requests" ADD CONSTRAINT "subscription_requests_user_id_fkey" FOREIGN KEY (user_id) REFERENCES "public"."users"(id);

-- =============================================
-- DONE! ✅
-- =============================================
-- Now, re-run your RLS policy scripts:
-- fix_chat_policies.sql
-- fix_conversation_policies.sql
-- =============================================
