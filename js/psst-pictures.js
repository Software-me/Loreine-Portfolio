(function () {
  "use strict";

  var BASE = "assets/psst/";
  var MANIFEST = BASE + "media.json";

  var carouselWrap = document.getElementById("gallery-carousel-wrap");
  var carouselImage = document.getElementById("carousel-image");
  var carouselCaption = document.getElementById("carousel-caption");
  var carouselCount = document.getElementById("carousel-count");
  var prevBtn = document.getElementById("carousel-prev");
  var nextBtn = document.getElementById("carousel-next");
  var emptyEl = document.getElementById("gallery-empty");
  var errorEl = document.getElementById("gallery-error");
  var imageItems = [];
  var currentIndex = 0;

  if (!carouselWrap || !carouselImage) return;

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
      "You opened this page as a file (file://). Use a local server: open PowerShell, run cd C:\\Loreine-Portfolio, then python -m http.server 8080 and open http://localhost:8080/psst-pictures.html"
    );
    showEmptyInstructions();
    return;
  }

  function getMediaFromGlobal() {
    if (!window.PSST_MEDIA || typeof window.PSST_MEDIA !== "object") return null;
    return {
      images: Array.isArray(window.PSST_MEDIA.images) ? window.PSST_MEDIA.images : [],
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
  }

  function setCurrentImage(index) {
    if (imageItems.length === 0) return;
    var next = index;
    if (next < 0) next = imageItems.length - 1;
    if (next >= imageItems.length) next = 0;
    currentIndex = next;
    renderCurrentImage();
  }

  function renderMedia(data) {
    var images = Array.isArray(data.images) ? data.images : [];
    if (images.length === 0) {
      showEmptyInstructions();
      return;
    }

    if (emptyEl) emptyEl.hidden = true;
    carouselWrap.hidden = false;
    carouselImage.loading = "lazy";
    carouselImage.decoding = "async";

    images.forEach(function (item, index) {
      var file = typeof item === "string" ? item : item.file;
      if (!file) return;
      var caption = typeof item === "object" && item.caption ? item.caption : "";
      var src = BASE + "images/" + file;
      var imageItem = { src: src, caption: caption, index: index };
      imageItems.push(imageItem);
    });
    if (imageItems.length === 0) {
      showEmptyInstructions();
      return;
    }

    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            renderCurrentImage();
            io.disconnect();
          });
        },
        { root: null, rootMargin: "200px 0px", threshold: 0.01 }
      );
      io.observe(carouselWrap);
    } else {
      renderCurrentImage();
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

  document.addEventListener("keydown", function (e) {
    if (imageItems.length === 0) return;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      setCurrentImage(currentIndex - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
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
