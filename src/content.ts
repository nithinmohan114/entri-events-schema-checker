console.log("Content script loaded for Event Logger");
let isProcessing = false;

// Define the event listener function
function handleSchemaValidation(event: CustomEvent) {
  if (isProcessing) return; // Prevent duplicate processing
  isProcessing = true;

  const { eventName, eventPayload, appPlatform } = event.detail;

  console.log(
    `Received event: ${eventName}, Payload: ${JSON.stringify(
      eventPayload
    )}, Platform: ${appPlatform}`
  );

  try {
    console.log("Sending event data to background script");
    chrome.runtime.sendMessage(
      {
        action: "logEvent",
        eventName,
        eventPayload,
        appPlatform,
      },
      (response) => {
        console.log("Response from background script:", response);
        isProcessing = false; // Reset the flag after processing
      }
    );
  } catch (e) {
    console.error("Error sending event data:", e);
    isProcessing = false; // Reset the flag on error
  }
}

// Attach the event listener
window.addEventListener(
  "entri-schema-validation",
  handleSchemaValidation as EventListener
);

// Remove the event listener when the document is unloaded
window.addEventListener("unload", function () {
  window.removeEventListener(
    "entri-schema-validation",
    handleSchemaValidation as EventListener
  );
});
