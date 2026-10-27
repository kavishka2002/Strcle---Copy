const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("littlePaperDesktop", Object.freeze({
  isDesktop: true,
  printCurrentPage: options => ipcRenderer.invoke("print-current-page", options),
  printResource: url => ipcRenderer.invoke("print-resource", url),
  printPdfData: pdfData => ipcRenderer.invoke("print-pdf-data", pdfData)
}));
