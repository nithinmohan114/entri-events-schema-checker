console.log('Popup script loaded');

function displayEvents() {
  console.log('Fetching events');
  chrome.storage.local.get(['events'], function(result) {
    console.log('Retrieved events:', result.events);
    const events = result.events || [];
    const container = document.getElementById('eventsContainer');
    container.innerHTML = ''; // Clear previous content

    if (events.length === 0) {
      container.textContent = 'No events logged yet.';
    } else {
      events.forEach(event => {
        const eventDiv = document.createElement('div');
        eventDiv.className = `event ${event.valid ? 'valid' : 'invalid'}`;

        const eventName = document.createElement('div');
        eventName.className = 'event-name';
        eventName.textContent = `Event: ${event.event_name}`;

        const eventProperties = document.createElement('div');
        eventProperties.textContent = `Properties: ${JSON.stringify(event.event_properties)}`;

        const status = document.createElement('div');
        status.textContent = event.valid ? 'Schema validation passed' : 'Schema validation failed';
        status.className = event.valid ? 'valid' : 'invalid';

        if (!event.valid) {
          const error = document.createElement('div');
          error.textContent = `Error: ${event.error}`;
          error.className = 'error';
          eventDiv.appendChild(error);
        }

        eventDiv.appendChild(eventName);
        eventDiv.appendChild(eventProperties);
        eventDiv.appendChild(status);
        container.appendChild(eventDiv);
      });
    }
  });
}

document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM content loaded');
  displayEvents();

  document.getElementById('refreshButton').addEventListener('click', displayEvents);

  // Refresh events every 5 seconds
  setInterval(displayEvents, 5000);
});