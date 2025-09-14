const select = document.getElementById("languageSelect");
const savedMessageElem = document.getElementById("savedMessage");
const popupHeading = document.getElementById("popupHeading");
const popupDescription = document.getElementById("popupDescription");
const mobileNoticeElem = document.querySelector(".info");

let savedMessageText = "Saved!"; // default

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

// Populate select
languages.forEach((lang) => {
  const option = document.createElement("option");
  option.value = lang.code;
  option.textContent = lang.value;
  select.appendChild(option);
});

// Load translations JSON
fetch(chrome.runtime.getURL("translations.json"))
  .then((response) => response.json())
  .then((messages) => {
    const userLang = navigator.language.slice(0, 2); // e.g., "en", "fr"
    const text = messages[userLang] || messages["en"];
    popupHeading.textContent = text.heading;
    popupDescription.textContent = text.description;
    savedMessageText = text.savedMessage || "Saved!";
    mobileNoticeElem.textContent = text.mobileNotice;
  })
  .catch((err) => {
    console.error("Failed to load translations:", err);
    popupHeading.textContent = "Select Preferred Language";
    popupDescription.textContent =
      "Choose the language for YouTube desktop player interface and audio.";
    savedMessageText = "Saved!";
    mobileNoticeElem.textContent =
      text.mobileNotice ||
      "⚠ This extension works only for the mobile version of the YouTube website.";
  });

// Load saved language or default
chrome.storage.sync.get(["preferredLanguage"], (data) => {
  select.value = data.preferredLanguage || "en-US";
  if (!data.preferredLanguage) {
    chrome.storage.sync.set({ preferredLanguage: "en-US" });
  }
});

// Save on change
select.addEventListener("change", () => {
  chrome.storage.sync.set({ preferredLanguage: select.value }, () => {
    savedMessageElem.textContent = savedMessageText;
    savedMessageElem.style.display = "block";
    setTimeout(() => (savedMessageElem.style.display = "none"), 1000);
  });
});
