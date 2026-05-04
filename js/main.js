(function () {
  "use strict";

  var TYPING_PHRASE = "Exploring my journey through academics, music, and culture";
  var TYPING_SPEED = 42;
  var TYPING_PAUSE = 2200;

  /* ----- Year ----- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ----- Nav: scroll + mobile ----- */
  var header = document.querySelector(".site-header");
  var navToggle = document.getElementById("nav-toggle");
  var navMenu = document.getElementById("nav-menu");

  function onScroll() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 40);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", function () {
      var open = navMenu.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    navMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navMenu.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ----- Typing ----- */
  var typingEl = document.getElementById("typing-text");
  if (typingEl && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var ti = 0;
    var phase = "typing";

    function tickTyping() {
      if (phase === "typing") {
        ti++;
        typingEl.textContent = TYPING_PHRASE.slice(0, ti);
        if (ti >= TYPING_PHRASE.length) {
          phase = "pause";
          return void setTimeout(tickTyping, TYPING_PAUSE);
        }
        return void setTimeout(tickTyping, TYPING_SPEED);
      }
      if (phase === "pause") {
        phase = "deleting";
        return void tickTyping();
      }
      ti--;
      typingEl.textContent = TYPING_PHRASE.slice(0, ti);
      if (ti <= 0) {
        phase = "typing";
        return void setTimeout(tickTyping, 600);
      }
      setTimeout(tickTyping, TYPING_SPEED / 2.5);
    }
    typingEl.textContent = "";
    setTimeout(tickTyping, 400);
  } else if (typingEl) {
    typingEl.textContent = TYPING_PHRASE;
  }

  /* ----- Particles ----- */
  var canvas = document.getElementById("particles");
  if (canvas && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var ctx = canvas.getContext("2d");
    var particles = [];
    var w = 0;
    var h = 0;
    var DPR = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      var rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = w * DPR;
      canvas.height = h * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }

    function initParticles() {
      particles = [];
      var count = Math.floor((w * h) / 18000);
      count = Math.min(Math.max(count, 35), 120);
      for (var n = 0; n < count; n++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.8 + 0.4,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          a: Math.random() * 0.45 + 0.15,
        });
      }
    }

    function step() {
      ctx.clearRect(0, 0, w, h);
      for (var p = 0; p < particles.length; p++) {
        var q = particles[p];
        q.x += q.vx;
        q.y += q.vy;
        if (q.x < 0) q.x = w;
        if (q.x > w) q.x = 0;
        if (q.y < 0) q.y = h;
        if (q.y > h) q.y = 0;
        ctx.beginPath();
        ctx.arc(q.x, q.y, q.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(200, 210, 255, " + q.a + ")";
        ctx.fill();
      }
      requestAnimationFrame(step);
    }

    resize();
    initParticles();
    window.addEventListener("resize", function () {
      resize();
      initParticles();
    });
    requestAnimationFrame(step);
  }

  /* ----- Scroll reveal ----- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            if (!entry.target.classList.contains("timeline")) io.unobserve(entry.target);
          }
        });
      },
      { root: null, rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    revealEls.forEach(function (el) {
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* ----- Three.js: subtle rotating shape ----- */
  var container = document.getElementById("hero-3d");
  if (container && typeof THREE !== "undefined" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var scene = new THREE.Scene();
    var cam = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    cam.position.z = 4.2;

    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    var geo = new THREE.IcosahedronGeometry(1.15, 1);
    var mat = new THREE.MeshStandardMaterial({
      color: 0xb8a0ff,
      emissive: 0x221844,
      metalness: 0.35,
      roughness: 0.35,
      wireframe: true,
    });
    var mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);

    var inner = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.72, 0),
      new THREE.MeshStandardMaterial({
        color: 0x7ec8e3,
        emissive: 0x0a3040,
        metalness: 0.2,
        roughness: 0.5,
        transparent: true,
        opacity: 0.35,
      })
    );
    scene.add(inner);

    var amb = new THREE.AmbientLight(0xffffff, 0.55);
    scene.add(amb);
    var pt = new THREE.PointLight(0xc4a5ff, 1.1, 12);
    pt.position.set(2, 2, 3);
    scene.add(pt);

    function sizeThree() {
      var rect = container.getBoundingClientRect();
      var cw = Math.max(1, rect.width);
      var ch = Math.max(1, rect.height);
      renderer.setSize(cw, ch, false);
      cam.aspect = cw / ch;
      cam.updateProjectionMatrix();
    }

    sizeThree();
    window.addEventListener("resize", sizeThree);

    var t0 = performance.now();
    function loop(now) {
      var t = (now - t0) * 0.001;
      mesh.rotation.x = t * 0.31;
      mesh.rotation.y = t * 0.42;
      inner.rotation.x = -t * 0.22;
      inner.rotation.y = t * 0.35;
      renderer.render(scene, cam);
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }

  /* ----- Home corner image: drag + click zoom ----- */
  var heroFigure = document.querySelector(".corner-memento--hero");
  if (heroFigure) {
    var pointerId = null;
    var startX = 0;
    var startY = 0;
    var startLeft = 0;
    var startTop = 0;
    var moved = false;
    var movedThreshold = 6;
    var zoomTimer = null;

    function getNumericPx(v) {
      var n = parseFloat(String(v || "").replace("px", ""));
      return Number.isFinite(n) ? n : 0;
    }

    function clampPosition(x, y) {
      var rect = heroFigure.getBoundingClientRect();
      var maxX = window.innerWidth - rect.width;
      var maxY = window.innerHeight - rect.height;
      return {
        x: Math.min(Math.max(0, x), Math.max(0, maxX)),
        y: Math.min(Math.max(0, y), Math.max(0, maxY)),
      };
    }

    function ensureFixedPositioning() {
      var rect = heroFigure.getBoundingClientRect();
      heroFigure.style.position = "fixed";
      heroFigure.style.left = rect.left + "px";
      heroFigure.style.top = rect.top + "px";
      heroFigure.style.bottom = "auto";
      heroFigure.style.right = "auto";
    }

    function setZoomed(on) {
      heroFigure.classList.toggle("is-zoomed", !!on);
      if (!on) return;
      window.clearTimeout(zoomTimer);
      zoomTimer = window.setTimeout(function () {
        heroFigure.classList.remove("is-zoomed");
      }, 2000);
    }

    function onPointerDown(e) {
      if (pointerId !== null) return;
      pointerId = e.pointerId;
      moved = false;
      ensureFixedPositioning();
      startX = e.clientX;
      startY = e.clientY;
      startLeft = getNumericPx(heroFigure.style.left);
      startTop = getNumericPx(heroFigure.style.top);
      heroFigure.classList.add("is-dragging");
      heroFigure.setPointerCapture(pointerId);
    }

    function onPointerMove(e) {
      if (pointerId === null || e.pointerId !== pointerId) return;
      var dx = e.clientX - startX;
      var dy = e.clientY - startY;
      if (Math.abs(dx) > movedThreshold || Math.abs(dy) > movedThreshold) moved = true;
      var p = clampPosition(startLeft + dx, startTop + dy);
      heroFigure.style.left = p.x + "px";
      heroFigure.style.top = p.y + "px";
    }

    function onPointerUp(e) {
      if (pointerId === null || e.pointerId !== pointerId) return;
      heroFigure.releasePointerCapture(pointerId);
      pointerId = null;
      heroFigure.classList.remove("is-dragging");
      if (!moved) setZoomed(true);
    }

    heroFigure.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
  }
})();
