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

  // 2. Session Management (using sessionStorage)
  function getOrCreateSession() {
    let sessionId = sessionStorage.getItem('sotto_session_id');
    if (sessionId) return sessionId;
    
    // Generate UUID v4 equivalent
    sessionId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    
    sessionStorage.setItem('sotto_session_id', sessionId);
    return sessionId;
  }

  const sessionId = getOrCreateSession();

  // Exclusions state
  function getExclusions(key) {
    try {
      const data = sessionStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  function addExclusion(key, id) {
    if (!id) return;
    const items = getExclusions(key);
    if (!items.includes(id)) {
      items.push(id);
      sessionStorage.setItem(key, JSON.stringify(items));
    }
  }

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
    host.style.zIndex = '2147483647'; // Maximum z-index
    host.style.pointerEvents = 'none'; // Click-through when empty
    // Default position — will be updated by showWidget with theme data
    host.style.bottom = '20px';
    host.style.left = '20px';
    document.body.appendChild(host);

    shadowRoot = host.attachShadow({ mode: 'closed' });
    
    const style = document.createElement('style');
    style.textContent = `
      .sotto-widget {
        display: flex;
        align-items: center;
        gap: var(--s-gap, 12px);
        padding: var(--s-pad-y, 12px) var(--s-pad-x, 16px);
        background: var(--s-bg, #ffffff);
        color: var(--s-text, #1a1a1a);
        font-family: var(--s-font, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);
        border-radius: var(--s-radius, 8px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05);
        border: 1px solid rgba(0,0,0,0.05);
        opacity: 0;
        transition: opacity 200ms ease-in;
        pointer-events: auto;
        cursor: pointer;
        max-width: var(--s-max-w, 320px);
        will-change: opacity;
      }
      .sotto-widget.sotto-visible {
        opacity: 1;
        transition: opacity 300ms ease-out;
      }
      .sotto-icon {
        width: var(--s-icon, 16px);
        height: var(--s-icon, 16px);
        flex-shrink: 0;
        color: var(--s-text, #1a1a1a);
      }
      .sotto-content {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .sotto-title {
        font-size: var(--s-title-size, 13px);
        font-weight: 600;
        margin: 0;
      }
      .sotto-message {
        font-size: var(--s-msg-size, 12px);
        opacity: 0.8;
        margin: 0;
      }
      .sotto-time {
        font-size: var(--s-time-size, 10px);
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
  let currentCooldown = 60; // default 60s

  function hideWidget() {
    if (!container) return;
    container.classList.remove('sotto-visible');
    
    // Start cooldown timer after exit animation completes
    setTimeout(() => {
      setTimeout(poll, currentCooldown * 1000);
    }, 200); // 200ms exit animation
  }

  function showWidget(data) {
    initUI();
    
    const { event, theme } = data;
    
    // Check theme and set cooldown
    if (data.cooldown) {
      currentCooldown = data.cooldown;
    }

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

      // Apply position
      var host = document.getElementById('sotto-widget-host');
      if (host) {
        host.style.top = '';
        host.style.bottom = '';
        host.style.left = '';
        host.style.right = '';
        switch (theme.position) {
          case 'bottom-right':
            host.style.bottom = '20px';
            host.style.right = '20px';
            break;
          case 'top-left':
            host.style.top = '20px';
            host.style.left = '20px';
            break;
          case 'top-right':
            host.style.top = '20px';
            host.style.right = '20px';
            break;
          default: // bottom-left
            host.style.bottom = '20px';
            host.style.left = '20px';
            break;
        }
      }

      // Apply size
      var scale = 1;
      if (theme.size === 'small') scale = 0.85;
      else if (theme.size === 'large') scale = 1.15;
      container.style.setProperty('--s-gap', Math.round(12 * scale) + 'px');
      container.style.setProperty('--s-pad-y', Math.round(12 * scale) + 'px');
      container.style.setProperty('--s-pad-x', Math.round(16 * scale) + 'px');
      container.style.setProperty('--s-max-w', Math.round(320 * scale) + 'px');
      container.style.setProperty('--s-icon', Math.round(16 * scale) + 'px');
      container.style.setProperty('--s-title-size', Math.round(13 * scale) + 'px');
      container.style.setProperty('--s-msg-size', Math.round(12 * scale) + 'px');
      container.style.setProperty('--s-time-size', Math.round(10 * scale) + 'px');
    }

    // Render content safely without innerHTML to prevent DOM-based XSS
    container.innerHTML = ''; // Clear previous content just in case

    const iconSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    iconSvg.setAttribute('class', 'sotto-icon');
    iconSvg.setAttribute('viewBox', '0 0 24 24');
    iconSvg.setAttribute('fill', 'none');
    iconSvg.setAttribute('stroke', 'currentColor');
    iconSvg.setAttribute('stroke-width', '2');
    iconSvg.setAttribute('stroke-linecap', 'round');
    iconSvg.setAttribute('stroke-linejoin', 'round');
    
    const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path1.setAttribute('d', 'M22 11.08V12a10 10 0 1 1-5.93-9.14');
    
    const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    polyline.setAttribute('points', '22 4 12 14.01 9 11.01');
    
    iconSvg.appendChild(path1);
    iconSvg.appendChild(polyline);

    const contentDiv = document.createElement('div');
    contentDiv.className = 'sotto-content';

    const messageP = document.createElement('p');
    messageP.className = 'sotto-message';
    messageP.textContent = event.message; // SAFE: Automatically escapes HTML

    const timeSpan = document.createElement('span');
    timeSpan.className = 'sotto-time';
    timeSpan.textContent = formatTimeAgo(event.timestamp); // SAFE

    contentDiv.appendChild(messageP);
    contentDiv.appendChild(timeSpan);

    container.appendChild(iconSvg);
    container.appendChild(contentDiv);

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
      const excEvents = encodeURIComponent(JSON.stringify(getExclusions('sotto_shown_event_ids')));
      const excProducts = encodeURIComponent(JSON.stringify(getExclusions('sotto_shown_product_ids')));
      
      const response = await fetch(`${apiBase}/api/widget/events?account_id=${accountId}&session_id=${sessionId}&excluded_event_ids=${excEvents}&excluded_product_ids=${excProducts}`);
      const data = await response.json();

      if (!data.skip && data.event) {
        
        // Track the ID to avoid showing it again this session
        if (data.event.type === 'individual' && data.event.id) {
          addExclusion('sotto_shown_event_ids', data.event.id);
        } else if (data.event.type === 'aggregate' && data.event.product_id) {
          addExclusion('sotto_shown_product_ids', data.event.product_id);
        }

        showWidget(data);
      } else {
        // If API says skip (freq cap hit, or no more events), we stay silent forever for this session.
        // No further polling is scheduled.
      }
    } catch (e) {
      // Silently fail
      // On network error, maybe retry after a default cooldown
      setTimeout(poll, 60000);
    }

    isPolling = false;
  }

  // Start initial poll after 2 seconds
  setTimeout(poll, 2000);

})();
