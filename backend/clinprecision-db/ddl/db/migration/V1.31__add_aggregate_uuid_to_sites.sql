-- Add aggregate_uuid column to sites table for Axon Framework integration
-- This allows mapping between database auto-increment IDs and Axon aggregate UUIDs

ALTER TABLE sites ADD COLUMN aggregate_uuid VARCHAR(255);

-- Create unique index on aggregate_uuid for fast lookups
CREATE UNIQUE INDEX idx_sites_aggregate_uuid ON sites(aggregate_uuid);

-- Add comment for documentation
COMMENT ON COLUMN sites.aggregate_uuid IS 'UUID used by Axon Framework as aggregate identifier for CQRS/Event Sourcing';