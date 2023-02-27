# HandlebarsEmailRenderer

[![npm version](https://img.shields.io/npm/v/handlebars-email-renderer.svg?style=flat-square)](https://www.npmjs.com/package/handlebars-email-renderer)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![GitHub repo size](https://img.shields.io/github/repo-size/handlebars-email-renderer/handlebars-email-renderer)](https://github.com/handlebars-email-renderer/handlebars-email-renderer)
[![TypeScript](https://badges.frapsoft.com/typescript/code/typescript.svg?v=101)](https://github.com/ellerbrock/typescript-badges/)
[![Code format: Prettier](https://img.shields.io/badge/code_format-prettier-blue.svg?style=flat-square)](https://github.com/prettier/prettier)

[![Build states](https://github.com/handlebars-email-renderer/handlebars-email-renderer/workflows/Tests/badge.svg)](https://github.com/handlebars-email-renderer/handlebars-email-renderer/actions?query=workflow%3ATests+branch%3Amain)
[![Known Vulnerabilities](https://snyk.io/test/github/handlebars-email-renderer/handlebars-email-renderer/badge.svg)](https://snyk.io/test/github/handlebars-email-renderer/handlebars-email-renderer)

<!-- [![build status](https://travis-ci.com/npm/handlebars-email-renderer/handlebars-email-renderer.svg)](https://travis-ci.com/npm/handlebars-email-renderer/handlebars-email-renderer) -->

[![GitHub issues](https://img.shields.io/github/issues/handlebars-email-renderer/handlebars-email-renderer)](https://github.com/handlebars-email-renderer/handlebars-email-renderer/issues)
[![GitHub pull requests](https://img.shields.io/github/issues-pr/handlebars-email-renderer/handlebars-email-renderer)](https://github.com/handlebars-email-renderer/handlebars-email-renderer/pulls)
[![GitHub last commit](https://img.shields.io/github/last-commit/handlebars-email-renderer/handlebars-email-renderer)](https://github.com/handlebars-email-renderer/handlebars-email-renderer/commits)

[![semantic-release: angular](https://img.shields.io/badge/semantic--release-angular-e10079?logo=semantic-release)](https://github.com/semantic-release/semantic-release)

<div style="text-align:center"><img src="https://i.imgur.com/RV9wRd4.png" alt="Illustration de l'extrait de code"></div>

<!--
<!-- [![Downloads](https://img.shields.io/npm/dt/handlebars-email-renderer.svg)](https://www.npmjs.com/package/handlebars-email-renderer)
[![Downloads](https://img.shields.io/npm/dt/handlebars-email-renderer.svg?style=flat-square&label=Downloads)](https://yarnpkg.com/package/handlebars-email-renderer) -->

<div style="text-align:center">Allows you to create components that render to email HTML using Handlebars.js.</div>

<!-- TODO: Image of email exemple -->

## Installation

To install the package, run the following command:

```bash
npm install handlebars-email-renderer

# or

yarn add handlebars-email-renderer
```

## Usage

This view engine uses the architecture of the 'views' folder to structure the different views of emails. This makes it trivial to use in basic applications, but you must ensure that this folder has at least the following architecture:

### Basic Usage

In this section, we will cover the basic usage of HandlebarsEmailRenderer. We will show you how to create a simple email using the default layout and a single view.

**Directory Structure:**

To get started, you'll need to create a views directory with the following structure:

```bash
.
├── views
│   ├── layouts
│   │   └── main.hbs
│   └── welcome.hbs

2 directories, 2 files
```

The `layouts` folder contains the different layouts that can be used to structure your emails. For this example, we only need one layout, which we'll call `main.hbs`. This layout defines the basic structure of the email.

The `welcome.hbs` file is the view that will be rendered as the body of the email. This file contains the content that will be sent to the user.

**Code Explanation:**

To use HandlebarsEmailRenderer in your project, you'll need to create an instance of the `HandlebarsEmailRenderer` class with the desired options:

```javascript
const { HandlebarsEmailRenderer } = require("handlebars-email-renderer");

const renderer = new HandlebarsEmailRenderer();

// You can customize the path and name of the `views` directory by passing a `viewsPath` option when instantiating the module:

const renderer = new HandlebarsEmailRenderer({
  viewsPath: "./my-email-templates",
});
```

The `render` method is used to render the email template. By default, the method will look for a view with the same name as the first argument passed to the function in the `views` directory. In this example, the `welcome.hbs` view will be rendered with the `main.hbs` layout:

```javascript
const email = await renderer.render("welcome");
// or synchronous method
const email = renderer.renderSync("welcome");
```

> **Warning**: Using the `renderSync` method is discouraged, as it may crash the Node.js process and cause performance issues. Use it only if you are certain that performing this method will not impact the performance of your application.

The email variable will now contain the rendered HTML email.

**views/layouts/main.hbs:**

The main layout is the HTML page wrapper which can be reused for the different views of the mail. `{{{body}}}` is used as a placeholder for where the main content should be rendered.

```handlebars
<html>
  <head>
    <meta charset="utf-8" />
    <title>Example Email</title>
  </head>
  <body>
    {{{body}}}
  </body>
</html>
```

**views/welcome.hbs:**

The content for the mail welcome which will be rendered into the layout's `{{{body}}}`.

```handlebars
<h1>Welcome, new user!</h1>
```

<!-- TODO:
#### Running the Example

The above example is bundled in this package's [examples directory](exemples/), where it can be run by:

```shell
cd examples/
npm install
npm start
``` -->

### Advenced Usage

In this part, we introduce to choose a custom layout and use personalized data inside your emails.
We will also see how the partials which allow you to break down your code into smaller portions of reusable components in all your emails.
Before going further we recommend that you read the documentation [handlebars introduction](https://handlebarsjs.com/guide/#custom-helpers)

**Custom Layout:**

To use a layout other than the default (`main.hbs`), you must pass the `layout` argument with the name of the corresponding `.hbs` file in the `layouts` directory.

```javascript
// For use 'views/layouts/admin.hbs'

const email = await renderer.render("welcome", {
  layout: "admin",
});
```

**Expressions:**

You can pass custom data to your email on the second argument of the `render` method:

```javascript
const email = await renderer.render("welcome", {
  user: {
    firstName: "John",
    pets: [
      {
        name: "Beethoven",
        dog: true,
      },
      {
        name: "Garfield",
        dog: false,
      },
    ],
  },
});
```

You can pass data in the following way into layouts and partials:

```handlebars
<!-- views/welcome.hbs: -->

<h1>Welcome, {{user.firstName}}</h1>
```

Yous can use some expression that is part of the Handlebars language itself:

```handlebars
<!-- views/welcome.hbs: -->

<h1>Welcome, {{user.firstName}}</h1>
{{#each user.pets}}
  <p>
    Your pet is named
    {{user.pets.name}}
    {{#if user.pets.dog}}
      , it is a dog!
    {{/if}}
  </p>
{{/each}}
```

Helpers can be used to implement functionality that is not part of the Handlebars language itself
A helper can be registered at runtime via Handlebars.registerHelper, for example in order to uppercase all characters of a string.

```javascript
const renderer = new HandlebarsEmailRenderer({
  helpers: {
    toUppercase: (text) => {
      return text.toUpperCase();
    },
  },
});
```

```handlebars
<!-- views/welcome.hbs: -->

<h1>Welcome, {{toUppercase user.firstName}}</h1>
```

for more information on expressions, see [handlbars expressions](https://handlebarsjs.com/guide/expressions.html#basic-usage).

**Partials:**

Directory Structure:

```bash
# With partials and subfolder of partials
.
├── views
│   ├── layouts
│   │   └── main.hbs
│   ├── partials
│   │   ├── components
│   │   │   └── button.hbs
│   │   ├── end.hbs
│   │   ├── head.hbs
│   │   └── navbar.hbs
│   └── welcome.hbs

4 directories, 6 files
```

In this architecture, we add:

- a `partials` folder to organize the different components to reuse in your layouts and/or in your views.
- one or more `partials` subfolders, to help structure your components.
- several `*.hbs` files containing your components (one file = one partial).

For use a partial on layout (or on view):

```handlebars
<!-- views/layout/main.hbs: -->
{{> head }}

{{{ body }}}

{{> end }}
```

```handlebars
<!-- views/partials/head.hbs: -->
<html>
  <head>
    <meta charset="utf-8" />
    <title>Example Email</title>
  </head>
  <body>
```

```handlebars
<!-- views/partials/end.hbs: -->
  </body>
</html>
```

You can pass data to your component (partial) in the following way:

```handlebars
<!-- views/welcome.hbs: -->

<h1>Welcome, user</h1>
{{> components/button text='Click here!' link='https://github.com/handlebars-email-renderer/handlebars-email-renderer'}}
```

```handlebars
<!-- views/partials/components/button.hbs: -->

<a href="{{link}}">{{text}}</a>
```

for more information on partials, see [handlbars partials](https://handlebarsjs.com/guide/partials.html#basic-partials).

**More:**

For more information on advanced handlebars features read [handlebars documentation](https://handlebarsjs.com/guide/).

For more information on how to use HandlebarsEmailRenderer, please refer to the [API documentation](docs/API.md).

## Contributing

Contributions are welcome! If you find a bug or want to suggest a new feature, please open an issue on the GitHub repository.

Before submitting a pull request, please make sure that your changes are consistent with the code style of the project, and that all tests pass. To run the tests, use the following command:

```bash
npm test
```

## Acknowledgments

We would like to thank the team who created and maintains the Handlebars.js package on which this module is entirely based. We also express our gratitude to the contributors of Express Handlebars who have greatly inspired this module and have been a great help to us in many projects.

## License

HandlebarsEmailRenderer is licensed under the [MIT License](LICENSE).

## Donation

If you have found my work useful and would like to support me, you can donate via PayPal or Bitcoin. Thank you in advance for your support!

### PayPal

[![paypal](https://img.shields.io/badge/Donate-PayPal-blue?style=for-the-badge&logo=paypal)](https://www.paypal.com/paypalme/ensembleCS)

### Bitcoin

[![bitcoin](https://img.shields.io/badge/Bitcoin-Donate-blue?style=for-the-badge&logo=bitcoin&logoColor=white&label=Donate&color=FF9900)](https://www.moonpay.com/)

1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2
