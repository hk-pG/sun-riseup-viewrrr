use tauri_plugin_log::{Target, TargetKind};

//INFO:  lib.rsを直接編集するとrust-analyzerの動作が重いので、ログ設定の生成を別モジュールに切り出す

///
/// tauri_plugin_logのBuilderを生成する
///
/// usage:
/// ```ignore
/// use sun_riseup_viewrrr_lib::tauri_log_config::generate_tauri_log_config;
/// fn main() {
///     let builder = generate_tauri_log_config();
///     let _ = builder.build();
/// }
/// ```
pub fn generate_tauri_log_config() -> tauri_plugin_log::Builder {
    tauri_plugin_log::Builder::new().targets([
        Target::new(TargetKind::Stdout),
        Target::new(TargetKind::LogDir {
            file_name: Some("logs".to_string()),
        }),
        Target::new(TargetKind::Webview),
    ])
}
