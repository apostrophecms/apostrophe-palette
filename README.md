# apostrophe-palette
## An in-context interface for changing CSS

`apostrophe-palette` is a bundle that provides an in-context interface for changing the values of developer-set CSS properties. The values are stored in the `apostrophe-global` document and applied to the site whenever the stylesheet link is included in a template. Adjusting values via the palette interface renders changes to the site instantly.

Developers define properties that can be changed by passing the module an array of `apostrophe-schema` fields.

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
  // ... project level configuration
  'apostrophe-palette-widgets': {},
  'apostrophe-palette': {},
  'apostrophe-palette-global': {
    paletteFields: [ // array of fields, like a normal schema
      {
        name: 'backgroundColor',
        label: 'Background color of the website',
        type: 'color',
        selector: 'body',
        property: 'background-color',
      },
      {
        name: 'imageWidgetMargins',
        label: 'Vertical space between image widgets',
        type: 'range',
        selector: ['.c-image-widget', '.c-slideshow-widget'],
        property: ['margin-bottom', 'margin-top'],
        min: 0,
        max: 10,
        step: 0.1,
        unit: 'rem'
      }
    ],
    arrangePaletteFields: [
      {
        name: 'colors',
        label: 'Color Settings',
        fields: ['backgroundColor']
      },
      {
        name: 'margins',
        label: 'Margin Settings',
        fields: ['imageWidgetMargins']
      }
    ]
}
```

### `paletteFields` properties.

#### `name`
This becomes the name of the field when saved to the `apostrophe-global` document, be sure to avoid conflicts.

#### `label`
Normal schema label

#### `type`
A subset of of `apostrophe-schema` field types. Can take `string`, `range`, `color`, and `select`.

#### `selector`
A string or array of strings to be used as CSS selectors. These are printed as-is, so it is valid to pass things like `body`, `.template p`, `#someId [data-foo]`, etc. All selectors will be used to target the `property` property and give the value of the field.

#### `property`
A string or array of strings to be used as CSS properties. These are printed as-is and are used in conjunction with all `selector` properties and the value of the field itself.

#### `unit` (optional)
A string that is appended after the value of the field is printed as a CSS rule.


### `arrangePaletteFields`
You get the opportunity to group your palette fields with a similar syntax you group normal `apostrophe-schema` fields. Fields can be nested at a max depth of 2 levels.

## Including the interface and stylesheets in your template
The interface for interacting with the palette values is actually a special `apostrophe-widget`. There is a macro to help you put it on the page. You'll also need to add hooks for the stylesheet link (which brings in the styles as the exist when the page is loaded) and tag (which gets appended to when palette is changed, giving the editor immediate changes).

In `layout.html`

```html
{% import 'apostrophe-palette-widgets:macros.html' as palette %}
<!-- ... other templating -->

  {% block extraHead %}
    {{ palette.stylesheetLink(data.global) }}
    {{ palette.stylesheetTag() }}
  {% endblock %}

  {% block beforeMain %}
    {% if data.user %} <!-- be sure to somehow safegaurd against non-editor situations, as performance could unnecessarily suffer -->
      {{ palette.palette(data.global, 'palette') }}
    {% endif %}
  {% endblock %}
```

Then you should be able to 'create' your palette widget by opening the drawer and clicking Add Palette.
!(images/palette.gif)

## What actually happens?
Everytime the palette stylesheet is requested, Apostrophe generates a stylesheet based on the `paletteFields` and their values at the time of render and sends it to the browser. When an editor toggles the values of palette fields via it's widget, front-end JavaScript updates the `<style>` tag associated with palette with those changes. This makes sure the latest changes are last in the cascade. It also sends the new values to the server for sanitization and saving.

The generated stylesheets get properly cached until changes are made, at which time the browser is made aware there is a new version to fetch.

