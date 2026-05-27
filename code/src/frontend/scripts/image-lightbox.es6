let focusElement = null;

const closeModal = () => {
  const modal = document.getElementById("lightbox-modal");
  modal.classList.remove("lightbox-open");
  document.body.classList.remove("lightbox-open");
  focusElement.focus();
};

const clickCloseHandler = () => {
  closeModal();
};

const keyboardHandler = (event) => {
  const modal = document.getElementById("lightbox-modal");
  if (modal.classList.contains("lightbox-open")) {
    if (event.key === "Escape") {
      closeModal();
      return;
    }

    if (event.key !== "Tab") {
      return;
    }

    const focusableElements = "button, [href], input, select, textarea, [tabindex]:not([tabindex=\"-1\"])";
    const focusableContent = modal.querySelectorAll(focusableElements);

    if (focusableContent.length > 0) {
      const firstFocusableElement = focusableContent[0]; // get first element to be focused inside modal
      const lastFocusableElement = focusableContent[focusableContent.length - 1]; // get last element to be focused inside modal

      if (event.shiftKey && document.activeElement === firstFocusableElement) { // if shift key pressed for shift + tab combination
        event.preventDefault();
        lastFocusableElement.focus(); // add focus for the last focusable element
        return;
      }
      if (!event.shiftKey && document.activeElement === lastFocusableElement) { // if tab key is pressed
        // if focused has reached to last focusable element then focus first focusable element after pressing tab
        event.preventDefault();
        firstFocusableElement.focus(); // add focus for the first focusable element
      }
    }
  }
};

const openModal = (event) => {
  focusElement = event.target;
  let properTarget;
  if (event.target.nodeName === "FIGURE") {
    properTarget = event.target;
  } else {
    properTarget = event.target.parentNode;
  }
  const modal = document.getElementById("lightbox-modal");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxCaption = document.getElementById("lightbox-caption");
  lightboxImg.src = ""; // Remove any lingering previous image for clients on slow connections.
  lightboxImg.alt = "";
  lightboxImg.src = properTarget.children[0].dataset.lightboximagesrc;
  lightboxImg.alt = properTarget.children[0].alt;
  if (properTarget.children[1]?.textContent) {
    lightboxCaption.textContent = properTarget.children[1].textContent;
  } else {
    lightboxCaption.textContent = "";
  }
  modal.classList.add("lightbox-open");
  document.body.classList.add("lightbox-open");
  modal.focus();
  document.addEventListener("keydown", keyboardHandler);
  modal.addEventListener("click", clickCloseHandler, { once: true });
};

const clickOpenHandler = (event) => {
  openModal(event);
};

const keyboardOpenHandler = (event) => {
  const modal = document.getElementById("lightbox-modal");
  if (!modal.classList.contains("lightbox-open") && event.key === "Enter") {
    openModal(event);
  }
};

const imageLightbox = () => {
  const imageLightboxes = document.querySelectorAll(".editor-image-lightbox");
  const modal = document.getElementById("lightbox-modal");
  const translations = modal.getAttribute("data-translations");
  const translationsAsJson = JSON.parse(translations);

  imageLightboxes.forEach((imgLightbox) => {
    imgLightbox.setAttribute("role", "button");
    imgLightbox.setAttribute("title", translationsAsJson.fullscreenImage || "Trykk for å åpne i fullskjerm");
    imgLightbox.addEventListener("click", clickOpenHandler);
    imgLightbox.addEventListener("keydown", keyboardOpenHandler);
  });
};

export default imageLightbox;
