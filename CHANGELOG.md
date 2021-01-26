## v2.0.30 - 2021-01-27
* Allow falsey values other than `null` to be saved for palette fields.

## v2.0.29 - 2020-11-23

* Compatible with the `htmlHelp` option of schema fields. Previously this module disabled that option.

## v2.0.28 - 2020-08-20

* `apostrophe-palette` no longer pushes the entirety of `req.data.global` into JSON in the page when logged in. This is a fix for performance when editing, as well as in some cases a fix for broken pages when logged in. If your site allows untrusted individuals to log in and you store sensitive information such as API keys in Apostrophe's global preferences, then this should also be regarded as a security fix.

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

