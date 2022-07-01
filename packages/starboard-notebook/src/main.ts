/*! This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import { StarboardNotebookElement } from "./components/notebook";
import "./init";

const baseEl = document.createElement("base");
baseEl.target = "_parent";
document.head.append(baseEl);

const notebookEl = new StarboardNotebookElement();
document.body.append(notebookEl);

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
const outputEl = document.createElement("div");
outputEl.id = "my-element";
outputEl.style.backgroundColor = "#fdf";
outputEl.innerHTML = `
  <h3>AI Goverance Scores</h3>
  <p>Run your cell to see how you score</p>
`;
document.body.append(outputEl);
