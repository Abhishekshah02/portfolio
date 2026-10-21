/* ==========================================================================
   Abhishek Kumar Shah — Portfolio interactions (vanilla JS, no dependencies)
   ========================================================================== */
(function () {
  "use strict";

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- Theme ---------- */
  var root = document.documentElement;
  var themeToggle = $("#themeToggle");
  function setTheme(t) {
    root.setAttribute("data-theme", t);
    try { localStorage.setItem("theme", t); } catch (e) {}
    var meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", t === "light" ? "#f7f7f4" : "#09090c");
  }
  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      setTheme(root.getAttribute("data-theme") === "light" ? "dark" : "light");
    });
  }

  /* ---------- Nav: scrolled state, progress bar, back-to-top ---------- */
  var nav = $("#nav");
  var progress = $("#progress");
  var toTop = $("#toTop");
  var ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || window.pageYOffset;
      if (nav) nav.classList.toggle("is-scrolled", y > 12);
      if (toTop) toTop.classList.toggle("is-visible", y > 600);
      if (progress) {
        var h = document.documentElement.scrollHeight - window.innerHeight;
        progress.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
      }
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  /* ---------- Mobile menu ---------- */
  var burger = $("#navBurger");
  var mobileMenu = $("#mobileMenu");
  function closeMenu() {
    if (!burger || !mobileMenu) return;
    burger.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Open menu");
    mobileMenu.classList.remove("is-open");
  }
  if (burger && mobileMenu) {
    burger.addEventListener("click", function () {
      var open = !mobileMenu.classList.contains("is-open");
      burger.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      mobileMenu.classList.toggle("is-open", open);
    });
    $$("a", mobileMenu).forEach(function (a) { a.addEventListener("click", closeMenu); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });
  }

  /* ---------- Scroll spy ---------- */
  var sections = $$("main section[id]");
  var navLinks = $$('.nav__links a[href^="#"], .mobile-menu a[href^="#"]');
  if ("IntersectionObserver" in window && sections.length) {
    var current = null;
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) current = en.target.id;
      });
      if (!current) return;
      navLinks.forEach(function (a) {
        a.classList.toggle("is-active", a.getAttribute("href") === "#" + current);
      });
    }, { rootMargin: "-40% 0px -55% 0px", threshold: 0 });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- Reveal on scroll (fires once) ---------- */
  var reveals = $$(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("is-in");
          ro.unobserve(en.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach(function (el) { ro.observe(el); });
  }

  /* ---------- Hero role: typewriter that cycles through roles ---------- */
  var roleText = $("#roleText");
  var roleLine = $("#roleLine");
  if (roleText) {
    var roles = [];
    try { roles = JSON.parse(roleText.getAttribute("data-roles") || "[]"); } catch (e) {}
    if (!roles.length) roles = [roleText.textContent];

    if (reduceMotion) {
      roleText.textContent = roles[0];
    } else {
      var ri = 0, ci = 0, deleting = false, hovering = false;
      if (roleLine) {
        roleLine.addEventListener("pointerenter", function () { hovering = true; });
        roleLine.addEventListener("pointerleave", function () { hovering = false; });
      }
      var step = function () {
        if (hovering || document.hidden) { setTimeout(step, 400); return; }
        var word = roles[ri];
        if (!deleting) {
          ci++;
          roleText.textContent = word.slice(0, ci);
          if (ci >= word.length) { deleting = true; setTimeout(step, 2800); return; }
          setTimeout(step, 45 + Math.random() * 45);
        } else {
          ci--;
          roleText.textContent = word.slice(0, ci);
          if (ci <= 0) { deleting = false; ri = (ri + 1) % roles.length; setTimeout(step, 400); return; }
          setTimeout(step, 26);
        }
      };
      roleText.textContent = "";
      setTimeout(step, 500);
    }
  }

  /* ---------- Spotlight hover on cards (desktop only) ---------- */
  if (finePointer) {
    $$(".tile, .project").forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty("--mx", (e.clientX - r.left) + "px");
        card.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
    });

    // Subtle 3D tilt on the hero photo.
    var photo = $("#photoCard");
    if (photo && !reduceMotion) {
      photo.addEventListener("pointermove", function (e) {
        var r = photo.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        photo.style.transform = "rotateY(" + (x * 8) + "deg) rotateX(" + (-y * 8) + "deg)";
      });
      photo.addEventListener("pointerleave", function () { photo.style.transform = ""; });
    }
  }

  /* ---------- Project filters ---------- */
  var filters = $$(".filter");
  var projects = $$(".project");
  filters.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var f = btn.getAttribute("data-filter");
      filters.forEach(function (b) {
        b.classList.toggle("is-active", b === btn);
        b.setAttribute("aria-selected", String(b === btn));
      });
      projects.forEach(function (p) {
        var tags = (p.getAttribute("data-tags") || "").split(/\s+/);
        var show = f === "all" || tags.indexOf(f) !== -1;
        p.classList.toggle("is-hidden", !show);
        if (show) p.classList.add("is-in");
      });
    });
  });

  /* ---------- Modal (project case studies + certificate lightbox) ---------- */
  var modal = $("#modal");
  var modalTitle = $("#modalTitle");
  var modalBody = $("#modalBody");
  var modalFoot = $("#modalFoot");
  var modalClose = $("#modalClose");
  var lastFocus = null;

  function openModalRaw(title, html, links) {
    if (!modal) return;
    modalTitle.textContent = title;
    modalBody.innerHTML = html;
    modalFoot.innerHTML = "";

    (links || []).forEach(function (l) {
      var a = document.createElement("a");
      a.className = "btn btn--primary btn--sm";
      a.href = l.href;
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = l.label + " ↗";
      modalFoot.appendChild(a);
    });
    var closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "btn btn--ghost btn--sm";
    closeBtn.textContent = "Close";
    closeBtn.addEventListener("click", closeModal);
    modalFoot.appendChild(closeBtn);

    lastFocus = document.activeElement;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    $(".modal__panel", modal).scrollTop = 0;
    setTimeout(function () { modalClose.focus(); }, 50);
  }

  function openProject(card) {
    var title = $(".project__title", card);
    var details = $(".project__details", card);
    if (!title || !details) return;
    var html = details.innerHTML;
    var links = [];
    var tmp = document.createElement("div");
    tmp.innerHTML = html;
    var linksEl = $(".modal__foot-links", tmp);
    if (linksEl) {
      try { links = JSON.parse(linksEl.getAttribute("data-links") || "[]"); } catch (e) {}
      linksEl.remove();
      html = tmp.innerHTML;
    }
    openModalRaw(title.textContent, html, links);
  }

  function closeModal() {
    if (!modal || !modal.classList.contains("is-open")) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  projects.forEach(function (card) {
    card.addEventListener("click", function (e) {
      if (e.target.closest("[data-stop]") || e.target.closest("a")) return;
      openProject(card);
    });
    card.addEventListener("keydown", function (e) {
      if ((e.key === "Enter" || e.key === " ") && e.target === card) {
        e.preventDefault();
        openProject(card);
      }
    });
    var more = $("[data-open]", card);
    if (more) {
      more.addEventListener("click", function (e) {
        e.stopPropagation();
        openProject(card);
      });
    }
  });

  // Certificate cards: open the image in the modal as a lightbox.
  $$(".cred[data-img]").forEach(function (card) {
    var open = function () {
      var media = $(".cred__media", card);
      if (media && media.classList.contains("is-missing")) return;
      var src = card.getAttribute("data-img");
      var title = ($(".cred__title", card) || {}).textContent || "Certificate";
      var issuer = ($(".cred__issuer", card) || {}).textContent || "";
      var kind = ($(".cred__kind", card) || {}).textContent || "";
      var fig = document.createElement("figure");
      fig.className = "lightbox";
      var img = document.createElement("img");
      img.src = src;
      img.alt = title;
      var cap = document.createElement("figcaption");
      cap.textContent = issuer + (kind ? " · " + kind : "");
      fig.appendChild(img);
      fig.appendChild(cap);
      openModalRaw(title, fig.outerHTML, [{ label: "Open full size", href: src }]);
    };
    card.addEventListener("click", open);
    card.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
    });
  });

  if (modal) {
    modalClose.addEventListener("click", closeModal);
    modal.addEventListener("click", function (e) { if (e.target === modal) closeModal(); });
    document.addEventListener("keydown", function (e) {
      if (!modal.classList.contains("is-open")) return;
      if (e.key === "Escape") closeModal();
      if (e.key === "Tab") {
        // simple focus trap
        var focusables = $$('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])', modal)
          .filter(function (el) { return el.offsetParent !== null; });
        if (!focusables.length) return;
        var first = focusables[0], last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* ---------- Copy to clipboard + toast ---------- */
  var toast = $("#toast");
  var toastTimer;
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("is-visible"); }, 2200);
  }

  $$("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var text = btn.getAttribute("data-copy");
      var done = function () {
        btn.classList.add("is-copied");
        btn.textContent = "copied";
        showToast("Email copied to clipboard");
        setTimeout(function () { btn.classList.remove("is-copied"); btn.textContent = "copy"; }, 1800);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text, done); });
      } else {
        fallbackCopy(text, done);
      }
    });
  });

  function fallbackCopy(text, done) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); done(); } catch (e) { showToast(text); }
    document.body.removeChild(ta);
  }

  /* ---------- Footer year ---------- */
  var year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
