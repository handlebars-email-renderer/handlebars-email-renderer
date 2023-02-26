# Class: HandlebarsEmailRenderer

Class used to render email templates using Handlebars.js.

## Constructor

```typescript
new HandlebarsEmailRenderer(options?: HandlebarsEmailRendererOptions)
```

Creates a new instance of the HandlebarsEmailRenderer class with the given options.

- `options` (Object): An object containing options for the renderer.
  - `viewsPath` (String): The path to the folder containing email templates. Defaults to `'./views'`. This option allows you to customize the directory where email.
  - `helpers` (Object): An object containing Handlebars helpers. This option allows you to pass in custom helpers for use in your email templates.

## Method: `render`

```typescript
async render(view: string, options: Record<string, unknown> = {}): Promise<string>
```

Renders an email template using the provided options.

- `view` (String): The name of the email template to render.
- `options` (Object) : An optional object containing options to use when rendering the template. It can contain any data that is needed by the email template or the layout template.
  - `layout`: Name of layout to use. Defaults to `'main'`.

Returns a Promise that resolves with the rendered email HTML. If the view or layout file is not found, the Promise is rejected with an error.

## Method: `renderSync`

```typescript
renderSync(view: string, options: Record<string, unknown> = {}): string
```

Renders an email template using the provided options using a synchronous loop to wait for the renderer to be constructed. This method should only be used if you are certain that calling it will not negatively impact the performance of your application.

> **Note:** Using the renderSync method is discouraged, as it may crash the Node.js process and cause performance issues. Use it only if you are certain that performing this method will not impact the performance of your application.

- `view` (String): The name of the email template to render.
- `options` (Object) : An optional object containing options to use when rendering the template. It can contain any data that is needed by the email template or the layout template.
  - `layout`: Name of layout to use. Defaults to `'main'`.

Returns a String with the rendered email HTML. If the view or layout file is not found, an error is thrown.

## Method: `registerHelper`

```typescript
registerHelper(name: string, fn: Handlebars.HelperDelegate): string
```

Registers an individual Handlebars helper.

- `name` (String): The name of the email template to render.
- `fn` (Object) : The helper function to be executed when the helper is called.

This method allows you to register a single Handlebars helper. If you want to register multiple helpers at once, use the `registerHelpers` method instead. if an helper with the same name already exists, this one will replace it.

## Method: `registerHelpers`

```typescript
registerHelpers(helpers: Record<string, Handlebars.HelperDelegate>): void
```

Registers an object containing multiple Handlebars helpers.

- `helpers` (Object): An object containing Handlebars helpers.

This method allows you to register multiple Handlebars helpers at once. The `helpers` argument should be an object, where each property represents a helper and its value is the function to be executed when the helper is called. If the `helpers` object is not valid, an error is thrown. If an helper with the same name already exists, this one will replace it.
