console.log('Background script loaded');

let eventSchemas = {};

fetch('https://raw.githubusercontent.com/nithinmohan114/entri-events-schema/main/event_schemas.json')
  .then(response => response.json())
  .then(data => {
    eventSchemas = data;
    console.log('Schemas loaded:', eventSchemas);
  })
  .catch(error => console.error('Error loading schemas:', error));

function validateEvent(eventData, schema) {
    const eventProperties = eventData.event_properties;
    let valid = true;
    let error = '';

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

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Received message in background script:', message);
  if (message.action === "logEvent") {
    console.log('Processing event data:', message.data);
    try {
      const eventData = JSON.parse(message.data);
      const schema = eventSchemas[eventData.event_name];
      console.log('Schema for event:', schema);
      const eventResult = {
        event_name: eventData.event_name,
        event_properties: eventData.event_properties
      };

      if (schema) {
        const { valid, error } = validateEvent(eventData, schema);
        eventResult.valid = valid;
        eventResult.error = error || '';
      } else {
        eventResult.valid = false;
        eventResult.error = 'No schema defined for this event';
      }

      chrome.storage.local.get(['events'], function(result) {
        const events = result.events || [];
        events.push(eventResult);
        chrome.storage.local.set({ events }, () => {
          console.log('Event stored. Total events:', events.length);
          sendResponse({status: 'Event processed and stored'});
        });
      });
    } catch (e) {
      console.error('Error processing event data:', e);
      sendResponse({status: 'Error processing event'});
    }
  }
  return true; // Indicates that the response is sent asynchronously
});

chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL("popup.html") });
});