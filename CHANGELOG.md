## v2.0.27 - 2020-07-15
* apostrophe-palette adds itself to a list of admin bar menu items that hide themselves when apostrophe-workflow is in preview/live mode.

## v2.0.26 - 2020-06-17

* Workflow "submit / commit" UI now pops up properly after changes made via palett's custom UI.
* Namespaced JavaScript functions properly, keeping them out of global scope.

## v2.0.25

* Updates styles to be friendly with new `color` field updates.

## 2.0.24

* Updates the eslint config and cleans up linter errors. Sets up CircleCI.

## 2.0.23

* No longer sets the site to the `user` asset scene, which means we no longer push a lot of extra JS and CSS when palette is present for logged out site visitors.

## 2.0.17

* Performance improvements when updating the global doc settings based on the palette.
* Race condition prevention when updating the global doc settings based on the palette.
* Refactoring for maintainability; feature set remains the same.
* Debounced the `palette-update` route to prevent "slamming" of the server.

