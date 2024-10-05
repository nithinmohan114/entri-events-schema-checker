console.log("Background script loaded");

interface EventSchema {
  [key: string]: { [key: string]: string };
}

// fetch(
//   "https://raw.githubusercontent.com/nithinmohan114/entri-events-schema/main/event_schemas.json"
// )
//   .then((response) => response.json())
//   .then((data) => {
//     eventSchemas = data;
//     console.log("Schemas loaded:", eventSchemas);
//   })
//   .catch((error) => console.error("Error loading schemas:", error));

const eventSchemas: EventSchema = {
  entriapp_login_language_selected_clicked: { lang_codes: "string" },
};

interface EventData {
  eventName: string;
  eventPayload: Record<string, unknown>;
  valid?: boolean;
  error?: string;
}

function validateEvent(
  eventData: EventData,
  schema: Record<string, string>
): { valid: boolean; error: string } {
  const eventProperties = eventData.eventPayload;
  let valid = true;
  let error = "";

  for (const [key, type] of Object.entries(schema)) {
    if (!(key in eventProperties)) {
      valid = false;
      error = `Missing property '${key}'`;
      break;
    }
    if (typeof eventProperties[key] !== type) {
      valid = false;
      error = `Property '${key}' should be of type '${type}'`;
      break;
    }
  }
  return { valid, error };
}

const processEvent = (
  message: {
    action: string;
    eventName: string;
    eventPayload: Record<string, unknown>;
  },
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: { status: string }) => void
) => {
  if (message.action === "logEvent") {
    console.log("Processing event data:", message.eventPayload, sender);
    try {
      const schema = eventSchemas[message.eventName];
      console.log("Schema for event:", schema);
      const eventResult: EventData = {
        eventName: message.eventName,
        eventPayload: message.eventPayload,
      };

      if (schema) {
        const { valid, error } = validateEvent(message, schema);
        eventResult.valid = valid;
        eventResult.error = error || "";
      } else {
        eventResult.valid = false;
        eventResult.error = "No schema defined for this event";
      }

      chrome.storage.local.get(["events"], function (result) {
        const events = result.events || [];
        events.push(eventResult);
        chrome.storage.local.set({ events }, () => {
          console.log("Event stored. Total events:", events.length);
          sendResponse({ status: "Event processed and stored" });
        });
      });
    } catch (e) {
      console.error("Error processing event data:", e);
      sendResponse({ status: "Error processing event" });
    }
  }
  return true; // Indicates that the response is sent asynchronously
};

chrome.runtime.onMessage.addListener(processEvent);

chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL("popup.html") });
});
