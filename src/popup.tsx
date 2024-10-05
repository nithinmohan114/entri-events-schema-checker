import React, { useState, useEffect } from "react";
import { AlertCircle, CheckCircle } from "lucide-react";
import { ScrollArea } from "./components/ui/scroll-area";

interface EventSchema {
  event_name: { type: "string"; required: boolean };
  timestamp: { type: "number"; required: boolean };
  user_id: { type: "string"; required: boolean };
  page_url: { type: "string"; required: boolean };
  browser: { type: "string"; required: boolean };
}

interface Event {
  event_name: string;
  timestamp: number;
  user_id?: string;
  page_url: string;
  browser: string;
}

interface ValidationResult {
  isValid: boolean;
  violatedField: string | null;
}

// Mock schema for validation
const mockSchema: EventSchema = {
  event_name: { type: "string", required: true },
  timestamp: { type: "number", required: true },
  user_id: { type: "string", required: true },
  page_url: { type: "string", required: true },
  browser: { type: "string", required: true },
};

// Mock function to generate random events
const generateRandomEvent = (): Event => ({
  event_name: Math.random() > 0.5 ? "page_view" : "button_click",
  timestamp: Date.now(),
  user_id:
    Math.random() > 0.8 ? undefined : Math.random().toString(36).substring(7),
  page_url:
    Math.random() > 0.5 ? "https://example.com" : "https://example.com/about",
  browser: Math.random() > 0.5 ? "Chrome" : "Firefox",
});

// Validation function
const validateEvent = (event: Event): ValidationResult => {
  for (const [key, value] of Object.entries(mockSchema)) {
    if (value.required && !(key in event)) {
      return { isValid: false, violatedField: key };
    }
  }
  return { isValid: true, violatedField: null };
};

interface EventItemProps {
  event: Event;
  isSelected: boolean;
  onClick: () => void;
}

const EventItem: React.FC<EventItemProps> = ({
  event,
  isSelected,
  onClick,
}) => {
  const { isValid } = validateEvent(event);

  return (
    <div
      className={`flex items-center p-2 cursor-pointer hover:bg-gray-800 ${
        isSelected ? "bg-gray-700" : ""
      }`}
      onClick={onClick}
    >
      {isValid ? (
        <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
      ) : (
        <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
      )}
      <span className="flex-grow text-gray-200">{event.event_name}</span>
      <span className="text-sm text-gray-400">
        {new Date(event.timestamp).toLocaleTimeString()}
      </span>
    </div>
  );
};

interface EventListProps {
  events: Event[];
  selectedEvent: Event | null;
  onSelectEvent: (event: Event) => void;
}

const EventList: React.FC<EventListProps> = ({
  events,
  selectedEvent,
  onSelectEvent,
}) => {
  return (
    <ScrollArea className="h-[calc(100%-2rem)] w-full">
      {events.map((event, index) => (
        <EventItem
          key={index}
          event={event}
          isSelected={selectedEvent === event}
          onClick={() => onSelectEvent(event)}
        />
      ))}
    </ScrollArea>
  );
};

interface DetailsPanelProps {
  event: Event;
}

const DetailsPanel: React.FC<DetailsPanelProps> = ({ event }) => {
  const { isValid, violatedField } = validateEvent(event);

  return (
    <div className="p-4 text-gray-200">
      <h2 className="text-xl font-bold mb-4">Event Details</h2>
      {Object.entries(event).map(([key, value]) => (
        <div key={key} className="mb-2">
          <span
            className={`font-semibold ${
              key === violatedField ? "text-red-400" : ""
            }`}
          >
            {key}:
          </span>{" "}
          {value !== undefined ? value.toString() : "undefined"}
        </div>
      ))}
      {!isValid && (
        <div className="mt-4 p-2 bg-red-900 text-red-200 rounded">
          Schema violation: {violatedField} is required but missing or invalid.
        </div>
      )}
    </div>
  );
};

export function Popup() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const newEvent = generateRandomEvent();
      setEvents((prevEvents) => [newEvent, ...prevEvents.slice(0, 99)]);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex w-[800px] h-[600px] bg-[#121212] text-gray-200">
      <div className="w-1/2 p-4 border-r border-gray-700">
        <h1 className="text-2xl font-bold mb-4">Analytics Events</h1>
        <EventList
          events={events}
          selectedEvent={selectedEvent}
          onSelectEvent={setSelectedEvent}
        />
      </div>
      <div className="w-1/2 p-4">
        {selectedEvent ? (
          <DetailsPanel event={selectedEvent} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            Select an event to view details
          </div>
        )}
      </div>
    </div>
  );
}
