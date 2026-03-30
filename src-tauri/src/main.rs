#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::menu::{MenuBuilder, MenuItemBuilder};
use tauri::tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent};
use tauri::{Emitter, Manager, WebviewWindowBuilder};

#[derive(serde::Serialize)]
struct WindowPosition {
  x: i32,
  y: i32,
}

#[tauri::command]
fn get_window_position(window: tauri::WebviewWindow) -> Result<WindowPosition, String> {
  let position = window.outer_position().map_err(|err| err.to_string())?;
  Ok(WindowPosition {
    x: position.x,
    y: position.y,
  })
}

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![get_window_position])
    .setup(|app| {
      if app.get_webview_window("main").is_none() {
        let _ = WebviewWindowBuilder::new(app, "main", tauri::WebviewUrl::App("index.html".into()))
          .title("Desktop Pet")
          .inner_size(280.0, 320.0)
          .decorations(false)
          .shadow(false)
          .always_on_top(true)
          .resizable(false)
          .build()
          .map_err(|error| error.to_string())?;
      }

      if let Some(window) = app.get_webview_window("main") {
        let _ = window.set_always_on_top(true);
        let _ = window.set_visible_on_all_workspaces(true);
      }

      let show_item = MenuItemBuilder::new("显示 / 隐藏").id("toggle_visibility").build(app)?;
      let mute_item = MenuItemBuilder::new("静音切换").id("toggle_mute").build(app)?;
      let quit_item = MenuItemBuilder::new("退出").id("quit").build(app)?;

      let menu = MenuBuilder::new(app)
        .items(&[&show_item, &mute_item, &quit_item])
        .build()?;

      TrayIconBuilder::new()
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_menu_event(|app, event| match event.id.as_ref() {
          "toggle_visibility" => {
            if let Some(window) = app.get_webview_window("main") {
              let visible = window.is_visible().unwrap_or(true);
              if visible {
                let _ = window.hide();
              } else {
                let _ = window.show();
                let _ = window.set_focus();
              }
            }
          }
          "toggle_mute" => {
            if let Some(window) = app.get_webview_window("main") {
              let _ = window.emit("pet://toggle-mute", ());
            }
          }
          "quit" => app.exit(0),
          _ => {}
        })
        .on_tray_icon_event(|tray, event| {
          if let TrayIconEvent::Click {
            button: MouseButton::Left,
            button_state: MouseButtonState::Up,
            ..
          } = event
          {
            if let Some(window) = tray.app_handle().get_webview_window("main") {
              let _ = window.show();
              let _ = window.set_focus();
            }
          }
        })
        .build(app)?;

      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running desktop pet");
}
