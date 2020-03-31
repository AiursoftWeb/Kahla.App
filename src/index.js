const electron = require('electron');
const {Menu, Tray, Notification, shell, globalShortcut, ipcMain} = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require('path');
const Url = require('url');
const platform = require('os').platform();

let mainWindow;
app.showExitNotif = true;

const singleLock = app.requestSingleInstanceLock();

if (!singleLock) {
    app.quit();
}

function createWindow() {
    mainWindow = new BrowserWindow(
        {
            width: 1242,
            height: 768,
            icon: __dirname + '/assets/144x144.png',
            titleBarStyle: platform === 'darwin' ? 'hiddenInset' : 'default',
            minWidth: 200,
            minHeight: 300,
            webPreferences: {
                nodeIntegration: true
            }
        });
    // and load the index.html of the app.
    mainWindow.loadURL(Url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }));

    mainWindow.on('close', function (event) {
        if (!app.isQuiting) {
            event.preventDefault();
            mainWindow.hide();
            if (app.showExitNotif) {
                app.showExitNotif = false;
                new Notification({
                    title: 'Kahla',
                    body: 'Kahla is running in the background. Press Ctrl + Alt + S to open.'
                }).show();
            }
        }
    });

    mainWindow.webContents.on("new-window", (event, url) => {
        event.preventDefault();
        shell.openExternal(url);
    });
}

app.on('ready', createWindow);

ipcMain.on('oauth', (event, arg) => {
    let nextExit = false;
    let oauth = new BrowserWindow(
        {
            width: 410,
            height: 730,
            icon: __dirname + '/assets/144x144.png',
            titleBarStyle: 'default',
            minWidth: 200,
            minHeight: 300,
            title: 'Please login via your aiursoft account.'
        });
    oauth.loadURL(arg);
    oauth.webContents.on('will-redirect', (event_, url_) => {
        if (nextExit) {
            oauth.close();
            oauth.destroy();
            mainWindow.loadURL(Url.format({
                pathname: path.join(__dirname, 'index.html'),
                protocol: 'file:',
                slashes: true,
            }));
        }
        if (url_.match(/.+\/Auth\/AuthResult.+/gi)) {
            nextExit = true;
        }
    });
    oauth.show();
});

app.addListener('before-quit', () => {
    app.isQuiting = true;
});

app.on('window-all-closed', function () {
    app.quit();
});

app.on('will-quit', () => {
    globalShortcut.unregister('CommandOrControl+Alt+S');
    globalShortcut.unregisterAll()
});

app.setAppUserModelId('com.example.kahla');

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow();
    } else {
        mainWindow.show();
    }
});

app.on("second-instance", (event, commandLine, workingDirectory) => {
    if (mainWindow !== null) {
        mainWindow.show();
    }
});

let tray = null;
app.on('ready', () => {
    if (platform === 'darwin') {
        tray = new Tray(__dirname + '/assets/KahlaTemplate.png');
    } else {
        tray = new Tray(__dirname + '/assets/144x144.png');
    }
    tray.addListener('double-click', function () {
        mainWindow.show();
    });
    globalShortcut.register('CommandOrControl+Alt+S', () => {
        if (mainWindow.isVisible() && mainWindow.isFocused()) {
            mainWindow.hide();
        } else {
            mainWindow.show();
        }
    });
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Kahla', click: function () {
                mainWindow.show();
            }
        },
        {
            label: 'Toggle developer tools', click: function () {
                mainWindow.toggleDevTools()
            }
        },
        {type: 'separator'},
        {
            label: 'Exit', click: function () {
                app.isQuiting = true;
                app.quit();
            }
        }
    ]);
    Menu.setApplicationMenu(null);
    tray.setToolTip('Kahla');
    tray.setContextMenu(contextMenu);
});
