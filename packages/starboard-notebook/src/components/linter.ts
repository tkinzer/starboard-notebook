import { html, LitElement } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { setupCommunicationWithParentFrame } from "../runtime/core";
import { Cell, GovernanceLintError, Runtime, ScoreResult } from "src/types";

@customElement("starboard-linter")
export class StarboardLinterElement extends LitElement {
  @property({ type: Object })
  private notebookRuntime?: Runtime;

  @property()
  private eventListeners?: EventListener[];

  @query(".linter-container")
  private cellsParentElement!: HTMLElement;

  createRenderRoot() {
    return this;
  }

  /**
   * FIX: We should be able to access the notebook runtime globally instead of passing it
   * during initialization
   */
  public setNotebookRuntime(runtime: Runtime) {
    this.notebookRuntime = runtime;
    // Hook event listeners
    setupCommunicationWithParentFrame(runtime);
  }

  /**
   * TODO: hook event listeners up to trigger cell linting on execution
   */
  // const changeListeners = this.notebookRuntime?.internal.listeners.cellContentChanges.get(cell.id);
  // if (changeListeners) {
  //   changeListeners.forEach((v) => v());
  // }

  // SET private changeListeners[]

  private scoreNotebookModels() {
    if (!this.notebookRuntime) return;

    console.log(`notebook runtime`, this.notebookRuntime);

    /**
     * TODO: Investigate usage of consoleCatcher for intercepting the rendered python / pandas
     */
    // const catcher = this.notebookRuntime?.consoleCatcher.hook((msg) => msg);
    // console.log(catcher);

    const cells = this.notebookRuntime?.content.cells;
    cells
      ?.filter((c) => c.cellType === "python" && fuzzyDataImportMatcher(c.textContent))
      .forEach((cell) => {
        console.log("foundNotebookDataImports", cell);
        /**
         * TODO
         * Determine how to check the csv data import for the column/table header cells
         */
        this.submitCodeToScore(cell);
      });
  }

  /**
   * FIX: Issue with referrer-policy in chrome.
   * The URL below can be pinged successfully with cUrl,
   *  but blocked when using inside the notebook in the browser.
   * @param cell
   */
  submitCodeToScore(cell: Cell) {
    (async () => {
      const rawResponse = await fetch("http://127.0.0.1:5000/score", {
        method: "POST",
        body: cell.textContent, // JSON.stringify({ a: 1, b: "Textual content" }),
      });
      const content = await rawResponse.json();

      console.log(content);

      if (content.length > 0) {
        this.lintWarning(content);
      }
    })();
  }

  lintWarning(warnings: GovernanceLintError[]) {
    const linterUpdateEl = document.querySelector("[id='linter-console-updates']");

    if (warnings.length > 0 && linterUpdateEl) {
      linterUpdateEl.innerHTML = "WARNING - issues detected";
      warnings.forEach((w) => {
        const appendEl = document.createElement(`p`);
        appendEl.className = "lint-warning";
        appendEl.innerHTML = w.message;
        linterUpdateEl?.appendChild(appendEl);
      });
    } else {
      linterUpdateEl ? (linterUpdateEl.innerHTML = "") : null;
    }
  }

  executeJob() {
    this.updateLinterConsole("submitting job for execution");
  }

  updateLinterConsole(status: any, type?: string): void {
    const linterUpdateEl = document.querySelector("[id='linter-console-updates']");
    if (linterUpdateEl) {
      linterUpdateEl.innerHTML = `${status}`;
      linterUpdateEl.className += ` ${type}`;
    }
  }

  render() {
    return html`
      <div class="linter-container">
        <div class="linter-actions">
          <button @click=${this.scoreNotebookModels}>Run Cells</button>
          <button @click=${this.executeJob}>Submit Job for Execution</button>
        </div>

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
