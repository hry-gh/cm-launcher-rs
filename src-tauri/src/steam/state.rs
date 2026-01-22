use std::sync::{Arc, Mutex};
use steamworks::{AuthTicket, Client};

/// Manages Steam client state and authentication
pub struct SteamState {
    client: Client,
    active_ticket: Arc<Mutex<Option<AuthTicket>>>,
}

impl SteamState {
    pub fn init() -> Result<Self, steamworks::SteamAPIInitError> {
        tracing::debug!("Initializing Steam client");
        let client = Client::init()?;
        Ok(Self {
            client,
            active_ticket: Arc::new(Mutex::new(None)),
        })
    }

    pub fn get_steam_id(&self) -> u64 {
        self.client.user().steam_id().raw()
    }

    pub fn get_display_name(&self) -> String {
        self.client.friends().name()
    }

    pub fn get_auth_session_ticket(&self) -> Result<Vec<u8>, String> {
        let identity = steamworks::networking_types::NetworkingIdentity::new();
        let (ticket, ticket_bytes) = self.client.user().authentication_session_ticket(identity);

        let mut active = self.active_ticket.lock().unwrap();
        *active = Some(ticket);

        Ok(ticket_bytes)
    }

    pub fn cancel_auth_ticket(&self) {
        let mut active = self.active_ticket.lock().unwrap();
        *active = None;
    }

    pub fn client(&self) -> &Client {
        &self.client
    }

    pub fn get_launch_command_line(&self) -> String {
        self.client.apps().launch_command_line()
    }

    pub fn run_callbacks(&self) {
        self.client.run_callbacks();
    }
}
