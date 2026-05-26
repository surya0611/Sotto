(function() {
  // Sotto MVP - Core Widget Script
  // Served asynchronously from public/widget.js

  // 1. Identify configuration
  const scriptTag = document.currentScript || document.querySelector('script[src*="widget.js"]');
  if (!scriptTag) return;

  const accountId = scriptTag.getAttribute('data-account-id');
  if (!accountId) return;

  // For MVP, we determine API base URL from the script source, defaulting to localhost if not found
  const scriptUrl = new URL(scriptTag.src);
  const apiBase = scriptUrl.origin;

  // 2. Session Management
  function getOrCreateSession() {
    const match = document.cookie.match(new RegExp('(^| )sotto_session_id=([^;]+)'));
    if (match) return match[2];
    
    // Generate UUID v4 equivalent
    const sessionId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    
    // Set cookie for 30 minutes
    const date = new Date();
    date.setTime(date.getTime() + (30 * 60 * 1000));
    document.cookie = `sotto_session_id=${sessionId}; expires=${date.toUTCString()}; path=/; SameSite=Lax`;
    return sessionId;
  }

  const sessionId = getOrCreateSession();

  // 3. Track Telemetry
  async function track(eventType) {
    try {
      await fetch(`${apiBase}/api/widget/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account_id: accountId,
          session_id: sessionId,
          event_type: eventType,
          url: window.location.href
        })
      });
    } catch (e) {
      // Silently fail tracking so we don't pollute host console
    }
  }

  // 4. UI Rendering (Shadow DOM for isolation)
  let shadowRoot = null;
  let container = null;

  function initUI() {
    if (container) return;
    
    const host = document.createElement('div');
    host.id = 'sotto-widget-host';
    host.style.position = 'fixed';
    host.style.bottom = '20px';
    host.style.left = '20px';
    host.style.zIndex = '2147483647'; // Maximum z-index
    host.style.pointerEvents = 'none'; // Click-through when empty
    document.body.appendChild(host);

    shadowRoot = host.attachShadow({ mode: 'closed' });
    
    const style = document.createElement('style');
    style.textContent = `
      .sotto-widget {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        background: var(--s-bg, #ffffff);
        color: var(--s-text, #1a1a1a);
        font-family: var(--s-font, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);
        border-radius: var(--s-radius, 8px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05);
        border: 1px solid rgba(0,0,0,0.05);
        opacity: 0;
        transform: translateY(10px);
        transition: opacity 400ms ease, transform 400ms ease;
        pointer-events: auto;
        cursor: pointer;
        max-width: 320px;
        will-change: opacity, transform;
      }
      .sotto-widget.sotto-visible {
        opacity: 1;
        transform: translateY(0);
      }
      .sotto-icon {
        width: 16px;
        height: 16px;
        flex-shrink: 0;
        color: var(--s-text, #1a1a1a);
      }
      .sotto-content {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .sotto-title {
        font-size: 13px;
        font-weight: 600;
        margin: 0;
      }
      .sotto-message {
        font-size: 12px;
        opacity: 0.8;
        margin: 0;
      }
      .sotto-time {
        font-size: 10px;
        opacity: 0.5;
        margin-top: 2px;
      }
      @media (max-width: 480px) {
        .sotto-widget {
          margin: 0 16px;
          max-width: calc(100vw - 32px);
        }
      }
    `;
    shadowRoot.appendChild(style);

    container = document.createElement('div');
    container.className = 'sotto-widget';
    
    // Add click tracking
    container.addEventListener('click', () => {
      track('click');
      hideWidget();
    });

    shadowRoot.appendChild(container);
  }

  function formatTimeAgo(dateString) {
    if (!dateString) return 'just now';
    const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }

  let hideTimeout;

  function hideWidget() {
    if (!container) return;
    container.classList.remove('sotto-visible');
  }

  function showWidget(data) {
    initUI();
    
    const { event, theme } = data;
    
    // Apply theme
    if (theme) {
      if (theme.bg_color) container.style.setProperty('--s-bg', theme.bg_color);
      if (theme.text_color) container.style.setProperty('--s-text', theme.text_color);
      if (theme.border_radius) container.style.setProperty('--s-radius', theme.border_radius);
      
      if (theme.font_family === 'System') {
        container.style.setProperty('--s-font', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif');
      } else if (theme.font_family === 'Serif') {
        container.style.setProperty('--s-font', 'Georgia, "Times New Roman", Times, serif');
      } else {
        container.style.setProperty('--s-font', 'inherit');
      }
    }

    // Render content
    container.innerHTML = `
      <svg class="sotto-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
      <div class="sotto-content">
        <p class="sotto-message">${event.message}</p>
        <span class="sotto-time">${formatTimeAgo(event.timestamp)}</span>
      </div>
    `;

    // Show and track
    // Need a tiny delay for CSS transition to trigger after innerHTML replacement
    setTimeout(() => {
      container.classList.add('sotto-visible');
      track('impression');
    }, 50);

    // Auto-hide after 6 seconds
    clearTimeout(hideTimeout);
    hideTimeout = setTimeout(hideWidget, 6000);
  }

  // 5. Polling Engine
  let isPolling = false;
  
  async function poll() {
    if (isPolling) return;
    isPolling = true;

    try {
      const response = await fetch(`${apiBase}/api/widget/events?account_id=${accountId}&session_id=${sessionId}`);
      const data = await response.json();

      if (!data.skip && data.event) {
        
        // Page Rules Check
        if (data.rules && data.rules.page_rules && data.rules.page_rules.length > 0) {
           const currentUrl = window.location.href;
           // MVP simplifcation: if page_rules exist, just assume it's valid for now, 
           // or implement strict regex check. We will skip deep regex for MVP snippet stability.
        }

        showWidget(data);
      }
    } catch (e) {
      // Silently fail
    }

    isPolling = false;
  }

  // Start polling every 30 seconds
  // And do an immediate initial poll after 2 seconds
  setTimeout(poll, 2000);
  setInterval(poll, 30000);

})();
