function handleSchemaValidation(event: CustomEvent) {
  const { eventName, eventPayload, appPlatform } = event.detail;

  console.log(
    `Received event: ${eventName}, Payload: ${JSON.stringify(
      eventPayload
    )}, Platform: ${appPlatform}`
  );

  try {
    chrome.runtime.sendMessage(
      {
        action: "validate",
        eventName,
        eventPayload,
        appPlatform,
      },
      (response) => {
        console.log("Response from background script:", response);
      }
    );
  } catch (e) {
    console.error("Error sending event data:", e);
  }
}

// Attach the event listener
window.addEventListener(
  "entri-schema-validation",
  handleSchemaValidation as EventListener
);
