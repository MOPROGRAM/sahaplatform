-- Saha Platform Database Schema for Cloudflare D1
-- Migration: 001_initial_schema

-- Create Currency table
CREATE TABLE IF NOT EXISTS Currency (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    nameAr TEXT,
    nameEn TEXT,
    code TEXT UNIQUE NOT NULL,
    symbol TEXT NOT NULL,
    isActive INTEGER DEFAULT 1,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Create Country table
CREATE TABLE IF NOT EXISTS Country (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    nameAr TEXT,
    nameEn TEXT,
    code TEXT UNIQUE NOT NULL,
    phoneCode TEXT NOT NULL,
    currencyId TEXT NOT NULL,
    flag TEXT,
    isActive INTEGER DEFAULT 1,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (currencyId) REFERENCES Currency(id)
);

-- Create City table
CREATE TABLE IF NOT EXISTS City (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    nameAr TEXT,
    nameEn TEXT,
    countryId TEXT NOT NULL,
    latitude REAL,
    longitude REAL,
    isActive INTEGER DEFAULT 1,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (countryId) REFERENCES Country(id)
);

-- Create User table (simplified for D1)
CREATE TABLE IF NOT EXISTS User (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE,
    emailVerified TEXT,
    image TEXT,
    password TEXT,
    role TEXT DEFAULT 'USER',
    verified INTEGER DEFAULT 0,
    phone TEXT,
    phoneVerified INTEGER DEFAULT 0,
    countryId TEXT,
    cityId TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (countryId) REFERENCES Country(id),
    FOREIGN KEY (cityId) REFERENCES City(id)
);

-- Create Ad table (main table for the platform)
CREATE TABLE IF NOT EXISTS Ad (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    titleAr TEXT,
    titleEn TEXT,
    description TEXT NOT NULL,
    descriptionAr TEXT,
    descriptionEn TEXT,
    price REAL,
    currencyId TEXT DEFAULT 'sar',
    category TEXT NOT NULL,
    cityId TEXT,
    latitude REAL,
    longitude REAL,
    images TEXT DEFAULT '[]', -- JSON array
    video TEXT,
    isBoosted INTEGER DEFAULT 0,
    isActive INTEGER DEFAULT 1,
    views INTEGER DEFAULT 0,
    authorId TEXT NOT NULL,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (currencyId) REFERENCES Currency(id),
    FOREIGN KEY (cityId) REFERENCES City(id),
    FOREIGN KEY (authorId) REFERENCES User(id)
);

-- Insert basic data
INSERT OR IGNORE INTO Currency (id, code, symbol, name, nameAr, nameEn, isActive) VALUES
('sar', 'sar', 'ر.س', 'Saudi Riyal', 'الريال السعودي', 'Saudi Riyal', 1),
('aed', 'aed', 'د.إ', 'UAE Dirham', 'الدرهم الإماراتي', 'UAE Dirham', 1),
('egp', 'egp', 'ج.م', 'Egyptian Pound', 'الجنيه المصري', 'Egyptian Pound', 1),
('usd', 'usd', '$', 'US Dollar', 'الدولار الأمريكي', 'US Dollar', 1);

INSERT OR IGNORE INTO Country (id, code, name, nameAr, nameEn, phoneCode, currencyId, flag, isActive) VALUES
('SA', 'SA', 'Saudi Arabia', 'المملكة العربية السعودية', 'Saudi Arabia', '+966', 'sar', '🇸🇦', 1),
('AE', 'AE', 'UAE', 'الإمارات العربية المتحدة', 'UAE', '+971', 'aed', '🇦🇪', 1),
('EG', 'EG', 'Egypt', 'مصر', 'Egypt', '+20', 'egp', '🇪🇬', 1);

INSERT OR IGNORE INTO City (id, name, nameAr, nameEn, countryId, latitude, longitude, isActive) VALUES
('riyadh', 'Riyadh', 'الرياض', 'Riyadh', 'SA', 24.7136, 46.6753, 1),
('dubai', 'Dubai', 'دبي', 'Dubai', 'AE', 25.2048, 55.2708, 1),
('cairo', 'Cairo', 'القاهرة', 'Cairo', 'EG', 30.0444, 31.2357, 1);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ad_category ON Ad(category);
CREATE INDEX IF NOT EXISTS idx_ad_city ON Ad(cityId);
CREATE INDEX IF NOT EXISTS idx_ad_active ON Ad(isActive);
CREATE INDEX IF NOT EXISTS idx_ad_created ON Ad(createdAt DESC);
CREATE INDEX IF NOT EXISTS idx_ad_author ON Ad(authorId);