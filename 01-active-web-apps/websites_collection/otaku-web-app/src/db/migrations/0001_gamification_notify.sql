-- NOTIFY trigger for async CQRS projection (BLUEPRINT_WEBSITES Priority 3)
-- Run after 0000_gamification.sql when moving to async worker.

CREATE OR REPLACE FUNCTION notify_gamification_event_inserted()
RETURNS trigger AS $$
BEGIN
  PERFORM pg_notify(
    'gamification_event_inserted',
    json_build_object(
      'userId', NEW.user_id,
      'eventType', NEW.event_type,
      'eventId', NEW.id
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_gamification_event_notify ON gamification_events;

CREATE TRIGGER trg_gamification_event_notify
  AFTER INSERT ON gamification_events
  FOR EACH ROW
  EXECUTE FUNCTION notify_gamification_event_inserted();
