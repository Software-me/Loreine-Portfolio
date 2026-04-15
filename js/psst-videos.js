(function () {
  "use strict";

  var BASE = "assets/psst/";
  var MANIFEST = BASE + "media.json";

  var videosEl = document.getElementById("gallery-videos");
  var videosWrap = document.getElementById("gallery-videos-wrap");
  var emptyEl = document.getElementById("gallery-empty");
  var errorEl = document.getElementById("gallery-error");

  if (!videosEl || !videosWrap) return;

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
      "You opened this page as a file (file://). Use a local server: open PowerShell, run cd C:\\Loreine-Portfolio, then python -m http.server 8080 and open http://localhost:8080/psst-videos.html"
    );
    showEmptyInstructions();
    return;
  }

  function getMediaFromGlobal() {
    if (!window.PSST_MEDIA || typeof window.PSST_MEDIA !== "object") return null;
    return {
      videos: Array.isArray(window.PSST_MEDIA.videos) ? window.PSST_MEDIA.videos : [],
    };
  }

  function renderMedia(data) {
    var videos = Array.isArray(data.videos) ? data.videos : [];
    if (videos.length === 0) {
      showEmptyInstructions();
      return;
    }

    if (emptyEl) emptyEl.hidden = true;
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
