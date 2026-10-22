/* ==========================================================================
   Motion layer — GSAP 3.13 + ScrollTrigger + SplitText
   Loads before main.js. If GSAP is missing (CDN blocked) the page falls back
   to the CSS/IntersectionObserver reveals in main.js. Honours reduced motion.
   ========================================================================== */
(function () {
  "use strict";
  if (!window.gsap) return;

  var gsap = window.gsap;
  var ST = window.ScrollTrigger;
  var Split = window.SplitText;
  var root = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  if (ST) gsap.registerPlugin(ST);
  if (Split) gsap.registerPlugin(Split);
  root.classList.add("has-gsap");

  // main.js reads this to delay the typewriter until the hero intro has landed
  window.MOTION_INTRO_DELAY = 1700;

  gsap.defaults({ ease: "power3.out", duration: 0.8 });
  // ?slowmo=1 slows every tween 8x for reviewing the choreography
  if (/[?&]slowmo=1/.test(location.search)) gsap.globalTimeline.timeScale(0.125);

  var mm = gsap.matchMedia();

  /* ---------- Reduced motion: everything visible, nothing moves ---------- */
  mm.add("(prefers-reduced-motion: reduce)", function () {
    window.MOTION_INTRO_DELAY = 300;
    gsap.set(".reveal, .hero__title, .nav", { clearProps: "all" });
  });

  mm.add("(prefers-reduced-motion: no-preference)", function () {
    /* ---------- 1. Hero intro (one orchestrated moment) ---------- */
    var hero = $("#home");
    var nav = $("#nav");
    var title = $(".hero__title");
    var introItems = {
      pill: $(".status-pill", hero),
      role: $(".hero__role", hero),
      lead: $(".hero__lead", hero),
      cta: $(".hero__cta", hero),
      meta: $(".hero__meta", hero),
      photo: $(".photo-card", hero),
      tags: $$(".photo-card__tag", hero),
      cue: $(".scroll-cue", hero)
    };

    // hide intro pieces before first paint
    gsap.set([nav, introItems.pill, introItems.role, introItems.lead, introItems.cta, introItems.meta, introItems.photo, introItems.cue], { autoAlpha: 0 });
    gsap.set(introItems.tags, { autoAlpha: 0, scale: 0.6 });
    if (title) gsap.set(title, { autoAlpha: 1, perspective: 700 });

    var runIntro = function () {
      var tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo(nav, { y: -24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7 }, 0);
      tl.fromTo(introItems.pill, { y: 14, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.6 }, 0.15);

      var chars = null;
      if (title && Split) {
        try {
          var split = new Split($$(".line", title), { type: "words,chars", wordsClass: "wd", charsClass: "ch" });
          chars = split.chars;
        } catch (e) { chars = null; }
      }
      if (chars && chars.length) {
        tl.from(chars, { yPercent: 70, autoAlpha: 0, rotateX: -60, transformOrigin: "50% 100%", duration: 0.9, stagger: 0.022, ease: "expo.out" }, 0.25);
      } else if (title) {
        tl.from($$(".line", title), { y: 40, autoAlpha: 0, duration: 0.9, stagger: 0.1, ease: "expo.out" }, 0.25);
      }

      tl.fromTo(introItems.role, { y: 12, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5 }, 0.95);
      tl.fromTo(introItems.lead, { y: 18, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7 }, 1.05);
      tl.fromTo(introItems.cta, { y: 18, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7 }, 1.2);
      tl.fromTo(introItems.meta, { y: 12, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.6 }, 1.35);
      tl.fromTo(introItems.photo, { y: 40, scale: 0.92, autoAlpha: 0 }, { y: 0, scale: 1, autoAlpha: 1, duration: 1.1, ease: "expo.out", clearProps: "transform,opacity,visibility" }, 0.45);
      tl.to(introItems.tags, { autoAlpha: 1, scale: 1, duration: 0.6, stagger: 0.14, ease: "back.out(2)", clearProps: "transform,opacity,visibility" }, 1.0);
      tl.fromTo(introItems.cue, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6 }, 1.6);
      tl.add(function () { gsap.set(nav, { clearProps: "transform" }); });
    };

    // Split text only after web fonts are in, so glyph metrics are final.
    var afterFonts = function (fn) {
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(fn, fn);
      else fn();
    };
    afterFonts(runIntro);

    if (!ST) return;

    /* ---------- 2. Section headings: masked line reveal ---------- */
    afterFonts(function () { setupHeadings(); ST.refresh(); });
    function setupHeadings() {
    $$(".section-head, .contact .contact__grid > div:first-child").forEach(function (head) {
      var eyebrow = $(".eyebrow", head);
      var h2 = $(".section-title, .contact__title", head);
      var sub = $(".section-sub, .contact__lead", head);
      var extra = $(".filters", head);
      var tl = gsap.timeline({ scrollTrigger: { trigger: head, start: "top 82%", once: true } });
      if (eyebrow) tl.from(eyebrow, { x: -18, autoAlpha: 0, duration: 0.6 }, 0);
      if (h2) {
        var lines = null;
        if (Split) {
          try { lines = new Split(h2, { type: "lines", mask: "lines", linesClass: "ln" }).lines; } catch (e) { lines = null; }
        }
        if (lines && lines.length) tl.from(lines, { yPercent: 110, duration: 0.9, stagger: 0.09, ease: "expo.out" }, 0.1);
        else tl.from(h2, { y: 30, autoAlpha: 0, duration: 0.8 }, 0.1);
      }
      if (sub) tl.from(sub, { y: 14, autoAlpha: 0, duration: 0.6 }, 0.4);
      if (extra) tl.from($$(".filter", extra), { y: 10, autoAlpha: 0, duration: 0.4, stagger: 0.05, clearProps: "transform,opacity,visibility" }, 0.45);
    });
    }

    /* ---------- 3. Scroll reveals (batched so each row lands as it appears) ---------- */
    var skip = function (el) {
      return el.closest("#home") || el.closest(".section-head") || el.closest(".contact__grid > div:first-child") || el.classList.contains("contact");
    };
    var items = $$(".reveal").filter(function (el) { return !skip(el); });
    var xpItems = items.filter(function (el) { return el.classList.contains("xp"); });
    var normal = items.filter(function (el) { return !el.classList.contains("xp"); });

    gsap.set(normal, { autoAlpha: 0, y: 30 });
    ST.batch(normal, {
      start: "top 88%",
      once: true,
      onEnter: function (batch) {
        gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.08, ease: "power3.out", clearProps: "transform,opacity,visibility", overwrite: true });
      }
    });

    gsap.set(xpItems, { autoAlpha: 0, x: -36 });
    ST.batch(xpItems, {
      start: "top 85%",
      once: true,
      onEnter: function (batch) {
        gsap.to(batch, { autoAlpha: 1, x: 0, duration: 0.9, stagger: 0.12, ease: "power3.out", clearProps: "transform,opacity,visibility", overwrite: true });
        batch.forEach(function (card) {
          gsap.from($$(".xp__list li", card), { x: -14, autoAlpha: 0, duration: 0.5, stagger: 0.06, delay: 0.25, clearProps: "transform,opacity,visibility" });
        });
      }
    });

    // contact panel: scale in
    var contact = $(".contact");
    if (contact) {
      gsap.set(contact, { autoAlpha: 0, y: 40, scale: 0.98 });
      gsap.to(contact, { autoAlpha: 1, y: 0, scale: 1, duration: 1, ease: "expo.out", clearProps: "transform,opacity,visibility", scrollTrigger: { trigger: contact, start: "top 85%", once: true } });
      gsap.from($$(".contact__list > *", contact), { x: 24, autoAlpha: 0, duration: 0.6, stagger: 0.07, clearProps: "transform,opacity,visibility", scrollTrigger: { trigger: contact, start: "top 75%", once: true } });
    }

    /* ---------- 4. Chips pop in with their card ---------- */
    $$(".skill-group, .xp, .project, .about__body").forEach(function (card) {
      var chips = $$(".chip", card);
      if (!chips.length) return;
      gsap.from(chips, {
        scale: 0.7, autoAlpha: 0, duration: 0.45, stagger: 0.025, ease: "back.out(1.8)", clearProps: "transform,opacity,visibility",
        scrollTrigger: { trigger: card, start: "top 82%", once: true }
      });
    });

    /* ---------- 5. Count-up numbers ---------- */
    $$("[data-count]").forEach(function (el) {
      var target = parseFloat(el.getAttribute("data-count"));
      var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
      if (isNaN(target)) return;
      var obj = { v: 0 };
      el.textContent = (0).toFixed(decimals);
      gsap.to(obj, {
        v: target, duration: 1.6, ease: "power2.out",
        onUpdate: function () { el.textContent = obj.v.toFixed(decimals); },
        scrollTrigger: { trigger: el, start: "top 90%", once: true }
      });
    });

    /* ---------- 6. Scroll-linked drift (background glows + hero photo) ---------- */
    gsap.to(".bg-glow--1", { y: -220, ease: "none", scrollTrigger: { trigger: "body", start: "top top", end: "max", scrub: 1.2 } });
    gsap.to(".bg-glow--2", { y: 160, ease: "none", scrollTrigger: { trigger: "body", start: "top top", end: "max", scrub: 1.2 } });
    var visual = $(".hero__visual");
    if (visual) gsap.to(visual, { yPercent: 10, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 0.6 } });
    var copy = $(".hero__copy");
    if (copy) gsap.to(copy, { yPercent: -6, autoAlpha: 0.35, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 0.6 } });

    /* ---------- 7. Terminal card types itself in ---------- */
    var term = $(".terminal__body");
    if (term) {
      var lines = $$(".line", term);
      gsap.from(lines, { autoAlpha: 0, x: -8, duration: 0.3, stagger: 0.09, ease: "power1.out", clearProps: "transform,opacity,visibility", scrollTrigger: { trigger: term, start: "top 80%", once: true } });
    }

    /* ---------- 8. Pointer-driven: magnetic CTAs + card tilt (desktop only) ---------- */
    if (finePointer) {
      $$(".hero__cta .btn--primary, .contact .btn--primary").forEach(function (btn) {
        var xTo = gsap.quickTo(btn, "x", { duration: 0.4, ease: "power3.out" });
        var yTo = gsap.quickTo(btn, "y", { duration: 0.4, ease: "power3.out" });
        btn.addEventListener("pointermove", function (e) {
          var r = btn.getBoundingClientRect();
          xTo((e.clientX - r.left - r.width / 2) * 0.28);
          yTo((e.clientY - r.top - r.height / 2) * 0.28 - 2);
        });
        btn.addEventListener("pointerleave", function () {
          gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.45)" });
        });
      });

      $$(".project").forEach(function (card) {
        var rx = gsap.quickTo(card, "rotationX", { duration: 0.45, ease: "power2.out" });
        var ry = gsap.quickTo(card, "rotationY", { duration: 0.45, ease: "power2.out" });
        gsap.set(card, { transformPerspective: 900 });
        card.addEventListener("pointerenter", function () { gsap.to(card, { y: -6, duration: 0.4, ease: "power3.out" }); });
        card.addEventListener("pointermove", function (e) {
          var r = card.getBoundingClientRect();
          var px = (e.clientX - r.left) / r.width - 0.5;
          var py = (e.clientY - r.top) / r.height - 0.5;
          ry(px * 6);
          rx(-py * 6);
        });
        card.addEventListener("pointerleave", function () {
          gsap.to(card, { y: 0, rotationX: 0, rotationY: 0, duration: 0.6, ease: "power3.out" });
        });
      });
    }

    /* ---------- 9. UI feedback: theme toggle spin, filter re-flow, modal stagger ---------- */
    var toggle = $("#themeToggle");
    if (toggle) {
      toggle.addEventListener("click", function () {
        var icon = $("svg", toggle);
        gsap.fromTo(toggle, { rotate: -140, scale: 0.7 }, { rotate: 0, scale: 1, duration: 0.6, ease: "back.out(2.5)" });
        if (icon) gsap.fromTo(icon, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 });
      });
    }

    $$(".filter").forEach(function (btn) {
      btn.addEventListener("click", function () {
        requestAnimationFrame(function () {
          var visible = $$(".project:not(.is-hidden)");
          gsap.fromTo(visible, { autoAlpha: 0, y: 18, scale: 0.98 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.06, ease: "power3.out", clearProps: "transform,opacity,visibility", overwrite: true });
          ST.refresh();
        });
      });
    });

    var modal = $("#modal");
    if (modal && window.MutationObserver) {
      new MutationObserver(function () {
        if (!modal.classList.contains("is-open")) return;
        var parts = $$("#modalBody > *, #modalFoot > *");
        gsap.fromTo(parts, { y: 16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.45, stagger: 0.04, ease: "power2.out", clearProps: "transform,opacity,visibility" });
      }).observe(modal, { attributes: true, attributeFilter: ["class"] });
    }

    /* ---------- 10. Keep triggers accurate once images/fonts settle ---------- */
    window.addEventListener("load", function () { ST.refresh(); });
    $$("img").forEach(function (img) {
      if (!img.complete) img.addEventListener("load", function () { ST.refresh(); }, { once: true });
    });
  });
})();
