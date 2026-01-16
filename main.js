const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const os = require('os');
const https = require('https');
const http = require('http');
const { spawn } = require('child_process');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    title: 'HyLauncher - The Lunar Client of Hytale',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    },
    icon: path.join(__dirname, 'public', 'icon.png'),
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default'
  });

  // Load the app
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    const indexPath = path.join(__dirname, 'build', 'index.html');
    console.log('Loading:', indexPath, 'Exists:', require('fs').existsSync(indexPath));
    mainWindow.loadFile(indexPath);
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

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

// IPC Handlers
ipcMain.handle('get-hytale-path', async () => {
  const platform = os.platform();
  let defaultPath = '';
  
  if (platform === 'win32') {
    defaultPath = path.join(os.homedir(), 'AppData', 'Roaming', '.hytale');
  } else if (platform === 'darwin') {
    defaultPath = path.join(os.homedir(), 'Library', 'Application Support', 'Hytale');
  } else {
    defaultPath = path.join(os.homedir(), '.hytale');
  }
  
  return defaultPath;
});

ipcMain.handle('select-hytale-path', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: 'Select Hytale Installation Directory'
  });
  
  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

ipcMain.handle('get-mods', async (event, modsPath) => {
  try {
    // modsPath must be explicitly set - no auto-default
    if (!modsPath) {
      return [];
    }
    
    // Create mods directory if it doesn't exist
    try {
      await fs.access(modsPath);
    } catch {
      await fs.mkdir(modsPath, { recursive: true });
    }
    
    const files = await fs.readdir(modsPath);
    const mods = [];
    
    for (const file of files) {
      const filePath = path.join(modsPath, file);
      const stats = await fs.stat(filePath);
      
      if (stats.isFile() && (file.endsWith('.jar') || file.endsWith('.zip'))) {
        const disabledPath = filePath + '.disabled';
        let isDisabled = false;
        
        try {
          await fs.access(disabledPath);
          isDisabled = true;
        } catch {
          // File is enabled
        }
        
        mods.push({
          name: file,
          path: filePath,
          size: stats.size,
          modified: stats.mtime.toISOString(),
          enabled: !isDisabled
        });
      }
    }
    
    return mods;
  } catch (error) {
    console.error('Error getting mods:', error);
    return [];
  }
});

ipcMain.handle('toggle-mod', async (event, modPath, enable) => {
  try {
    const disabledPath = modPath + '.disabled';
    
    if (enable) {
      // Enable mod: remove .disabled extension
      try {
        await fs.access(disabledPath);
        await fs.rename(disabledPath, modPath);
      } catch {
        // Already enabled or file doesn't exist
      }
    } else {
      // Disable mod: add .disabled extension
      try {
        await fs.access(modPath);
        await fs.rename(modPath, disabledPath);
      } catch {
        // Already disabled or file doesn't exist
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error toggling mod:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('delete-mod', async (event, modPath) => {
  try {
    // Try to delete both enabled and disabled versions
    try {
      await fs.unlink(modPath);
    } catch {
      // File might not exist
    }
    
    try {
      await fs.unlink(modPath + '.disabled');
    } catch {
      // File might not exist
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting mod:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('install-mod', async (event, modsPath, modFilePath) => {
  try {
    // modsPath can now be a custom path
    if (!modsPath) {
      const platform = os.platform();
      if (platform === 'win32') {
        modsPath = path.join(os.homedir(), 'AppData', 'Roaming', '.hytale', 'mods');
      } else if (platform === 'darwin') {
        modsPath = path.join(os.homedir(), 'Library', 'Application Support', 'Hytale', 'mods');
      } else {
        modsPath = path.join(os.homedir(), '.hytale', 'mods');
      }
    }
    
    // Create mods directory if it doesn't exist
    try {
      await fs.access(modsPath);
    } catch {
      await fs.mkdir(modsPath, { recursive: true });
    }
    
    const fileName = path.basename(modFilePath);
    const destPath = path.join(modsPath, fileName);
    
    // Copy file to mods directory
    await fs.copyFile(modFilePath, destPath);
    
    return { success: true, path: destPath };
  } catch (error) {
    console.error('Error installing mod:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('select-mod-file', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    title: 'Select Mod File',
    filters: [
      { name: 'Mod Files', extensions: ['jar', 'zip'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });
  
  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

// Helper function to get/set config
async function getConfig() {
  const userDataPath = app.getPath('userData');
  const configPath = path.join(userDataPath, 'config.json');
  
  try {
    const data = await fs.readFile(configPath, 'utf8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

async function saveConfig(config) {
  const userDataPath = app.getPath('userData');
  const configPath = path.join(userDataPath, 'config.json');
  await fs.writeFile(configPath, JSON.stringify(config, null, 2));
}

// Custom mods folder path handlers
ipcMain.handle('get-mods-path', async () => {
  const config = await getConfig();
  return config.customModsPath || null;
});

ipcMain.handle('set-mods-path', async (event, modsPath) => {
  try {
    const config = await getConfig();
    config.customModsPath = modsPath;
    await saveConfig(config);
    return { success: true };
  } catch (error) {
    console.error('Error saving mods path:', error);
    return { success: false, error: error.message };
  }
});

// Hytale executable path handlers
ipcMain.handle('get-hytale-exe-path', async () => {
  const config = await getConfig();
  return config.hytaleExePath || null;
});

ipcMain.handle('set-hytale-exe-path', async (event, exePath) => {
  try {
    const config = await getConfig();
    config.hytaleExePath = exePath;
    await saveConfig(config);
    return { success: true };
  } catch (error) {
    console.error('Error saving Hytale executable path:', error);
    return { success: false, error: error.message };
  }
});

// Orbis API key handlers
ipcMain.handle('get-orbis-api-key', async () => {
  const config = await getConfig();
  return config.orbisApiKey || '';
});

ipcMain.handle('set-orbis-api-key', async (event, apiKey) => {
  try {
    const config = await getConfig();
    config.orbisApiKey = apiKey;
    await saveConfig(config);
    return { success: true };
  } catch (error) {
    console.error('Error saving Orbis API key:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('select-mods-path', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: 'Select Mods Folder'
  });
  
  if (!result.canceled && result.filePaths.length > 0) {
    return { success: true, path: result.filePaths[0] };
  }
  return { success: false };
});

// Orbis API handlers
ipcMain.handle('orbis-fetch-mods', async (event, page = 1, search = '', category = '') => {
  try {
    const config = await getConfig();
    const apiKey = config.orbisApiKey;
    
    // If no API key, return demo mods with instructions
    if (!apiKey) {
      const demoMods = [
        {
          id: 1,
          name: 'Enhanced Textures Pack',
          author: 'TextureArtist',
          description: 'High-quality texture overhauls for better visuals in Hytale',
          downloads: 5234,
          version: '2.1.0',
          downloadUrl: 'https://example.com/enhanced-textures.jar',
          category: 'Textures'
        },
        {
          id: 2,
          name: 'Better Lighting Mod',
          author: 'LightingEnthusiast',
          description: 'Improves global illumination and dynamic lighting in the game',
          downloads: 3892,
          version: '1.5.0',
          downloadUrl: 'https://example.com/better-lighting.jar',
          category: 'Graphics'
        },
        {
          id: 3,
          name: 'Combat Tweaks',
          author: 'GameBalancer',
          description: 'Rebalances combat mechanics for more challenging gameplay',
          downloads: 2156,
          version: '1.0.5',
          downloadUrl: 'https://example.com/combat-tweaks.jar',
          category: 'Gameplay'
        },
        {
          id: 4,
          name: 'Inventory Manager',
          author: 'UIDesigner',
          description: 'Enhanced inventory system with better organization tools',
          downloads: 1843,
          version: '1.2.3',
          downloadUrl: 'https://example.com/inventory-manager.jar',
          category: 'UI'
        },
        {
          id: 5,
          name: 'Quality of Life Enhancements',
          author: 'QoLModder',
          description: 'Various quality of life improvements and convenience features',
          downloads: 4521,
          version: '3.0.0',
          downloadUrl: 'https://example.com/qol-enhancements.jar',
          category: 'General'
        },
        {
          id: 6,
          name: 'Advanced Crafting System',
          author: 'CraftMaster',
          description: 'Adds new crafting recipes and advanced manufacturing options',
          downloads: 2789,
          version: '1.1.0',
          downloadUrl: 'https://example.com/advanced-crafting.jar',
          category: 'Gameplay'
        }
      ];

      // Filter by search query if provided
      let filtered = demoMods;
      if (search) {
        const query = search.toLowerCase();
        filtered = demoMods.filter(mod => 
          mod.name.toLowerCase().includes(query) ||
          mod.description.toLowerCase().includes(query) ||
          mod.author.toLowerCase().includes(query)
        );
      }

      // Filter by category if provided
      if (category) {
        filtered = filtered.filter(mod => mod.category === category);
      }

      return { 
        success: true, 
        data: filtered,
        isDemoMode: true,
        message: 'Showing demo mods. Configure Orbis API key in Settings for real mods.'
      };
    }
    
    // Use the Orbis API endpoint
    const url = new URL('https://api.orbis.place/resources');
    url.searchParams.set('page', page);
    url.searchParams.set('limit', 50); // Request up to 50 mods per page
    if (search) url.searchParams.set('search', search);
    if (category) url.searchParams.set('category', category);
    
    return new Promise((resolve, reject) => {
      const options = {
        headers: {
          'x-api-key': apiKey
        }
      };
      
      https.get(url.toString(), options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          console.log('Orbis API Response Status:', res.statusCode);
          
          if (res.statusCode === 429) {
            resolve({ 
              success: false, 
              error: 'Rate limit exceeded. Please wait before trying again.' 
            });
            return;
          }
          
          if (res.statusCode !== 200) {
            console.error('Orbis API Error:', res.statusCode, res.statusMessage);
            resolve({ 
              success: false, 
              error: `API error: ${res.statusCode} ${res.statusMessage}` 
            });
            return;
          }
          
          try {
            const result = JSON.parse(data);
            console.log('Orbis API Response:', result);
            
            // Extract mods array from response
            // The API returns the mods array directly at the top level
            let modsArray = [];
            let pagination = {};
            
            if (Array.isArray(result)) {
              modsArray = result;
            } else if (result.data && Array.isArray(result.data)) {
              modsArray = result.data;
              pagination = result.meta || {};
            } else if (result.mods && Array.isArray(result.mods)) {
              modsArray = result.mods;
              pagination = result.meta || {};
            }
            
            // Map mods to include downloadUrl from latestVersion
            const modsWithDownloads = modsArray.map(mod => {
              let downloadUrl = '';
              
              // Try to get download URL from latestVersion
              if (mod.latestVersion) {
                // Try different possible property names
                downloadUrl = mod.latestVersion.downloadUrl ||
                             mod.latestVersion.url ||
                             mod.latestVersion.fileUrl ||
                             mod.latestVersion.downloadPath ||
                             mod.latestVersion.file?.url ||
                             '';
              }
              
              // If still no URL, construct one from the Orbis API
              // The Orbis API likely has a download endpoint we can construct
              if (!downloadUrl && mod.latestVersionId) {
                // Try the standard Orbis download endpoint
                downloadUrl = `https://api.orbis.place/resources/${mod.id}/versions/${mod.latestVersionId}/download`;
              } else if (!downloadUrl && mod.id) {
                // Fallback to just using the mod ID
                downloadUrl = `https://api.orbis.place/resources/${mod.id}/download`;
              }
              
              return {
                id: mod.id,
                name: mod.name,
                author: mod.ownerUser?.username || mod.ownerUser?.name || 'Unknown',
                description: mod.tagline || mod.description || '',
                downloads: mod.downloadCount || 0,
                version: mod.latestVersion?.versionNumber || '1.0.0',
                downloadUrl: downloadUrl,
                iconUrl: mod.iconUrl,
                status: mod.status,
                verified: mod.verified,
                original: mod
              };
            });
            
            resolve({ 
              success: true, 
              data: modsWithDownloads, 
              isDemoMode: false,
              pagination: pagination 
            });
          } catch (error) {
            console.error('Failed to parse Orbis API response:', error);
            resolve({ 
              success: false, 
              error: 'Failed to parse API response: ' + error.message 
            });
          }
        });
      }).on('error', (error) => {
        console.error('Error fetching mods from Orbis:', error);
        resolve({ success: false, error: error.message });
      });
    });
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('orbis-download-mod', async (event, modUrl, modsPath, modName) => {
  try {
    if (!modsPath) {
      return { success: false, error: 'Mods folder not set. Please configure it in Settings.' };
    }
    
    // Create mods directory if it doesn't exist
    try {
      await fs.access(modsPath);
    } catch {
      await fs.mkdir(modsPath, { recursive: true });
    }
    
    const fileName = modName || path.basename(new URL(modUrl).pathname);
    const destPath = path.join(modsPath, fileName);
    
    return new Promise((resolve, reject) => {
      const file = require('fs').createWriteStream(destPath);
      const protocol = modUrl.startsWith('https') ? https : http;
      
      protocol.get(modUrl, (response) => {
        if (response.statusCode === 302 || response.statusCode === 301) {
          // Handle redirect
          protocol.get(response.headers.location, (redirectResponse) => {
            redirectResponse.pipe(file);
            file.on('finish', () => {
              file.close();
              resolve({ success: true, path: destPath });
            });
          });
        } else {
          response.pipe(file);
          file.on('finish', () => {
            file.close();
            resolve({ success: true, path: destPath });
          });
        }
      }).on('error', (error) => {
        fs.unlink(destPath).catch(() => {});
        reject({ success: false, error: error.message });
      });
    });
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Game launching handlers
ipcMain.handle('find-hytale-executable', async () => {
  // First check saved path
  const config = await getConfig();
  if (config.hytaleExePath) {
    try {
      await fs.access(config.hytaleExePath);
      return { success: true, path: config.hytaleExePath };
    } catch {
      // Saved path doesn't exist, continue searching
    }
  }
  
  // Search default locations
  const platform = os.platform();
  const possiblePaths = [];
  
  if (platform === 'win32') {
    possiblePaths.push(
      path.join('C:', 'Program Files', 'Hytale', 'Hytale.exe'),
      path.join('C:', 'Program Files (x86)', 'Hytale', 'Hytale.exe'),
      path.join(os.homedir(), 'AppData', 'Local', 'Hytale', 'Hytale.exe'),
      path.join(os.homedir(), 'AppData', 'Roaming', 'Hytale', 'Hytale.exe')
    );
  } else if (platform === 'darwin') {
    possiblePaths.push(
      path.join('/Applications', 'Hytale.app', 'Contents', 'MacOS', 'Hytale'),
      path.join(os.homedir(), 'Applications', 'Hytale.app', 'Contents', 'MacOS', 'Hytale')
    );
  } else {
    possiblePaths.push(
      path.join(os.homedir(), '.local', 'share', 'Hytale', 'Hytale'),
      path.join('/usr', 'local', 'bin', 'Hytale'),
      path.join('/usr', 'bin', 'Hytale')
    );
  }
  
  for (const exePath of possiblePaths) {
    try {
      await fs.access(exePath);
      // Save found path
      config.hytaleExePath = exePath;
      await saveConfig(config);
      return { success: true, path: exePath };
    } catch {
      // Continue searching
    }
  }
  
  return { success: false, error: 'Hytale executable not found' };
});

ipcMain.handle('launch-hytale', async (event, exePath, modsPath) => {
  try {
    if (!exePath) {
      // Find executable
      const platform = os.platform();
      const possiblePaths = [];
      
      if (platform === 'win32') {
        possiblePaths.push(
          path.join('C:', 'Program Files', 'Hytale', 'Hytale.exe'),
          path.join('C:', 'Program Files (x86)', 'Hytale', 'Hytale.exe'),
          path.join(os.homedir(), 'AppData', 'Local', 'Hytale', 'Hytale.exe'),
          path.join(os.homedir(), 'AppData', 'Roaming', 'Hytale', 'Hytale.exe')
        );
      } else if (platform === 'darwin') {
        possiblePaths.push(
          path.join('/Applications', 'Hytale.app', 'Contents', 'MacOS', 'Hytale'),
          path.join(os.homedir(), 'Applications', 'Hytale.app', 'Contents', 'MacOS', 'Hytale')
        );
      } else {
        possiblePaths.push(
          path.join(os.homedir(), '.local', 'share', 'Hytale', 'Hytale'),
          path.join('/usr', 'local', 'bin', 'Hytale'),
          path.join('/usr', 'bin', 'Hytale')
        );
      }
      
      let found = false;
      for (const possiblePath of possiblePaths) {
        try {
          await fs.access(possiblePath);
          exePath = possiblePath;
          found = true;
          break;
        } catch {
          // Continue searching
        }
      }
      
      if (!found) {
        return { success: false, error: 'Hytale executable not found. Please set the path in settings.' };
      }
    }
    
    // Launch Hytale
    const execDir = path.dirname(exePath);
    const child = spawn(exePath, [], {
      detached: true,
      stdio: 'ignore',
      cwd: execDir
    });
    
    child.unref();
    
    return { success: true };
  } catch (error) {
    console.error('Error launching Hytale:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('select-hytale-executable', async () => {
  const platform = os.platform();
  const filters = [];
  
  if (platform === 'win32') {
    filters.push({ name: 'Executable', extensions: ['exe'] });
  } else if (platform === 'darwin') {
    filters.push({ name: 'Application', extensions: ['app'] });
  }
  
  filters.push({ name: 'All Files', extensions: ['*'] });
  
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    title: 'Select Hytale Executable',
    filters: filters
  });
  
  if (!result.canceled && result.filePaths.length > 0) {
    return { success: true, path: result.filePaths[0] };
  }
  return { success: false };
});

// Alias for compatibility
ipcMain.handle('select-hytale-exe', async () => {
  const platform = os.platform();
  const filters = [];
  
  if (platform === 'win32') {
    filters.push({ name: 'Executable', extensions: ['exe'] });
  } else if (platform === 'darwin') {
    filters.push({ name: 'Application', extensions: ['app'] });
  }
  
  filters.push({ name: 'All Files', extensions: ['*'] });
  
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    title: 'Select Hytale Executable',
    filters: filters
  });
  
  if (!result.canceled && result.filePaths.length > 0) {
    return { success: true, path: result.filePaths[0] };
  }
  return { success: false };
});

