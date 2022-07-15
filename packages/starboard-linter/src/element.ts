 import { LitElement } from "lit";
 import { customElement } from "lit/decorators.js";
 import { ContentContainer } from "./types";
 
interface LinterState {
  cells: any[];
}

 @customElement("starboard-linter")
 export class StarboardLinter extends LitElement {
   content: ContentContainer;
   runtime: any;
   opts: { editable?: ((state: LinterState) => boolean) | undefined };
 
   constructor(content: ContentContainer, runtime: any, opts: { editable?: (state: EditorState) => boolean } = {}) {
     super();
     this.content = content;
     this.runtime = runtime;
     this.opts = opts;
   }
 
   connectedCallback() {
     super.connectedCallback();
 
     // We don't run the cell if the editor has focus, as shift+enter has special meaning.
    //  this.addEventListener("keydown", (event: KeyboardEvent) => {
    //    if (event.key === "Enter" && this.editor.view.hasFocus()) {
    //      if (event.ctrlKey || event.shiftKey) {
    //        event.stopPropagation();
    //        return true;
    //      }
    //    }
    //  });
   }
 
   createRenderRoot() {
     return this;
   }
 
   private setupEditor() { 
 
    //  return createElement(RichMarkdownEditor, {
    //    defaultValue: this.content.textContent,
    //    placeholder: "Start writing here..",
    //    extensions: [math, mathDisplay],
    //    theme: editorTheme,
    //    onChange: (v) => {
    //      this.content.textContent = v();
    //    },
    //    readOnly: this.content.editable === false,
    //    onClickLink: (href, event) => {
    //      window.open(href, "_blank");
    //    },
    //    embeds: [],
    //    tooltip: undefined as any,
    //  });
    return {};
   }
 
  //  public refreshSettings() {
  //    // Dummy transaction
  //    this.editor.view.dispatch(this.editor.view.state.tr);
  //  }
 
  //  getContentAsMarkdownString() {
  //    return this.editor.value();
  //  }
 
  //  focus() {
  //    this.editor.focusAtStart();
  //  }
 
  //  setCaretPosition(position: "start" | "end") {
  //    if (position === "start") {
  //      this.editor.focusAtStart();
  //    } else {
  //      this.editor.focusAtEnd();
  //    }
  //  }
 
   dispose() {
     // No cleanup yet..
   }
 }
 