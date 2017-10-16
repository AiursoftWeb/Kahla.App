const electron = require('electron')
const { Menu, Tray } = require('electron')
const app = electron.app
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({ width: 512, height: 768, icon :  __dirname + '/assets/48x48.png' })

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  mainWindow.on('close', function (event) {
    if (!app.isQuiting) {
      event.preventDefault()
      mainWindow.hide();
    }
    return false;
  });

  mainWindow.on('minimize', function (event) {
    event.preventDefault()
    mainWindow.hide();
  });

}

var shouldQuit = app.makeSingleInstance(function(commandLine, workingDirectory) {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();
  }
});

if (shouldQuit) {
  app.quit();
  return;
}

app.on('ready', createWindow)

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
})

let tray = null
app.on('ready', () => {
  tray = new Tray(__dirname + '/assets/48x48.png')
  tray.addListener('double-click',function () { mainWindow.show(); })
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Kahla', click: function () { mainWindow.show(); }
    },
    { type: 'separator'},
    {
      label: 'Exit', click: function () { app.isQuiting = true; app.quit(); }
    }
  ])
  Menu.setApplicationMenu(null)
  tray.setToolTip('This is my application.')
  tray.setContextMenu(contextMenu)
})