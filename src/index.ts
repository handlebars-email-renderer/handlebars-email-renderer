/**
 * @file HandlebarsEmailRenderer
 *
 * This class is used to render email templates using Handlebars.js.
 *
 * @author Xavier Loué
 */

// Import required modules
import fs, { promises as fsPromises } from "fs";
import path from "path";
import Handlebars from "handlebars";
// FIXME: deasync
import { runLoopOnce } from "deasync";

interface HandlebarsEmailRendererOptions {
  viewsPath?: string;
  helpers?: Record<string, Handlebars.HelperDelegate>;
}

/**
 * HandlebarsEmailRenderer is a class that is used to render email templates using Handlebars.js.
 *
 * @class
 */
export class HandlebarsEmailRenderer {
  private isBuilt = false;
  private buildPromiseResolve!: () => void;
  private buildPromise: Promise<void>;
  viewsPath: string;
  helpers: Record<string, Handlebars.HelperDelegate> | undefined;

  /**
   * Creates an instance of HandlebarsEmailRenderer.
   *
   * @constructor
   * @param {object} [options={}] - An object containing options for the renderer.
   * @param {string} [options.viewsPath='./views'] - The path to the folder containing email templates.
   * @param {object} [options.helpers] - An object containing Handlebars helpers.
   */
  constructor(options: HandlebarsEmailRendererOptions = {}) {
    // Set default options if none are provided
    const { viewsPath = "./views", helpers } = options;

    // Validate the viewsPath option
    if (typeof viewsPath !== "string") {
      throw new Error(
        `The "viewsPath" argument must be a string. Received an argument of type "${typeof viewsPath}".`
      );
    }

    // Validate the helpers option
    if (
      (typeof helpers !== "undefined" && typeof helpers !== "object") ||
      Array.isArray(helpers) ||
      helpers === null
    ) {
      throw new Error(
        `The "helpers" argument must be an object. Received an argument of type "${typeof helpers}".`
      );
    } else {
      for (const helper in helpers) {
        if (typeof helpers[helper] !== "function") {
          throw new Error(
            'The "helpers.' +
              helper +
              '" argument must be a function. Received an argument of type "' +
              typeof helpers[helper] +
              '".'
          );
        }
      }
    }

    this.helpers = helpers;
    this.viewsPath = viewsPath;
    // Initialize state variables
    this.buildPromise = new Promise<void>((resolve) => {
      this.buildPromiseResolve = resolve;
    });
    // FIXME: build is for Sync method, but "await" for instantiation of the class is most safe (if error on build, waiting indefinitely on render)
    // Build the renderer
    this.build();
  }

  /**
   * A private method that builds the HandlebarsEmailRenderer instance by registering partials and helpers.
   *
   * @private
   * @returns {Promise} - A promise that resolves when the build process is complete.
   */
  private async build(): Promise<void> {
    // Register all partials and helpers
    await this.registerPartials();
    if (typeof this.helpers !== "undefined") this.registerHelpers(this.helpers);
    // Set the built flag and resolve the build promise
    this.isBuilt = true;
    this.buildPromiseResolve();
  }

  /**
   * A private method that registers all partials in the partials folder on build.
   *
   * @private
   * @returns {Promise} - A promise that resolves when all partials have been registered.
   */
  private async registerPartials(): Promise<void> {
    // Get the path to the partials folder
    const partialsPath = path.join(path.resolve(this.viewsPath), "partials");
    // Recursively register all partials in the partials folder
    await this.registerPartialsRecursive(partialsPath, partialsPath);
  }

  /**
   * A private method that registers all partials in the given folder and its subfolders.
   *
   * @private
   * @param {string} basePath - The base path of the partials folder.
   * @param {string} currentPath - The current path of the folder being processed.
   * @returns {Promise} - A promise that resolves when all partials in the current folder have been registered.
   */
  private async registerPartialsRecursive(
    basePath: string,
    currentPath: string
  ): Promise<void> {
    // Get a list of files in the current folder
    const files = await fsPromises.readdir(currentPath, {
      withFileTypes: true,
    });
    // Loop through the files and register any partials found
    for await (const file of files) {
      const filePath = path.join(currentPath, file.name);
      if (file.isFile() && file.name.endsWith(".hbs")) {
        const partialName = path.relative(
          basePath,
          filePath.replace(/\.hbs$/, "")
        );
        // Register the partial if it hasn't already been registered, or replace it
        if (Handlebars.partials[partialName])
          Handlebars.unregisterPartial(partialName);
        const rawPartial = await fsPromises.readFile(filePath, "utf-8");
        Handlebars.registerPartial(partialName, rawPartial);
      }
      // If the file is a directory, recurse into it to register more partials
      if (file.isDirectory()) {
        await this.registerPartialsRecursive(basePath, filePath);
      }
    }
  }

  /**
   * A method that registers an helper.
   *
   * @param {string} name - The name for calling the helper.
   * @param {Handlebars.HelperDelegate} fn - The function to execute when helper is call.
   * @returns {Void}
   */
  registerHelper(name: string, fn: Handlebars.HelperDelegate): void {
    // Validate the name option
    if (typeof name !== "string") {
      throw new Error(
        `The "name" argument must be a string. Received an argument of type "${typeof name}".`
      );
    }
    // Validate the fn
    if (typeof fn !== "function") {
      throw new Error(
        `The "fn" argument must be a function. Received an argument of type "${typeof fn}".`
      );
    }

    if (Handlebars.helpers[name]) Handlebars.unregisterHelper(name);
    Handlebars.registerHelper(name, fn);
  }

  /**
   * A method that registers all helpers specified in the options object.
   *
   * @param {Record<string, Handlebars.HelperDelegate>} helpers - The object contain helpers.
   * @returns {Void}
   */
  registerHelpers(helpers: Record<string, Handlebars.HelperDelegate>): void {
    // Validate the helpers option
    if (
      (typeof helpers !== "undefined" && typeof helpers !== "object") ||
      Array.isArray(helpers) ||
      helpers === null
    ) {
      throw new Error(
        `The "helpers" argument must be an object. Received an argument of type "${typeof helpers}".`
      );
    } else {
      for (const helper in helpers) {
        if (typeof helpers[helper] !== "function") {
          throw new Error(
            'The "helpers.' +
              helper +
              '" argument must be a function. Received an argument of type "' +
              typeof helpers[helper] +
              '".'
          );
        }
      }
    }

    Object.entries(helpers).forEach(([key, value]) => {
      if (Handlebars.helpers[key]) Handlebars.unregisterHelper(key);
      Handlebars.registerHelper(key, value);
    });
  }

  /**
   * A private method that waits until the renderer is built before resolving.
   *
   * @private
   * @returns {Promise} - A promise that resolves when the renderer has been built.
   */
  private async waitBuilt(): Promise<void> {
    await this.buildPromise;
  }

  /**
   * A private method that synchronous wait for the renderer to be built.
   *
   * @private
   * @returns {void} - Return when the renderer has been built.
   */
  private waitBuiltSync(): void {
    // Loop until the renderer is built
    while (!this.isBuilt) {
      // FIXME: prevent FATAL ERROR: JavaScript heap out of memory
      runLoopOnce();
      setTimeout(() => {
        // This line is just to prevent the loop from freezing
      }, 50);
    }
  }

  /**
   * Renders an email template using the provided options.
   *
   * @param {string} view - The name of the email template to render.
   * @param {object} [options={}] - An object containing options to use when rendering the template.
   * @param {string} [options.layout='main'] - The name of the layout template to use.
   * @returns {Promise<string>} - A promise that resolves with the rendered email.
   */
  async render(
    view: string,
    options: Record<string, unknown> = {}
  ): Promise<string> {
    // Check if viewsPath exist (if no exist: infinity build)
    await fsPromises.stat(path.resolve(this.viewsPath));

    // Wait for the renderer to be built before rendering the email
    await this.waitBuilt();

    // Set the default layout if none is provided
    options.layout = options.layout ?? "main";

    // Validate the view argument
    if (typeof view !== "string") {
      throw new Error(
        `The "view" argument must be a string. Received an argument of type "${typeof view}".`
      );
    }

    // Read the layout and template files
    const layoutContent = await fsPromises.readFile(
      path.join(path.resolve(this.viewsPath), `layouts/${options.layout}.hbs`),
      "utf-8"
    );
    const templateContent = await fsPromises.readFile(
      path.join(path.resolve(this.viewsPath), `${view}.hbs`),
      "utf-8"
    );
    // Compile the layout and template
    const layout = Handlebars.compile(layoutContent);
    const template = Handlebars.compile(templateContent);

    // Render the template and layout
    const body = template(options);
    return layout({
      ...options,
      body,
    });
  }

  /**
   * Renders an email template using the provided options, using a synchronous loop to wait for the renderer to be built.
   *
   * @param {string} view - The name of the email template to render.
   * @param {object} [options={}] - An object containing options to use when rendering the template.
   * @param {string} [options.layout='main'] - The name of the layout template to use.
   * @returns {string} - The rendered email.
   */
  renderSync(view: string, options: Record<string, unknown> = {}): string {
    // Check if viewsPath exist (if no exist: infinity build)
    if (!fs.existsSync(path.resolve(this.viewsPath))) {
      throw new Error(`The viewsPath "${this.viewsPath}" does not exist.`);
    }

    // Wait for the renderer to be built before rendering the email
    this.waitBuiltSync();

    // Set the default layout if none is provided
    options.layout = options.layout ?? "main";

    // Validate the view argument
    if (typeof view !== "string") {
      throw new Error(
        `The "view" argument must be a string. Received an argument of type "${typeof view}".`
      );
    }

    // Read the layout and template files
    const layoutContent = fs.readFileSync(
      path.join(path.resolve(this.viewsPath), `layouts/${options.layout}.hbs`),
      "utf-8"
    );
    const templateContent = fs.readFileSync(
      path.join(path.resolve(this.viewsPath), `${view}.hbs`),
      "utf-8"
    );
    // Compile the layout and template
    const layout = Handlebars.compile(layoutContent);
    const template = Handlebars.compile(templateContent);

    // Render the template and layout
    const body = template(options);
    return layout({
      ...options,
      body: body,
    });
  }
}
