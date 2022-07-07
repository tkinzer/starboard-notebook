/*! This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import { StarboardLinterElement } from "./components/linter";
import { StarboardNotebookElement } from "./components/notebook";
import "./init";

const baseEl = document.createElement("base");
baseEl.target = "_parent";
document.head.append(baseEl);

const rowContainer = document.createElement("div");
rowContainer.id = "notebook-container";
document.body.append(rowContainer);

const notebookEl = new StarboardNotebookElement();
rowContainer.appendChild(notebookEl);

/**
 * TODO: Create class for AILinter
 * - Output container for cell scores
 * - Extensible for future plugins that will be different types of linting in the browser.
 * -
 * Output container for scores after
 * submitting a line of code to the
 * scoring endpoint.
 * Endpoint URL: ... TODO
 */
const outputEl = new StarboardLinterElement();
var notebookRuntimeRef = notebookEl.getRuntime();
outputEl.setNotebookRuntime(notebookRuntimeRef);

const output = document.createElement("div");
output.id = "my-element";
output.appendChild(outputEl);

rowContainer.appendChild(output);
