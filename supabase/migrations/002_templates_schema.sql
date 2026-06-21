-- Create Notification Templates Table
CREATE TABLE notification_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  event_type TEXT NOT NULL, -- e.g., 'purchase', 'review', 'signup', 'custom'
  template_string TEXT NOT NULL, -- e.g., '{{first_name}} in {{city}} just bought {{product_name}}'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own templates"
  ON notification_templates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM account_members 
      WHERE account_members.account_id = notification_templates.account_id 
      AND account_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own templates"
  ON notification_templates FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM account_members 
      WHERE account_members.account_id = notification_templates.account_id 
      AND account_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own templates"
  ON notification_templates FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM account_members 
      WHERE account_members.account_id = notification_templates.account_id 
      AND account_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own templates"
  ON notification_templates FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM account_members 
      WHERE account_members.account_id = notification_templates.account_id 
      AND account_members.user_id = auth.uid()
    )
  );
