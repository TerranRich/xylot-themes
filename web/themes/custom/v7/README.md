# V7

A custom Drupal 9 theme for the Xylot Themes 7.x site, complete with Fluid Typography, Sass (SCSS), and Gulp.

## Installation and Setup

### Installing with Composer

_TBD_

### Installing Manually

1. Change directory to the theme's root: `<root-directory>/web/themes/custom/v7`
2. Delete the `.git` folder so that Git does not recognize this as a submodule of the larger site
3. Run `npm install` to load all node dependencies
4. For development run `npm run build:dev` to kickoff the Webpack module bundler (does not minify files in dev mode)
5. To bundle for production run `npm run build:prod` to generate the JS and CSS bundles all minified with sourcemaps

## Fluid Typography
V7 comes with a baseline implementation of fluid typography out of the box. Customizations can be made in the `_typography.scss` SCSS module. See [Verne Fluid Type](https://www.npmjs.com/package/verne-fluid-type) on npm.com for documentation.

## Other Notes
* Node version _must_ be `v10.16.0` (`nvm install 10.16.0`)
* NPM version _must_ be `7.9.0` (`npm install -g npm@7.9.0`)
