-- Enable Realtime for chat_messages table
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;

-- Create RLS policies for chat_messages
-- Allow anonymous users to read all messages
CREATE POLICY "Allow anonymous users to read chat messages" ON chat_messages
  FOR SELECT
  TO anon
  USING (true);

-- Allow anonymous users to insert messages
CREATE POLICY "Allow anonymous users to insert chat messages" ON chat_messages
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow authenticated users to read all messages
CREATE POLICY "Allow authenticated users to read chat messages" ON chat_messages
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert messages
CREATE POLICY "Allow authenticated users to insert chat messages" ON chat_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Grant necessary permissions
GRANT SELECT, INSERT ON chat_messages TO anon;
GRANT SELECT, INSERT ON chat_messages TO authenticated;