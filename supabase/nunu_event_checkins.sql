-- Create nunu_event_checkins table for tracking attendance
CREATE TABLE IF NOT EXISTS nunu_event_checkins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id TEXT NOT NULL,
    registration_id UUID NOT NULL REFERENCES nunu_event_registrations(id) ON DELETE CASCADE,
    checked_in_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'checked_in' CHECK (status IN ('checked_in', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Each person can only check in once per event
    UNIQUE(event_id, registration_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_nunu_event_checkins_event_id ON nunu_event_checkins(event_id);
CREATE INDEX IF NOT EXISTS idx_nunu_event_checkins_registration_id ON nunu_event_checkins(registration_id);

-- Enable RLS
ALTER TABLE nunu_event_checkins ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Anyone can read nunu_event_checkins"
    ON nunu_event_checkins FOR SELECT
    USING (true);

-- Allow public insert
CREATE POLICY "Anyone can insert nunu_event_checkins"
    ON nunu_event_checkins FOR INSERT
    WITH CHECK (true);

-- Allow public update
CREATE POLICY "Anyone can update nunu_event_checkins"
    ON nunu_event_checkins FOR UPDATE
    USING (true);

-- Allow public delete
CREATE POLICY "Anyone can delete nunu_event_checkins"
    ON nunu_event_checkins FOR DELETE
    USING (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE nunu_event_checkins;

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_nunu_event_checkins_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_nunu_event_checkins_updated_at
    BEFORE UPDATE ON nunu_event_checkins
    FOR EACH ROW
    EXECUTE FUNCTION update_nunu_event_checkins_updated_at();
