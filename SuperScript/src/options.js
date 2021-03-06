/*
Copyright (c) 2020 Guillaume Ryder

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

'use strict';

const lib = chrome.extension.getBackgroundPage();

const REGEXPS_SEPARATOR = '\n';

document.addEventListener('DOMContentLoaded', () => {
  $('restore').addEventListener('click', restoreOptionsToDefault);
  $('save').addEventListener('click', saveOptions);
  $('format').addEventListener('input', updateExample);

  const tags_table = $('tags-table');
  for (const tag in lib.TAGS) {
    const tag_name = '{' + tag + '}';

    const example_value = lib.formatPageTitle(tag_name, lib.EXAMPLE_ENV);

    const row = tags_table.insertRow(-1);
    row.insertCell(-1).appendChild(createTextElem('kbd', tag_name));
    row.insertCell(-1).innerHTML = lib.TAGS[tag].description;
    row.insertCell(-1).appendChild(createTextElem('code', example_value));
  }

  restoreOptions();
});

function updateExample() {
  $('example').textContent =
      lib.formatPageTitle($('format').value, lib.EXAMPLE_ENV);
}

function restoreOptions() {
  lib.getOptions(options => {
    $('format').value = options.format;
    $('url-filter-type-' +
            (options.url_filter_is_whitelist ? 'whitelist' : 'blacklist'))
        .checked = true;
    $('url-filter-regexps').value =
        (options.url_filter_regexps || []).join(REGEXPS_SEPARATOR);
    updateExample();
  });
}

function restoreOptionsToDefault() {
  lib.clearOptions(showOptionsSaved);
}

function saveOptions() {
  // Validate the URL filter regexps.
  const url_filter_regexps =
      $('url-filter-regexps').value.split(REGEXPS_SEPARATOR);
  for (const regexp of url_filter_regexps) {
    try {
      new RegExp(regexp);
    } catch (e) {
      $('status').textContent =
          'Invalid URL filter regular expression: ' + regexp;
      return;
    }
  }

  lib.setOptions(
    {
      format: $('format').value,
      url_filter_is_whitelist: $('url-filter-type-whitelist').checked,
      url_filter_regexps: url_filter_regexps,
    },
    showOptionsSaved);
}

function showOptionsSaved() {
  const status = $('status');
  status.textContent = 'Options saved.';
  setTimeout(() => status.textContent = '', 1000);

  restoreOptions();
}

// Helpers

function $(id) {
  return document.getElementById(id);
}

function createTextElem(tag_name, text) {
  const elem = document.createElement(tag_name);
  elem.textContent = text;
  return elem;
}
