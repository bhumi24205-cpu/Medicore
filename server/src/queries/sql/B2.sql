-- B2: Which lab results have a report image
SELECT lab_order_id, test_id, LENGTH(report_image) AS image_bytes
FROM lab_order_test
WHERE report_image IS NOT NULL;
