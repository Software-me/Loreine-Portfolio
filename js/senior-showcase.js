(function () {
  "use strict";

  var BASE = "assets/senior-showcase/";
  var media = window.SENIOR_SHOWCASE_MEDIA || {};
  var photos = Array.isArray(media.photos) ? media.photos : [];
  var videos = Array.isArray(media.videos) ? media.videos : [];
  var youtube = Array.isArray(media.youtube) ? media.youtube : [];

  var photosGrid = document.getElementById("showcase-photos-grid");
  var videosGrid = document.getElementById("showcase-videos-grid");
  var youtubeGrid = document.getElementById("showcase-youtube-grid");

  function textOrEmpty(value) {
    return typeof value === "string" ? value.trim() : "";
  }

  function appendTitleAndDescription(parent, item) {
    var title = textOrEmpty(item.title);
    var description = textOrEmpty(item.description);

    if (title) {
      var heading = document.createElement("h4");
      heading.className = "gallery-video__title";
      heading.textContent = title;
      parent.appendChild(heading);
    }

    if (description) {
      var desc = document.createElement("p");
      desc.className = "gallery-video__description";
      desc.textContent = description;
      parent.appendChild(desc);
    }
  }

  function renderPhotos() {
    if (!photosGrid) return;
    photosGrid.innerHTML = "";
    photos.forEach(function (item) {
      if (!item || !item.file) return;
      var card = document.createElement("figure");
      card.className = "gallery-card glass";

      var img = document.createElement("img");
      img.className = "gallery-card__img";
      img.src = BASE + "images/" + item.file;
      img.alt = textOrEmpty(item.title) || "Senior showcase photo";
      img.loading = "lazy";
      img.decoding = "async";
      card.appendChild(img);

      var captionText = textOrEmpty(item.description) || textOrEmpty(item.title);
      if (captionText) {
        var caption = document.createElement("figcaption");
        caption.className = "gallery-card__caption";
        caption.textContent = captionText;
        card.appendChild(caption);
      }

      photosGrid.appendChild(card);
    });
  }

  function renderVideos() {
    if (!videosGrid) return;
    videosGrid.innerHTML = "";
    videos.forEach(function (item) {
      if (!item || !item.file) return;
      var card = document.createElement("article");
      card.className = "gallery-video glass";

      appendTitleAndDescription(card, item);

      var video = document.createElement("video");
      video.className = "gallery-video__el";
      video.controls = true;
      video.preload = "metadata";
      video.src = BASE + "videos/" + item.file;
      card.appendChild(video);

      videosGrid.appendChild(card);
    });
  }

  function renderYoutube() {
    if (!youtubeGrid) return;
    youtubeGrid.innerHTML = "";
    youtube.forEach(function (item) {
      if (!item || !item.embedUrl) return;
      var card = document.createElement("article");
      card.className = "gallery-video glass";

      appendTitleAndDescription(card, item);

      var frameWrap = document.createElement("div");
      frameWrap.style.position = "relative";
      frameWrap.style.width = "100%";
      frameWrap.style.aspectRatio = "16 / 9";
      frameWrap.style.background = "#000";

      var iframe = document.createElement("iframe");
      iframe.src = item.embedUrl;
      iframe.title = textOrEmpty(item.title) || "YouTube video";
      iframe.loading = "lazy";
      iframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      iframe.allowFullscreen = true;
      iframe.style.position = "absolute";
      iframe.style.inset = "0";
      iframe.style.width = "100%";
      iframe.style.height = "100%";
      iframe.style.border = "0";
      frameWrap.appendChild(iframe);

      card.appendChild(frameWrap);
      youtubeGrid.appendChild(card);
    });
  }

  renderPhotos();
  renderVideos();
  renderYoutube();
})();
