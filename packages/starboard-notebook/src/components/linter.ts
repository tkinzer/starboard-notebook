import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { Cell, Runtime } from "src/types";
import { CellElement } from "./cell";

@customElement("starboard-linter")
export class StarboardLinterElement extends LitElement {
  @property({ type: Object })
  private notebookRuntime?: Runtime;

  createRenderRoot() {
    return this;
  }

  /**
   * FIX: We should be able to access the notebook runtime globally instead of passing it
   * during initialization
   */
  public setNotebookRuntime(runtime: Runtime) {
    runtime.dom.notebook.addEventListener("sb:run_cell", (evt) => {
      console.count("Evt type:" + evt);
      console.log(evt);
      if (evt) {
        const cellId = evt.detail.id;
        const cell = runtime.dom.getCellById(cellId);
        const cellContent = cell?.textContent;
        if (cellContent) {
          this.submitCodeToScore(cell);
        }
      }
    });
  }

  /**
   * Method to run all notebook cells and score each cell.
   * @returns void
   */
  private scoreNotebookModels() {
    if (!this.notebookRuntime) return;

    this.notebookRuntime?.content.cells
      ?.filter((c) => c.cellType === "python" && fuzzyDataImportMatcher(c.textContent))
      .forEach((cell) => this.submitCodeToScore(cell));
  }

  formatPayload(payload: string) {
    return payload.replace(/\\n/g, "").replace(/\s+/g, "");
  }

  /**
   * FIX: Issue with referrer-policy in chrome.
   * The URL below can be pinged successfully with cUrl,
   *  but blocked when using inside the notebook in the browser.
   * HACK-around: Add chrome extension for CORS support.
   * @param cell
   */
  submitCodeToScore(cell: CellElement | Cell) {
    (async () => {
      // FIX: process.env.API_URL is not defined in the notebook.
      const host = "http://0.0.0.0:5001";
      const url = `${host}/score`;
      const bodyPayload = { cellId: cell.id, textContent: cell.textContent };
      const body = this.formatPayload(JSON.stringify(bodyPayload));
      await fetch(url, {
        method: "POST",
        // headers: headers,
        body,
      }).then((rawResponse) => this.generateLintWarnings(Promise.resolve(rawResponse.json())));
    })();
  }

  generateLintWarnings(warnings: Promise<any[]>, selector?: string) {
    // For demo purposes, we'll just log the warnings to the console that we add to the document.
    const linterUpdateEl = document.querySelector(selector ?? "[id='linter-console-updates']");

    const items: any[] = [];
    if (linterUpdateEl) {
      warnings.then((warnings) => {
        if (warnings.length > 0) {
          linterUpdateEl.innerHTML = "";
          linterUpdateEl.append(`WARNING - ${warnings.length} Governance Issues Detected`);

          const linterItems = warnings.map((warning) => {
            const linterItem = document.createElement("div");
            const itemText = `${warning.cell_id}:ln${warning.line_num} ${warning.message}.`;
            items.push(warning);
            linterItem.innerHTML = `<p>${itemText} <a href="${warning.url}" target="_blank">Learn more</a></p>`;
            return linterItem;
          });
          linterUpdateEl.append(...linterItems);
        }
      });
    }

    return items;
  }

  render() {
    return html`
      <div class="linter-container">
        <div class="linter-console">
          <p id="linter-console-updates">No Governance Issues Detected</p>
        </div>
      </div>
    `;
  }
}

/**
 * TODO implement fuzzy matching/search for cell classification
 * @param text cell text content to regex for keywords indicating the cell is importing dataframes
 * @returns
 */
export function fuzzyDataImportMatcher(text: string): boolean {
  // FIXME: the second validation check should probably not be 'read_'.
  return text.indexOf("import pandas") >= 0 && text.indexOf("read_") >= 0;
}
