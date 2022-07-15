import { html, LitElement } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { Cell, GovernanceLintError, OutboundNotebookMessage, Runtime } from "src/types";
import { CellElement } from "./cell";

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

  subscribeToAllCellChanges(cells: Cell[]) {
    cells.forEach((c) =>
      this.notebookRuntime?.controls.subscribeToCellChanges(c.id, () => {
        console.log(`subscribing to cell change ${c.id}`);
      })
    );
  }

  subscribeToCellRunning(cells: CellElement[]) {
    cells.forEach((c) => {
      if (c.isUpdatePending) {
        console.log("cell update pending", c.id);
      }
    });
  }

  /**
   * FIX: We should be able to access the notebook runtime globally instead of passing it
   * during initialization
   */
  public setNotebookRuntime(runtime: Runtime) {
    this.notebookRuntime = runtime;
    const cells = runtime.content.cells;
    // Subscribe to cell changes
    this.subscribeToAllCellChanges(cells);
    this.subscribeToCellRunning(runtime.dom.cells);

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

    /**
     * TODO: Figure out how to capture run events of a cell instead of every change to any cell in a notebook.
     * Hack? Compare the old data.payload.content to the current data.payload.content and determine which cell(s) changed
     *  based on the differences in the module content section.
     */
    // window.addEventListener(
    //   "message",
    //   (event) => {
    //     if (event.data) {
    //       const msg = event.data as OutboundNotebookMessage;
    //       switch (msg.type) {
    //         case "NOTEBOOK_CONTENT_UPDATE": {
    //           console.log("event captured", event);
    //           break;
    //         }
    //       }
    //     }
    //   },
    //   false
    // );
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
        // this.notebookRuntime?.controls.runCell({ id: cell.id });

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
  submitCodeToScore(cell: CellElement | Cell) {
    (async () => {
      console.warn("submitting code to score", cell);
      const headers = new Headers();
      headers.append("Accept", "application/json");
      headers.append("Content-Type", "application/json"); // This one sends body

      const bodyPayload = { cellId: cell.id, textContent: cell.textContent };
      const body = JSON.stringify(bodyPayload);
      console.log("sending body", bodyPayload);
      const content = await fetch("http://127.0.0.1:5000/score", {
        method: "POST",
        // headers: headers,
        body,
      })
        .then((rawResponse) => rawResponse.json())
        .catch((e) => console.error(e));

      console.log("api response", content);

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
    }
  }

  executeJob() {
    this.updateLinterConsole("submitting job for execution");
  }

  clearLinterConsole() {
    const linterUpdateEl = document.querySelector("[id='linter-console-updates']");
    if (linterUpdateEl) {
      linterUpdateEl.innerHTML = ``;
    }
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
