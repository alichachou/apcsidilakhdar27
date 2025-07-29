/*
  # Fix messages table RLS policy for anonymous users

  1. Security Changes
    - Update the existing INSERT policy to properly allow anonymous users to insert messages
    - Ensure the policy allows both 'anon' and 'authenticated' roles to insert messages
    - Keep existing SELECT and UPDATE policies for authenticated users only

  This fixes the "new row violates row-level security policy" error when anonymous users
  try to submit contact form messages.
*/

-- Drop the existing insert policy if it exists
DROP POLICY IF EXISTS "Anyone can insert messages" ON messages;

-- Create a new policy that properly allows anonymous users to insert messages
CREATE POLICY "Allow anonymous and authenticated users to insert messages"
  ON messages
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);