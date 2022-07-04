# Code documentation
For information on environment and building the app, see [system documentation](../README.md).

## SCSS og ES6
We use SCSS to produce the CSS for the app. The SCSS-files are located in `/code/src/frontend/styles/`. All JavaScript is written in ES6, which is then transpiled to JS using Webpack.

## Webpack
To use files from the frontend-folder, we must pass them through Webpack.

Script files are added manually to the entry list in `/code/src/frontend/webpack.common.config.js`:
```
module.exports = {
  entry: {
    ...
    main: "./scripts/main.es6",
    ...
  }
```
This results in a bundle called `main.js` in the asset-folder, ready to be used in pageContributions in the app.
