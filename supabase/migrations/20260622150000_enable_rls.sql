-- Enable Row Level Security (RLS) on all public tables
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- 1. account_members policies
-- Users can only see memberships that belong to them
CREATE POLICY "Users can view their own memberships" 
ON account_members FOR SELECT 
TO authenticated 
USING (user_id = auth.uid());

-- 2. accounts policies
-- Users can view accounts they are members of
CREATE POLICY "Users can view accounts they belong to" 
ON accounts FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM account_members 
    WHERE account_members.account_id = accounts.id 
    AND account_members.user_id = auth.uid()
  )
);

-- Users can update accounts they are members of
CREATE POLICY "Users can update accounts they belong to" 
ON accounts FOR UPDATE
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM account_members 
    WHERE account_members.account_id = accounts.id 
    AND account_members.user_id = auth.uid()
  )
);

-- 3. notification_templates policies
-- Users can CRUD templates for accounts they belong to
CREATE POLICY "Users can manage templates for their accounts" 
ON notification_templates FOR ALL
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM account_members 
    WHERE account_members.account_id = notification_templates.account_id 
    AND account_members.user_id = auth.uid()
  )
);

-- 4. events policies
-- Users can view events for accounts they belong to
CREATE POLICY "Users can view events for their accounts" 
ON events FOR SELECT
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM account_members 
    WHERE account_members.account_id = events.account_id 
    AND account_members.user_id = auth.uid()
  )
);

-- Note: INSERTS into events happen via public APIs using the Service Role Key,
-- so RLS does not apply to them. If you eventually use the ANON key for event tracking,
-- you will need a separate policy allowing anon inserts with specific constraints.
