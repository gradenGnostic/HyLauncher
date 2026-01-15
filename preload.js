const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Legacy paths
  getHytalePath: () => ipcRenderer.invoke('get-hytale-path'),
  selectHytalePath: () => ipcRenderer.invoke('select-hytale-path'),
  
  // Mod management
  getMods: (modsPath) => ipcRenderer.invoke('get-mods', modsPath),
  toggleMod: (modPath, enable) => ipcRenderer.invoke('toggle-mod', modPath, enable),
  deleteMod: (modPath) => ipcRenderer.invoke('delete-mod', modPath),
  installMod: (modsPath, modFilePath) => ipcRenderer.invoke('install-mod', modsPath, modFilePath),
  selectModFile: () => ipcRenderer.invoke('select-mod-file'),
  
  // Custom mods folder
  getModsPath: () => ipcRenderer.invoke('get-mods-path'),
  setModsPath: (modsPath) => ipcRenderer.invoke('set-mods-path', modsPath),
  selectModsPath: () => ipcRenderer.invoke('select-mods-path'),
  
  // Hytale executable path
  getHytaleExePath: () => ipcRenderer.invoke('get-hytale-exe-path'),
  setHytaleExePath: (exePath) => ipcRenderer.invoke('set-hytale-exe-path', exePath),
  selectHytaleExe: () => ipcRenderer.invoke('select-hytale-exe'),
  selectHytaleExecutable: () => ipcRenderer.invoke('select-hytale-executable'),
  
  // Orbis API
  getOrbisApiKey: () => ipcRenderer.invoke('get-orbis-api-key'),
  setOrbisApiKey: (apiKey) => ipcRenderer.invoke('set-orbis-api-key', apiKey),
  orbisFetchMods: (page, search, category) => ipcRenderer.invoke('orbis-fetch-mods', page, search, category),
  fetchOrbisMods: (search = '') => ipcRenderer.invoke('orbis-fetch-mods', 1, search, ''),
  orbisDownloadMod: (modUrl, modsPath, modName) => ipcRenderer.invoke('orbis-download-mod', modUrl, modsPath, modName),
  
  // Game launching
  findHytaleExecutable: () => ipcRenderer.invoke('find-hytale-executable'),
  launchHytale: (exePath, modsPath) => ipcRenderer.invoke('launch-hytale', exePath, modsPath),
  selectHytaleExecutable: () => ipcRenderer.invoke('select-hytale-executable')
});

// Log that preload script has loaded (for debugging)
console.log('Preload script loaded, electronAPI exposed');

