CREATE EXTENSION IF NOT EXISTS btree_gist;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'reservation_no_overlap'
  ) THEN
    ALTER TABLE "Reservation" DROP CONSTRAINT "reservation_no_overlap";
  END IF;
END
$$;

ALTER TABLE "Reservation"
  ADD CONSTRAINT "reservation_no_overlap"
  EXCLUDE USING gist (
    "roomId" WITH =,
    tsrange("startsAt","endsAt",'[)') WITH &&
  )
  DEFERRABLE INITIALLY IMMEDIATE;
