const portalLib = require("/lib/xp/portal");
const imageLib = require("/lib/image");
const i18nLib = require("/lib/xp/i18n");

exports.responseProcessor = function (req, res) {
  if (req.mode !== "live" && req.mode !== "preview" && res.contentType === "text/html") {
    return res; // We don't need image lightbox in Edit mode
  }

  // Define our regular expressions
  const figuresRegex = /<figure(.)*?(.)*?(<\/figure>)/mgs;
  const imageLightboxRegex = /editor-image-lightbox/;
  const imageUrlRegex = /(src=")(.*?)(")/;
  const imageIdRegex = /(\/_\/image\/)(.*?)(:)/;

  // Find all figures with the editor-image-lightbox-class and put them in an array
  const figures = res.body.match(figuresRegex);

  if (figures) { // Only proceed if there are image lightboxes on the page
    /* Example figure HTML before we modify it:
      <figure class="captioned editor-align-center" style="margin: auto; width: 60%;"><img alt="Some alt text" src="_/image/[content-id:attachment-id]/width-768/filename.jpg" style="width:100%">
        <figcaption>The caption</figcaption>
      </figure>
    */
    // Generate high-res images for the modal to use
    const lightboxFigures = figures
      .filter((figure) => (imageLightboxRegex.test(figure)))
      .map((figure) => ({
        figure: figure,
        url: figure.match(imageUrlRegex)[2],
        id: figure.match(imageIdRegex)[2],
        image: imageLib.create({
          key: figure.match(imageIdRegex)[2],
          scale: "width(2048)", // TODO: Consider allowing adjusting these parameters in app config
          filter: "",
          format: "jpg",
          quality: "70",
          responsive: true
        })
      }));

    // Loop through all figures and modify the page HTML so the modal can use a high-res image instead of the thumbnail
    lightboxFigures.forEach((figure) => {
      /* After modification, the HTML should look something like this:
        <figure class="captioned editor-align-center editor-image-lightbox" style="margin: auto; width: 60%;"><img alt="Some alt text" src="_/image/[content-id:attachment-id]/width-768/filename.jpg" tabindex="0" data-lightboximagesrc="_/image/[content-id:attachment-id]/width-2048/filename.jpg?quality=70" style="width:100%">
          <figcaption>The caption</figcaption>
        </figure>
      */
      const figureRegex = new RegExp(`src="${figure.url}"`);
      res.body = res.body.replace(figureRegex, `src="${figure.url}" tabindex="0" data-lightboximagesrc="${figure.image.src}"`);
    });

    // Define the modal HTML
    const modal = `<div tabindex="-1" id="lightbox-modal" role="dialog" aria-modal="true" aria-labelledby="lightbox-caption" data-translations='{"fullscreenImage":"${i18nLib.localize({ key: "fullscreen-image" })}"}'>
      <button id="close-lightbox-modal" title="${i18nLib.localize({ key: "close-dialog" }) || "Steng dialogboksen"}"><span aria-hidden="true">&times;</span></button>
      <img id="lightbox-img">
      <div id="lightbox-caption"></div>
    </div>`;
    res.body = res.body.replace(/<\/body>/, `${modal}</body>`); // We inject the modal at the bottom of our page

    const customScripts = `<script async defer src="${portalLib.assetUrl({ path: "js/main.js" })}"></script>`;
    const customStyles = `<link rel="preload" href="${portalLib.assetUrl({ path: "css/main.css" })}"`
    + ` as="style"><link rel="stylesheet" href="${portalLib.assetUrl({ path: "css/main.css" })}">`;

    // This is the proper way to handle possible existing pageContributions
    const headEnd = res.pageContributions.headEnd;
    if (!headEnd) {
      res.pageContributions.headEnd = [];
    } else if (typeof headEnd === "string") {
      res.pageContributions.headEnd = [headEnd];
    }
    res.pageContributions.headEnd.push(customScripts);
    res.pageContributions.headEnd.push(customStyles);
  }

  return res;
};
