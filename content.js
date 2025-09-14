(function () {
  const DEFAULT_LANGUAGE = "en";

  const getVideoId = () => {
    const urlParams = new URLSearchParams(window.location.search);
    let videoId = urlParams.get("v");
    if (!videoId) {
      const meta = document.querySelector('meta[itemprop="videoId"]');
      if (meta) videoId = meta.getAttribute("content");
    }
    return videoId;
  };

  const createIframe = (videoId, language) => {
    const iframe = document.createElement("iframe");
    iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&hl=${language}`;
    iframe.style.width = "100%";
    iframe.style.height = "56.25vw"; // 16:9 aspect ratio
    iframe.style.border = "none";
    iframe.allow = "autoplay; encrypted-media";
    iframe.setAttribute("allowfullscreen", "");
    iframe.style.display = "none";
    iframe.className = "iframe-yt-player";

    iframe.addEventListener("load", () => {
      console.log("Desktop iframe loaded");
      iframe.style.display = "block";
    });

    return iframe;
  };

  let currentWrapper = null;
  let lastVideoId = null;

  const observer = new MutationObserver(() => {
    const ogPlayerElem = document.querySelector("#movie_player");
    if (!ogPlayerElem) return;

    // Pause and mute all videos
    document.querySelectorAll("video").forEach((v) => {
      v.pause();
      v.muted = true;
      v.dataset.replaced = "true";
    });

    const videoId = getVideoId();
    if (!videoId || videoId === lastVideoId) return;
    lastVideoId = videoId;

    // Remove previous iframe if exists
    if (currentWrapper && currentWrapper.parentNode) {
      currentWrapper.parentNode.removeChild(currentWrapper);
    }

    // Hide original player
    ogPlayerElem.style.display = "none";
    ogPlayerElem.style.zIndex = "-1";

    // Get preferred language from storage
    chrome.storage.sync.get(["preferredLanguage"], (data) => {
      const language = data.preferredLanguage || DEFAULT_LANGUAGE;
      const iframe = createIframe(videoId, language);

      const wrapper = document.createElement("div");
      wrapper.className =
        "yt-override-player-wrapper " + ogPlayerElem.className;
      wrapper.appendChild(iframe);

      ogPlayerElem.parentNode.appendChild(wrapper);
      currentWrapper = wrapper;
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();
