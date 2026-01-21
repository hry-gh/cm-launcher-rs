# CM Launcher

A rewrite of the DreamMaker backed CMLauncher, using Tauri and managing BYOND versions internally.

## Features

- BYOND version management
  - Automatically pulls the correct version for the game server you are connecting to.
- Non-BYOND authentication
  - Allows usage of CM-SS13 Authentication (Authentik) and Steam Authentication, in addition to BYOND
  - This is passed to the game server as an access code that can be further verified to prove identity and retrieve usernames, linked ckeys
- Steam Rich Presence
  - Shows which server the user is connected to, as well as the server population
  - Allows friends to quick connect to a server
- Access token/refresh token management for CM-SS13 Authentication
- Automatic CI/CD to Steam
