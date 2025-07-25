ALTER TABLE "order"
ADD COLUMN customer_comment TEXT,
ADD COLUMN customer_rating INTEGER;

ALTER TABLE "order"
ADD CONSTRAINT rating_check CHECK (rating BETWEEN 1 AND 5);