const { app, BrowserWindow, dialog, ipcMain, shell } = require("electron");
const { autoUpdater } = require("electron-updater");
const { randomUUID } = require("node:crypto");
const { spawn } = require("node:child_process");
const { createServer } = require("node:net");
const { access, mkdir, readFile, writeFile } = require("node:fs/promises");
const path = require("node:path");

const SERVER_HOST = "127.0.0.1";
const SERVER_PORT_FILE = "next-server-port";
const UPDATE_PREFERENCES_FILE = "update-preferences.json";
const STARTUP_TIMEOUT_MS = 60_000;
const STARTUP_POLL_MS = 250;
const UPDATE_CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000;

app.setName("LittlePaper");
app.setAppUserModelId("lk.littlepaper.desktop");

autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = false;
autoUpdater.allowPrerelease = false;

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  let mainWindow;
  let serverProcess;
  let serverReady = false;
  let isQuitting = false;
  let serverFailure;
  let serverOutput = "";
  let appOrigin;
  let updateCheckInterval;
  let updateCheckInProgress;
  let manualUpdateCheckRequested = false;
  let dismissedUpdateVersion = "";
  let updateSnapshot = {
    state: "idle",
    currentVersion: app.getVersion(),
    enabled: app.isPackaged && process.platform === "win32",
    revision: 0
  };

  function publishUpdateState(nextState) {
    updateSnapshot = {
      ...updateSnapshot,
      ...nextState,
      currentVersion: app.getVersion(),
      enabled: app.isPackaged && process.platform === "win32",
      revision: updateSnapshot.revision + 1
    };
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("update-status", updateSnapshot);
    }
    return updateSnapshot;
  }

  function releaseNotesText(releaseNotes) {
    if (typeof releaseNotes === "string") return releaseNotes.trim().slice(0, 4000);
    if (!Array.isArray(releaseNotes)) return "";
    return releaseNotes
      .map(note => typeof note === "string" ? note : note?.note)
      .filter(note => typeof note === "string" && note.trim())
      .join("\n\n")
      .slice(0, 4000);
  }

  async function loadDismissedUpdateVersion() {
    const preferencesPath = path.join(app.getPath("userData"), UPDATE_PREFERENCES_FILE);
    try {
      const preferences = JSON.parse(await readFile(preferencesPath, "utf8"));
      if (typeof preferences.dismissedVersion === "string") {
        dismissedUpdateVersion = preferences.dismissedVersion;
      }
    } catch (error) {
      if (error?.code !== "ENOENT") {
        console.error("Could not read the desktop update preferences.", error);
      }
    }
  }

  async function checkForUpdates(manual = false) {
    if (!updateSnapshot.enabled) {
      if (manual) publishUpdateState({ state: "disabled", notify: false });
      return;
    }

    if (manual) manualUpdateCheckRequested = true;
    if (updateCheckInProgress) return updateCheckInProgress;

    updateCheckInProgress = (async () => {
      publishUpdateState({
        state: "checking",
        latestVersion: undefined,
        releaseNotes: undefined,
        error: undefined,
        notify: false
      });
      try {
        await autoUpdater.checkForUpdates();
      } catch (error) {
        if (updateSnapshot.state !== "error") {
          publishUpdateState({
            state: "error",
            error: error instanceof Error ? error.message : String(error),
            notify: false
          });
        }
        manualUpdateCheckRequested = false;
      } finally {
        updateCheckInProgress = undefined;
      }
    })();

    return updateCheckInProgress;
  }

  autoUpdater.on("checking-for-update", () => {
    publishUpdateState({ state: "checking", error: undefined, notify: false });
  });
  autoUpdater.on("update-available", info => {
    const notify = manualUpdateCheckRequested || info.version !== dismissedUpdateVersion;
    manualUpdateCheckRequested = false;
    publishUpdateState({
      state: "available",
      latestVersion: info.version,
      releaseNotes: releaseNotesText(info.releaseNotes),
      error: undefined,
      notify
    });
  });
  autoUpdater.on("update-not-available", () => {
    manualUpdateCheckRequested = false;
    publishUpdateState({
      state: "not-available",
      latestVersion: undefined,
      releaseNotes: undefined,
      error: undefined,
      notify: false
    });
  });
  autoUpdater.on("download-progress", progress => {
    publishUpdateState({
      state: "downloading",
      percent: Number.isFinite(progress.percent) ? progress.percent : 0,
      transferred: progress.transferred,
      total: progress.total,
      notify: false
    });
  });
  autoUpdater.on("update-downloaded", info => {
    publishUpdateState({
      state: "downloaded",
      latestVersion: info.version,
      releaseNotes: releaseNotesText(info.releaseNotes),
      percent: 100,
      error: undefined,
      notify: false
    });
  });
  autoUpdater.on("error", error => {
    manualUpdateCheckRequested = false;
    publishUpdateState({
      state: "error",
      error: error instanceof Error ? error.message : String(error),
      notify: false
    });
  });

  function addServerOutput(chunk) {
    serverOutput = (serverOutput + chunk.toString()).slice(-8_000);
    if (!app.isPackaged) process.stdout.write(chunk);
  }

  function probePort(port) {
    return new Promise((resolve, reject) => {
      const probe = createServer();
      probe.once("error", reject);
      probe.listen(port, SERVER_HOST, () => {
        const address = probe.address();
        const selectedPort = address && typeof address === "object" ? address.port : undefined;
        probe.close(error => {
          if (error) reject(error);
          else if (selectedPort === undefined) reject(new Error("Could not reserve a local application port."));
          else resolve(selectedPort);
        });
      });
    });
  }

  async function getServerPort() {
    const userDataPath = app.getPath("userData");
    const portFilePath = path.join(userDataPath, SERVER_PORT_FILE);
    let savedPort;

    try {
      const rawPort = (await readFile(portFilePath, "utf8")).trim();
      savedPort = Number(rawPort);
      if (!/^\d+$/.test(rawPort) || !Number.isInteger(savedPort) || savedPort < 1024 || savedPort > 65535) {
        throw new Error(`The saved local server port is invalid: ${portFilePath}`);
      }
    } catch (error) {
      if (error && error.code !== "ENOENT") throw error;
    }

    if (savedPort !== undefined) {
      try {
        await probePort(savedPort);
      } catch (cause) {
        throw new Error(
          `LittlePaper's saved local port ${savedPort} is already in use. Close the other application using it and restart LittlePaper.`,
          { cause }
        );
      }
      return savedPort;
    }

    const port = await probePort(0);
    await mkdir(userDataPath, { recursive: true });
    await writeFile(portFilePath, `${port}\n`, { encoding: "utf8", flag: "wx" });
    return port;
  }

  function getStandaloneDirectory() {
    return path.join(app.getAppPath(), ".next-desktop", "standalone");
  }

  function waitForServer(origin) {
    const deadline = Date.now() + STARTUP_TIMEOUT_MS;

    return new Promise((resolve, reject) => {
      const fail = error => {
        if (serverReady) return;
        serverFailure = error;
      };

      serverProcess.once("error", fail);
      serverProcess.once("exit", (code, signal) => {
        const error = new Error(`The local Next.js server exited (code ${code ?? "unknown"}, signal ${signal ?? "none"}).`);
        if (!serverReady) serverFailure = error;
        else if (!isQuitting) {
          void dialog.showMessageBox({
            type: "error",
            title: "LittlePaper server stopped",
            message: error.message,
            detail: serverOutput
          }).finally(() => app.quit());
        }
      });

      const poll = async () => {
        if (serverFailure) {
          reject(new Error(`${serverFailure.message}\n\n${serverOutput}`, { cause: serverFailure }));
          return;
        }
        if (Date.now() >= deadline) {
          reject(new Error(`The local Next.js server did not become ready within ${STARTUP_TIMEOUT_MS / 1000} seconds.\n\n${serverOutput}`));
          return;
        }

        try {
          const response = await fetch(origin);
          if (response.ok) {
            serverReady = true;
            resolve();
            return;
          }
        } catch {
          // The server has not started listening yet; retry until the startup deadline.
        }

        setTimeout(poll, STARTUP_POLL_MS);
      };

      void poll();
    });
  }

  async function startNextServer() {
    const standaloneDirectory = getStandaloneDirectory();
    const serverPath = path.join(standaloneDirectory, "server.js");
    try {
      await access(serverPath);
    } catch (error) {
      if (error && error.code === "ENOENT") {
        throw new Error("The LittlePaper desktop server bundle is missing. Run `npm run desktop:build` before starting the desktop app.", { cause: error });
      }
      throw error;
    }
    const port = await getServerPort();
    const origin = `http://${SERVER_HOST}:${port}`;

    serverProcess = spawn(process.execPath, [serverPath], {
      cwd: standaloneDirectory,
      env: {
        ...process.env,
        ELECTRON_RUN_AS_NODE: "1",
        HOSTNAME: SERVER_HOST,
        NODE_ENV: "production",
        PORT: String(port)
      },
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true
    });
    serverProcess.stdout.on("data", addServerOutput);
    serverProcess.stderr.on("data", addServerOutput);

    try {
      await waitForServer(origin);
    } catch (error) {
      serverProcess.kill();
      serverProcess = undefined;
      throw error;
    }

    return origin;
  }

  function openExternalUrl(rawUrl) {
    try {
      const url = new URL(rawUrl);
      if (url.protocol !== "https:" && url.protocol !== "http:") return;
      void shell.openExternal(url.href).catch(error => {
        console.error("Could not open the external link.", error);
      });
    } catch (error) {
      console.error("Could not parse the external link.", error);
    }
  }

  async function createMainWindow(origin) {
    const standaloneDirectory = getStandaloneDirectory();
    mainWindow = new BrowserWindow({
      width: 1360,
      height: 900,
      minWidth: 900,
      minHeight: 640,
      title: "LittlePaper",
      autoHideMenuBar: true,
      backgroundColor: "#f5f7f5",
      icon: path.join(app.getAppPath(), ".next-desktop", "littlepaper.ico"),
      webPreferences: {
        preload: path.join(app.getAppPath(), "electron", "preload.cjs"),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
        webSecurity: true,
        webviewTag: false
      }
    });

    mainWindow.on("page-title-updated", event => {
      event.preventDefault();
      mainWindow.setTitle("LittlePaper");
    });

    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      openExternalUrl(url);
      return { action: "deny" };
    });

    mainWindow.webContents.on("will-navigate", (event, url) => {
      if (url.startsWith(`${origin}/`) || url === origin) return;
      event.preventDefault();
      openExternalUrl(url);
    });

    mainWindow.webContents.on("will-attach-webview", event => {
      event.preventDefault();
    });

    await mainWindow.loadURL(origin);
  }

  function assertMainWindowSender(event) {
    if (!mainWindow || event.sender !== mainWindow.webContents) {
      throw new Error("Desktop requests are only accepted from the LittlePaper window.");
    }
  }

  async function openPdfPreview(pdf) {
    if (!Buffer.isBuffer(pdf) || pdf.length < 5 || pdf.subarray(0, 5).toString("ascii") !== "%PDF-") {
      throw new Error("The print preview did not produce a valid PDF.");
    }
    const filePath = path.join(app.getPath("temp"), `LittlePaper-Print-${randomUUID()}.pdf`);
    await writeFile(filePath, pdf);
    const openError = await shell.openPath(filePath);
    if (openError) throw new Error(`Could not open the print preview: ${openError}`);
    return { status: "previewed" };
  }

  async function createPrintPreview(webContents, orientation = "portrait") {
    const pdf = await webContents.printToPDF({
      pageSize: "A4",
      printBackground: true,
      landscape: orientation === "landscape",
      margins: { top: 0, bottom: 0, left: 0, right: 0 },
      preferCSSPageSize: true
    });
    return openPdfPreview(Buffer.from(pdf));
  }

  ipcMain.handle("print-current-page", async (event, options) => {
    assertMainWindowSender(event);
    const orientation = options?.orientation ?? "portrait";
    if (orientation !== "portrait" && orientation !== "landscape") {
      throw new TypeError("Print orientation must be portrait or landscape.");
    }
    return createPrintPreview(mainWindow.webContents, orientation);
  });

  ipcMain.handle("print-pdf-data", async (event, pdfData) => {
    assertMainWindowSender(event);
    if (!(pdfData instanceof Uint8Array) || pdfData.byteLength > 100 * 1024 * 1024) {
      throw new Error("The selected PDF is invalid or exceeds the 100 MB print limit.");
    }
    return openPdfPreview(Buffer.from(pdfData));
  });

  ipcMain.handle("get-update-info", event => {
    assertMainWindowSender(event);
    return updateSnapshot;
  });

  ipcMain.handle("check-for-updates", async event => {
    assertMainWindowSender(event);
    await checkForUpdates(true);
    return { status: "checking" };
  });

  ipcMain.handle("download-update", async event => {
    assertMainWindowSender(event);
    if (!updateSnapshot.enabled || !updateSnapshot.latestVersion || !["available", "error"].includes(updateSnapshot.state)) {
      throw new Error("There is no available update to download.");
    }
    await autoUpdater.downloadUpdate();
    return { status: "downloaded" };
  });

  ipcMain.handle("install-update", event => {
    assertMainWindowSender(event);
    if (!updateSnapshot.enabled || updateSnapshot.state !== "downloaded") {
      throw new Error("The update has not finished downloading.");
    }
    autoUpdater.quitAndInstall(false, true);
    return { status: "installing" };
  });

  ipcMain.handle("dismiss-update", async (event, version) => {
    assertMainWindowSender(event);
    if (typeof version !== "string" || version !== updateSnapshot.latestVersion) {
      throw new TypeError("A valid update version is required.");
    }
    const preferencesPath = path.join(app.getPath("userData"), UPDATE_PREFERENCES_FILE);
    await mkdir(app.getPath("userData"), { recursive: true });
    await writeFile(preferencesPath, JSON.stringify({ dismissedVersion: version }), "utf8");
    dismissedUpdateVersion = version;
    publishUpdateState({ notify: false });
    return { status: "dismissed" };
  });

  ipcMain.handle("print-resource", async (event, rawUrl) => {
    assertMainWindowSender(event);
    if (typeof rawUrl !== "string") throw new TypeError("A print resource URL is required.");
    const url = new URL(rawUrl, appOrigin);
    if (url.origin !== appOrigin) throw new Error("Only resources from this LittlePaper installation can be printed.");
    if (!url.pathname.toLowerCase().endsWith(".pdf")) {
      throw new Error("Only PDF files can be opened directly as a print preview.");
    }
    const publicDirectory = path.resolve(getStandaloneDirectory(), "public");
    let relativeResource;
    try {
      relativeResource = decodeURIComponent(url.pathname).replace(/^[/\\]+/, "");
    } catch (cause) {
      throw new Error("The PDF path is invalid.", { cause });
    }
    const filePath = path.resolve(publicDirectory, relativeResource);
    const relativePath = path.relative(publicDirectory, filePath);
    if (!relativePath || relativePath === ".." || relativePath.startsWith(`..${path.sep}`) || path.isAbsolute(relativePath)) {
      throw new Error("The PDF path is outside the LittlePaper library.");
    }
    const openError = await shell.openPath(filePath);
    if (openError) throw new Error(`Could not open the PDF print preview: ${openError}`);
    return { status: "previewed" };
  });

  app.on("second-instance", () => {
    if (!mainWindow) return;
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  });

  app.whenReady().then(async () => {
    try {
      await loadDismissedUpdateVersion();
      const origin = await startNextServer();
      appOrigin = origin;
      await createMainWindow(origin);
      if (updateSnapshot.enabled) {
        void checkForUpdates();
        updateCheckInterval = setInterval(() => void checkForUpdates(), UPDATE_CHECK_INTERVAL_MS);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await dialog.showMessageBox({
        type: "error",
        title: "Could not start LittlePaper",
        message: "LittlePaper could not start its local application server.",
        detail: message
      });
      app.quit();
    }
  });

  app.on("before-quit", () => {
    isQuitting = true;
    if (updateCheckInterval) clearInterval(updateCheckInterval);
    if (serverProcess && !serverProcess.killed) serverProcess.kill();
  });

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
  });
}
