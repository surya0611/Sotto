(function() {
  // Sotto MVP - Conversion Tracking Pixel
  // Served asynchronously from public/pixel.js

  const scriptTag = document.currentScript || document.querySelector('script[src*="pixel.js"]');
  if (!scriptTag) return;

  const accountId = scriptTag.getAttribute('data-account-id');
  if (!accountId) return;

  const scriptUrl = new URL(scriptTag.src);
  const apiBase = scriptUrl.origin;

  // Retrieve existing session cookie
  const match = document.cookie.match(new RegExp('(^| )sotto_session_id=([^;]+)'));
  if (!match) {
    console.log('Sotto: No session found, skipping conversion tracking.');
    return;
  }
  const sessionId = match[2];

  // Fire conversion event
  fetch(`${apiBase}/api/widget/track`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    keepalive: true, // Ensures the request fires even if the user navigates away quickly
    body: JSON.stringify({
      account_id: accountId,
      session_id: sessionId,
      event_type: 'conversion',
      url: window.location.href
    })
  }).catch(() => {
    // Silently fail
  });
})();
