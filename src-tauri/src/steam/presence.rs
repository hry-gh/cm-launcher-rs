use steamworks::Client;

pub fn set_playing_status(client: &Client, server_name: &str, player_count: u32) {
    let friends = client.friends();

    if !friends.set_rich_presence("status", Some(&format!("Playing on {}", server_name))) {
        eprintln!("Failed to set rich presence 'status'");
    }
    if !friends.set_rich_presence("players", Some(&player_count.to_string())) {
        eprintln!("Failed to set rich presence 'players'");
    }
    if !friends.set_rich_presence("name", Some(server_name)) {
        eprintln!("Failed to set rich presence 'name'");
    }
    if !friends.set_rich_presence("steam_display", Some("#Status_Playing")) {
        eprintln!("Failed to set rich presence 'steam_display'");
    }
}

pub fn set_launcher_status(client: &Client) {
    let friends = client.friends();

    if !friends.set_rich_presence("status", Some("In the Launcher")) {
        eprintln!("Failed to set rich presence 'status'");
    }
    if !friends.set_rich_presence("steam_display", Some("#Status_Launcher")) {
        eprintln!("Failed to set rich presence 'steam_display'");
    }
}

#[allow(dead_code)]
pub fn clear_presence(client: &Client) {
    client.friends().clear_rich_presence();
}
