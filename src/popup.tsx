import React, { useEffect, useState } from "react";

interface EventResult {
  eventName: string;
  eventPayload: Record<string, unknown>;
  valid: boolean;
  error: string;
}

const Popup: React.FC = () => {
  const [events, setEvents] = useState<EventResult[]>([]);

  const displayEvents = () => {
    console.log("Fetching events");
    chrome.storage.local.get(["events"], (result) => {
      console.log("Retrieved events:", result.events);
      const events = result.events || [];
      setEvents(events);
    });
  };

  useEffect(() => {
    displayEvents();
  }, []);

  return (
    <div>
      <h1>Event Logger</h1>
      <button onClick={displayEvents}>Refresh Events</button>
      <div id="eventsContainer">
        {events.length === 0 ? (
          <p>No events logged yet.</p>
        ) : (
          events.map((event, index) => (
            <div
              key={index}
              className={`event ${event.valid ? "valid" : "invalid"}`}
            >
              <div className="event-name">Event: {event.eventName}</div>
              <div>Properties: {JSON.stringify(event.eventPayload)}</div>
              <div className={event.valid ? "valid" : "invalid"}>
                {event.valid
                  ? "Schema validation passed"
                  : "Schema validation failed"}
              </div>
              {!event.valid && (
                <div className="error">Error: {event.error}</div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Popup;
