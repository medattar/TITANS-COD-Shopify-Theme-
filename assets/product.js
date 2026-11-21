/* TITANS COD — product page behaviour: variants, gallery, add to cart, delivery estimate, sticky bar. */
(() => {
  if (window.__titansProductJs) return;
  window.__titansProductJs = true;
  const Titans = window.Titans || {};
  const strings = Titans.strings || {};

  /* ---------- Product info: variant selection + partial re-render ---------- */

  class ProductInfo extends HTMLElement {
    connectedCallback() {
      if (this._bound) return;
      this._bound = true;
      try {
        this.data = JSON.parse(this.querySelector('[data-product-json]')?.textContent || '{}');
      } catch (error) {
        this.data = {};
      }
      this.addEventListener('change', (event) => {
        const picker = event.target.closest('variant-picker');
        if (picker && this.contains(picker)) this.onOptionChange(picker);
      });
    }

    get form() {
      return document.getElementById(this.dataset.formId);
    }

    selectedValues(picker) {
      return Array.from(picker.querySelectorAll('[data-option-index]'))
        .sort((a, b) => Number(a.dataset.optionIndex) - Number(b.dataset.optionIndex))
        .map((fieldset) => {
          const select = fieldset.querySelector('select');
          if (select) return select.value;
          return fieldset.querySelector('input:checked')?.value;
        });
    }

    onOptionChange(picker) {
      const values = this.selectedValues(picker);
      const variant = (this.data.variants || []).find((v) => v.options.every((option, i) => option === values[i]));
      this.setVariant(variant || null, values);
    }

    setVariant(variant) {
      this.variant = variant;
      this.querySelectorAll('[data-variant-input]').forEach((input) => this.syncInput(input, variant));
      const form = this.form;
      if (form) form.querySelectorAll('input[name="id"]').forEach((input) => this.syncInput(input, variant));

      this.classList.toggle('is-unavailable', !variant);
      if (!variant) {
        this.setUnavailable();
        return;
      }

      if (this.dataset.updateUrl === 'true') {
        const url = new URL(window.location.href);
        url.searchParams.set('variant', variant.id);
        window.history.replaceState({}, '', url.toString());
      }

      if (variant.featured_media_id) {
        this.querySelector('media-gallery')?.goToMedia(variant.featured_media_id);
      }

      this.render(variant);
      document.dispatchEvent(
        new CustomEvent('titans:variant:change', { detail: { variant, sectionId: this.dataset.sectionId } })
      );
    }

    syncInput(input, variant) {
      const next = variant ? String(variant.id) : '';
      if (input.value === next && input.disabled === !variant) return;
      input.value = next;
      input.disabled = !variant;
      /* COD apps listen for changes on the form's variant input. */
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }

    setUnavailable() {
      this.querySelectorAll('[data-add-button]').forEach((button) => {
        button.disabled = true;
        const label = button.querySelector('.atc__l1');
        if (label) label.textContent = strings.unavailable || 'Unavailable';
        button.querySelectorAll('.atc__l3').forEach((el) => el.remove());
      });
      const sticky = this.querySelector('[data-sticky-button]');
      if (sticky) sticky.disabled = true;
    }

    async render(variant) {
      this._abort?.abort();
      this._abort = new AbortController();
      const base = (this.dataset.renderUrl || this.dataset.productUrl).split('?')[0];
      const url = `${base}?variant=${variant.id}&section_id=${this.dataset.sectionId}`;
      this.setAttribute('aria-busy', 'true');
      try {
        const response = await fetch(url, { signal: this._abort.signal });
        if (!response.ok) throw new Error(String(response.status));
        const html = await response.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const focusedId = document.activeElement?.id;
        this.querySelectorAll('[data-variant-update]').forEach((target) => {
          const key = target.dataset.variantUpdate;
          const source = doc.querySelector(`[data-variant-update="${CSS.escape(key)}"]`);
          if (!source) return;
          target.innerHTML = source.innerHTML;
          target.hidden = source.hidden;
          ['class', 'aria-label'].forEach((attr) => {
            if (source.hasAttribute(attr)) target.setAttribute(attr, source.getAttribute(attr));
          });
        });
        if (focusedId) document.getElementById(focusedId)?.focus({ preventScroll: true });
      } catch (error) {
        if (error.name !== 'AbortError') console.warn('[TITANS] variant render failed', error);
      } finally {
        this.removeAttribute('aria-busy');
      }
    }
  }
  if (!customElements.get('product-info')) customElements.define('product-info', ProductInfo);

  /* variant-picker is a styling hook; ProductInfo handles its change events. */
  if (!customElements.get('variant-picker')) customElements.define('variant-picker', class extends HTMLElement {});

  /* ---------- Media gallery ---------- */

  class MediaGallery extends HTMLElement {
    connectedCallback() {
      if (this._bound) return;
      this._bound = true;
      this.track = this.querySelector('[data-gallery-track]');
      if (!this.track) return;
      this.slides = Array.from(this.track.children);
      this.thumbs = Array.from(this.querySelectorAll('[data-thumb-index]'));
      this.counter = this.querySelector('[data-gallery-current]');
      this.index = Math.max(
        0,
        this.slides.findIndex((s) => s.classList.contains('is-active'))
      );
      if (this.index > 0) requestAnimationFrame(() => this.goTo(this.index, false));

      this.addEventListener('click', (event) => {
        const thumb = event.target.closest('[data-thumb-index]');
        if (thumb) this.goTo(Number(thumb.dataset.thumbIndex));
        if (event.target.closest('[data-gallery-prev]')) this.goTo(this.index - 1);
        if (event.target.closest('[data-gallery-next]')) this.goTo(this.index + 1);
      });

      this.track.addEventListener(
        'scroll',
        Titans.utils.debounce(() => {
          const i = Math.round(this.track.scrollLeft / Math.max(1, this.track.clientWidth));
          if (i !== this.index) this.setActive(i);
        }, 80),
        { passive: true }
      );

      this.track.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowRight') this.goTo(this.index + 1);
        if (event.key === 'ArrowLeft') this.goTo(this.index - 1);
      });
    }

    goTo(index, smooth = true) {
      if (!this.slides?.length) return;
      const i = (index + this.slides.length) % this.slides.length;
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.track.scrollTo({ left: this.slides[i].offsetLeft, behavior: smooth && !reduce ? 'smooth' : 'auto' });
      this.setActive(i);
    }

    goToMedia(mediaId) {
      const i = this.slides?.findIndex((s) => s.dataset.mediaId === String(mediaId));
      if (i >= 0) this.goTo(i);
    }

    setActive(i) {
      this.index = i;
      this.slides.forEach((slide, n) => {
        const active = n === i;
        slide.classList.toggle('is-active', active);
        if (!active) slide.querySelectorAll('video').forEach((video) => video.pause());
      });
      this.thumbs.forEach((thumb, n) => {
        if (n === i) {
          thumb.setAttribute('aria-current', 'true');
          const rail = thumb.parentElement;
          const vertical = rail.scrollHeight > rail.clientHeight + 2;
          rail.scrollTo({
            top: vertical ? thumb.offsetTop - rail.clientHeight / 2 + thumb.clientHeight / 2 : 0,
            left: vertical ? 0 : thumb.offsetLeft - rail.clientWidth / 2 + thumb.clientWidth / 2,
            behavior: 'smooth',
          });
        } else {
          thumb.removeAttribute('aria-current');
        }
      });
      if (this.counter) this.counter.textContent = String(i + 1);
    }
  }
  if (!customElements.get('media-gallery')) customElements.define('media-gallery', MediaGallery);

  /* ---------- Product form (AJAX add to cart when the cart drawer is enabled) ---------- */

  document.addEventListener('submit', async (event) => {
    const form = event.target.closest('form[data-product-form]');
    /* In COD app mode the native form only carries the variant for the app; block implicit (Enter key) submits. */
    if (form && form.closest('[data-purchase-mode="app"]') && !event.submitter) {
      event.preventDefault();
      return;
    }
    if (!form || Titans.cartType !== 'drawer' || !document.getElementById('CartDrawer')) return;
    event.preventDefault();

    const button = event.submitter || form.querySelector('[data-add-button]');
    const error = form.querySelector('[data-form-error]');
    if (button?.getAttribute('aria-busy') === 'true') return;
    button?.setAttribute('aria-busy', 'true');
    if (error) error.hidden = true;

    try {
      await Titans.cart.addToCart(new FormData(form));
    } catch (err) {
      if (error) {
        error.textContent = err.message;
        error.hidden = false;
      } else {
        Titans.utils.toast(err.message, 'error');
      }
    } finally {
      button?.removeAttribute('aria-busy');
    }
  });

  /* ---------- Delivery estimate ---------- */

  class DeliveryEstimate extends HTMLElement {
    connectedCallback() {
      const text = this.querySelector('[data-delivery-text]');
      const template = text?.dataset.template;
      if (!text || !template) return;
      const min = Number(this.dataset.min || 0);
      const max = Math.max(min, Number(this.dataset.max || min));
      const businessOnly = this.dataset.businessDays === 'true';
      const start = new Date();
      if (start.getHours() >= Number(this.dataset.cutoff || 24)) start.setDate(start.getDate() + 1);

      const addDays = (from, days) => {
        const date = new Date(from);
        let added = 0;
        while (added < days) {
          date.setDate(date.getDate() + 1);
          const day = date.getDay();
          if (!businessOnly || (day !== 0 && day !== 6)) added += 1;
        }
        return date;
      };

      let formatter;
      try {
        formatter = new Intl.DateTimeFormat(this.dataset.locale, { weekday: 'short', day: 'numeric', month: 'short' });
      } catch (error) {
        formatter = new Intl.DateTimeFormat(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
      }
      const wrap = (date) => {
        const u = document.createElement('u');
        u.textContent = formatter.format(date);
        return u.outerHTML;
      };
      const escape = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
      text.innerHTML = escape(template)
        .replace('[start]', wrap(addDays(start, min)))
        .replace('[end]', wrap(addDays(start, max)));
    }
  }
  if (!customElements.get('delivery-estimate')) customElements.define('delivery-estimate', DeliveryEstimate);

  /* ---------- Sticky buy bar ---------- */

  class StickyBuyBar extends HTMLElement {
    connectedCallback() {
      if (this._bound) return;
      this._bound = true;
      this.info = this.closest('product-info');
      this.target = this.info?.querySelector('.buy-buttons, [data-variant-input]');
      if (!this.target) return;

      this._io = new IntersectionObserver(
        ([entry]) => {
          const past = !entry.isIntersecting && entry.boundingClientRect.top < 0;
          this.classList.toggle('is-visible', past);
          this.setAttribute('aria-hidden', String(!past));
          this.inert = !past;
        },
        { threshold: 0 }
      );
      this._io.observe(this.target);

      this.addEventListener('click', (event) => {
        if (!event.target.closest('[data-sticky-button]')) return;
        this.onBuy();
      });
    }

    disconnectedCallback() {
      this._io?.disconnect();
    }

    onBuy() {
      const buy = this.info.querySelector('.buy-buttons');
      const native = buy?.dataset.purchaseMode === 'native';
      const singleVariant = (this.info.data?.variants || []).length <= 1;
      const form = this.info.form;
      const addButton = form?.querySelector('[data-add-button]');
      if (native && singleVariant && form && addButton && !addButton.disabled) {
        form.requestSubmit(addButton);
        return;
      }
      const anchor = this.info.querySelector('variant-picker') || buy || this.target;
      anchor.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
  if (!customElements.get('sticky-buy-bar')) customElements.define('sticky-buy-bar', StickyBuyBar);
})();
