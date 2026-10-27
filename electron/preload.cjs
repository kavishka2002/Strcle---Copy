const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("littlePaperDesktop", Object.freeze({
  isDesktop: true,
  printCurrentPage: options => ipcRenderer.invoke("print-current-page", options),
  printWithDialog: options => ipcRenderer.invoke("print-with-dialog", options),
  printResource: url => ipcRenderer.invoke("print-resource", url),
  printPdfData: pdfData => ipcRenderer.invoke("print-pdf-data", pdfData),
  getUpdateInfo: () => ipcRenderer.invoke("get-update-info"),
  checkForUpdates: () => ipcRenderer.invoke("check-for-updates"),
  downloadUpdate: () => ipcRenderer.invoke("download-update"),
  installUpdate: () => ipcRenderer.invoke("install-update"),
  dismissUpdate: version => ipcRenderer.invoke("dismiss-update", version),
  onUpdateStatus: callback => {
    if (typeof callback !== "function") {
      throw new TypeError("An update status listener is required.");
    }
    const listener = (_event, status) => callback(status);
    ipcRenderer.on("update-status", listener);
    return () => ipcRenderer.removeListener("update-status", listener);
  }
}));
