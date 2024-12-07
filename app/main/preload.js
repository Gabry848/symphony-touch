// const { contextBridge, ipcRenderer } = require('electron');

// function create_tag_music() {
//     const sidebar = document.querySelector('.sidebar');
//     const container = sidebar.querySelector('.container');
//     const songList = container.querySelector('.song-list');
// }

// let channel = 'get-audio-list';
// contextBridge.exposeInMainWorld('electronAPI', {
//     sendMessage: (channel) => ipcRenderer.send(channel),
//     onMessage: (channel, callback) => ipcRenderer.on(channel, (event, ...args) => {
//         console.log('onMessage', event, args);
        
//     })
// });

console.log('preload.js loaded');