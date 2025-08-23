-- Fix RLS policies for chat_messages table

-- Grant necessary permissions to anon role
GRANT SELECT, INSERT ON chat_messages TO anon;
GRANT SELECT, INSERT ON chat_messages TO authenticated;

-- Ensure RLS is enabled
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Anyone can read chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Anyone can insert chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Allow anonymous users to read chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Allow anonymous users to insert chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Allow authenticated users to read chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Allow authenticated users to insert chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Enable read access for all users" ON chat_messages;
DROP POLICY IF EXISTS "Enable insert access for all users" ON chat_messages;

-- Create simple, working policies
CREATE POLICY "chat_select_policy" ON chat_messages
  FOR SELECT USING (true);

CREATE POLICY "chat_insert_policy" ON chat_messages
  FOR INSERT WITH CHECK (true);