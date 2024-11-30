const { app, BrowserWindow, ipcMain, Menu, MenuItem, Tray, nativeImage, Notification } = require('electron');
const path = require('path')
const contexMenu = require("electron-context-menu")


let mainwindow
let second_window
let template_menu = [
    { label: "label1" },
    { label: "label2", click: () => { console.log("clicata label2") } },
    { label: "close", role: "close" },
    {
        label: "label4", submenu: [
            { label: "new window", click: () => { create_window() }, accelerator: "Ctrl+Alt+W" },
            { type: "separator"},
            {
                label: "come", submenu: [
                    { label: "stai", accelerator: "Alt+I", click: () => { console.log("clkiccato") } }
                ]
            },
            { label: "stai" },
        ]
    },
    {label:"vedi codice r23", accelerator: process.platform === "darwin" ? 'Alt+Cmd+I' : "Alt+Shift+I", click:()=>{console.log("ok")}}
]
const menu = Menu.buildFromTemplate(template_menu)
Menu.setApplicationMenu(menu)

// contex menu
// se lascio vuoto ci sono le impostazioni di default
contexMenu({
    showSaveImageAs: true,
    labels: {
		saveImageAs: 'Guardar imagen como… (modificato)',
	}
}) 


function createWindow() {
    app.setAppUserModelId("com.myapp")
    mainwindow = new BrowserWindow({
        height: 600,
        width: 800,
        //maxHeight: 1000,
        //minHeight: 300,
        minWidth: 300,
        //resizable: false,
        //minimizable: false,
        fullscreenable: true,
        fullscreen: false,
        //frame:false,
        //transparent: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            preload: path.join(__dirname, "preload.js")
        },
        title: 'My App',
    });

    mainwindow.setTitle('My App');
    mainwindow.loadFile('index.html');
    //mainwindow.webContents.openDevTools();
    mainwindow.on("close", () => app.quit())
    mainwindow.on("minimize", (event)=>{
        event.preventDefault()
        mainwindow.setSkipTaskbar(true)
    })
    // per creare contex-menu (tasto destro) manualmente con electron
    //mainwindow.webContents.on("context-menu", ()=>{
    //    menu.popup()
    //})
}

app.whenReady().then(()=>{
    createWindow()
    let icon = nativeImage.createFromPath("icon.png")
    let menu = Menu.buildFromTemplate([
        {label:"close", role:"quit"}
    ])
    let tray = new Tray(icon)
    tray.setContextMenu(menu)
    tray.setTitle("app electron")
    tray.setToolTip("my app in electron")
    tray.on("double-click", ()=>{
        mainwindow.show()
    })
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

ipcMain.on("test", (e, data) => {
    console.log(data)
    mainwindow.webContents.send("risposta", { response: "ok" })
})

ipcMain.on("window:minimize", (e) => {
    mainwindow.minimize()
})
ipcMain.on("window:restore", (e) => {
    if (mainwindow.isMaximized()) {
        mainwindow.restore()
    } else {
        mainwindow.maximize()
    }
})
ipcMain.on("window:close", (e) => {
    mainwindow.close()
})

ipcMain.on("secondwindow", (e, data) => {
    console.log(data)
})

ipcMain.on("notifica", (e)=>{
    let notifica = new Notification({
        title:"my notifica",
        subtitle: "sottotitolo",
        body:"ciao ciao, ciao",
    })
    console.log(notifica)
    notifica.show()
    notifica.on("close", (events, args)=>{
        console.log("notifica chiusa!")
    })
})


function create_window() {
    second_window = new BrowserWindow({
        height: 200,
        modal: true,
        parent: mainwindow,
        width: 200,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    })
    second_window.loadFile("help.html")
}