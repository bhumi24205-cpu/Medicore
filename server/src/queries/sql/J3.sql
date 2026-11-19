-- J3: Hemoglobin value stored inside the lab result JSON
SELECT lab_order_id, test_id, extra_results->>'$.hemoglobin' AS hemoglobin
FROM lab_order_test
WHERE extra_results IS NOT NULL AND extra_results->>'$.hemoglobin' IS NOT NULL;
