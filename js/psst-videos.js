(function () {
  "use strict";

  var BASE = "assets/psst/";
  var MANIFEST = BASE + "media.json";
  var YEAR_LABEL = "2026";
  /** Same base name as the video file, e.g. DSC_0685.MOV → assets/psst/images/DSC_0685.jpg */
  var THUMB_SUBDIR = "images/";
  var THUMB_EXTS = [".jpg", ".JPG", ".jpeg", ".JPEG", ".png", ".PNG", ".webp"];

  var rootEl = document.getElementById("psst-movie-root");
  var videosWrap = document.getElementById("gallery-videos-wrap");
  var emptyEl = document.getElementById("gallery-empty");
  var errorEl = document.getElementById("gallery-error");

  var bannerGradients = [
    "linear-gradient(135deg, rgba(40, 24, 80, 0.85) 0%, rgba(12, 10, 24, 0.92) 50%, rgba(20, 40, 70, 0.88) 100%)",
    "linear-gradient(135deg, rgba(24, 50, 70, 0.85) 0%, rgba(12, 18, 32, 0.92) 45%, rgba(60, 30, 80, 0.85) 100%)",
    "linear-gradient(135deg, rgba(70, 30, 50, 0.85) 0%, rgba(18, 12, 28, 0.92) 50%, rgba(30, 55, 75, 0.88) 100%)",
    "linear-gradient(135deg, rgba(30, 60, 55, 0.85) 0%, rgba(10, 14, 28, 0.92) 48%, rgba(90, 50, 30, 0.82) 100%)",
    "linear-gradient(135deg, rgba(50, 35, 90, 0.88) 0%, rgba(8, 10, 22, 0.94) 50%, rgba(25, 45, 65, 0.88) 100%)",
  ];

  if (!rootEl || !videosWrap) return;

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

  function getYoutubeEntries() {
    var list = window.PSST_YOUTUBE_ENTRIES;
    if (!Array.isArray(list)) return [];
    return list.filter(function (entry) {
      return entry && typeof entry === "object" && typeof entry.youtubeUrl === "string" && entry.youtubeUrl.trim();
    });
  }

  function isYoutubeEntry(entry) {
    return entry && entry.type === "youtube";
  }

  function buildItems(data) {
    var items = [];
    var videos = Array.isArray(data.videos) ? data.videos : [];
    videos.forEach(function (item) {
      var file = typeof item === "string" ? item : item.file;
      if (!file) return;
      items.push({ type: "local", raw: item, file: file });
    });
    getYoutubeEntries().forEach(function (config) {
      items.push({
        type: "youtube",
        config: config,
        file: typeof config.id === "string" && config.id.trim() ? config.id.trim() : "youtube",
      });
    });
    return items;
  }

  function getVideoDetails(file) {
    var details = window.PSST_VIDEO_DETAILS;
    if (!details || typeof details !== "object") return {};
    var match = details[file];
    if (!match || typeof match !== "object") return {};
    return match;
  }

  function getYoutubeConfig(entry) {
    if (!isYoutubeEntry(entry)) return null;
    return entry.config || null;
  }

  function getTrailerFile(entry) {
    var yt = getYoutubeConfig(entry);
    if (!yt || typeof yt.trailerFile !== "string") return "";
    return yt.trailerFile.trim();
  }

  function getPlaybackFile(entry) {
    if (!entry) return "";
    if (isYoutubeEntry(entry)) return getTrailerFile(entry);
    return entry.file || "";
  }

  function appendWatchVideoButton(content) {
    var btnRow = document.createElement("div");
    btnRow.className = "psst-movie-buttons";
    var watchBtn = document.createElement("a");
    watchBtn.href = "#";
    watchBtn.className = "psst-btn psst-btn--primary";
    watchBtn.dataset.action = "watch-video";
    watchBtn.innerHTML = '<i class="fa fa-play" aria-hidden="true"></i> Watch video';
    btnRow.appendChild(watchBtn);
    content.appendChild(btnRow);
  }

  function getVideoTitle(item, file, entry) {
    var yt = getYoutubeConfig(entry);
    if (yt && typeof yt.title === "string") return yt.title.trim();
    if (item && typeof item === "object" && typeof item.title === "string") {
      return item.title.trim();
    }
    var details = getVideoDetails(file);
    if (typeof details.title === "string") return details.title.trim();
    return "";
  }

  function getVideoDescription(item, file, entry) {
    var yt = getYoutubeConfig(entry);
    if (yt && typeof yt.description === "string") return yt.description.trim();
    if (item && typeof item === "object" && typeof item.description === "string") {
      return item.description.trim();
    }
    var details = getVideoDetails(file);
    if (typeof details.description === "string") return details.description.trim();
    return "";
  }

  function getTopic(item, file, entry) {
    var yt = getYoutubeConfig(entry);
    if (yt && typeof yt.topic === "string" && yt.topic.trim()) return yt.topic.trim();
    var details = getVideoDetails(file);
    if (typeof details.topic === "string" && details.topic.trim()) return details.topic.trim();
    var title = getVideoTitle(item, file, entry);
    if (title) return title;
    if (item && typeof item === "object" && typeof item.topic === "string" && item.topic.trim()) return item.topic.trim();
    return "PSST event";
  }

  function getThumbUrl(item, file, entry) {
    var yt = getYoutubeConfig(entry);
    if (yt && typeof yt.thumb === "string" && yt.thumb.trim()) return yt.thumb.trim();
    if (item && typeof item === "object" && typeof item.thumb === "string" && item.thumb.trim()) {
      return item.thumb.trim();
    }
    var details = getVideoDetails(file);
    if (typeof details.thumb === "string" && details.thumb.trim()) return details.thumb.trim();
    return "";
  }

  function fileStem(videoFile) {
    var base = String(videoFile).replace(/\\/g, "/").split("/").pop() || "";
    return base.replace(/\.[^/.]+$/, "");
  }

  function urlsForStemThumbs(videoFile) {
    var stem = fileStem(videoFile);
    if (!stem) return [];
    var enc = encodeURIComponent(stem);
    return THUMB_EXTS.map(function (ext) {
      return BASE + THUMB_SUBDIR + enc + ext;
    });
  }

  /** Explicit thumb first (if set), then same-name images under assets/psst/images/ */
  function getThumbCandidateUrls(item, file, entry) {
    if (isYoutubeEntry(entry)) {
      var list = [];
      var explicit = (getThumbUrl(item, file, entry) || "").trim();
      if (explicit) {
        list.push(explicit);
        var stem = fileStem(explicit);
        if (stem) {
          var encStem = encodeURIComponent(stem);
          THUMB_EXTS.forEach(function (ext) {
            var u = BASE + THUMB_SUBDIR + encStem + ext;
            if (list.indexOf(u) === -1) list.push(u);
          });
        }
      }
      var idStem = entry.file;
      if (idStem) {
        var encId = encodeURIComponent(idStem);
        THUMB_EXTS.forEach(function (ext) {
          var u = BASE + THUMB_SUBDIR + encId + ext;
          if (list.indexOf(u) === -1) list.push(u);
        });
      }
      return list;
    }

    var explicitLocal = (getThumbUrl(item, file, entry) || "").trim();
    var stemUrls = urlsForStemThumbs(file);
    if (explicitLocal) {
      var localList = [explicitLocal];
      stemUrls.forEach(function (u) {
        if (u !== explicitLocal) localList.push(u);
      });
      return localList;
    }
    return stemUrls;
  }

  function mountPreviewImage(container, candidates, displayTitle) {
    var fallback = document.createElement("div");
    fallback.className = "psst-carousel-fallback";
    fallback.textContent = displayTitle;

    if (candidates.length === 0) {
      container.appendChild(fallback);
      return;
    }

    var img = document.createElement("img");
    img.alt = displayTitle;
    img.loading = "lazy";
    var idx = 0;

    function showFallback() {
      container.innerHTML = "";
      container.appendChild(fallback);
    }

    function tryNext() {
      if (idx >= candidates.length) {
        showFallback();
        return;
      }
      var url = candidates[idx];
      idx += 1;
      img.onerror = function () {
        tryNext();
      };
      img.onload = function () {
        img.onerror = null;
      };
      img.src = url;
    }

    container.appendChild(img);
    tryNext();
  }

  function mountCarouselThumb(carouselItem, item, file, displayTitle, entry) {
    mountPreviewImage(carouselItem, getThumbCandidateUrls(item, file, entry), displayTitle);
  }

  function mountYoutubeCarouselItem(carouselItem, entry, displayTitle) {
    var config = entry.config;
    carouselItem.classList.add("carousel-item--youtube");

    var stack = document.createElement("div");
    stack.className = "psst-carousel-youtube-stack";

    var preview = document.createElement("div");
    preview.className = "psst-carousel-preview";
    mountPreviewImage(preview, getThumbCandidateUrls(null, entry.file, entry), displayTitle);

    var watchBtn = document.createElement("a");
    watchBtn.href = config.youtubeUrl.trim();
    watchBtn.target = "_blank";
    watchBtn.rel = "noopener noreferrer";
    watchBtn.className = "psst-btn psst-btn--primary psst-carousel-youtube-btn";
    var label =
      typeof config.buttonLabel === "string" && config.buttonLabel.trim()
        ? config.buttonLabel.trim()
        : "Watch on YouTube";
    watchBtn.innerHTML = '<i class="fa fa-youtube-play" aria-hidden="true"></i> ' + label;
    watchBtn.setAttribute("aria-label", label + " (opens in a new tab)");
    watchBtn.addEventListener("click", function (e) {
      e.stopPropagation();
    });

    stack.appendChild(preview);
    stack.appendChild(watchBtn);
    carouselItem.appendChild(stack);
  }

  function formatDuration(seconds) {
    if (!isFinite(seconds) || seconds < 0) return "—";
    var s = Math.floor(seconds % 60);
    var m = Math.floor((seconds / 60) % 60);
    var h = Math.floor(seconds / 3600);
    if (h > 0) return h + "h " + m + "m";
    if (m > 0) return m + "m " + s + "s";
    return s + "s";
  }

  function appendDescription(descWrap, description, entry) {
    if (description) {
      var blocks = description.split(/\n\s*\n/);
      blocks.forEach(function (block) {
        var text = block.trim();
        if (!text) return;
        var p = document.createElement("p");
        p.textContent = text;
        descWrap.appendChild(p);
      });
      return;
    }
    if (isYoutubeEntry(entry)) return;
    var pEmpty = document.createElement("p");
    pEmpty.textContent = "Filipino Cultural Club (PSST) — community highlights.";
    descWrap.appendChild(pEmpty);
  }

  function renderMedia(data) {
    var items = buildItems(data);
    if (items.length === 0) {
      showEmptyInstructions();
      return;
    }

    if (emptyEl) emptyEl.hidden = true;
    videosWrap.hidden = false;

    var banner = document.createElement("div");
    banner.className = "psst-movie-banner";
    banner.style.background = bannerGradients[0];
    banner.style.backgroundSize = "cover";
    banner.style.backgroundPosition = "center";

    var leftCol = document.createElement("div");
    leftCol.className = "psst-movie-column";

    items.forEach(function (entry, index) {
      var file = entry.file;
      var item = entry.raw;
      var title = getVideoTitle(item, file, entry);
      var displayTitle = title || file.replace(/\.[^/.]+$/, "");
      var description = getVideoDescription(item, file, entry);
      var topic = getTopic(item, file, entry);
      var youtube = isYoutubeEntry(entry);

      var content = document.createElement("div");
      content.className = "psst-movie-content" + (index === 0 ? " active" : "");
      content.dataset.file = file;
      content.dataset.index = String(index);
      if (youtube) content.dataset.source = "youtube";

      var titleEl = document.createElement("h2");
      titleEl.className = "psst-movie-title";
      titleEl.textContent = displayTitle;

      var meta = document.createElement("h4");
      meta.className = "psst-movie-meta";
      var y = document.createElement("span");
      y.textContent = YEAR_LABEL;
      var dur = document.createElement("span");
      dur.className = "psst-meta-duration";
      dur.textContent = "—";
      var top = document.createElement("span");
      top.className = "psst-meta-topic";
      top.textContent = topic;
      meta.appendChild(y);
      meta.appendChild(dur);
      meta.appendChild(top);

      var descWrap = document.createElement("div");
      descWrap.className = "psst-movie-desc";
      appendDescription(descWrap, description, entry);

      content.appendChild(titleEl);
      content.appendChild(meta);

      if (youtube) {
        appendWatchVideoButton(content);
        content.appendChild(descWrap);
      } else {
        content.appendChild(descWrap);
        appendWatchVideoButton(content);
      }

      leftCol.appendChild(content);
    });

    banner.appendChild(leftCol);

    var carouselBox = document.createElement("div");
    carouselBox.className = "psst-carousel-box";

    var carousel = document.createElement("div");
    carousel.className = "carousel psst-carousel";

    items.forEach(function (entry, index) {
      var file = entry.file;
      var item = entry.raw;
      var title = getVideoTitle(item, file, entry);
      var displayTitle = title || file.replace(/\.[^/.]+$/, "");

      var ci = document.createElement("div");
      ci.className = "carousel-item";
      ci.dataset.index = String(index);
      ci.setAttribute("role", "button");
      ci.setAttribute("tabindex", "0");
      ci.setAttribute("aria-label", "Select video: " + displayTitle);

      if (isYoutubeEntry(entry)) {
        mountYoutubeCarouselItem(ci, entry, displayTitle);
      } else {
        mountCarouselThumb(ci, item, file, displayTitle, entry);
      }

      carousel.appendChild(ci);
    });

    carouselBox.appendChild(carousel);
    banner.appendChild(carouselBox);

    var trailer = document.createElement("div");
    trailer.className = "psst-trailer";
    trailer.setAttribute("aria-hidden", "true");

    var modalVideo = document.createElement("video");
    modalVideo.id = "psst-modal-video";
    modalVideo.className = "psst-trailer__video";
    modalVideo.controls = true;
    modalVideo.playsInline = true;
    modalVideo.preload = "none";

    var closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "psst-trailer__close";
    closeBtn.setAttribute("aria-label", "Close video");
    closeBtn.innerHTML = "&times;";

    trailer.appendChild(modalVideo);
    trailer.appendChild(closeBtn);

    rootEl.appendChild(banner);
    rootEl.appendChild(trailer);

    var currentIndex = 0;

    function gradientAt(i) {
      return bannerGradients[i % bannerGradients.length];
    }

    function setActiveIndex(index) {
      if (index < 0 || index >= items.length) return;
      currentIndex = index;
      banner.style.background = gradientAt(index);

      var contents = banner.querySelectorAll(".psst-movie-content");
      contents.forEach(function (el, i) {
        el.classList.toggle("active", i === index);
      });
    }

    function updateDurationForIndex(index, seconds) {
      var content = banner.querySelector('.psst-movie-content[data-index="' + index + '"]');
      if (!content) return;
      var durEl = content.querySelector(".psst-meta-duration");
      if (durEl) durEl.textContent = formatDuration(seconds);
    }

    function openModalWithCurrentVideo() {
      var entry = items[currentIndex];
      if (!entry) return;
      var file = getPlaybackFile(entry);
      if (!file) return;
      var url = BASE + "videos/" + file;

      modalVideo.pause();
      modalVideo.removeAttribute("src");
      modalVideo.load();

      modalVideo.src = url;
      modalVideo.load();

      trailer.classList.add("active");
      trailer.setAttribute("aria-hidden", "false");

      function onMeta() {
        modalVideo.removeEventListener("loadedmetadata", onMeta);
        updateDurationForIndex(currentIndex, modalVideo.duration);
      }
      modalVideo.addEventListener("loadedmetadata", onMeta);

      modalVideo.play().catch(function () {});
    }

    function closeModal() {
      modalVideo.pause();
      modalVideo.removeAttribute("src");
      modalVideo.load();
      trailer.classList.remove("active");
      trailer.setAttribute("aria-hidden", "true");
    }

    closeBtn.addEventListener("click", closeModal);
    trailer.addEventListener("click", function (e) {
      if (e.target === trailer) closeModal();
    });

    rootEl.addEventListener("click", function (e) {
      var a = e.target.closest("a[data-action='watch-video']");
      if (!a || !rootEl.contains(a)) return;
      e.preventDefault();
      openModalWithCurrentVideo();
    });

    carousel.addEventListener("click", function (e) {
      if (e.target.closest(".psst-carousel-youtube-btn")) return;
      var item = e.target.closest(".carousel-item");
      if (!item || !carousel.contains(item)) return;
      var idx = parseInt(item.dataset.index, 10);
      if (!isNaN(idx)) setActiveIndex(idx);
    });

    carousel.addEventListener("keydown", function (e) {
      if (e.key !== "Enter" && e.key !== " ") return;
      var item = e.target.closest(".carousel-item");
      if (!item || !carousel.contains(item)) return;
      if (e.target.closest(".psst-carousel-youtube-btn")) return;
      e.preventDefault();
      var idx = parseInt(item.dataset.index, 10);
      if (!isNaN(idx)) setActiveIndex(idx);
    });

    function initCarousel() {
      if (!window.jQuery || !window.jQuery.fn || !window.jQuery.fn.carousel) return;
      try {
        window.jQuery(carousel).carousel();
      } catch (err) {}
    }

    requestAnimationFrame(initCarousel);

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && trailer.classList.contains("active")) closeModal();
    });

    setActiveIndex(0);
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
