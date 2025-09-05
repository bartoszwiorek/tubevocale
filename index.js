if (window.location.hostname.includes("youtube.com")) {
  let lastUrl = location.href;

  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      onUrlChange();
    }
  }).observe(document, { subtree: true, childList: true });

  onUrlChange(); // initial call

  function onUrlChange() {
    if (location.pathname === "/watch") {
      initDropdown();
    } else {
      const container = document.getElementById("yt-lang-container");
      if (container) container.remove();
    }
  }

  function getLanguages() {
    const languages = [
      { value: "fr-FR", code: "fr-FR" },
      { value: "en-US", code: "en-US" },
      { value: "pl", code: "pl" },
      { value: "hi", code: "hi" },
      { value: "es-US", code: "es-US" },
      { value: "id", code: "id" },
      { value: "ja", code: "ja" },
      { value: "pt-BR", code: "pt-BR" },
      { value: "it", code: "it" },
    ];

    const userLocale = navigator.language || "en-US";
    const displayNames = new Intl.DisplayNames([userLocale], {
      type: "language",
    });

    return { languages, displayNames };
  }

  function initDropdown() {
    if (
      !document.querySelector("#movie_player") ||
      document.getElementById("yt-lang-container")
    )
      return; // already injected or no player

    const { languages, displayNames } = getLanguages();

    // container styles
    const containerStyles = {
      position: "fixed",
      left: "10px",
      bottom: "10px",
      zIndex: "9999",
      padding: "6px 10px",
      background: "rgba(0,0,0,0.7)",
      color: "white",
      fontSize: "12px",
      borderRadius: "8px",
      display: "flex",
      flexDirection: "column",
      gap: "4px",
    };

    // dropdown styles
    const selectStyles = {
      padding: "2px 6px",
      fontSize: "12px",
      borderRadius: "4px",
      border: "1px solid #555",
      background: "white",
      color: "black",
    };

    // create container
    const container = document.createElement("div");
    container.id = "yt-lang-container";
    Object.assign(container.style, containerStyles);

    // label
    const label = document.createElement("span");
    label.textContent = "TubeVocale";
    label.style.fontSize = "11px";
    label.style.opacity = "0.8";

    // dropdown
    const selector = document.createElement("select");
    selector.id = "yt-lang-selector";
    Object.assign(selector.style, selectStyles);

    // build options
    selector.innerHTML = languages
      .map((lang) => {
        const labelText = displayNames.of(lang.code.split(".")[0]) || lang.code;
        return `<option value="${lang.value}">${labelText}</option>`;
      })
      .join("");

    // append elements
    container.appendChild(label);
    container.appendChild(selector);
    document.body.appendChild(container);

    // load saved language ignoring numeric suffix
    const saved = localStorage.getItem("yt-player-user-settings");
    if (saved) {
      try {
        let lang = JSON.parse(JSON.parse(saved).data)["483"].stringValue;
        selector.value =
          languages.find((l) => l.value === lang.split(".")[0])?.value ||
          lang.split(".")[0];
      } catch {}
    }

    // handle change
    selector.addEventListener("change", () => {
      const lang = selector.value;
      localStorage.setItem(
        "yt-player-user-settings",
        JSON.stringify({
          data: JSON.stringify({ 483: { stringValue: `${lang}.10` } }),
          expiration: Date.now() + 2592000000,
          creation: Date.now(),
        })
      );

      // inject reload into page context
      const script = document.createElement("script");
      script.textContent = `(${injectReload})();`;
      (document.head || document.documentElement).appendChild(script);
      script.remove();
    });

    // reload player function
    function injectReload() {
      const player = document.getElementById("movie_player");
      if (player && typeof player.stopVideo === "function") {
        player.stopVideo();
        player.playVideo();
      } else {
        location.reload();
      }
    }
  }
}
