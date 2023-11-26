// Copyright 2023 Sean McPherson
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the “Software”), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

export class NavSearch extends HTMLElement {
  // version: 0.0.1

  /**
   * @typedef {{data: Object, label: string, search: string, value: string}} Option
   * @type {Array<Option>}
   */
  _options = [];
  /** @type {string} */
  _uuid = "";

  constructor() {
    super();

    this._uuid =
      "crypto" in window
        ? window.crypto.randomUUID()
        : Math.random().toString(36).substring(2, 15);
  }

  connectedCallback() {
    const inputElement = this.querySelector("input[type=search]");

    // No input, then no searching
    if (!inputElement) {
      return console.debug("Could not find input[type=search]");
    }

    const datalistElement = document.querySelector(
      `datalist#${inputElement.getAttribute("list")}`
    );

    // No datalist, then no data
    if (!datalistElement) {
      return console.debug("Could not find datalist element");
    }

    inputElement.dataset.oldList = inputElement.getAttribute("list");
    inputElement.removeAttribute("list");
    inputElement.setAttribute("aria-controls", this._uuid);
    inputElement.setAttribute("aria-expanded", "false");

    this.buildOptionsData(datalistElement);

    const template = this.querySelector("template");
    // Should we ever update this value?
    const templateHTML = template?.innerHTML.trim();

    const navElement = document.createElement("nav");
    navElement.setAttribute("id", this._uuid);
    this.appendChild(navElement);

    inputElement.addEventListener(
      "input",
      this.getHandleInput(inputElement, navElement, templateHTML)
    );

    this.addEventListener(
      "keydown",
      this.getHandleKeydown(inputElement, navElement)
    );
  }

  /**
   * Converts option markup from datalistElement to internal data structure
   * @param {HTMLDataListElement} datalistElement
   */
  buildOptionsData(datalistElement) {
    datalistElement.querySelectorAll("option").forEach((option) => {
      const value = option.value;
      const label = option.label || option.textContent;

      this._options.push({
        data: option.dataset || {},
        label,
        search: (value + "\n" + label).toLowerCase(),
        value,
      });
    });
  }

  /**
   * Builds the HTML markup for a single search result
   * @param {Option} option
   * @param {(string|undefined)} templateHTML
   * @returns string
   */
  buildResultMarkup(option, templateHTML) {
    if (templateHTML) {
      return templateHTML
        .replace(/%value%/g, option.value)
        .replace(/%label%/g, option.label)
        .replace(/%data\.(.*)%/g, (_, match) => {
          // TODO: Handle kebab to camelCase
          if (option.data.hasOwnProperty(match)) {
            return option.data[match];
          }
          return "";
        });
    }
    return `<a href=${option.value}>${option.label}</a>`;
  }

  /**
   * Creates a debounced input event handler for inputElement
   * @param {HTMLInputElement} inputElement
   * @param {HTMLElement} navElement
   * @param {string | undefined} templateHTML
   * @returns {function(KeyboardEvent): void} Input event handler
   */
  getHandleInput(inputElement, navElement, templateHTML) {
    return debounce((e) => {
      const query = e.target.value.toLowerCase();

      if (query.length === 0) {
        inputElement.setAttribute("aria-expanded", "false");
        navElement.textContent = "";
        return;
      }

      let html = "";

      this._options.forEach((option) => {
        if (option.search.includes(query)) {
          html += this.buildResultMarkup(option, templateHTML);
        }
      });

      if (html.length > 0) {
        inputElement.setAttribute("aria-expanded", "true");
      }

      navElement.innerHTML = html;
    }, 300);
  }

  /**
   * Creates a keydown event handler for the :host element
   * @param {HTMLInputElement} inputElement
   * @param {HTMLElement} navElement
   * @returns {function(KeyboardEvent): void} Keypress event handler
   */
  getHandleKeydown(inputElement, navElement) {
    return (e) => {
      if (e.target === inputElement) {
        switch (e.key) {
          case "ArrowDown": {
            e.preventDefault();
            const firstChild = navElement.firstElementChild;
            if (firstChild) {
              firstChild.focus();
            }
            break;
          }
          case "Escape": {
            e.preventDefault();
            inputElement.setAttribute("aria-expanded", "false");
            inputElement.value = "";
            navElement.textContent = "";
            break;
          }
        }
      }

      if (navElement.contains(e.target)) {
        switch (e.key) {
          case "ArrowDown": {
            e.preventDefault();
            const nextSibling = e.target.nextElementSibling;
            if (nextSibling) {
              nextSibling.focus();
            }
            break;
          }
          case "ArrowUp": {
            e.preventDefault();
            const previousSibling = e.target.previousElementSibling;
            if (previousSibling) {
              previousSibling.focus();
            }
            break;
          }
          case "Escape": {
            e.preventDefault();
            inputElement.focus();
            inputElement.setAttribute("aria-expanded", "false");
            navElement.textContent = "";
            break;
          }
          case "Space": {
            e.preventDefault();
            e.target.click();
            break;
          }
        }
      }
    };
  }
}

export default ["nav-search", NavSearch];

function debounce(func, wait) {
  let timeout;

  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
