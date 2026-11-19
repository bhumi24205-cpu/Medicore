-- Q17: Total money received per payment mode
SELECT payment_mode, COUNT(*) AS payments, SUM(amount) AS total_received
FROM payment
GROUP BY payment_mode;
