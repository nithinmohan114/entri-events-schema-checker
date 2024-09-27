(function() {
  console.log('Content script loaded for Event Logger');
  let eventCount = 0;

  const originalConsoleLog = console.log;
  console.log = function(...args) {
    console.info('argument', args)
    if (args[0] === 'MixpanelEvent: ' && args[1] && typeof args[1] === 'object') {
      eventCount++;
      const eventData = args[1];
      console.log(`Captured Mixpanel event #${eventCount}:`, eventData);

      try {
        chrome.runtime.sendMessage({
          action: "logEvent",
          data: JSON.stringify(eventData)
        }, response => {
          console.log('Response from background script:', response);
        });
      } catch (e) {
        console.error('Error processing event data:', eventData, e);
      }
    }

    originalConsoleLog.apply(console, args);
  };

  // Periodically log the number of events captured
  setInterval(() => {
    console.log(`Total Mixpanel events captured: ${eventCount}`);
  }, 5000);
})();