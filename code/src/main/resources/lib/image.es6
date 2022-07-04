const libs = {
  portal: require("/lib/xp/portal"),
  content: require("/lib/xp/content"),
  cache: require("/lib/cache"),
  context: require("/lib/xp/context")
};

const PRESCALED_IMAGE_SIZES = [256, 512, 1024, 2048];
const PRESCALED_IMAGE_QUALITIES = [70, 65, 60, 55];
const DEFAULT_IMAGE_WIDTH = 1024;
const DEFAULT_IMAGE_QUALITY = 60;
const THUMBNAIL_RATIO = 8;
const THUMBNAIL_IMAGE_SIZE = 128;

// const tempSVG = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 {{w}} {{h}}'/>"; // Simplest possible SVG
const iconSVG = "<svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' viewBox='0 0 {{w}} {{h}}'><rect width='100%' height='100%' fill='#eee'/><defs><symbol id='a' viewBox='0 0 90 66' opacity='0.3'><path d='M85 5v56H5V5h80m5-5H0v66h90V0z'/><circle cx='18' cy='20' r='6'/><path d='M56 14L37 39l-8-6-17 23h67z'/></symbol></defs><use xlink:href='#a' width='20%' x='40%'/></svg>"; // Basic 'picture' icon

const imageCache = libs.cache.newCache({
  size: 200,
  expire: 60 * 20 // 20 minute cache
});

const urlCache = libs.cache.newCache({
  size: 100,
  expire: 60 * 20 // 20 minute cache
});

/**
 * Get available scaletypes (grouped by affected image dimensions)
 * @return {Object} The available scale types
 */
const getScaleTypes = () => ({
  x: ["width", "square", "max"],
  y: ["height"],
  xy: ["wide", "block"]
});
exports.getScaleTypes = getScaleTypes;

/**
 * Calculates the greatest common divisor for a and b
 * @param {Integer} a
 * @param {Integer} b
 * @return {Integer} Greatest common divisor
 */
const greatestCommonDivisor = (a, b) => (b ? greatestCommonDivisor(b, a % b) : Math.abs(a));
exports.greatestCommonDivisor = greatestCommonDivisor;

/**
 * Get image dimensions (width and height) for image
 * @param {Object} image - The image content
 * @return {Object} The image dimensions
 */
const getImageDimensions = (image) => {
  const imageInfo = image.x.media.imageInfo;
  const imageDimensions = {
    x: imageInfo.imageWidth,
    y: imageInfo.imageHeight
  };
  return imageDimensions;
};
exports.getImageDimensions = getImageDimensions;

/**
 * Get aspect ratio (width divided by height) of image
 * @param {Object} image - The image content
 * @return {Float} The image aspect ratio
 */
const getImageAspectRatio = (image) => {
  const imageDimensions = getImageDimensions(image);
  return imageDimensions.x / imageDimensions.y;
};
exports.getImageAspectRatio = getImageAspectRatio;

/**
 * Creates image URL.
 * @param {String} key - The image content key
 * @param {String} scale - Scaling filter
 * @param {String} filter - Additional image filters
 * @param {String} format - Image format
 * @param {String} quality - Image quality (JPEG)
 * @return {String} The image URL
 */
const createUrl = (key, scale, filter, format, quality) => urlCache.get(`${key}${scale}${filter}${format}${quality}`, () => {
  const scaledQuality = quality || DEFAULT_IMAGE_QUALITY;
  const url = libs.portal.imageUrl({
    id: key,
    scale: scale,
    filter: filter,
    format: format,
    quality: scaledQuality
  });

  const urlMatch = url.match(/_\/image\/.*/i);
  return urlMatch ? urlMatch[0] : url;
});
exports.createUrl = createUrl;

/**
 * Get individual scale parameters as array from scale parameter string.
 * @param {String} scale - Scaling filter
 * @return {Array} The individual scaling parameters
 */
const getScaleParameters = (scale) => {
  // remove trailing parenthesis
  let res = scale.replace(/\)$/, "");
  // split on parenthesis and comma
  res = res.split(/[(,]/);
  return res;
};
exports.getScaleParameters = getScaleParameters;

/**
 * Create final scale filter based on selected scaling filter and available width
 * @param {Object} image - The image content
 * @param {String} scale - Scaling filter
 * @param {Integer} width
 * @return {String} Available width
 */
const createScaleFilter = (image, scale, width) => {
  const scaleParams = getScaleParameters(scale);
  const scaleType = scaleParams[0].toLowerCase();
  const finalScaleFilterArray = [];
  const scaleTypes = getScaleTypes();

  if (scaleTypes.x.indexOf(scaleType) >= 0) {
    finalScaleFilterArray.push(width);
  }

  if (scaleTypes.y.indexOf(scaleType) >= 0) {
    // height scaling does not make sense for responsive images
    log.warning("Height scaling does not make sense for responsive images");
  }

  if (scaleTypes.xy.indexOf(scaleType) >= 0) {
    const scaleRatio = (scaleParams[1] / scaleParams[2]);
    finalScaleFilterArray.push(width);
    finalScaleFilterArray.push(Math.round(width / scaleRatio));
  }

  if (scaleParams[3]) {
    finalScaleFilterArray.push(scaleParams[3]);
  }

  if (scaleParams[4]) {
    finalScaleFilterArray.push(scaleParams[4]);
  }

  const finalScaleFilter = `${scaleType}(${finalScaleFilterArray.join()})`;
  return finalScaleFilter;
};
exports.createScaleFilter = createScaleFilter;

/**
 * Creates scaled image of desired width.
 * @param {Number} scaledWidth - Desired width
 * @param {Object} image - The image content
 * @param {String} scale - Scaling filter
 * @param {String} filter - Additional image filters
 * @param {String} format - Image format
 * @param {String} quality - Image quality (JPEG)
 * @return {String} The image src
 */
const createSrc = (scaledWidth, image, scale, filter, format, quality) => {
  const scalingFilter = createScaleFilter(image, scale, scaledWidth);
  const scaledQuality = quality || DEFAULT_IMAGE_QUALITY;
  return createUrl(image._id, scalingFilter, filter, format, scaledQuality);
};
exports.createSrc = createSrc;

/**
 * Create placeholder width and height based on selected scaling filter and available width
 * @param {Object} image - The image content
 * @param {String} scale - Scaling filter
 * @param {Integer} width
 * @return {object} placeholder object with x, y, heightPercentage and svg src image
 */
const createScaledPlaceholder = (image, scale, width) => {
  const scaleParams = getScaleParameters(scale);
  const scaleType = scaleParams[0].toLowerCase();
  const placeholder = {};
  let scaleRatio = 1;

  const scaleTypes = getScaleTypes();

  if (scaleTypes.xy.indexOf(scaleType) >= 0) {
    // We use user set aspect ratio
    scaleRatio = scaleParams[1] / scaleParams[2];
  } else if (scaleType === "square") {
    scaleRatio = 1;
  } else {
    // We use actual image size for ratio
    scaleRatio = getImageAspectRatio(image);
  }

  const height = width / scaleRatio;
  placeholder.x = width;
  placeholder.y = String(Math.round(height));
  placeholder.heightPercentage = String((100 * height) / width);

  placeholder.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(iconSVG.replace(/{{w}}/g, placeholder.x).replace(/{{h}}/g, placeholder.y))}`;

  return placeholder;
};
exports.createScaledPlaceholder = createScaledPlaceholder;

/**
 * Create thumbnail url of image. Image is THUMBNAIL_RATIO times smaller than original scale.
 * @param {String} key - The image content key
 * @param {String} scale - Scaling filter
 * @param {String} format - Image format
 * @param {String} quality - Image quality (JPEG)
 * @return {String} The image URL
 */
const createThumbnail = (key, scale, format, quality) => {
  let [scaleType, x, y] = getScaleParameters(scale);
  scaleType = scaleType.toLowerCase();

  const scaleTypes = getScaleTypes();

  if (x < THUMBNAIL_IMAGE_SIZE) {
    const ratio = THUMBNAIL_IMAGE_SIZE / x;
    x = THUMBNAIL_IMAGE_SIZE;
    if (scaleTypes.xy.indexOf(scaleType) >= 0) {
      y = Math.round(y * ratio);
    }
  } else {
    x = Math.round(x / THUMBNAIL_RATIO);
    if (scaleTypes.xy.indexOf(scaleType) >= 0) {
      y = Math.round(y / THUMBNAIL_RATIO);
    }
  }
  const scaleString = `${scaleType}(${x}${y ? `, ${y}` : ""})`;

  return createUrl(key, scaleString, "", format, quality);
};
exports.createThumbnail = createThumbnail;

/**
 * Creates image responsive srcset.
 * @param {Object} image - The image content
 * @param {String} scale - Scaling filter
 * @param {String} filter - Additional image filters
 * @param {String} format - Image format
 * @param {String} quality - Image quality (JPEG)
 * @return {Object} The image srcset
 */
const createSrcSet = (image, scale, filter, format, quality) => {
  const srcSet = [];
  let generatedUrl = null;
  for (let i = 0; i < PRESCALED_IMAGE_SIZES.length; i++) {
    const scaledWidth = PRESCALED_IMAGE_SIZES[i];
    const scaledQuality = quality || PRESCALED_IMAGE_QUALITIES[i];
    const scalingFilter = createScaleFilter(image, scale, scaledWidth);

    let scaledUrl = null;

    if (generatedUrl) {
      const scaleRegex = /\/[a-z]*-\d{1,4}(-\d{1,4})?\//gmi;
      scaledUrl = generatedUrl.replace(scaleRegex, `/${scalingFilter.replace(/,|\(|\)/gi, "-")}/`);
    } else {
      scaledUrl = exports.createUrl(
        image._id,
        scalingFilter,
        filter,
        format,
        scaledQuality
      );
      generatedUrl = scaledUrl;
    }

    srcSet.push(`${scaledUrl} ${scaledWidth}w`);
  }
  return srcSet;
};
exports.createSrcSet = createSrcSet;

/**
 * Creates image object.
 * @param {String} key - The image content key
 * @param {String} scale - Scaling filter
 * @param {String} filter - Additional image filters
 * @param {String} format - Image format
 * @param {String} quality - Image quality (JPEG)
 * @param {Boolean} responsive - Create responsive image sizes?
 * @return {Object} The image object
 */
const create = ({
  key, scale = "width(1)", filter = "", format = "jpg", quality = "70", responsive = true
}) => {
  const context = libs.context.get();
  return imageCache.get(`${context.branch}${key}${scale}${filter}${quality}${responsive}`, () => {
    const image = {};
    if (key) {
      let result = libs.content.get({
        key: key
      });
      if (!result) {
        const fallbackImage = libs.portal.getSiteConfig()?.fallbackImage;
        if (fallbackImage) {
          result = libs.content.get({
            key: fallbackImage
          });
        }
      }

      if (result) {
        if (result.type === "media:image") {
          image.thumbnail = createThumbnail(result._id, scale, format, quality);
          if (responsive) {
            image.isResponsive = true;
            image.srcSet = createSrcSet(result, scale, filter, format, quality).join(", ");
            image.src = createSrc(DEFAULT_IMAGE_WIDTH, result, scale, filter, format, quality);
            const placeHolder = createScaledPlaceholder(result, scale, DEFAULT_IMAGE_WIDTH);
            if (placeHolder && placeHolder.x && placeHolder.y) {
              image.width = placeHolder.x;
              image.height = placeHolder.y;
              image.heightPercentage = placeHolder.heightPercentage;
              image.placeholderSrc = placeHolder.src;
            }
          } else {
            image.isResponsive = false;
            image.src = exports.createUrl(result._id, scale, filter, format, quality);
          }
        } else {
          const url = libs.portal.attachmentUrl({ id: result._id });
          const urlMatch = url.match(/_\/attachment\/.*/i);
          image.src = urlMatch ? urlMatch[0] : url;
          image.srcSet = image.src;
          image.thumbnail = image.src;
        }
        image.alt = result.data.altText || result.data.caption || result.displayName;
        image.caption = result.data.caption || null;
        image.artist = result.data.artist || null;
        image.copyright = result.data.copyright || null;
        image.tags = result.data.tags || null;
      }
    }
    return image;
  });
};
exports.create = create;
