// This file contains tests for the HandlebarsEmailRenderer class

// Import the necessary packages
import "mocha";
import assert from "assert";
import HandlebarsEmailRenderer from "../lib/esm/index.mjs";
import fs, { readFileSync } from "fs";
import util from "util";
import path from "path";

// Define the views path
const viewsPath = {
  viewsPath: path.join(path.resolve("./"), "test", "fixtures", "views"),
};

// Define the read file function
const readFile = util.promisify(fs.readFile);

// Start the tests for the HandlebarsEmailRenderer class
describe("HandlebarsEmailRenderer", () => {
  // Test the constructor function
  describe("constructor", () => {

    // Test that a new instance of HandlebarsEmailRenderer is created successfully
    it("should create a new instance of HandlebarsEmailRenderer", () => {
      const mailRenderer = new HandlebarsEmailRenderer();
      assert(mailRenderer instanceof HandlebarsEmailRenderer);
    });

    // Test that an error is thrown if the viewsPath argument is not a string
    it("should throw an error if the viewsPath argument is not a string", async () => {
      await assert.rejects(
        async () => new HandlebarsEmailRenderer({ viewsPath: 123 }),
        {
          name: "Error",
          message:
            'The "viewsPath" argument must be a string. Received an argument of type "number".',
        }
      );
    });

    // Test that an error is thrown if the helpers argument is not an object or undefined
    it("should throw an error if the helpers argument is not an object or undefined", async () => {
      await assert.rejects(
        async () => new HandlebarsEmailRenderer({ ...viewsPath, helpers: 'is string' }),
        {
          name: "Error",
          message:
            'The "helpers" argument must be an object. Received an argument of type "string".',
        }
      );
    });

    // Test that an error is thrown if the helpers argument is not an object with function
    it("should throw an error if the helpers argument is not an object with a function", async () => {
      await assert.rejects(
        async () => new HandlebarsEmailRenderer({
          ...viewsPath,
          helpers: {
            noFunctionHelper: 'is string'
          },
        }),
        {
          name: "Error",
          message:
            'The "helpers.noFunctionHelper" argument must be a function. Received an argument of type "string".',
        }
      );
    });
  });

  // Test the render function
  describe("render", () => {

    // Test that an error is thrown if views path does not exist
    it("should throw an error if views path not exist", async () => {
      const view = "welcome";
      const options = {
        username: "John",
      };

      // Create a new instance of HandlebarsEmailRenderer with a non-existent views path
      const mailRenderer = new HandlebarsEmailRenderer({ viewsPath: path.join(path.resolve("./"), "test", "fixtures", "no_existant_view_path") });
      await assert.rejects(
        async () => await mailRenderer.render(view, options),
        {
          name: "Error",
          message: `ENOENT: no such file or directory, stat '${mailRenderer.viewsPath}'`,
        }
      );
    });

    // Test to check if an error is thrown when the layout path doesn't exist.
    it("should throw an error if layout path not exist", async () => {
      const view = "welcome";
      const options = {
        username: "John",
      };

      const mailRenderer = new HandlebarsEmailRenderer({ viewsPath: path.join(path.resolve("./"), "test", "fixtures", "views_with_no_layouts_path") });

      await assert.rejects(
        async () => await mailRenderer.render(view, options),
        {
          name: "Error",
          message: `ENOENT: no such file or directory, open '${path.join(mailRenderer.viewsPath, "layouts", "main.hbs")}'`,
        }
      );
    });

    // Test to check if an email template is rendered with the default layout.
    it("should render an email template with default layout", async () => {
      const view = "welcome";
      const options = {
        username: "John",
      };
      const expectedRenderedEmail = await readFile(
        "./test/fixtures/expected_welcome_email_with_layout.html",
        "utf-8"
      );

      const mailRenderer = new HandlebarsEmailRenderer(viewsPath);
      const renderedEmail = await mailRenderer.render(view, options);
      assert.strictEqual(renderedEmail, expectedRenderedEmail);
    });

    // Test to check if an email template is rendered with a specific layout.
    it("should render an email template with specific layout", async () => {
      const view = "welcome";
      const options = {
        layout: "admin",
        username: "John"
      };
      const expectedRenderedEmail = await readFile(
        "./test/fixtures/expected_welcome_email_with_admin_layout.html",
        "utf-8"
      );

      const mailRenderer = new HandlebarsEmailRenderer(viewsPath);
      const renderedEmail = await mailRenderer.render(view, options);
      assert.strictEqual(renderedEmail, expectedRenderedEmail);
    });

    // Test to check if an error is thrown when the default layout file doesn't exist.
    it("should throw an error if default layout no exist", async () => {
      const view = "welcome";
      const options = {
        username: "John",
      };
      const mailRenderer = new HandlebarsEmailRenderer({
        viewsPath: path.join(path.resolve("./"), "test", "fixtures", "views_with_no_layouts_main_file"),
      });

      await assert.rejects(
        async () => await mailRenderer.render(view, options),
        {
          name: "Error",
          message: `ENOENT: no such file or directory, open '${mailRenderer.viewsPath}/layouts/main.hbs'`,
        }
      );
    });

    // Test to check if an error is thrown when the layout argument is not a string.
    it("should throw an error if the layout argument is not a string", async () => {
      const view = 'welcome';
      const options = {
        layout: 123,
        username: "John",
      };
      const mailRenderer = new HandlebarsEmailRenderer(viewsPath);

      await assert.rejects(
        async () => await mailRenderer.render(view, options),
        {
          name: "Error",
          message: `ENOENT: no such file or directory, open '${mailRenderer.viewsPath}/layouts/123.hbs'`,
        }
      );
    });

    // Test to check if an error is thrown when the default custom layout file doesn't exist.
    it("should throw an error if custom layout no exist", async () => {
      const view = "welcome";
      const options = {
        layout: "non_existent_layout",
        username: "John",
      };
      const mailRenderer = new HandlebarsEmailRenderer(viewsPath);

      await assert.rejects(
        async () => await mailRenderer.render(view, options),
        {
          name: "Error",
          message: `ENOENT: no such file or directory, open '${mailRenderer.viewsPath}/layouts/non_existent_layout.hbs'`,
        }
      );
    });

    // Test to check if an error is thrown when the view argument is not a string.
    it("should throw an error if the view argument is not a string", async () => {
      const view = 123;
      const options = {
        username: "John",
      };
      const mailRenderer = new HandlebarsEmailRenderer(viewsPath);

      await assert.rejects(
        async () => await mailRenderer.render(view, options),
        {
          name: "Error",
          message:
            'The "view" argument must be a string. Received an argument of type "number".',
        }
      );
    });

    // Test to check if an error is thrown when the email template file doesn't exist.
    it("should throw an error if the email template file does not exist", async () => {
      const view = "non_existent_template";
      const options = {
        username: "John",
      };
      const mailRenderer = new HandlebarsEmailRenderer(viewsPath);

      await assert.rejects(
        async () => await mailRenderer.render(view, options),
        {
          name: "Error",
          message: `ENOENT: no such file or directory, open '${mailRenderer.viewsPath}/non_existent_template.hbs'`,
        }
      );
    });

    // Test to check if an email template is rendered with helper.
    it("should render an email template with helper", async () => {
      const view = "helper";
      const options = {
        username: "John",
      };
      const expectedRenderedEmail = await readFile(
        "./test/fixtures/expected_existent_helper.html",
        "utf-8"
      );

      const mailRenderer = new HandlebarsEmailRenderer({
        ...viewsPath,
        helpers: {
          toUppercase: (text) => {
            if (typeof text === 'string' || text instanceof String)
              return text.toUpperCase();
            else return;
          },
        },
      });

      const renderedEmail = await mailRenderer.render(view, options);
      // console.log(renderedEmail)
      assert.strictEqual(renderedEmail, expectedRenderedEmail);
    });

    // Test to check if an error is thrown when the helper called on views doesn't exist.
    it("should throw an error if the helper does not exist", async () => {
      const view = "unknow_helper";
      const options = {
        username: "John",
      };

      const mailRenderer = new HandlebarsEmailRenderer(viewsPath);

      await assert.rejects(
        async () => await mailRenderer.render(view, options),
        {
          name: "Error",
          message: `Missing helper: "unknowHelper"`,
        }
      );
    });
  });

  // Tests for the renderSync method
  describe("renderSync", () => {

    // Test that an error is thrown if views path does not exist
    it("should throw an error if views path not exist", async () => {
      const view = "welcome";
      const options = {
        username: "John",
      };

      // Create a new instance of HandlebarsEmailRenderer with a non-existent views path
      const mailRenderer = new HandlebarsEmailRenderer({ viewsPath: path.join(path.resolve("./"), "test", "fixtures", "no_existant_view_path") });
      await assert.rejects(
        async () => mailRenderer.renderSync(view, options),
        {
          name: "Error",
          message: `The viewsPath "${mailRenderer.viewsPath}" does not exist.`,
        }
      );
    });

    // Test to check if an error is thrown when the layout path doesn't exist.
    it("should throw an error if layout path not exist", async () => {
      const view = "welcome";
      const options = {
        username: "John",
      };

      const mailRenderer = new HandlebarsEmailRenderer({ viewsPath: path.join(path.resolve("./"), "test", "fixtures", "views_with_no_layouts_path") });

      await assert.rejects(
        async () => mailRenderer.renderSync(view, options),
        {
          name: "Error",
          message: `ENOENT: no such file or directory, open '${path.join(mailRenderer.viewsPath, "layouts", "main.hbs")}'`,
        }
      );
    });

    // Test to check if an email template is rendered with the default layout.
    it("should render an email template with default layout", () => {
      const view = "welcome";
      const options = {
        username: "John",
      };
      const expectedRenderedEmail = readFileSync(
        "./test/fixtures/expected_welcome_email_with_layout.html",
        "utf-8"
      );

      const mailRenderer = new HandlebarsEmailRenderer(viewsPath);
      const renderedEmail = mailRenderer.renderSync(view, options);

      assert.strictEqual(renderedEmail, expectedRenderedEmail);
    });

    // Test to check if an email template is rendered with a specific layout.
    it("should render an email template with specific layout", () => {
      const view = "welcome";
      const options = {
        layout: "admin",
        username: "John"
      };
      const expectedRenderedEmail = readFileSync(
        "./test/fixtures/expected_welcome_email_with_admin_layout.html",
        "utf-8"
      );

      const mailRenderer = new HandlebarsEmailRenderer(viewsPath);
      const renderedEmail = mailRenderer.renderSync(view, options);
      assert.strictEqual(renderedEmail, expectedRenderedEmail);
    });

    // Test to check if an error is thrown when the default layout file doesn't exist.
    it("should throw an error if default layout no exist", async () => {
      const view = "welcome";
      const options = {
        username: "John",
      };
      const mailRenderer = new HandlebarsEmailRenderer({
        viewsPath: path.join(path.resolve("./"), "test", "fixtures", "views_with_no_layouts_main_file"),
      });

      await assert.rejects(
        async () => mailRenderer.renderSync(view, options),
        {
          name: "Error",
          message: `ENOENT: no such file or directory, open '${mailRenderer.viewsPath}/layouts/main.hbs'`,
        }
      );
    });

    // Test to check if an error is thrown when the layout argument is not a string.
    it("should throw an error if the layout argument is not a string", async () => {
      const view = 'welcome';
      const options = {
        layout: 123,
        username: "John",
      };
      const mailRenderer = new HandlebarsEmailRenderer(viewsPath);

      await assert.rejects(
        async () => mailRenderer.renderSync(view, options),
        {
          name: "Error",
          message: `ENOENT: no such file or directory, open '${mailRenderer.viewsPath}/layouts/123.hbs'`,
        }
      );
    });

    // Test to check if an error is thrown when the default custom layout file doesn't exist.
    it("should throw an error if custom layout no exist", async () => {
      const view = "welcome";
      const options = {
        layout: "non_existent_layout",
        username: "John",
      };
      const mailRenderer = new HandlebarsEmailRenderer(viewsPath);

      await assert.rejects(
        async () => mailRenderer.renderSync(view, options),
        {
          name: "Error",
          message: `ENOENT: no such file or directory, open '${mailRenderer.viewsPath}/layouts/non_existent_layout.hbs'`,
        }
      );
    });

    // Test to check if an error is thrown when the view argument is not a string.
    it("should throw an error if the view argument is not a string", async () => {
      const view = 123;
      const options = {
        username: "John",
      };
      const mailRenderer = new HandlebarsEmailRenderer(viewsPath);

      await assert.rejects(
        async () => mailRenderer.renderSync(view, options),
        {
          name: "Error",
          message:
            'The "view" argument must be a string. Received an argument of type "number".',
        }
      );
    });

    // Test to check if an error is thrown when the email template file doesn't exist.
    it("should throw an error if the email template file does not exist", async () => {
      const view = "non_existent_template";
      const options = {
        username: "John",
      };
      const mailRenderer = new HandlebarsEmailRenderer(viewsPath);

      await assert.rejects(
        async () => mailRenderer.renderSync(view, options),
        {
          name: "Error",
          message: `ENOENT: no such file or directory, open '${mailRenderer.viewsPath}/non_existent_template.hbs'`,
        }
      );
    });

    // Test to check if an email template is rendered with helper.
    it("should render an email template with helper", () => {
      const view = "helper";
      const options = {
        username: "John",
      };
      const expectedRenderedEmail = readFileSync(
        "./test/fixtures/expected_existent_helper.html",
        "utf-8"
      );

      const mailRenderer = new HandlebarsEmailRenderer({
        ...viewsPath,
        helpers: {
          toUppercase: (text) => {
            if (typeof text === 'string' || text instanceof String)
              return text.toUpperCase();
            else return;
          },
        },
      });

      const renderedEmail = mailRenderer.renderSync(view, options);

      assert.strictEqual(renderedEmail, expectedRenderedEmail);
    });

    // Test to check if an error is thrown when the helper called on views doesn't exist.
    it("should throw an error if the helper does not exist", async () => {
      const view = "unknow_helper";
      const options = {
        username: "John",
      };

      const mailRenderer = new HandlebarsEmailRenderer(viewsPath);

      await assert.rejects(
        async () => mailRenderer.renderSync(view, options),
        {
          name: "Error",
          message: `Missing helper: "unknowHelper"`,
        }
      );
    });

  });

  // Tests for the registerHelper method
  describe("registerHelper", () => {
    // Test that a new helper is registered successfully
    it("should register a new helper", async () => {
      const mailRenderer = new HandlebarsEmailRenderer(viewsPath);
      const helperName = "greet";
      const helperFn = function (name) {
        return `Hello, ${name}!`;
      };

      const expectedRenderedEmail = await readFile(
        "./test/fixtures/expected_greet_helper.html",
        "utf-8"
      );

      mailRenderer.registerHelper(helperName, helperFn);
      const renderedEmail = await mailRenderer.render("greet_helper", { username: "John" });

      assert.strictEqual(renderedEmail.trim(), expectedRenderedEmail);
    });

    // Test that an error is thrown if the helper name argument is not a string
    it("should throw an error if the helper name argument is not a string", async () => {
      const mailRenderer = new HandlebarsEmailRenderer(viewsPath);
      const helperFn = function (name) {
        return `Hello, ${name}!`;
      };
      await assert.rejects(
        async () => mailRenderer.registerHelper(123, helperFn),
        {
          name: "Error",
          message: 'The "name" argument must be a string. Received an argument of type "number".',
        }
      );
    });

    // Test that an error is thrown if the helper function argument is not a function
    it("should throw an error if the helper function argument is not a function", async () => {
      const mailRenderer = new HandlebarsEmailRenderer(viewsPath);
      const helperName = "greet";
      const invalidHelperFn = "not a function";
      await assert.rejects(
        async () => mailRenderer.registerHelper(helperName, invalidHelperFn),
        {
          name: "Error",
          message: 'The "fn" argument must be a function. Received an argument of type "string".',
        }
      );
    });
  });

  // Tests for the registerHelpers method
  describe("registerHelpers", () => {

    // Test that helpers can be registered
    it("should register helpers", async () => {
      const view = "helper";
      const options = {
        username: "John",
      };
      const expectedRenderedEmail = await readFile(
        "./test/fixtures/expected_existent_helper.html",
        "utf-8"
      );

      const mailRenderer = new HandlebarsEmailRenderer(viewsPath);

      mailRenderer.registerHelpers({
        toUppercase: (text) => {
          if (typeof text === 'string' || text instanceof String)
            return text.toUpperCase();
          else return;
        }
      });

      const renderedEmail = await mailRenderer.render(view, options);
      assert.strictEqual(renderedEmail, expectedRenderedEmail);
    });

    // Test that helpers can be registered multiple times
    it("should register helpers multiple times", async () => {
      const view = "helper";
      const options = {
        username: "John",
      };
      const expectedRenderedEmail = await readFile(
        "./test/fixtures/expected_existent_helper.html",
        "utf-8"
      );

      const mailRenderer = new HandlebarsEmailRenderer(viewsPath);

      mailRenderer.registerHelpers({
        toUppercase: (text) => {
          if (typeof text === 'string' || text instanceof String)
            return text.toUpperCase();
          else return;
        }
      });

      mailRenderer.registerHelpers({
        toLowercase: (text) => {
          if (typeof text === 'string' || text instanceof String)
            return text.toLowerCase();
          else return;
        }
      });

      const renderedEmail = await mailRenderer.render(view, options);
      assert.strictEqual(renderedEmail, expectedRenderedEmail);
    });

    // Test that an error is thrown if helpers is not an object
    it("should throw an error if helpers is not an object", async () => {
      const mailRenderer = new HandlebarsEmailRenderer(viewsPath);

      await assert.rejects(
        async () => mailRenderer.registerHelpers("not an object"),
        {
          name: "Error",
          message: 'The "helpers" argument must be an object. Received an argument of type "string".',
        }
      );
    });

  });

});
