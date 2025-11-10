-- Add gender column to profiles table
ALTER TABLE profiles 
ADD COLUMN gender TEXT CHECK (gender IN ('erkek', 'kadın', 'diğer')) DEFAULT 'erkek';