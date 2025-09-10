-- Remove unique constraint from shipment_id to allow duplicates
ALTER TABLE public.shipments DROP CONSTRAINT IF EXISTS shipments_shipment_id_key;

-- Drop the index that was created for the unique constraint
DROP INDEX IF EXISTS idx_shipments_shipment_id;

-- Recreate the index without unique constraint for performance
CREATE INDEX IF NOT EXISTS idx_shipments_shipment_id ON public.shipments(shipment_id);
