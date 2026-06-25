const fs = require('fs');

let content = fs.readFileSync('src/widget/index.js', 'utf8');

// 1. Add import at the top
content = `import { computeWidgetStyles } from '../lib/appearance';\n\n` + content;

// 2. Replace initUI logic
const initUI_start = content.indexOf('function initUI() {');
const formatTimeAgo_start = content.indexOf('function formatTimeAgo(dateString) {');

const newInitUI = `
  let bgWrapper = null;

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
    style.textContent = \`
      .sotto-widget {
        opacity: 0;
        transform: var(--s-transform-hidden, translateY(10px));
        transition: opacity 200ms ease-in, transform 300ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 300ms ease;
        pointer-events: auto;
        cursor: pointer;
        will-change: opacity, transform, box-shadow;
      }
      .sotto-widget.sotto-visible {
        opacity: 1;
        transform: translate(0, 0);
        transition: opacity 300ms ease-out, transform 400ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 300ms ease;
      }
      .sotto-widget:hover {
        transform: var(--s-hover-transform, none);
        box-shadow: var(--s-hover-shadow, none);
      }
      .sotto-icon {
        width: var(--s-icon, 16px);
        height: var(--s-icon, 16px);
        flex-shrink: 0;
        color: inherit;
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
        color: inherit;
        transition: opacity 200ms ease;
        z-index: 4;
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
          max-width: calc(100vw - 32px) !important;
        }
      }
    \`;
    
    shadowRoot.appendChild(style);

    container = document.createElement('div');
    container.className = 'sotto-widget';
    
    container.addEventListener('click', (e) => {
      if (e.target.closest('.sotto-close')) return;
      track('click');
      if (activeConfig?.event?.url) {
        try {
          const targetUrl = new URL(activeConfig.event.url, window.location.origin);
          if (activeConfig.utm && activeConfig.utm.enabled) {
            targetUrl.searchParams.set('utm_source', activeConfig.utm.source || 'sotto_widget');
            targetUrl.searchParams.set('utm_medium', activeConfig.utm.medium || 'social_proof');
            if (activeConfig.utm.campaign) {
              targetUrl.searchParams.set('utm_campaign', activeConfig.utm.campaign);
            }
          }
          window.location.href = targetUrl.toString();
          return;
        } catch(err) {}
      }
      hideWidget();
    });

    bgWrapper = document.createElement('div');
    bgWrapper.id = 'sotto-bg-wrapper';
    container.appendChild(bgWrapper);

    const innerContent = document.createElement('div');
    innerContent.id = 'sotto-inner';
    innerContent.style.display = 'flex';
    innerContent.style.alignItems = 'center';
    innerContent.style.width = '100%';
    innerContent.style.gap = 'var(--s-gap)';
    innerContent.style.position = 'relative';
    innerContent.style.zIndex = '3';

    const closeBtn = document.createElement('div');
    closeBtn.className = 'sotto-close';
    closeBtn.innerHTML = '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      handleCloseClick();
    });

    container.appendChild(innerContent);
    container.appendChild(closeBtn);
    shadowRoot.appendChild(container);
  }

`;
content = content.substring(0, initUI_start) + newInitUI + content.substring(formatTimeAgo_start);

// 3. Replace showWidget logic
const showWidget_start = content.indexOf('function showWidget(data) {');
const showWidget_end = content.indexOf('function evaluateCondition(cond) {');

const newShowWidget = `
  function showWidget(data) {
    initUI();
    
    const { event, theme, timing, visibility } = data;
    
    if (!applyVisibility(visibility)) {
      setTimeout(poll, timing?.time_between_ms || 8000);
      return;
    }

    if (timing) {
      currentDisplayMs = timing.display_ms || 4000;
      currentTimeBetweenMs = timing.time_between_ms || 8000;
    }

    // Apply computeWidgetStyles!
    if (theme && theme.appearance) {
      const styles = computeWidgetStyles(theme.appearance);
      
      Object.assign(container.style, styles.containerStyles);
      Object.assign(bgWrapper.style, styles.bgStyles);
      
      // Position
      var host = document.getElementById('sotto-widget-host');
      if (host) {
        host.style.top = '';
        host.style.bottom = '';
        host.style.left = '';
        host.style.right = '';
        switch (theme.position) {
          case 'bottom-right': host.style.bottom = '20px'; host.style.right = '20px'; break;
          case 'top-left': host.style.top = '20px'; host.style.left = '20px'; break;
          case 'top-right': host.style.top = '20px'; host.style.right = '20px'; break;
          default: host.style.bottom = '20px'; host.style.left = '20px'; break;
        }
      }

      // Animation Direction
      switch (theme.slide_animation) {
        case 'slide-down': container.style.setProperty('--s-transform-hidden', 'translateY(-10px)'); break;
        case 'slide-left': container.style.setProperty('--s-transform-hidden', 'translateX(10px)'); break;
        case 'slide-right': container.style.setProperty('--s-transform-hidden', 'translateX(-10px)'); break;
        default: container.style.setProperty('--s-transform-hidden', 'translateY(10px)'); break;
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
        container.style.setProperty('--s-hover-shadow', 'none');
      }

      // Size Vars
      var scale = 1;
      if (theme.size === 'small') scale = 0.85;
      else if (theme.size === 'large') scale = 1.15;
      container.style.setProperty('--s-gap', Math.round(12 * scale) + 'px');
      container.style.setProperty('--s-icon', Math.round(16 * scale) + 'px');
      container.style.setProperty('--s-img-size', Math.round(48 * scale) + 'px');
      container.style.setProperty('--s-title-size', Math.round(13 * scale) + 'px');
      container.style.setProperty('--s-msg-size', Math.round(12 * scale) + 'px');
      container.style.setProperty('--s-time-size', Math.round(10 * scale) + 'px');
    }

    const inner = shadowRoot.getElementById('sotto-inner');
    if (!inner) return;
    inner.innerHTML = ''; 

    let visualElement;
    if (event.image_url) {
      visualElement = document.createElement('img');
      visualElement.className = 'sotto-image';
      visualElement.src = event.image_url;
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

    inner.appendChild(visualElement);
    inner.appendChild(contentDiv);

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
`;

content = content.substring(0, showWidget_start) + newShowWidget + content.substring(showWidget_end + '  // 5. Polling Engine\n'.length);

fs.writeFileSync('src/widget/index.js', content);
console.log('Refactored widget.js successfully');
