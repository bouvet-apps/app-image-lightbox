import "../styles/main.scss";
import imageLightbox from "./image-lightbox";

// require.context() to make sure webpack picks up image files.
require.context("../images/", true, /\.(svg|gif|png|jp?g|webp)/i, "lazy");

if (document.readyState !== "loading") {
  // Page was finished loading before we came to this line. Run whatever you like.
  imageLightbox();
} else {
  // Page was not finished loading yet, so we attach an event listener.
  window.addEventListener("DOMContentLoaded", () => {
    // Run this when page is finished loading.
    imageLightbox();
  });
}
