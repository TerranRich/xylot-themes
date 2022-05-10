# V7

A custom Drupal 9 theme for the Xylot Themes 7.x site, complete with Fluid Typography, Sass (SCSS), and Gulp.

## Installation and Setup

### Installing with Composer

_TBD_

### Installing Manually

1. Open the Drupal site's `web` folder
2. Clone the Monty repo into the following folder: `<root-directory>/themes/custom/`
    * **NOTE:** You can also download the repo's .ZIP file and unpack it into the above folder
3. Delete the `.git` folder so that Git does not recognize this as a submodule of the larger site
4. Run `npm install` to load all node dependencies
5. For development run `npm run build:dev` to kickoff the Webpack module bundler (does not minify files in dev mode)
6. To bundle for production run `npm run build:prod` to generate the JS and CSS bundles all minified with sourcemaps

## Fluid Typography
V7 comes with a baseline implementation of fluid typography out of the box. Customizations can be made in the `_typography.scss` SCSS module. See [Verne Fluid Type](https://www.npmjs.com/package/verne-fluid-type) on npm.com for documentation.
