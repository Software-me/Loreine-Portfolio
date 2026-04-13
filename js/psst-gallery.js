(function () {
  "use strict";

  var BASE = "assets/psst/";
  var MANIFEST = BASE + "media.json";

  var photosEl = document.getElementById("gallery-photos");
  var videosEl = document.getElementById("gallery-videos");
  var photosWrap = document.getElementById("gallery-photos-wrap");
  var videosWrap = document.getElementById("gallery-videos-wrap");
  var emptyEl = document.getElementById("gallery-empty");
  var errorEl = document.getElementById("gallery-error");
  var lightbox = document.getElementById("lightbox");
  var lightboxImg = lightbox ? lightbox.querySelector(".lightbox__img") : null;
  var closeBtn = lightbox ? lightbox.querySelector(".lightbox__close") : null;

  if (!photosEl || !videosEl) return;

  function forceVisible(el) {
    if (el) el.classList.add("is-visible");
  }

  function showError(msg) {
    if (!errorEl) return;
    errorEl.hidden = false;
    errorEl.textContent = msg;
    forceVisible(errorEl);
  }

  function showEmptyInstructions() {
    if (!emptyEl) return;
    emptyEl.hidden = false;
    forceVisible(emptyEl);
  }

  if (window.location.protocol === "file:") {
    showError(
      "You opened this page as a file (file://). Use a local server: open PowerShell, run cd C:\\Loreine-Portfolio, then python -m http.server 8080 and open http://localhost:8080/psst-heritage.html"
    );
    showEmptyInstructions();
    return;
  }

  function getMediaFromGlobal() {
    if (!window.PSST_MEDIA || typeof window.PSST_MEDIA !== "object") return null;
    return {
      images: Array.isArray(window.PSST_MEDIA.images) ? window.PSST_MEDIA.images : [],
      videos: Array.isArray(window.PSST_MEDIA.videos) ? window.PSST_MEDIA.videos : [],
    };
  }

  function renderMedia(data) {
    var images = Array.isArray(data.images) ? data.images : [];
    var videos = Array.isArray(data.videos) ? data.videos : [];

    if (images.length === 0 && videos.length === 0) {
      showEmptyInstructions();
      return;
    }

    if (emptyEl) emptyEl.hidden = true;

    if (images.length > 0) {
      photosWrap.hidden = false;
      forceVisible(photosWrap);
      images.forEach(function (item) {
        var file = typeof item === "string" ? item : item.file;
        if (!file) return;
        var caption = typeof item === "object" && item.caption ? item.caption : "";
        var src = BASE + "images/" + file;
        var alt = caption || "PSST photo";

        var figure = document.createElement("figure");
        figure.className = "gallery-card glass";

        var img = document.createElement("img");
        img.className = "gallery-card__img";
        img.src = src;
        img.alt = alt;
        img.loading = "lazy";
        img.addEventListener("click", function () {
          openLightbox(src, alt);
        });
        img.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openLightbox(src, alt);
          }
        });
        img.tabIndex = 0;
        img.setAttribute("role", "button");

        figure.appendChild(img);
        if (caption) {
          var figc = document.createElement("figcaption");
          figc.className = "gallery-card__caption";
          figc.textContent = caption;
          figure.appendChild(figc);
        }
        photosEl.appendChild(figure);
      });
    }

    if (videos.length > 0) {
      videosWrap.hidden = false;
      forceVisible(videosWrap);
      videos.forEach(function (item) {
        var file = typeof item === "string" ? item : item.file;
        if (!file) return;
        var caption = typeof item === "object" && item.caption ? item.caption : "";

        var wrap = document.createElement("div");
        wrap.className = "gallery-video glass";

        var video = document.createElement("video");
        video.className = "gallery-video__el";
        video.controls = true;
        video.playsInline = true;
        video.preload = "metadata";
        video.src = BASE + "videos/" + file;

        wrap.appendChild(video);
        if (caption) {
          var cap = document.createElement("p");
          cap.className = "gallery-video__caption";
          cap.textContent = caption;
          wrap.appendChild(cap);
        }
        videosEl.appendChild(wrap);
      });
    }
  }

  function openLightbox(src, alt) {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = src;
    lightboxImg.alt = alt || "";
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    if (!lightbox || !lightboxImg) return;
    lightbox.hidden = true;
    lightboxImg.src = "";
    lightboxImg.alt = "";
    document.body.style.overflow = "";
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", closeLightbox);
  }
  if (lightbox) {
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && lightbox && !lightbox.hidden) closeLightbox();
  });

  var globalMedia = getMediaFromGlobal();
  if (globalMedia) {
    renderMedia(globalMedia);
    return;
  }

  fetch(MANIFEST)
    .then(function (r) {
      if (!r.ok) throw new Error("Could not load media list.");
      return r.json();
    })
    .then(renderMedia)
    .catch(function () {
      showError(
        "Could not load assets/psst/media.js or assets/psst/media.json. Re-run scripts/generate-psst-media-json.ps1, then open via local server."
      );
      showEmptyInstructions();
    });
})();
