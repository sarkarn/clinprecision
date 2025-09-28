-- Temporary script to populate aggregate_uuid for existing sites
-- This is needed because existing sites were created before Axon integration

-- Generate UUIDs for existing sites that don't have aggregate_uuid
UPDATE sites 
SET aggregate_uuid = CONCAT(
    SUBSTRING(MD5(CONCAT(id, name, site_number, RAND())), 1, 8), '-',
    SUBSTRING(MD5(CONCAT(id, name, site_number, RAND())), 9, 4), '-',
    SUBSTRING(MD5(CONCAT(id, name, site_number, RAND())), 13, 4), '-',
    SUBSTRING(MD5(CONCAT(id, name, site_number, RAND())), 17, 4), '-',
    SUBSTRING(MD5(CONCAT(id, name, site_number, RAND())), 21, 12)
)
WHERE aggregate_uuid IS NULL OR aggregate_uuid = '';

-- Verify the update
SELECT id, name, site_number, aggregate_uuid, status 
FROM sites 
ORDER BY id;