use tauri::Manager;


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;

        // let window = app.get_webview_window("main").expect("无法获取主窗口");
      // 打开 webview 的开发者工具
      // window.open_devtools();

      }
      // let window = app.get_webview_window("main").expect("无法获取主窗口");
      // 打开 webview 的开发者工具
      // window.open_devtools();
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
