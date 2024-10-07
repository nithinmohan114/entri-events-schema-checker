import { validateEvent } from "./api/validate";
import { ValidateRequest } from "./types/validate.type";
console.log("Background script loaded");

// fetch(
//   "https://raw.githubusercontent.com/nithinmohan114/entri-events-schema/main/event_schemas.json"
// )
//   .then((response) => response.json())
//   .then((data) => {
//     eventSchemas = data;
//     console.log("Schemas loaded:", eventSchemas);
//   })
//   .catch((error) => console.error("Error loading schemas:", error));

const processEvent = (
  message: {
    action: string;
    eventName: string;
    eventPayload: ValidateRequest.EventPayload;
  },
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: { status: string }) => void
) => {
  const { action, eventName, eventPayload } = message;
  if (action === "validate") {
    try {
      validateEvent({ eventName, eventPayload }).then((response) =>
        console.log("response:", response)
      );
      // const eventResult: EventData = {
      //   eventName: message.eventName,
      //   eventPayload: message.eventPayload,
      // };

      // chrome.storage.local.get(["events"], function (result) {
      //   const events = result.events || [];
      //   events.push(eventResult);
      //   chrome.storage.local.set({ events }, () => {
      //     console.log("Event stored. Total events:", events.length);
      //     sendResponse({ status: "Event processed and stored" });
      //   });
      // });
    } catch (e) {
      console.error("Error processing event data:", e);
      sendResponse({ status: "Error processing event" });
    }
  }
};

chrome.runtime.onMessage.addListener(processEvent);

chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL("popup.html") });
});
