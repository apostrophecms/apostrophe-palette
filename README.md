todo
- [x] let dev set target container, use throughout
- [x] let dev supply modifier character
- [x] hooks for before/after submit
- [x] order fields / group fields
- BUG colorpicker field does not update if value is changed in the global modal
- [x] style the dang form
- [x] cleanup the $field thing
- make a nicer template fragment to drop in to a project

# apostrophe-palette

`apostrophe-palette` is a bundle that provides an in-context interface for changing the values of a schema and the front-end events to react to those changes.

Primary use case for this module would be giving an editor style control over aspects of a design without having to change code and be able to see how their changes affect the design in real time, like a palette tool in an art program.

`apostrophe-palette` assumes:
- You want access to this schema data everywhere (extends `apostrophe-global`).
- You want to affect the front-end by way of wrapper classes that describe the changes made in the palette tool.

The bundle includes:
- `apostrophe-palette-global` pushes your palette schema to the `apostrophe-global` module
- `apostrophe-palette-schemas` provides identifying wrappers for schema fields
- `apostrophe-palette-widgets` provides the main interface for interacting with the schema and hooks for saving / reacting.

## Example configuration

```javascript
modules: {
  ... // project level configuration
  'apostrophe-palette-widgets': {},
  'apostrophe-palette': {},
  'apostrophe-palette-global': {
    target: 'body', // jquery selector for modifying wrapper classes, optional, defaults to `body`
    modifierSeparator: '__', // CSS modifier separator, optional, defaults to `--`
    paletteFields: [ // array of fields, like a normal schema
      {
        name: 'backgroundColor',
        class: 'o-bg-color',
        label: 'Background Color',
        type: 'color'
      },
}
```