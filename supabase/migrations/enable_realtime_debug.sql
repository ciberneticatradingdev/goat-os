-- Debug and enable realtime for chat_messages table

-- Check if realtime is enabled for the table
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' AND tablename = 'chat_messages';

-- If not found, add the table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;

-- Check current RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'chat_messages';

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

-- Create simple, working policies
CREATE POLICY "Enable read access for all users" ON chat_messages
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON chat_messages
  FOR INSERT WITH CHECK (true);

-- Verify the setup
SELECT 
  'Realtime enabled' as check_type,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' AND tablename = 'chat_messages'
    ) THEN 'YES' 
    ELSE 'NO' 
  END as status;

SELECT 
  'RLS enabled' as check_type,
  CASE 
    WHEN relrowsecurity THEN 'YES' 
    ELSE 'NO' 
  END as status
FROM pg_class 
WHERE relname = 'chat_messages';

SELECT 
  'Policies count' as check_type,
  COUNT(*)::text as status
FROM pg_policies 
WHERE tablename = 'chat_messages';