import { validateEvent } from "./api/validate";
import { EventForStorage, ValidateRequest } from "./types/validate.type";
console.log("Background script loaded");

async function getCurrentTab() {
  const queryOptions = { active: true, lastFocusedWindow: true };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  const [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

/**
 * Listen for changes in the local storage and update the badge count
 */
chrome.storage.onChanged.addListener(async (changes, areaName) => {
  if (areaName === "local") {
    const activeTab = await getCurrentTab();

    /**
     * Update the badge count based on the number of invalid events
     */
    if (changes.events) {
      console.log("Events changed:", changes.events.newValue);
      if (activeTab) {
        if (changes.events.newValue) {
          chrome.action.setBadgeBackgroundColor({ color: "#AF4041" });
          chrome.action.setBadgeText({
            tabId: activeTab.id,
            text: (changes.events.newValue as EventForStorage[])
              .filter((event) => !event.isValid)
              .length.toString(),
          });
        } else {
          console.log("No events found");
          // Reset the badge text
          chrome.action.setBadgeText({ tabId: activeTab.id, text: "" });
        }
      }
    }
  }
});

/**
 *  Process the event data and store it in the local storage
 * @param message   The message received from the content script
 * @param _sender   The sender of the message
 * @param sendResponse  The callback function to send the response
 * @returns
 */
const processEvent = (
  message: {
    action: string;
    eventName: string;
    eventPayload: ValidateRequest.EventPayload;
  },
  _sender: chrome.runtime.MessageSender,
  sendResponse: (response: { status: string }) => void
) => {
  const { action, eventName, eventPayload } = message;
  if (action === "validate") {
    (async () => {
      try {
        const { valid: isValid, errors } = await validateEvent({
          eventName,
          eventPayload,
        });

        const statusMessage = isValid
          ? "Event validated successfully"
          : "Event validation failed";

        const eventResult = {
          eventName,
          eventPayload,
          isValid,
          errors,
          timestamp: new Date().toISOString(), // Add timestamp here
        };

        chrome.storage.local.get(
          ["events"],
          function (result: { events: Array<EventForStorage> }) {
            let events = result.events || [];
            events = [eventResult, ...events];
            chrome.storage.local.set({ events }, () => {
              sendResponse({ status: statusMessage });
            });
          }
        );
      } catch (e) {
        console.error("Error processing event data:", e);
        sendResponse({ status: "Error processing event" });
      }
    })(); // Immediately invoke the async function
    return true;
  }
};

chrome.runtime.onMessage.addListener(processEvent);

chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL("popup.html") });
});
