/// Represents an active game session
#[derive(Debug, Clone)]
pub struct GameSession {
    pub server_name: String,
    pub status_url: String,
}

/// The current state of presence to display
#[derive(Debug, Clone)]
#[allow(dead_code)]
pub enum PresenceState {
    /// User is in the launcher, not playing
    InLauncher,
    /// User is playing on a server
    Playing {
        server_name: String,
        player_count: u32,
    },
    /// Presence should be cleared/hidden
    #[allow(dead_code)]
    Disconnected,
}

/// Trait for presence providers (Steam, Discord, etc.)
#[allow(dead_code)]
pub trait PresenceProvider: Send + Sync {
    /// Returns the name of this presence provider (for logging)
    fn name(&self) -> &'static str;

    /// Update the presence state
    fn update_presence(&self, state: &PresenceState);

    /// Clear all presence data
    fn clear_presence(&self);
}
