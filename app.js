var electron = require('electron')
electron.app.on('ready', function() {
    var mainWindow = new electron.BrowserWindow({
        width: 1000,
        height: 1000,
        minWidth: 300,
        minHeight: 30
    })
    mainWindow.loadURL('file://' + __dirname + '/index.html')
})
