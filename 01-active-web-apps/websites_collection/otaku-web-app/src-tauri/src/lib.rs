use std::path::Path;
use std::fs::File;
use std::io::Read;
use xxhash_rust::xxh3::xxh3_64;
use walkdir::WalkDir;

// A highly optimized Tauri command that rips through a directory and hashes .mkv files
#[tauri::command]
async fn scan_directory(path: String) -> Result<Vec<String>, String> {
    let mut scanned_files = Vec::new();
    
    // CPU-intensive background scanning
    for entry in WalkDir::new(Path::new(&path)).into_iter().filter_map(|e| e.ok()) {
        if entry.path().extension().and_then(|s| s.to_str()) == Some("mkv") {
            if let Ok(mut file) = File::open(entry.path()) {
                let mut buffer = Vec::new();
                // Read the first 1MB for ultra-fast fingerprinting
                if let Ok(bytes_read) = file.by_ref().take(1_048_576).read_to_end(&mut buffer) {
                    if bytes_read > 0 {
                        let hash = xxh3_64(&buffer);
                        let file_name = entry.file_name().to_string_lossy().into_owned();
                        scanned_files.push(format!("{}:{:x}", file_name, hash));
                    }
                }
            }
        }
    }
    
    Ok(scanned_files)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![scan_directory])
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
