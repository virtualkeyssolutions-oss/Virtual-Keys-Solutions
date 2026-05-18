/* ============================================================
   VIRTUAL KEYS — GLOBAL MOTION JS
   Smooth page-to-page transitions: fades the veil back in
   on internal link clicks, then navigates.
   ============================================================ */
(function () {
  'use strict';

  // How long the exit fade lasts (must match CSS transition).
  var LEAVE_MS = 420;

  var isLeaving = false;

  // Decide whether a click should trigger the slow-mo transition.
  function shouldIntercept(a, e) {
    if (!a || !a.href) return false;
    if (e.defaultPrevented) return false;
    if (e.button !== 0) return false;                       // left click only
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return false;
    if (a.target && a.target !== '' && a.target !== '_self') return false;
    if (a.hasAttribute('download')) return false;
    if (a.getAttribute('rel') === 'external') return false;

    var href = a.getAttribute('href');
    if (!href) return false;
    if (href.charAt(0) === '#') return false;               // in-page anchor
    if (/^(mailto:|tel:|sms:|javascript:|whatsapp:)/i.test(href)) return false;

    var url;
    try { url = new URL(a.href, location.href); } catch (err) { return false; }

    if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
    if (url.origin !== location.origin) return false;       // external site
    // Same page (hash-only nav) — skip
    if (url.pathname === location.pathname &&
        url.search   === location.search   && url.hash) return false;
    // Exact same URL — let the browser do its thing
    if (url.href === location.href) return false;

    return true;
  }

  function leaveTo(href) {
    if (isLeaving) return;
    isLeaving = true;
    document.documentElement.classList.add('vk-leaving');
    setTimeout(function () { window.location.href = href; }, LEAVE_MS);
  }

  // Capture-phase listener so we run before any per-element handlers
  // that might call stopPropagation on bubble.
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var a = t.closest('a');
    if (!shouldIntercept(a, e)) return;
    e.preventDefault();
    leaveTo(a.href);
  }, true);

  // Clean up before going into bfcache so a Back-button restore
  // doesn't show the dark veil briefly.
  window.addEventListener('pagehide', function () {
    document.documentElement.classList.remove('vk-leaving');
    isLeaving = false;
  });

  // If restored from bfcache, make sure we're not stuck in leaving state.
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) {
      document.documentElement.classList.remove('vk-leaving');
      isLeaving = false;
    }
  });
})();
