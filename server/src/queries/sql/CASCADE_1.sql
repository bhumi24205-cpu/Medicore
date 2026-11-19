-- CASCADE_1: Deleting a bill cascades and automatically deletes its bill_items
START TRANSACTION;
  SELECT COUNT(*) AS items_before FROM bill_item WHERE bill_id = 3;
  DELETE FROM bill WHERE bill_id = 3;
  SELECT COUNT(*) AS items_after_delete FROM bill_item WHERE bill_id = 3;
ROLLBACK;
