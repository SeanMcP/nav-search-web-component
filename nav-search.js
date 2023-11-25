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

    // Store option data internally
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

    const template = this.querySelector("template");
    // Should we ever update this value?
    const templateHTML = template?.innerHTML.trim();

    const navElement = document.createElement("nav");
    this.appendChild(navElement);

    inputElement.addEventListener(
      "input",
      debounce((e) => {
        const query = e.target.value.toLowerCase();
        if (query.length === 0) {
          navElement.textContent = "";
          return;
        }

        let html = "";

        this._options.forEach((option) => {
          if (option.search.includes(query)) {
            html += this.buildResultMarkup(option, templateHTML);
          }
        });

        navElement.innerHTML = html;
      }, 300)
    );
  }

  /**
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
