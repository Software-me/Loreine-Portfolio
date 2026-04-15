(function () {
  "use strict";

  var BASE = "assets/psst/";
  var MANIFEST = BASE + "media.json";

  var carouselWrap = document.getElementById("gallery-carousel-wrap");
  var carouselImage = document.getElementById("carousel-image");
  var carouselCaption = document.getElementById("carousel-caption");
  var carouselCount = document.getElementById("carousel-count");
  var carouselThumbs = document.getElementById("carousel-thumbs");
  var prevBtn = document.getElementById("carousel-prev");
  var nextBtn = document.getElementById("carousel-next");
  var lightbox = document.getElementById("lightbox");
  var lightboxImage = document.getElementById("lightbox-image");
  var lightboxClose = document.getElementById("lightbox-close");
  var videosEl = document.getElementById("gallery-videos");
  var videosWrap = document.getElementById("gallery-videos-wrap");
  var emptyEl = document.getElementById("gallery-empty");
  var errorEl = document.getElementById("gallery-error");
  var imageItems = [];
  var currentIndex = 0;

  if (!carouselWrap || !carouselImage || !carouselThumbs || !videosEl) return;

  function forceVisible(el) {
    if (el) el.classList.add("is-visible");
  }

  function showError(msg) {
    if (!errorEl) return;
    errorEl.hidden = false;
    errorEl.textContent = msg;
  }

  function showEmptyInstructions() {
    if (!emptyEl) return;
    emptyEl.hidden = false;
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

  function buildAlt(item) {
    if (item.caption) return item.caption;
    return "PSST photo " + String(item.index + 1);
  }

  function renderCurrentImage() {
    if (imageItems.length === 0) return;

    var item = imageItems[currentIndex];
    carouselImage.src = item.src;
    carouselImage.alt = buildAlt(item);
    carouselCaption.textContent = item.caption || "";
    carouselCaption.hidden = item.caption === "";
    carouselCount.textContent = "Image " + String(currentIndex + 1) + " of " + String(imageItems.length);

    Array.prototype.forEach.call(carouselThumbs.querySelectorAll(".carousel-thumb"), function (btn, idx) {
      var isActive = idx === currentIndex;
      btn.classList.toggle("is-active", isActive);
      btn.setAttribute("aria-selected", isActive ? "true" : "false");
      btn.tabIndex = isActive ? 0 : -1;
    });
  }

  function setCurrentImage(index) {
    if (imageItems.length === 0) return;
    var next = index;
    if (next < 0) next = imageItems.length - 1;
    if (next >= imageItems.length) next = 0;
    currentIndex = next;
    renderCurrentImage();
  }

  function openLightbox() {
    if (!lightbox || !lightboxImage || imageItems.length === 0) return;
    var current = imageItems[currentIndex];
    lightboxImage.src = current.src;
    lightboxImage.alt = buildAlt(current);
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    if (!lightbox || !lightboxImage) return;
    lightbox.hidden = true;
    lightboxImage.src = "";
    lightboxImage.alt = "";
    document.body.style.overflow = "";
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
      carouselWrap.hidden = false;
      images.forEach(function (item, index) {
        var file = typeof item === "string" ? item : item.file;
        if (!file) return;
        var caption = typeof item === "object" && item.caption ? item.caption : "";
        var src = BASE + "images/" + file;
        var imageItem = { src: src, caption: caption, index: index };
        imageItems.push(imageItem);

        var thumbBtn = document.createElement("button");
        thumbBtn.type = "button";
        thumbBtn.className = "carousel-thumb";
        thumbBtn.setAttribute("role", "tab");
        thumbBtn.setAttribute("aria-label", "Show image " + String(index + 1));
        thumbBtn.setAttribute("aria-selected", "false");
        thumbBtn.tabIndex = -1;
        thumbBtn.addEventListener("click", function () {
          setCurrentImage(index);
        });

        var thumbImg = document.createElement("img");
        thumbImg.className = "carousel-thumb__img";
        thumbImg.src = src;
        thumbImg.alt = buildAlt(imageItem);
        thumbImg.loading = "lazy";

        thumbBtn.appendChild(thumbImg);
        carouselThumbs.appendChild(thumbBtn);
      });
      renderCurrentImage();
    }

    if (videos.length > 0) {
      videosWrap.hidden = false;
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

  if (prevBtn) {
    prevBtn.addEventListener("click", function () {
      setCurrentImage(currentIndex - 1);
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener("click", function () {
      setCurrentImage(currentIndex + 1);
    });
  }
  if (carouselImage) {
    carouselImage.addEventListener("click", openLightbox);
    carouselImage.tabIndex = 0;
    carouselImage.setAttribute("role", "button");
    carouselImage.setAttribute("aria-label", "Enlarge image");
    carouselImage.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openLightbox();
      }
    });
  }
  if (lightboxClose) {
    lightboxClose.addEventListener("click", closeLightbox);
  }
  if (lightbox) {
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && lightbox && !lightbox.hidden) {
      closeLightbox();
      return;
    }
    if (imageItems.length === 0) return;
    if (e.key === "ArrowLeft") {
      setCurrentImage(currentIndex - 1);
    } else if (e.key === "ArrowRight") {
      setCurrentImage(currentIndex + 1);
    }
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
