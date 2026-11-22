/* TITANS COD — global scripts (vanilla JS, custom elements, no dependencies). */
(() => {
  const Titans = (window.Titans = window.Titans || {});
  const strings = Titans.strings || {};
  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Utilities ---------- */

  const debounce = (fn, wait = 200) => {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), wait);
    };
  };

  const toast = (message, type = 'info') => {
    const region = document.querySelector('[data-toast-region]');
    if (!region || !message) return;
    const el = document.createElement('div');
    el.className = `toast${type === 'error' ? ' toast--error' : ''}`;
    el.textContent = message;
    region.appendChild(el);
    setTimeout(() => el.remove(), 3200);
  };

  const fetchJSON = async (url, options = {}) => {
    const res = await fetch(url, {
      ...options,
      headers: { Accept: 'application/json', ...(options.headers || {}) },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.status) {
      const error = new Error(data.description || data.message || strings.cartError || 'Error');
      error.data = data;
      throw error;
    }
    return data;
  };

  Titans.utils = { debounce, toast, fetchJSON };

  /* ---------- Dialogs and drawers ---------- */

  const lockScroll = () => document.documentElement.classList.add('scroll-lock');
  const unlockScroll = () => {
    if (!document.querySelector('dialog[open].drawer, dialog[open][data-lock-scroll]')) {
      document.documentElement.classList.remove('scroll-lock');
    }
  };

  const openDialog = (dialog, opener) => {
    if (!dialog || dialog.open) return;
    dialog._opener = opener || document.activeElement;
    dialog.showModal();
    lockScroll();
    if (opener) opener.setAttribute('aria-expanded', 'true');
    dialog.dispatchEvent(new CustomEvent('dialog:open', { bubbles: true }));
  };

  const closeDialog = (dialog) => {
    if (!dialog || !dialog.open) return;
    dialog.close();
  };

  document.addEventListener('click', (event) => {
    const opener = event.target.closest('[data-open-dialog]');
    if (opener) {
      const dialog = document.getElementById(opener.dataset.openDialog);
      if (dialog && typeof dialog.showModal === 'function') {
        event.preventDefault();
        openDialog(dialog, opener);
      }
      return;
    }
    const closer = event.target.closest('[data-close-dialog]');
    if (closer) {
      closeDialog(closer.closest('dialog'));
      return;
    }
    // Click on backdrop closes the dialog.
    if (event.target instanceof HTMLDialogElement && event.target.open) {
      const rect = event.target.getBoundingClientRect();
      const inside =
        event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
      if (!inside) closeDialog(event.target);
    }
  });

  document.addEventListener(
    'close',
    (event) => {
      const dialog = event.target;
      if (!(dialog instanceof HTMLDialogElement)) return;
      unlockScroll();
      if (dialog._opener) {
        dialog._opener.setAttribute('aria-expanded', 'false');
        if (document.contains(dialog._opener)) dialog._opener.focus({ preventScroll: true });
      }
    },
    true
  );

  Titans.openDialog = openDialog;
  Titans.closeDialog = closeDialog;

  /* Header dropdowns: close others, close on outside click / Escape. */
  document.addEventListener('click', (event) => {
    document.querySelectorAll('details[data-disclosure][open]').forEach((details) => {
      if (!details.contains(event.target)) details.removeAttribute('open');
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    document.querySelectorAll('details[data-disclosure][open]').forEach((details) => {
      details.removeAttribute('open');
      details.querySelector('summary')?.focus();
    });
  });

  /* Accordions set to "one open at a time". The toggle event does not bubble, so listen in capture. */
  document.addEventListener(
    'toggle',
    (event) => {
      const details = event.target;
      if (!(details instanceof HTMLDetailsElement) || !details.open) return;
      const group = details.closest('[data-accordion-exclusive]');
      if (!group) return;
      group.querySelectorAll('details[open]').forEach((other) => {
        if (other !== details && other.closest('[data-accordion-exclusive]') === group) other.open = false;
      });
    },
    true
  );

  /* ---------- Cart ---------- */

  const cartSections = () => {
    const ids = [];
    if (document.getElementById('CartDrawer')) ids.push('cart-drawer');
    document.querySelectorAll('cart-items[data-section-id]').forEach((el) => ids.push(el.dataset.sectionId));
    return ids;
  };

  const updateCartCount = (count) => {
    if (typeof count !== 'number' || Number.isNaN(count)) return;
    document.querySelectorAll('[data-cart-count]').forEach((el) => {
      el.textContent = count > 0 ? String(count) : '';
      el.dataset.count = String(count);
    });
  };

  /* Remember which cart control had focus so it can be restored after a re-render. */
  const cartFocusSelector = () => {
    const el = document.activeElement;
    if (!el || !el.closest('cart-items, [data-cart-drawer-inner]')) return null;
    const key = el.dataset.key || el.closest('[data-key]')?.dataset.key || el.closest('.cart-item')?.querySelector('[data-key]')?.dataset.key;
    if (el.matches('[data-remove-line]')) return key ? `[data-remove-line][data-key="${CSS.escape(key)}"]` : null;
    if (el.matches('[data-qty]')) return key ? `[data-key="${CSS.escape(key)}"]` : null;
    if (el.matches('input[data-line]')) return key ? `input[data-key="${CSS.escape(key)}"]` : null;
    return el.id ? `#${CSS.escape(el.id)}` : null;
  };

  const restoreCartFocus = (selector) => {
    if (!selector) return;
    const target = document.querySelector(selector);
    if (target) {
      const qty = target.closest('.cart-item')?.querySelector('input[data-line]');
      (target.matches('[data-remove-line], input') ? target : qty || target).focus({ preventScroll: true });
      return;
    }
    const drawer = document.getElementById('CartDrawer');
    if (drawer?.open) drawer.querySelector('[data-close-dialog]')?.focus({ preventScroll: true });
  };

  const renderCartSections = (sections) => {
    if (!sections) return;
    const focus = cartFocusSelector();
    Object.entries(sections).forEach(([id, html]) => {
      if (!html) return;
      const doc = new DOMParser().parseFromString(html, 'text/html');
      if (id === 'cart-drawer') {
        const next = doc.querySelector('[data-cart-drawer-inner]');
        const current = document.querySelector('[data-cart-drawer-inner]');
        if (next && current) current.replaceWith(next);
        const count = doc.querySelector('[data-cart-count-value]');
        if (count) updateCartCount(parseInt(count.dataset.cartCountValue, 10));
        return;
      }
      const root = document.getElementById(`shopify-section-${id}`);
      const nextRoot = doc.getElementById(`shopify-section-${id}`) || doc.body;
      const hadItems = !!root?.querySelector('[data-cart-has-items]');
      const hasItems = !!nextRoot.querySelector('[data-cart-has-items]');
      if (root && hadItems !== hasItems) {
        root.innerHTML = nextRoot.innerHTML;
        return;
      }
      const target = document.querySelector(`cart-items[data-section-id="${id}"]`);
      const source = nextRoot.querySelector('cart-items');
      if (target && source) target.innerHTML = source.innerHTML;
      (root || document).querySelectorAll('[data-cart-refresh]').forEach((el) => {
        const fresh = nextRoot.querySelector(`[data-cart-refresh="${el.dataset.cartRefresh}"]`);
        if (fresh) el.innerHTML = fresh.innerHTML;
      });
    });
    restoreCartFocus(focus);
  };

  const addToCart = async (formData) => {
    const sections = cartSections();
    if (sections.length) {
      formData.append('sections', sections.join(','));
      formData.append('sections_url', window.location.pathname);
    }
    const data = await fetchJSON(`${Titans.routes.cartAdd}.js`, {
      method: 'POST',
      body: formData,
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
    });
    renderCartSections(data.sections);
    document.dispatchEvent(new CustomEvent('cart:added', { detail: { item: data } }));
    const drawer = document.getElementById('CartDrawer');
    if (drawer) openDialog(drawer);
    else toast(strings.added);
    return data;
  };

  /* Cart changes run one at a time so line numbers and keys never go stale mid-flight. */
  let cartQueue = Promise.resolve();
  const changeCart = (lineOrKey, quantity) => {
    const run = async () => {
      const sections = cartSections();
      const target = typeof lineOrKey === 'number' ? { line: lineOrKey } : { id: String(lineOrKey) };
      const data = await fetchJSON(`${Titans.routes.cartChange}.js`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...target, quantity, sections, sections_url: window.location.pathname }),
      });
      renderCartSections(data.sections);
      updateCartCount(data.item_count);
      document.dispatchEvent(new CustomEvent('cart:changed', { detail: { cart: data } }));
      return data;
    };
    const next = cartQueue.then(run, run);
    cartQueue = next.catch(() => {});
    return next;
  };

  Titans.cart = { addToCart, changeCart, updateCartCount, renderCartSections };

  /* Quick add forms on product cards (only intercepted when a cart drawer exists). */
  document.addEventListener('submit', async (event) => {
    const form = event.target.closest('form[data-quick-add]');
    if (!form || Titans.cartType !== 'drawer' || !document.getElementById('CartDrawer')) return;
    event.preventDefault();
    const button = form.querySelector('[type="submit"]');
    button?.setAttribute('aria-busy', 'true');
    try {
      await addToCart(new FormData(form));
    } catch (error) {
      toast(error.message, 'error');
    } finally {
      button?.removeAttribute('aria-busy');
    }
  });

  /* Cart line items (drawer + page). Uses delegation so re-rendered markup keeps working. */
  class CartItems extends HTMLElement {
    connectedCallback() {
      if (this._bound) return;
      this._bound = true;
      this._timers = new Map();
      this.addEventListener('change', (event) => {
        const input = event.target.closest('input[data-line]');
        if (!input) return;
        const ref = input.dataset.key || input.dataset.line;
        clearTimeout(this._timers.get(ref));
        this._timers.set(
          ref,
          setTimeout(() => {
            this._timers.delete(ref);
            this.update(input.dataset.key || parseInt(input.dataset.line, 10), parseInt(input.value, 10));
          }, 350)
        );
      });
      this.addEventListener('click', (event) => {
        const remove = event.target.closest('[data-remove-line]');
        if (!remove) return;
        event.preventDefault();
        remove.disabled = true;
        this.update(remove.dataset.key || parseInt(remove.dataset.removeLine, 10), 0);
      });
    }

    async update(ref, quantity) {
      if (!ref || Number.isNaN(quantity)) return;
      this.setAttribute('aria-busy', 'true');
      try {
        await changeCart(ref, quantity);
      } catch (error) {
        const errors = document.querySelector(`cart-items[data-section-id="${this.dataset.sectionId}"] [data-cart-errors]`) || this.querySelector('[data-cart-errors]');
        if (errors) errors.textContent = error.message;
        else toast(error.message, 'error');
      } finally {
        this.removeAttribute('aria-busy');
      }
    }
  }
  if (!customElements.get('cart-items')) customElements.define('cart-items', CartItems);

  /* ---------- Quantity input ---------- */

  class QuantityInput extends HTMLElement {
    connectedCallback() {
      if (this._bound) return;
      this._bound = true;
      this.input = this.querySelector('input');
      this.addEventListener('click', (event) => {
        const button = event.target.closest('[data-qty]');
        if (!button || !this.input) return;
        event.preventDefault();
        const step = parseInt(this.input.step, 10) || 1;
        const min = parseInt(this.input.min, 10) || 0;
        const max = this.input.max ? parseInt(this.input.max, 10) : Infinity;
        const current = parseInt(this.input.value, 10) || min;
        const next = button.dataset.qty === 'plus' ? current + step : current - step;
        this.input.value = String(Math.min(max, Math.max(min, next)));
        this.input.dispatchEvent(new Event('change', { bubbles: true }));
      });
    }
  }
  if (!customElements.get('quantity-input')) customElements.define('quantity-input', QuantityInput);

  /* ---------- Countdown ---------- */

  class CountdownTimer extends HTMLElement {
    connectedCallback() {
      const raw = this.dataset.end;
      this.end = raw ? new Date(raw).getTime() : NaN;
      if (Number.isNaN(this.end)) {
        if (!(window.Shopify && Shopify.designMode)) this.hidden = true;
        return;
      }
      this.parts = {
        days: this.querySelector('[data-days]'),
        hours: this.querySelector('[data-hours]'),
        minutes: this.querySelector('[data-minutes]'),
        seconds: this.querySelector('[data-seconds]'),
      };
      this.tick();
      this.timer = setInterval(() => this.tick(), 1000);
    }

    disconnectedCallback() {
      clearInterval(this.timer);
    }

    tick() {
      const diff = this.end - Date.now();
      if (diff <= 0) {
        clearInterval(this.timer);
        const text = this.dataset.expiredText;
        if (text) {
          this.textContent = text;
        } else {
          const wrapper = this.closest('[data-countdown-wrapper]');
          if (wrapper) wrapper.hidden = true;
          else this.hidden = true;
        }
        return;
      }
      const s = Math.floor(diff / 1000);
      const urgent = parseInt(this.dataset.urgent || '0', 10);
      if (urgent > 0) this.classList.toggle('countdown--urgent', s < urgent * 60);
      const pad = (n) => String(n).padStart(2, '0');
      if (this.parts.days) this.parts.days.textContent = pad(Math.floor(s / 86400));
      if (this.parts.hours) this.parts.hours.textContent = pad(Math.floor((s % 86400) / 3600));
      if (this.parts.minutes) this.parts.minutes.textContent = pad(Math.floor((s % 3600) / 60));
      if (this.parts.seconds) this.parts.seconds.textContent = pad(s % 60);
    }
  }
  if (!customElements.get('countdown-timer')) customElements.define('countdown-timer', CountdownTimer);

  /* ---------- Slider (scroll-snap with buttons) ---------- */

  class SliderComponent extends HTMLElement {
    connectedCallback() {
      this.track = this.querySelector('[data-slider-track]');
      if (!this.track) return;
      this.prev = this.querySelector('[data-slider-prev]');
      this.next = this.querySelector('[data-slider-next]');
      this.dots = Array.from(this.querySelectorAll('[data-slider-dot]'));
      this._onScroll = debounce(() => this.update(), 60);
      this.track.addEventListener('scroll', this._onScroll, { passive: true });
      this.prev?.addEventListener('click', () => this.go(-1));
      this.next?.addEventListener('click', () => this.go(1));
      this.dots.forEach((dot, i) => dot.addEventListener('click', () => this.goTo(i)));
      this._ro = new ResizeObserver(() => this.update());
      this._ro.observe(this.track);
      this.update();
    }

    disconnectedCallback() {
      this._ro?.disconnect();
    }

    slides() {
      return Array.from(this.track.children).filter((el) => el.offsetParent !== null);
    }

    go(direction) {
      const slides = this.slides();
      if (!slides.length) return;
      const width = slides[0].getBoundingClientRect().width;
      const gap = parseFloat(getComputedStyle(this.track).columnGap) || 0;
      this.track.scrollBy({ left: direction * (width + gap), behavior: reducedMotion() ? 'auto' : 'smooth' });
    }

    goTo(index) {
      const slide = this.slides()[index];
      if (!slide) return;
      this.track.scrollTo({ left: slide.offsetLeft - this.track.offsetLeft, behavior: reducedMotion() ? 'auto' : 'smooth' });
    }

    update() {
      const max = this.track.scrollWidth - this.track.clientWidth - 2;
      if (this.prev) this.prev.disabled = this.track.scrollLeft <= 2;
      if (this.next) this.next.disabled = this.track.scrollLeft >= max;
      if (this.dots.length) {
        const slides = this.slides();
        let active = 0;
        slides.forEach((slide, i) => {
          if (Math.abs(slide.offsetLeft - this.track.offsetLeft - this.track.scrollLeft) < slide.clientWidth / 2) active = i;
        });
        this.dots.forEach((dot, i) => dot.setAttribute('aria-current', String(i === active)));
      }
    }
  }
  if (!customElements.get('slider-component')) customElements.define('slider-component', SliderComponent);

  /* ---------- Deferred media (load video/iframe only on click) ---------- */

  class DeferredMedia extends HTMLElement {
    connectedCallback() {
      if (this._bound) return;
      this._bound = true;
      this.querySelector('[data-deferred-poster]')?.addEventListener('click', () => this.load());
      if (this.hasAttribute('data-autoplay')) this.observe();
    }

    disconnectedCallback() {
      this._io?.disconnect();
    }

    observe() {
      this._io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              this.load(false);
              this._io.disconnect();
            }
          });
        },
        { rootMargin: '200px' }
      );
      this._io.observe(this);
    }

    load(focus = true) {
      if (this.loaded) return;
      const template = this.querySelector('template');
      if (!template) return;
      this.loaded = true;
      const content = template.content.firstElementChild.cloneNode(true);
      this.appendChild(content);
      this.setAttribute('loaded', '');
      const poster = this.querySelector('[data-deferred-poster]');
      if (poster) poster.hidden = true;
      if (content.tagName === 'VIDEO') {
        content.play?.().catch(() => {});
      }
      if (focus) content.focus?.({ preventScroll: true });
    }
  }
  if (!customElements.get('deferred-media')) customElements.define('deferred-media', DeferredMedia);

  /* Autoplay muted videos only while visible (UGC grids, hero videos). */
  class InviewVideo extends HTMLElement {
    connectedCallback() {
      this.video = this.querySelector('video');
      if (!this.video || this._bound) return;
      this._bound = true;
      this.querySelector('[data-video-sound]')?.addEventListener('click', (event) => {
        event.preventDefault();
        this.video.muted = !this.video.muted;
        event.currentTarget.setAttribute('aria-pressed', String(!this.video.muted));
      });
      if (reducedMotion() && !this.hasAttribute('data-force')) {
        this.video.removeAttribute('autoplay');
        this.video.controls = true;
        return;
      }
      this.addToggle();
      this._io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !this._userPaused) {
              if (this.video.preload === 'none') this.video.preload = 'metadata';
              this.video.play().catch(() => {});
            } else if (!entry.isIntersecting) {
              this.video.pause();
            }
          });
        },
        { threshold: 0.25 }
      );
      this._io.observe(this);
    }

    addToggle() {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'video-toggle';
      const sync = () => {
        const paused = this.video.paused;
        button.setAttribute('aria-label', paused ? strings.playVideo || 'Play' : strings.pauseVideo || 'Pause');
        button.classList.toggle('is-paused', paused);
      };
      button.innerHTML = '<span class="video-toggle__pause" aria-hidden="true"></span><span class="video-toggle__play" aria-hidden="true"></span>';
      button.addEventListener('click', (event) => {
        event.preventDefault();
        if (this.video.paused) {
          this._userPaused = false;
          this.video.play().catch(() => {});
        } else {
          this._userPaused = true;
          this.video.pause();
        }
      });
      this.video.addEventListener('play', sync);
      this.video.addEventListener('pause', sync);
      sync();
      this.appendChild(button);
    }

    disconnectedCallback() {
      this._io?.disconnect();
    }
  }
  if (!customElements.get('inview-video')) customElements.define('inview-video', InviewVideo);

  /* ---------- Anchor navigation ---------- */

  class AnchorNav extends HTMLElement {
    connectedCallback() {
      this.links = Array.from(this.querySelectorAll('[data-anchor-link]'));
      const targets = this.links
        .map((link) => document.getElementById(decodeURIComponent(link.hash.slice(1))))
        .filter(Boolean);
      if (this.classList.contains('anchor-nav--sticky')) {
        document.documentElement.style.setProperty('--anchor-nav-height', `${Math.round(this.offsetHeight)}px`);
      }
      if (!targets.length || !('IntersectionObserver' in window)) return;
      this._visible = new Map();
      this._io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => this._visible.set(entry.target.id, entry.isIntersecting));
          const current = targets.find((t) => this._visible.get(t.id));
          if (current) this.setActive(current.id);
        },
        { rootMargin: '-35% 0px -55% 0px' }
      );
      targets.forEach((t) => this._io.observe(t));
    }

    setActive(id) {
      this.links.forEach((link) => {
        const active = decodeURIComponent(link.hash.slice(1)) === id;
        link.classList.toggle('is-active', active);
        if (active) {
          link.setAttribute('aria-current', 'location');
          const inner = link.parentElement;
          if (inner.scrollWidth > inner.clientWidth) {
            inner.scrollTo({ left: link.offsetLeft - inner.clientWidth / 2 + link.offsetWidth / 2, behavior: 'smooth' });
          }
        } else {
          link.removeAttribute('aria-current');
        }
      });
    }

    disconnectedCallback() {
      this._io?.disconnect();
    }
  }
  if (!customElements.get('anchor-nav')) customElements.define('anchor-nav', AnchorNav);

  /* ---------- Before / after slider ---------- */

  class BeforeAfterSlider extends HTMLElement {
    connectedCallback() {
      this.range = this.querySelector('input[type="range"]');
      if (!this.range) return;
      const update = () => this.style.setProperty('--pos', `${this.range.value}%`);
      this.range.addEventListener('input', update);
      update();
    }
  }
  if (!customElements.get('before-after-slider')) customElements.define('before-after-slider', BeforeAfterSlider);

  class SplitSlider extends HTMLElement {
    connectedCallback() {
      this.range = this.querySelector('.split-slider__range');
      if (!this.range) return;
      this.vertical = this.dataset.orientation === 'vertical';
      this.range.addEventListener('input', () => this.set(Number(this.range.value)));
      this.range.addEventListener('keydown', (event) => {
        const keys = this.vertical ? { ArrowUp: -1, ArrowDown: 1 } : { ArrowLeft: -1, ArrowRight: 1 };
        if (!(event.key in keys)) return;
        event.preventDefault();
        this.set(Number(this.range.value) + keys[event.key] * (event.shiftKey ? 10 : 2));
      });
      this.addEventListener('pointerdown', (event) => {
        if (event.button !== 0) return;
        this.dragging = true;
        this.setPointerCapture(event.pointerId);
        this.fromPointer(event);
        this.range.focus({ preventScroll: true });
      });
      this.addEventListener('pointermove', (event) => {
        const follow = this.hasAttribute('data-follow') && event.pointerType === 'mouse';
        if (this.dragging || follow) this.fromPointer(event);
      });
      const stop = () => {
        this.dragging = false;
      };
      this.addEventListener('pointerup', stop);
      this.addEventListener('pointercancel', stop);
      this.set(Number(this.range.value));
    }

    fromPointer(event) {
      const rect = this.getBoundingClientRect();
      const ratio = this.vertical ? (event.clientY - rect.top) / rect.height : (event.clientX - rect.left) / rect.width;
      this.set(ratio * 100);
    }

    set(value) {
      const pos = Math.min(100, Math.max(0, value));
      this.range.value = String(Math.round(pos));
      this.style.setProperty('--pos', `${pos}%`);
    }
  }
  if (!customElements.get('split-slider')) customElements.define('split-slider', SplitSlider);

  /* ---------- Announcement bar rotator ---------- */

  class AnnouncementBar extends HTMLElement {
    connectedCallback() {
      this.slides = Array.from(this.querySelectorAll('[data-announcement-slide]'));
      if (this.slides.length < 2 || this.hasAttribute('data-marquee')) return;
      this.index = 0;
      this.delay = (parseInt(this.dataset.speed, 10) || 5) * 1000;
      this.start();
      this.addEventListener('mouseenter', () => this.stop());
      this.addEventListener('mouseleave', () => this.start());
      this.addEventListener('focusin', () => this.stop());
    }

    disconnectedCallback() {
      this.stop();
    }

    start() {
      if (reducedMotion()) return;
      this.stop();
      this.timer = setInterval(() => this.show(this.index + 1), this.delay);
    }

    stop() {
      clearInterval(this.timer);
    }

    show(i) {
      this.index = (i + this.slides.length) % this.slides.length;
      this.slides.forEach((slide, n) => slide.setAttribute('aria-hidden', String(n !== this.index)));
    }
  }
  if (!customElements.get('announcement-bar')) customElements.define('announcement-bar', AnnouncementBar);

  /* ---------- Sticky header ---------- */

  class StickyHeader extends HTMLElement {
    connectedCallback() {
      this.mode = this.dataset.sticky;
      this.setOffset();
      this._ro = new ResizeObserver(() => this.setOffset());
      this._ro.observe(this);
      if (this.mode !== 'scroll-up') return;
      this.last = window.scrollY;
      this._onScroll = () => {
        const y = window.scrollY;
        const hide = y > this.last && y > this.offsetHeight * 2;
        this.classList.toggle('header-wrapper--hidden', hide && !document.querySelector('details[data-disclosure][open]'));
        this.last = y;
      };
      window.addEventListener('scroll', this._onScroll, { passive: true });
    }

    disconnectedCallback() {
      this._ro?.disconnect();
      if (this._onScroll) window.removeEventListener('scroll', this._onScroll);
    }

    setOffset() {
      const h = this.mode === 'none' ? 0 : Math.round(this.getBoundingClientRect().height);
      document.documentElement.style.setProperty('--header-offset', `${h}px`);
    }
  }
  if (!customElements.get('sticky-header')) customElements.define('sticky-header', StickyHeader);

  /* ---------- Tabs ---------- */

  class TabsComponent extends HTMLElement {
    connectedCallback() {
      if (this._bound) return;
      this._bound = true;
      this.refresh();
      this.addEventListener('click', (event) => {
        const tab = event.target.closest('[role="tab"]');
        if (tab && this.tabs.includes(tab)) this.select(tab);
      });
      this.addEventListener('keydown', (event) => {
        const i = this.tabs.indexOf(event.target);
        if (i === -1) return;
        if (event.key === 'ArrowRight') this.select(this.tabs[(i + 1) % this.tabs.length], true);
        if (event.key === 'ArrowLeft') this.select(this.tabs[(i - 1 + this.tabs.length) % this.tabs.length], true);
      });
    }

    ownPanels() {
      return Array.from(this.querySelectorAll('[data-tab-panel]')).filter((p) => p.closest('tabs-component') === this);
    }

    /* Tabs built from blocks render only panels; the buttons are created here from data-tab-label. */
    refresh(selectedPanelId) {
      if (this.hasAttribute('data-build-tabs')) {
        const bar = this.querySelector('[data-tab-bar]');
        const panels = this.ownPanels();
        bar.replaceChildren(
          ...panels.map((panel, i) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.id = `${panel.id}-tab`;
            button.setAttribute('role', 'tab');
            button.setAttribute('aria-controls', panel.id);
            button.textContent = panel.dataset.tabLabel || String(i + 1);
            panel.setAttribute('aria-labelledby', button.id);
            return button;
          })
        );
        bar.hidden = panels.length < 2;
      }
      this.tabs = Array.from(this.querySelectorAll('[role="tab"]')).filter((t) => t.closest('tabs-component') === this);
      const initial =
        this.tabs.find((t) => t.getAttribute('aria-controls') === selectedPanelId) ||
        this.tabs.find((t) => t.getAttribute('aria-selected') === 'true') ||
        this.tabs[0];
      if (initial) this.select(initial);
    }

    select(tab, focus = false) {
      this.tabs.forEach((t) => {
        const selected = t === tab;
        t.setAttribute('aria-selected', String(selected));
        t.tabIndex = selected ? 0 : -1;
        const panel = this.querySelector(`#${t.getAttribute('aria-controls')}`);
        if (panel) panel.hidden = !selected;
      });
      if (focus) tab.focus();
    }
  }
  if (!customElements.get('tabs-component')) customElements.define('tabs-component', TabsComponent);

  /* ---------- Reveal + text effects ---------- */

  const revealObserver =
    'IntersectionObserver' in window
      ? new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;
              entry.target.classList.add('is-visible');
              if (entry.target.classList.contains('fx-typewriter')) typewrite(entry.target);
              revealObserver.unobserve(entry.target);
            });
          },
          { rootMargin: '0px 0px -8% 0px', threshold: 0.05 }
        )
      : null;

  function typewrite(el) {
    if (el._typed) return;
    el._typed = true;
    const text = el.dataset.text || el.textContent;
    if (reducedMotion()) return;
    el.textContent = '';
    el.classList.add('is-typing');
    let i = 0;
    const step = () => {
      el.textContent = text.slice(0, ++i);
      if (i < text.length) setTimeout(step, 45);
      else el.classList.remove('is-typing');
    };
    step();
  }

  const initReveal = (root = document) => {
    const targets = root.querySelectorAll('.reveal, .fx-fade, .fx-slide, .fx-reveal, .fx-typewriter');
    targets.forEach((el) => {
      if (el.classList.contains('fx-typewriter') && !el.dataset.text) el.dataset.text = el.textContent.trim();
      if (!revealObserver || reducedMotion() || window.Shopify?.designMode) {
        el.classList.add('is-visible');
        return;
      }
      revealObserver.observe(el);
    });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => initReveal());
  else initReveal();

  /* ---------- Theme editor integration ---------- */

  const showIconPalette = (block) => {
    const template = document.getElementById('IconPaletteTemplate');
    if (!template || !block.querySelector('.icon, .icon-grid__icon')) return;
    document.querySelector('[data-icon-palette]')?.remove();
    const host = block.closest('[id^="shopify-section-"]') || block;
    host.appendChild(template.content.cloneNode(true));
    const used = new Set(
      Array.from(block.querySelectorAll('.icon')).map((icon) => {
        const named = Array.from(icon.classList).find((name) => name.startsWith('icon-') && name !== 'icon');
        return named ? named.slice(5) : '';
      })
    );
    host.querySelectorAll('[data-icon-value]').forEach((item) => {
      item.classList.toggle('is-active', used.has(item.dataset.iconValue));
    });
  };

  if (window.Shopify?.designMode) {
    document.addEventListener('shopify:section:load', (event) => initReveal(event.target));

    document.addEventListener('shopify:section:select', (event) => {
      if (event.target.id === 'shopify-section-cart-drawer') openDialog(document.getElementById('CartDrawer'));
    });

    document.addEventListener('shopify:section:deselect', (event) => {
      if (event.target.id === 'shopify-section-cart-drawer') closeDialog(document.getElementById('CartDrawer'));
    });

    document.addEventListener('shopify:block:select', (event) => {
      const block = event.target;
      const slider = block.closest('slider-component');
      if (slider?.track) {
        const index = Array.from(slider.track.children).indexOf(block.closest('[data-slider-track] > *'));
        if (index >= 0) slider.goTo(index);
      }
      const bar = block.closest('announcement-bar');
      if (bar?.slides) {
        bar.stop();
        bar.show(bar.slides.indexOf(block));
      }
      const details = block.closest('details');
      if (details) details.open = true;
      const tab = block.closest('[role="tabpanel"]');
      if (tab) tab.closest('tabs-component')?.refresh(tab.id);
      showIconPalette(block);
    });

    document.addEventListener('shopify:block:deselect', (event) => {
      event.target.closest('announcement-bar')?.start();
      document.querySelector('[data-icon-palette]')?.remove();
    });
  }
})();
