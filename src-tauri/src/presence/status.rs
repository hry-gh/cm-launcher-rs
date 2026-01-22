//! Server status fetching utilities

#[derive(Debug, serde::Deserialize)]
pub struct StatusResponse {
    pub servers: Vec<ServerStatus>,
}

#[derive(Debug, serde::Deserialize)]
pub struct ServerStatus {
    pub name: String,
    #[allow(dead_code)]
    pub status: String,
    pub data: Option<ServerData>,
}

#[derive(Debug, serde::Deserialize)]
pub struct ServerData {
    pub players: u32,
}

pub async fn fetch_player_count(status_url: &str, server_name: &str) -> Option<u32> {
    let response = reqwest::get(status_url).await.ok()?;
    let status: StatusResponse = response.json().await.ok()?;

    status
        .servers
        .iter()
        .find(|s| s.name == server_name)
        .and_then(|s| s.data.as_ref())
        .map(|d| d.players)
}
