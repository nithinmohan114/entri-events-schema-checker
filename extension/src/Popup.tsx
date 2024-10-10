import React, { useEffect, useState } from "react";
import { AlertCircle, CheckCircle, Eraser, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "./components/ui/scroll-area";
import { EventForStorage } from "./types/validate.type";
import {
  clearChromeLocalStorage,
  formatAjvErrors,
  openAsWindow,
} from "./lib/utils";

interface EventItemProps {
  event: EventForStorage;
  isSelected: boolean;
  onClick: () => void;
}

const EventItem: React.FC<EventItemProps> = ({
  event,
  isSelected,
  onClick,
}) => {
  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 100, opacity: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 15 }}
      className={`flex items-center p-2 cursor-pointer hover:bg-gray-800 ${
        isSelected ? "bg-gray-700" : ""
      }`}
      onClick={onClick}
    >
      {event.isValid ? (
        <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
      ) : (
        <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
      )}
      <span className="flex-grow text-gray-200">{event.eventName}</span>
      <span className="text-sm text-gray-400">
        {new Date(event.timestamp).toLocaleTimeString()}
      </span>
    </motion.div>
  );
};

interface EventListProps {
  events: EventForStorage[];
  selectedEvent: EventForStorage | null;
  onSelectEvent: (event: EventForStorage) => void;
}

const EventList: React.FC<EventListProps> = ({
  events,
  selectedEvent,
  onSelectEvent,
}) => {
  return (
    <ScrollArea className="h-[calc(100%-2rem)] w-full">
      <AnimatePresence initial={false}>
        {events.map((event) => (
          <EventItem
            key={event.timestamp}
            event={event}
            isSelected={selectedEvent === event}
            onClick={() => onSelectEvent(event)}
          />
        ))}
      </AnimatePresence>
    </ScrollArea>
  );
};

interface DetailsPanelProps {
  event: EventForStorage;
}

const DetailsPanel: React.FC<DetailsPanelProps> = ({ event }) => {
  const formattedErrors = formatAjvErrors(event.errors);
  return (
    <div className="p-4 text-gray-200">
      <h2 className="text-xl font-bold mb-4">Event Details</h2>
      {Object.entries(event.eventPayload).map(([key, value]) => (
        <div key={key} className="mb-2">
          {/* <span
            className={`font-semibold ${
              key === violatedField ? "text-red-400" : ""
            }`}
          >
            {key}:
          </span>{" "} */}
          <span className={`font-semibold`}>{key}:</span>{" "}
          {value !== undefined ? value.toString() : "undefined"}
        </div>
      ))}
      {!event.isValid && (
        <div className="mt-4 p-2 bg-red-900 text-red-200 rounded">
          <h3 className="font-bold mb-2">Schema Violations:</h3>
          {formattedErrors.map((error, index) => (
            <div key={index} className="mb-2">
              <p>
                <span className="font-semibold">Property:</span>{" "}
                {error.property}
              </p>
              <p>
                <span className="font-semibold">Message:</span> {error.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export function Popup() {
  const [events, setEvents] = useState<EventListProps["events"]>([]); // Use the custom hook
  const [selectedEvent, setSelectedEvent] = useState<EventForStorage | null>(
    null
  );

  useEffect(() => {
    // Fetch data from Chrome storage
    chrome.storage.local.get(["events"], (result) => {
      const storedEvents = result.events || [];
      setEvents(storedEvents);
    });

    /**
     *  Handle changes in Chrome storage
     * @param changes  The changes in the storage
     */
    const handleStorageChange = (changes: {
      [key: string]: chrome.storage.StorageChange;
    }) => {
      if (changes.events) {
        const storedEvents = changes.events.newValue || [];
        setEvents(storedEvents);
      }
    };

    // Listen for changes in Chrome storage
    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  return (
    <div className="flex w-[800px] h-[600px] bg-[#121212] text-gray-200">
      <div className="w-1/2 p-4 border-r border-gray-700">
        <div className="position-sticky top-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <img src="./icon_48.png" alt="Icon" className="mr-2 h-6 w-6" />
              <h1 className="text-2xl font-bold">Analytics Events</h1>
            </div>
            <div className="flex items-center">
              <Button
                variant="outline"
                size="icon"
                className="border-[#AF4041] bg-[#121212] hover:bg-[#AF4041] mr-4"
                onClick={clearChromeLocalStorage}
              >
                <Eraser className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="bg-[#121212]"
                onClick={openAsWindow}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        {events.length > 0 && (
          <EventList
            events={events}
            selectedEvent={selectedEvent}
            onSelectEvent={setSelectedEvent}
          />
        )}
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
