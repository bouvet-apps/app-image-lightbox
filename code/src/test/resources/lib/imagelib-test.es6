const { mock, assertJson, assertEquals } = require("/lib/xp/testing");

const image1024x768 = {
  _id: "c5195da3-d087-4fdd-b1f0-0f8356d9b116",
  _name: "03012020v2",
  _path: "/site/bilder/03012020v2",
  creator: "user:system:su",
  modifier: "user:system:su",
  createdTime: "2020-01-03T14:19:43.753Z",
  modifiedTime: "2020-01-03T14:19:46.086Z",
  type: "media:image",
  displayName: "Some Displayname",
  hasChildren: false,
  language: "en",
  valid: true,
  childOrder: "modifiedtime DESC",
  data: {
    media: {
      attachment: "03012020v1.gif",
      focalPoint: {
        x: 0.5,
        y: 0.5
      }
    },
    caption: "Some caption",
    artist: "Some artist",
    copyright: "Some copyright"
  },
  x: {
    media: {
      imageInfo: {
        imageHeight: 768,
        imageWidth: 1024,
        contentType: "image/gif",
        pixelSize: 128960,
        byteSize: 16767
      }
    },
    "no-bouvet-app": {
      cmsStatus: {
        status: "approved"
      }
    }
  },
  page: {},
  attachments: {
    "03012020v1.gif": {
      name: "03012020v1.gif",
      label: "source",
      size: 16767,
      mimeType: "image/gif"
    }
  },
  publish: {
    from: "2020-01-03T14:19:00Z",
    first: "2020-01-03T14:19:00Z"
  }
};

const image400x300 = {
  _id: "c5195da3-d087-4fdd-b1f0-0f8356d9b116",
  _name: "03012020v2",
  _path: "/site/bilder/03012020v2",
  creator: "user:system:su",
  modifier: "user:system:su",
  createdTime: "2020-01-03T14:19:43.753Z",
  modifiedTime: "2020-01-03T14:19:46.086Z",
  type: "media:image",
  displayName: "Some other image",
  hasChildren: false,
  language: "en",
  valid: true,
  childOrder: "modifiedtime DESC",
  data: {
    media: {
      attachment: "03012020v2.gif",
      focalPoint: {
        x: 0.5,
        y: 0.5
      }
    },
    caption: "Some other caption",
    artist: "Some other artist",
    copyright: "Some other copyright"
  },
  x: {
    media: {
      imageInfo: {
        imageHeight: 300,
        imageWidth: 400,
        contentType: "image/gif",
        pixelSize: 128960,
        byteSize: 16767
      }
    },
    "no-bouvet-app": {
      cmsStatus: {
        status: "approved"
      }
    }
  },
  page: {},
  attachments: {
    "03012020v2.gif": {
      name: "03012020v2.gif",
      label: "source",
      size: 16767,
      mimeType: "image/gif"
    }
  },
  publish: {
    from: "2020-01-03T14:19:00Z",
    first: "2020-01-03T14:19:00Z"
  }
};

const mockedContentLibFuncs = {
  get: () => image1024x768
};

const mockedContextLibFuncs = {
  get: () => "draft"
};

const mockedPortalLibFuncs = {
  getSiteConfig: () => ({ fallbackImage: "fallback.jpg" }),
  imageUrl: (params) => `/_/image/${params.id}:some_id/${params.scale}/filename.${params.format}?quality=${params.quality}`
};

mock("/lib/xp/content.js", mockedContentLibFuncs);
mock("/lib/xp/context.js", mockedContextLibFuncs);
mock("/lib/xp/portal.js", mockedPortalLibFuncs);

const imageLib = require("/lib/image"); // Lib must be required AFTER any mocks are defined

exports.testGetScaleTypes = () => {
  const result = imageLib.getScaleTypes();
  assertJson({
    x: ["width", "square", "max"],
    y: ["height"],
    xy: ["wide", "block"]
  }, result);
};

exports.testGreatestCommonDivisor1024x768 = () => {
  const result = imageLib.greatestCommonDivisor(1024, 768);
  assertEquals(256, result);
};

exports.testGreatestCommonDivisor400x300 = () => {
  const result = imageLib.greatestCommonDivisor(400, 300);
  assertEquals(100, result);
};

exports.testGetImageDimensions1024x768 = () => {
  const result = imageLib.getImageDimensions(image1024x768);
  assertJson({ x: 1024, y: 768 }, result);
};

exports.testGetImageDimensions400x300 = () => {
  const result = imageLib.getImageDimensions(image400x300);
  assertJson({ x: 400, y: 300 }, result);
};

exports.testGetScaleParametersWidth1024x768 = () => {
  const result = imageLib.getScaleParameters("width(1024,768)");
  assertJson(["width", "1024", "768"], result);
};

exports.testGetScaleParametersWide1024 = () => {
  const result = imageLib.getScaleParameters("wide(1024)");
  assertJson(["wide", "1024"], result);
};

exports.testGetScaleParametersBlock400x300 = () => {
  const result = imageLib.getScaleParameters("block(400,300)");
  assertJson(["block", "400", "300"], result);
};

exports.testcreateScaleFilter1024x768 = () => {
  const result = imageLib.createScaleFilter(image1024x768, "block(1024,768)", 200);
  assertEquals("block(200,150)", result);
};

exports.testCreateSrc1024x768 = () => {
  const result = imageLib.createSrc(1024, image1024x768, "block(1024,768)", "", "jpg", "70");
  assertEquals("_/image/c5195da3-d087-4fdd-b1f0-0f8356d9b116:some_id/block(1024,768)/filename.jpg?quality=70", result);
};

exports.testCreateScaledPlaceholder = () => {
  const result = imageLib.createScaledPlaceholder(image1024x768, "block(1024,768)", "1024");
  assertJson({
    x: "1024",
    y: "768",
    heightPercentage: "75",
    src: "data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20xmlns%3Axlink%3D'http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink'%20viewBox%3D'0%200%201024%20768'%3E%3Crect%20width%3D'100%25'%20height%3D'100%25'%20fill%3D'%23eee'%2F%3E%3Cdefs%3E%3Csymbol%20id%3D'a'%20viewBox%3D'0%200%2090%2066'%20opacity%3D'0.3'%3E%3Cpath%20d%3D'M85%205v56H5V5h80m5-5H0v66h90V0z'%2F%3E%3Ccircle%20cx%3D'18'%20cy%3D'20'%20r%3D'6'%2F%3E%3Cpath%20d%3D'M56%2014L37%2039l-8-6-17%2023h67z'%2F%3E%3C%2Fsymbol%3E%3C%2Fdefs%3E%3Cuse%20xlink%3Ahref%3D'%23a'%20width%3D'20%25'%20x%3D'40%25'%2F%3E%3C%2Fsvg%3E"
  }, result);
};

exports.testCreateThumbnail = () => {
  const result = imageLib.createThumbnail(image1024x768._id, "block(1024,768)", "jpg", "30");
  assertEquals("_/image/c5195da3-d087-4fdd-b1f0-0f8356d9b116:some_id/block(128, 96)/filename.jpg?quality=30", result);
};

exports.testCreateSrcSet = () => {
  const result = imageLib.createSrcSet(image1024x768, "block(1024,768)", "", "jpg", "80");
  assertJson([
    "_/image/c5195da3-d087-4fdd-b1f0-0f8356d9b116:some_id/block(256,192)/filename.jpg?quality=80 256w",
    "_/image/c5195da3-d087-4fdd-b1f0-0f8356d9b116:some_id/block(256,192)/filename.jpg?quality=80 512w",
    "_/image/c5195da3-d087-4fdd-b1f0-0f8356d9b116:some_id/block(256,192)/filename.jpg?quality=80 1024w",
    "_/image/c5195da3-d087-4fdd-b1f0-0f8356d9b116:some_id/block(256,192)/filename.jpg?quality=80 2048w"
  ], result);
};

exports.testCreate = () => {
  const result = imageLib.create({
    key: image1024x768._id, scale: "block(1024,768)", filter: "", format: "jpg", quality: "75", responsive: true
  });
  assertJson({
    thumbnail: "_/image/c5195da3-d087-4fdd-b1f0-0f8356d9b116:some_id/block(128, 96)/filename.jpg?quality=75",
    isResponsive: true,
    srcSet: "_/image/c5195da3-d087-4fdd-b1f0-0f8356d9b116:some_id/block(256,192)/filename.jpg?quality=75 256w, _/image/c5195da3-d087-4fdd-b1f0-0f8356d9b116:some_id/block(256,192)/filename.jpg?quality=75 512w, _/image/c5195da3-d087-4fdd-b1f0-0f8356d9b116:some_id/block(256,192)/filename.jpg?quality=75 1024w, _/image/c5195da3-d087-4fdd-b1f0-0f8356d9b116:some_id/block(256,192)/filename.jpg?quality=75 2048w",
    src: "_/image/c5195da3-d087-4fdd-b1f0-0f8356d9b116:some_id/block(1024,768)/filename.jpg?quality=75",
    width: 1024,
    height: "768",
    heightPercentage: "75",
    placeholderSrc: "data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20xmlns%3Axlink%3D'http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink'%20viewBox%3D'0%200%201024%20768'%3E%3Crect%20width%3D'100%25'%20height%3D'100%25'%20fill%3D'%23eee'%2F%3E%3Cdefs%3E%3Csymbol%20id%3D'a'%20viewBox%3D'0%200%2090%2066'%20opacity%3D'0.3'%3E%3Cpath%20d%3D'M85%205v56H5V5h80m5-5H0v66h90V0z'%2F%3E%3Ccircle%20cx%3D'18'%20cy%3D'20'%20r%3D'6'%2F%3E%3Cpath%20d%3D'M56%2014L37%2039l-8-6-17%2023h67z'%2F%3E%3C%2Fsymbol%3E%3C%2Fdefs%3E%3Cuse%20xlink%3Ahref%3D'%23a'%20width%3D'20%25'%20x%3D'40%25'%2F%3E%3C%2Fsvg%3E",
    alt: "Some caption",
    caption: "Some caption",
    artist: "Some artist",
    copyright: "Some copyright",
    tags: null
  }, result);
};
