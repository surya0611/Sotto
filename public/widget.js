(function() {
  // Sotto MVP - Unified Widget & Pixel Script
  // Served asynchronously from public/widget.js

  // 1. Identify configuration
  const scriptTag = document.currentScript || document.querySelector('script[src*="widget.js"]');
  if (!scriptTag) return;

  const accountId = scriptTag.getAttribute('data-account-id');
  if (!accountId) return;

  const scriptUrl = new URL(scriptTag.src);
  const apiBase = scriptUrl.origin;

  // 2. Session Management
  function getOrCreateSession() {
    let sessionId = sessionStorage.getItem('sotto_session_id');
    if (sessionId) return sessionId;
    
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

  function clearExclusions() {
    sessionStorage.removeItem('sotto_shown_event_ids');
    sessionStorage.removeItem('sotto_shown_product_ids');
  }

  // Session Limits & Anti-Spam
  function getSessionDisplays() {
    return parseInt(sessionStorage.getItem('sotto_session_displays') || '0', 10);
  }

  function incrementSessionDisplays() {
    sessionStorage.setItem('sotto_session_displays', (getSessionDisplays() + 1).toString());
  }

  function isSuppressed() {
    const until = parseInt(sessionStorage.getItem('sotto_suppress_until') || '0', 10);
    return Date.now() < until;
  }

  function handleCloseClick() {
    hideWidget();
    let closes = parseInt(sessionStorage.getItem('sotto_close_count') || '0', 10) + 1;
    sessionStorage.setItem('sotto_close_count', closes.toString());
    
    if (closes >= 3) {
      // Suppress for 24 hours
      sessionStorage.setItem('sotto_suppress_until', (Date.now() + 24 * 60 * 60 * 1000).toString());
      isPolling = true; // Stop future polls
    }
  }

  let pageDisplayCount = 0;

  // 3. Track Telemetry & Init
  let isConversionPage = false;
  let activeConfig = null;

  async function track(eventType) {
    try {
      const res = await fetch(`${apiBase}/api/widget/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account_id: accountId,
          session_id: sessionId,
          event_type: eventType,
          url: window.location.href
        })
      });
      return await res.json();
    } catch (e) {
      return null;
    }
  }

  // 4. UI Rendering (Shadow DOM)
  let shadowRoot = null;
  let container = null;

  function initUI() {
    if (container) return;
    
    const host = document.createElement('div');
    host.id = 'sotto-widget-host';
    host.style.position = 'fixed';
    host.style.zIndex = '2147483647';
    host.style.pointerEvents = 'none';
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
        box-shadow: var(--s-shadow, 0 4px 12px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05));
        border: var(--s-border, 1px solid rgba(0,0,0,0.05));
        backdrop-filter: var(--s-backdrop, none);
        -webkit-backdrop-filter: var(--s-backdrop, none);
        opacity: 0;
        transform: var(--s-transform-hidden, translateY(10px));
        transition: opacity 200ms ease-in, transform 300ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 300ms ease;
        pointer-events: auto;
        cursor: pointer;
        max-width: var(--s-max-w, 320px);
        will-change: opacity, transform, box-shadow;
      }
      .sotto-widget.sotto-visible {
        opacity: 1;
        transform: translate(0, 0);
        transition: opacity 300ms ease-out, transform 400ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 300ms ease;
      }
      .sotto-widget.sotto-visible:hover {
        transform: var(--s-hover-transform, none);
        box-shadow: var(--s-hover-shadow, var(--s-shadow, 0 4px 12px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05)));
      }
      .sotto-icon {
        width: var(--s-icon, 16px);
        height: var(--s-icon, 16px);
        flex-shrink: 0;
        color: var(--s-text, #1a1a1a);
      }
      .sotto-image {
        width: var(--s-img-size, 48px);
        height: var(--s-img-size, 48px);
        border-radius: var(--s-img-radius, 4px);
        object-fit: cover;
        flex-shrink: 0;
        background: rgba(0,0,0,0.03);
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
      .sotto-close {
        position: absolute;
        top: 6px;
        right: 6px;
        width: 16px;
        height: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        cursor: pointer;
        color: var(--s-text, #1a1a1a);
        transition: opacity 200ms ease;
      }
      .sotto-widget:hover .sotto-close {
        opacity: 0.5;
      }
      .sotto-close:hover {
        opacity: 1 !important;
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
    
    container.addEventListener('click', (e) => {
      if (e.target.closest('.sotto-close')) return; // handled separately
      track('click');
      hideWidget();
    });

    const closeBtn = document.createElement('div');
    closeBtn.className = 'sotto-close';
    closeBtn.innerHTML = '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      handleCloseClick();
    });
    container.appendChild(closeBtn);

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
  let currentDisplayMs = 4000;
  let currentTimeBetweenMs = 8000;

  function hideWidget() {
    if (!container) return;
    container.classList.remove('sotto-visible');
    
    // Start cooldown timer after exit animation completes
    setTimeout(() => {
      setTimeout(poll, currentTimeBetweenMs);
    }, 200);
  }

  function applyVisibility(visibility) {
    if (!visibility) return true;
    const isMobile = window.innerWidth <= 480;
    if (isMobile && visibility.hide_mobile) return false;
    if (!isMobile && visibility.hide_desktop) return false;
    return true;
  }

  function showWidget(data) {
    initUI();
    
    const { event, theme, timing, visibility } = data;
    
    // Check device visibility before showing
    if (!applyVisibility(visibility)) {
      // Start polling again after cooldown since we skipped this one
      setTimeout(poll, timing?.time_between_ms || 8000);
      return;
    }

    if (timing) {
      currentDisplayMs = timing.display_ms || 4000;
      currentTimeBetweenMs = timing.time_between_ms || 8000;
    }

    // Apply theme
    if (theme) {
      if (theme.bg_color) container.style.setProperty('--s-bg', theme.bg_color);
      if (theme.text_color) container.style.setProperty('--s-text', theme.text_color);
      if (theme.border_radius !== undefined) container.style.setProperty('--s-radius', theme.border_radius + 'px');
      
      // Presets
      if (theme.theme_preset === 'glassmorphism') {
        container.style.setProperty('--s-backdrop', 'blur(12px)');
        container.style.setProperty('--s-border', '1px solid rgba(255, 255, 255, 0.2)');
        container.style.setProperty('--s-shadow', '0 8px 32px rgba(0, 0, 0, 0.1)');
      } else if (theme.theme_preset === 'neumorphism') {
        container.style.setProperty('--s-shadow', '8px 8px 16px #e6e6e6, -8px -8px 16px #ffffff');
        container.style.setProperty('--s-border', 'none');
      } else {
        container.style.setProperty('--s-backdrop', 'none');
        container.style.setProperty('--s-border', '1px solid rgba(0,0,0,0.05)');
        container.style.setProperty('--s-shadow', '0 4px 12px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.06)');
      }

      // Hover Animations
      if (theme.hover_animation === 'lift') {
        container.style.setProperty('--s-hover-transform', 'translateY(-4px)');
        container.style.setProperty('--s-hover-shadow', '0 12px 24px rgba(0,0,0,0.15)');
      } else if (theme.hover_animation === 'glow') {
        container.style.setProperty('--s-hover-transform', 'none');
        container.style.setProperty('--s-hover-shadow', '0 0 20px rgba(99, 102, 241, 0.4)');
      } else if (theme.hover_animation === 'scale') {
        container.style.setProperty('--s-hover-transform', 'scale(1.03)');
        container.style.setProperty('--s-hover-shadow', '0 8px 24px rgba(0,0,0,0.12)');
      } else {
        container.style.setProperty('--s-hover-transform', 'none');
        container.style.setProperty('--s-hover-shadow', 'var(--s-shadow)');
      }
      
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

      // Apply animation direction
      switch (theme.slide_animation) {
        case 'slide-down': container.style.setProperty('--s-transform-hidden', 'translateY(-10px)'); break;
        case 'slide-left': container.style.setProperty('--s-transform-hidden', 'translateX(10px)'); break;
        case 'slide-right': container.style.setProperty('--s-transform-hidden', 'translateX(-10px)'); break;
        default: container.style.setProperty('--s-transform-hidden', 'translateY(10px)'); break; // slide-up
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
      container.style.setProperty('--s-img-size', Math.round(48 * scale) + 'px');
      container.style.setProperty('--s-title-size', Math.round(13 * scale) + 'px');
      container.style.setProperty('--s-msg-size', Math.round(12 * scale) + 'px');
      container.style.setProperty('--s-time-size', Math.round(10 * scale) + 'px');
    }

    container.innerHTML = ''; 

    let visualElement;

    if (event.image_url) {
      visualElement = document.createElement('img');
      visualElement.className = 'sotto-image';
      visualElement.src = event.image_url;
      // Provide an empty alt attribute or default so it's accessible
      visualElement.alt = "Product image";
    } else {
      visualElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      visualElement.setAttribute('class', 'sotto-icon');
      visualElement.setAttribute('viewBox', '0 0 24 24');
      visualElement.setAttribute('fill', 'none');
      visualElement.setAttribute('stroke', 'currentColor');
      visualElement.setAttribute('stroke-width', '2');
      visualElement.setAttribute('stroke-linecap', 'round');
      visualElement.setAttribute('stroke-linejoin', 'round');
      
      const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path1.setAttribute('d', 'M22 11.08V12a10 10 0 1 1-5.93-9.14');
      
      const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
      polyline.setAttribute('points', '22 4 12 14.01 9 11.01');
      
      visualElement.appendChild(path1);
      visualElement.appendChild(polyline);
    }

    const contentDiv = document.createElement('div');
    contentDiv.className = 'sotto-content';

    const messageP = document.createElement('p');
    messageP.className = 'sotto-message';
    messageP.textContent = event.message; 

    const timeSpan = document.createElement('span');
    timeSpan.className = 'sotto-time';
    timeSpan.textContent = formatTimeAgo(event.timestamp); 

    contentDiv.appendChild(messageP);
    contentDiv.appendChild(timeSpan);

    container.appendChild(visualElement);
    container.appendChild(contentDiv);

    setTimeout(() => {
      container.classList.add('sotto-visible');
      track('impression');
    }, 50);

    clearTimeout(hideTimeout);
    hideTimeout = setTimeout(hideWidget, currentDisplayMs);

    pageDisplayCount++;
    incrementSessionDisplays();
  }

  // 5. Polling Engine
  let isPolling = false;
  
  function checkPageRules(pageRules) {
    if (!pageRules || pageRules.length === 0) return true;
    
    const url = window.location.href;
    const path = window.location.pathname;
    
    let isIncluded = false;
    let hasIncludes = false;
    let isExcluded = false;

    for (const rule of pageRules) {
      if (!rule.pattern) continue;
      // Convert wildcard to regex
      const regexStr = '^' + rule.pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$';
      const regex = new RegExp(regexStr, 'i');
      
      const matches = regex.test(url) || regex.test(path);
      
      if (rule.type === 'include') {
        hasIncludes = true;
        if (matches) isIncluded = true;
      } else if (rule.type === 'exclude') {
        if (matches) isExcluded = true;
      }
    }

    if (isExcluded) return false;
    if (hasIncludes && !isIncluded) return false;
    return true;
  }

  async function poll() {
    if (isPolling || isSuppressed()) return;
    if (isConversionPage) return; 
    
    isPolling = true;

    try {
      const excEvents = encodeURIComponent(JSON.stringify(getExclusions('sotto_shown_event_ids')));
      const excProducts = encodeURIComponent(JSON.stringify(getExclusions('sotto_shown_product_ids')));
      
      const response = await fetch(`${apiBase}/api/widget/events?account_id=${accountId}&session_id=${sessionId}&excluded_event_ids=${excEvents}&excluded_product_ids=${excProducts}`);
      const data = await response.json();

      if (data.skip) {
        // Handle looping if no new events
        if (activeConfig && activeConfig.timing && activeConfig.timing.loop) {
          clearExclusions();
          setTimeout(poll, activeConfig.timing.time_between_ms || 8000);
        }
        isPolling = false;
        return;
      }

      activeConfig = data;

      // Validate Rules & Limits
      const rules = data.rules || {};
      if (!checkPageRules(rules.page_rules)) {
        return; // Abort silently
      }

      const frequencyCap = data.timing?.frequency_cap || 5; // Fallback if missing
      const maxPerPage = rules.max_per_page || 20;

      if (pageDisplayCount >= maxPerPage || getSessionDisplays() >= frequencyCap) {
        return; // Abort silently
      }

      if (data.event) {
        if (data.event.type === 'individual' && data.event.id) {
          addExclusion('sotto_shown_event_ids', data.event.id);
        } else if (data.event.type === 'aggregate' && data.event.product_id) {
          addExclusion('sotto_shown_product_ids', data.event.product_id);
        }

        showWidget(data);
      } else {
        // Handle looping
        if (activeConfig && activeConfig.timing && activeConfig.timing.loop) {
          clearExclusions();
          setTimeout(poll, activeConfig.timing.time_between_ms || 8000);
        }
      }
    } catch (e) {
      setTimeout(poll, 60000);
    }

    isPolling = false;
  }

  // 6. Bootstrap
  async function bootstrap() {
    if (isSuppressed()) return;

    // Send init telemetry
    const initData = await track('init');
    
    if (initData && initData.is_conversion) {
      isConversionPage = true;
      // We don't start polling if it's a conversion page, to keep the thank you page clean.
      return;
    }

    // Default delay is 3000ms. We could fetch config first, but doing an optimistic poll is fine.
    // We'll let the first poll happen quickly and rely on its delay if any.
    // Wait, let's just do a first poll right away, but hold the render until delay_ms.
    // For simplicity, we just start the poll. The poll itself returns the config.
    
    // We fetch the config on the first poll
    try {
      const response = await fetch(`${apiBase}/api/widget/events?account_id=${accountId}&session_id=${sessionId}`);
      const data = await response.json();
      activeConfig = data;

      const delayMs = data?.timing?.delay_ms || 3000;
      setTimeout(poll, delayMs);
    } catch(e) {
      setTimeout(poll, 3000);
    }
  }

  bootstrap();

})();
