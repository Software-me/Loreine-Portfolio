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

  function getVideoDetails(file) {
    var details = window.PSST_VIDEO_DETAILS;
    if (!details || typeof details !== "object") return {};
    var match = details[file];
    if (!match || typeof match !== "object") return {};
    return match;
  }

  function getVideoTitle(item, file) {
    if (item && typeof item === "object" && typeof item.title === "string") {
      return item.title.trim();
    }
    var details = getVideoDetails(file);
    if (typeof details.title === "string") return details.title.trim();
    return "";
  }

  function getVideoDescription(item, file) {
    if (item && typeof item === "object" && typeof item.description === "string") {
      return item.description.trim();
    }
    var details = getVideoDetails(file);
    if (typeof details.description === "string") return details.description.trim();
    return "";
  }

  function renderMedia(data) {
    var videos = Array.isArray(data.videos) ? data.videos : [];
    if (videos.length === 0) {
      showEmptyInstructions();
      return;
    }

    if (emptyEl) emptyEl.hidden = true;
    videosWrap.hidden = false;
    var deferredVideos = [];

    videos.forEach(function (item) {
      var file = typeof item === "string" ? item : item.file;
      if (!file) return;
      var title = getVideoTitle(item, file);
      var caption = typeof item === "object" && item.caption ? item.caption : "";
      var description = getVideoDescription(item, file);

      var wrap = document.createElement("div");
      wrap.className = "gallery-video glass";

      var titleEl = document.createElement("h4");
      titleEl.className = "gallery-video__title";
      titleEl.textContent = title;
      titleEl.hidden = title === "";
      wrap.appendChild(titleEl);

      var video = document.createElement("video");
      video.className = "gallery-video__el";
      video.controls = true;
      video.playsInline = true;
      video.preload = "none";
      video.dataset.src = BASE + "videos/" + file;

      wrap.appendChild(video);
      if (caption) {
        var cap = document.createElement("p");
        cap.className = "gallery-video__caption";
        cap.textContent = caption;
        wrap.appendChild(cap);
      }
      if (description) {
        var blocks = description.split(/\n\s*\n/);
        blocks.forEach(function (block) {
          var text = block.trim();
          if (!text) return;
          var desc = document.createElement("p");
          desc.className = "gallery-video__description";
          desc.textContent = text;
          wrap.appendChild(desc);
        });
      }
      videosEl.appendChild(wrap);
      deferredVideos.push(video);
    });

    function activateVideo(videoEl) {
      if (!videoEl || !videoEl.dataset || !videoEl.dataset.src) return;
      if (videoEl.getAttribute("src")) return;
      videoEl.src = videoEl.dataset.src;
      videoEl.load();
    }

    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            activateVideo(entry.target);
            io.unobserve(entry.target);
          });
        },
        { root: null, rootMargin: "250px 0px", threshold: 0.01 }
      );
      deferredVideos.forEach(function (videoEl) {
        io.observe(videoEl);
      });
    } else {
      deferredVideos.forEach(function (videoEl) {
        activateVideo(videoEl);
      });
    }
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
