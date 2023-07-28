import type { ClipboardEvent, DragEvent, KeyboardEvent } from "react";

// https://stackoverflow.com/a/34936253/7585847
const newLineCharRegex = /[\r\n\x0B\x0C\u0085\u2028\u2029]+/g;

function insertPlainText(data: DataTransfer) {
  const text = data.getData("text/plain").replace(newLineCharRegex, "");
  document.execCommand("insertText", false, text);
}

function handlePaste(e: ClipboardEvent) {
  e.preventDefault();
  insertPlainText(e.clipboardData);
}

function handleDrop(e: DragEvent) {
  e.preventDefault();
  insertPlainText(e.dataTransfer);
}

function preventEnter(e: KeyboardEvent<HTMLParagraphElement>) {
  if (e.key === "Enter") {
    e.preventDefault();
  }
}

export function makeContentEditable() {
  return {
    contentEditable: true,
    suppressContentEditableWarning: true,
    onPaste: handlePaste,
    onDrop: handleDrop,
    onKeyDown: preventEnter,
  };
}
