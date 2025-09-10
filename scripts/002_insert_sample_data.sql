-- Insert sample shipment data
INSERT INTO public.shipments (
  shipment_id, order_id, item_id, sku_id, reason, aging, 
  receiving_date, photos_received, status, checked
) VALUES 
  ('SH001', 'ORD-2024-001', 'ITM-001', 'SKU-ABC123', 'Quality Check', 5, '2024-01-15', true, 'completed', true),
  ('SH002', 'ORD-2024-002', 'ITM-002', 'SKU-DEF456', 'Damage Report', 12, '2024-01-10', false, 'processing', false),
  ('SH003', 'ORD-2024-003', 'ITM-003', 'SKU-GHI789', 'Missing Items', 8, '2024-01-12', true, 'pending', false),
  ('SH004', 'ORD-2024-004', 'ITM-004', 'SKU-JKL012', 'Wrong Color', 3, '2024-01-18', true, 'completed', true),
  ('SH005', 'ORD-2024-005', 'ITM-005', 'SKU-MNO345', 'Size Issue', 15, '2024-01-08', false, 'cancelled', false),
  ('SH006', 'ORD-2024-006', 'ITM-006', 'SKU-PQR678', 'Late Delivery', 7, '2024-01-14', true, 'processing', false),
  ('SH007', 'ORD-2024-007', 'ITM-007', 'SKU-STU901', 'Package Damage', 20, '2024-01-05', true, 'pending', false),
  ('SH008', 'ORD-2024-008', 'ITM-008', 'SKU-VWX234', 'Quality Check', 2, '2024-01-20', false, 'completed', true),
  ('SH009', 'ORD-2024-009', 'ITM-009', 'SKU-YZA567', 'Wrong Item', 10, '2024-01-11', true, 'processing', false),
  ('SH010', 'ORD-2024-010', 'ITM-010', 'SKU-BCD890', 'Incomplete Order', 6, '2024-01-16', false, 'pending', false)
ON CONFLICT (shipment_id) DO NOTHING;
