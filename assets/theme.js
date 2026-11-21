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

  const renderCartSections = (sections) => {
    if (!sections) return;
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
      const target = document.querySelector(`cart-items[data-section-id="${id}"]`);
      const source = doc.querySelector('cart-items');
      if (target && source) target.innerHTML = source.innerHTML;
    });
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

  const changeCart = async (line, quantity) => {
    const sections = cartSections();
    const data = await fetchJSON(`${Titans.routes.cartChange}.js`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ line, quantity, sections, sections_url: window.location.pathname }),
    });
    renderCartSections(data.sections);
    updateCartCount(data.item_count);
    document.dispatchEvent(new CustomEvent('cart:changed', { detail: { cart: data } }));
    return data;
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
      this._onChange = debounce((input) => this.update(input.dataset.line, parseInt(input.value, 10)), 350);
      this.addEventListener('change', (event) => {
        const input = event.target.closest('[data-line]');
        if (input && input.matches('input')) this._onChange(input);
      });
      this.addEventListener('click', (event) => {
        const remove = event.target.closest('[data-remove-line]');
        if (remove) {
          event.preventDefault();
          this.update(remove.dataset.removeLine, 0);
        }
      });
    }

    async update(line, quantity) {
      if (!line || Number.isNaN(quantity)) return;
      this.setAttribute('aria-busy', 'true');
      try {
        await changeCart(parseInt(line, 10), quantity);
      } catch (error) {
        const errors = this.querySelector('[data-cart-errors]');
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
        this.hidden = true;
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
      if (!this.video) return;
      if (reducedMotion() && !this.hasAttribute('data-force')) {
        this.video.removeAttribute('autoplay');
        return;
      }
      this._io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              if (this.video.preload === 'none') this.video.preload = 'metadata';
              this.video.play().catch(() => {});
            } else {
              this.video.pause();
            }
          });
        },
        { threshold: 0.25 }
      );
      this._io.observe(this);
      this.querySelector('[data-video-sound]')?.addEventListener('click', (event) => {
        event.preventDefault();
        this.video.muted = !this.video.muted;
        event.currentTarget.setAttribute('aria-pressed', String(!this.video.muted));
      });
    }

    disconnectedCallback() {
      this._io?.disconnect();
    }
  }
  if (!customElements.get('inview-video')) customElements.define('inview-video', InviewVideo);

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
      this.tabs = Array.from(this.querySelectorAll('[role="tab"]'));
      this.tabs.forEach((tab) => {
        tab.addEventListener('click', () => this.select(tab));
        tab.addEventListener('keydown', (event) => {
          const i = this.tabs.indexOf(tab);
          if (event.key === 'ArrowRight') this.select(this.tabs[(i + 1) % this.tabs.length], true);
          if (event.key === 'ArrowLeft') this.select(this.tabs[(i - 1 + this.tabs.length) % this.tabs.length], true);
        });
      });
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
      if (tab) {
        const tabs = tab.closest('tabs-component');
        const trigger = tabs?.querySelector(`[aria-controls="${tab.id}"]`);
        if (trigger) tabs.select(trigger);
      }
    });

    document.addEventListener('shopify:block:deselect', (event) => {
      event.target.closest('announcement-bar')?.start();
    });
  }
})();
