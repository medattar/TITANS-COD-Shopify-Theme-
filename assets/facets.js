/* TITANS COD — collection / search filtering and sorting via the Section Rendering API. */
(() => {
  const debounce = (fn, wait) => {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), wait);
    };
  };

  class FacetFilters extends HTMLElement {
    connectedCallback() {
      if (this._bound) return;
      this._bound = true;
      this.sectionId = this.dataset.sectionId;
      this._onInput = debounce(() => this.submitForm(), 450);

      this.addEventListener('change', (event) => {
        if (event.target.closest('[data-facets-form]')) this._onInput();
      });
      this.addEventListener('submit', (event) => {
        if (!event.target.matches('[data-facets-form]')) return;
        event.preventDefault();
        this.submitForm();
      });
      this.addEventListener('click', (event) => {
        const link = event.target.closest('a[data-facet-link]');
        if (!link || event.metaKey || event.ctrlKey) return;
        event.preventDefault();
        const url = new URL(link.href, window.location.origin);
        this.render(url.search.slice(1), link.closest('.pagination-wrapper') !== null);
      });
      window.addEventListener('popstate', () => this.render(window.location.search.slice(1), false, false));
    }

    get form() {
      return this.querySelector('[data-facets-form]');
    }

    submitForm() {
      const params = new URLSearchParams();
      new FormData(this.form).forEach((value, key) => {
        if (value !== '') params.append(key, value);
      });
      this.render(params.toString());
    }

    async render(query, scroll = false, push = true) {
      const params = new URLSearchParams(query);
      params.delete('section_id');
      const clean = params.toString();
      params.set('section_id', this.sectionId);
      this.setAttribute('aria-busy', 'true');
      try {
        const response = await fetch(`${window.location.pathname}?${params.toString()}`);
        if (!response.ok) throw new Error(String(response.status));
        const html = await response.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const focusedId = document.activeElement?.id;
        this.querySelectorAll('[data-facet-update]').forEach((target) => {
          const source = doc.querySelector(`[data-facet-update="${target.dataset.facetUpdate}"]`);
          if (source) target.innerHTML = source.innerHTML;
        });
        const bar = doc.querySelector('.facets__open');
        const currentBar = this.querySelector('.facets__open');
        if (bar && currentBar) currentBar.innerHTML = bar.innerHTML;
        if (focusedId) document.getElementById(focusedId)?.focus({ preventScroll: true });
        if (push) window.history.pushState({}, '', clean ? `${window.location.pathname}?${clean}` : window.location.pathname);
        if (scroll) this.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } catch (error) {
        window.location.search = clean;
      } finally {
        this.removeAttribute('aria-busy');
      }
    }
  }

  if (!customElements.get('facet-filters')) customElements.define('facet-filters', FacetFilters);
})();
