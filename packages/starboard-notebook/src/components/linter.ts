import { html, LitElement } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { Cell, Runtime, ScoreResult } from "src/types";

@customElement("starboard-linter")
export class StarboardLinterElement extends LitElement {
  @property({ type: Object })
  private notebookRuntime?: Runtime;

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
  }

  private scoreNotebookModels() {
    if (!this.notebookRuntime) return;

    console.log(`notebook runtime`, this.notebookRuntime);
    const catcher = this.notebookRuntime?.consoleCatcher.hook((msg) => msg);
    console.log(catcher);

    const cells = this.notebookRuntime?.content.cells;
    cells
      ?.filter((c) => c.cellType === "python" && fuzzyDataImportMatcher(c.textContent))
      .forEach((cell) => {
        console.log("foundNotebookDataImports", cell);
        /**
         * TODO
         * Determine how to check the csv data import for the column/table header cells
         */
        // const changeListeners = this.notebookRuntime?.internal.listeners.cellContentChanges.get(cell.id);
        // if (changeListeners) {
        //   changeListeners.forEach((v) => v());
        // }

        // SET private changeListeners[]

        this.updateLinterConsoleStatus("Submitting code for scoring...");
        this.submitCodeToScore(cell);
      });

    this.updateLinterConsoleStatus(`detecting responsibility triggers: ${["sex", "race"]}`);
  }

  async submitCodeToScore(cell: Cell): Promise<any> {
    const score = await fetch("http://127.0.0.1:5000/score");
    return score;
  }

  async executeJob() {
    await alert("Confirm job execution");
    this.updateLinterConsoleStatus("submitting job for execution");
  }

  updateLinterConsoleStatus(status: string): void {
    const linterUpdateEl = document.querySelector("[id='linter-console-updates']");
    if (linterUpdateEl) setTimeout(() => (linterUpdateEl.innerHTML = `${status}`), 2000);
  }

  render() {
    return html`
      <div class="linter-container">
        <div class="linter-actions">
          <button @click=${this.scoreNotebookModels}>Run Cells</button>
          <button @click=${this.executeJob}>Submit Job for Execution</button>
        </div>

        <div class="linter-console">
          <span id="linter-console-updates">No Governance Issues Detected</span>
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
  return text.indexOf("import") >= 0;
}
