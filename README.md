# HyLauncher

HyLauncher is a direct, no-nonsense tool for launching Hytale in offline mode. It's built to bypass the standard login process by emulating the necessary environment variables and directory structures right on your machine.

## Key Features

Offline Authentication: Forces the client into offline mode so you don't have to deal with login servers.

Multiplayer Authentication (WIP): Support for local session emulation and custom identity tokens is currently under development.

Smart Java Detection: Automatically looks for the bundled JRE in your game files so you don't have to install Java manually.

Auto-Setup: Handles the creation of the UserData folder in your AppData so the game actually boots without errors.

Live Logging: Streams the game's console output directly to your terminal so you can see exactly what's happening or why it's crashing.

## How to use

Configure the Path: Make sure the GAME_PATH in the script points to your HytaleClient.exe.

## Technical Details

The launcher ensures the game runs from the correct working directory (Client folder) and maps the user data to:
%APPDATA%\Hytale\UserData

