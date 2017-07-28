const {app, BrowserWindow} = require('electron');
const path = require('path');
const url = require('url');

const { name, version } = require('../package.json');
const { start } = require('./udp');

let win;

const createWindow = () => {
    win = new BrowserWindow({show:false});
    win.maximize();
    win.loadURL(url.format({
        // pathname: path.join(__dirname, '../ui/index.html'),
        pathname: path.join(__dirname, '../ui/dev-scratchpad.html'),
        protocol: 'file:',
        slashes: true
    }));

    win.webContents.openDevTools();

    win.on('closed', () => win = null);
};
app.on('ready', createWindow);

app.on('window-all-closed', () => process.platform !== 'darwin' && app.quit());

app.on('activate', () => win === null&& createWindow());

console.log(`starting ${name} ${version}`);

start({ name, version });
