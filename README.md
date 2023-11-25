# Nav Search Web Component

<div style="background:black;color:white;text-align:center">

**🚧 This component is currently under construction 🚧**

</div>

🧭 A web component for searching and navigating links

## Overview

This web component starts with a search input child and a datalist and adds all
of the logic to render a searchable list of links.

- 🛠️ Customizable template
- ⛹️‍♀️ Debounced searching

## Installation

Download the [`nav-search.js`](nav-search.js) file and add it to your project,
then define the custom element in your JavaScript file:

```js
import NavSearch from "./path/to/nav-search.js";

customElements.define(...NavSearch);
```

By default, the tag name is `nav-search`. If you would like to use a different
tag name, you can import the web-component class directly and use your own:

```js
import { NavSearch } from "./path/to/nav-search.js";

customElements.define("your-custom-tag-name", NavSearch);
```

## Usage

### Basic

Wrap the web component around an `input[type=search]` element, and add a linked
`datalist` element:

```html
<datalist id="pages">
  <option value="/about">About the company</option>
  <option value="/contact">Contact us</option>
  <option value="/products">Our products</option>
</datalist>

<nav-search>
  <input aria-label="search our site" type="search" list="pages" />
</nav-search>
```

Without additional configuration, the web component will render a list of links
that correspond to each option in the `datalist`:

```html
<a href="option.value">option.label</a>
```

### Templating

To customize the markup, you can provide a `template` element with a single `a`
element inside. Using `%PROPERTY%` syntax, you can interpolate data from each
option into your template, including `[data-*]` attributes:

```html
<datalist id="products">
  <option value="/notepads">Notebooks</option>
  <option value="/pencils" data-highlight="🌟">Pencils</option>
  <option value="/pens">Pens</option>
</datalist>

<nav-search>
  <input aria-label="search our site" type="search" list="products" />
  <template>
    <a class="search-option" href="%value%">%label% %data.highlight%</a>
  </template>
</nav-search>
```

The above template will result in the following markup:

```html
<nav>
  <a href="/notepads">Notepads</a>
  <a href="/pencils">Pencils 🌟</a>
  <a href="/pens">Pens</a>
</nav>
```

## License

MIT
