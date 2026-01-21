#[cfg(feature = "steam")]
pub mod presence;

#[cfg(feature = "steam")]
pub mod state;

#[cfg(feature = "steam")]
pub use state::SteamState;
