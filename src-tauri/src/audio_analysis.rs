use pyo3::prelude::*;
use pyo3::types::{PyList, PyString, PyTuple};
use tauri::AppHandle;
use std::path::PathBuf;

fn get_venv_python_path(handle: &AppHandle) -> Option<PathBuf> {
    let possible_paths = if cfg!(target_os = "windows") {
        vec![
            handle
                .path_resolver()
                .resolve_resource(".venv/Scripts/python.exe")?,
            handle
                .path_resolver()
                .resolve_resource("python/python.exe")?,
        ]
    } else {
        vec![
            handle
                .path_resolver()
                .resolve_resource(".venv/bin/python3.12")?,
            handle
                .path_resolver()
                .resolve_resource("python/bin/python3")?,
            handle
                .path_resolver()
                .resolve_resource(".venv/bin/python")?,
            handle
                .path_resolver()
                .resolve_resource("python/bin/python")?,
        ]
    };

    for path in possible_paths {
        if path.exists() {
            return Some(path);
        }
    }

    None // Interpreter not found
}


fn get_venv_site_packages(handle: &AppHandle) -> Option<PathBuf> {
    let possible_paths = if cfg!(target_os = "windows") {
        vec![
            handle
                .path_resolver()
                .resolve_resource(".venv/Lib/site-packages")?,
            handle
                .path_resolver()
                .resolve_resource("python/Lib/site-packages")?,
        ]
    } else {
        vec![
            handle
                .path_resolver()
                .resolve_resource(".venv/lib/python3.12/site-packages")?,
            handle
                .path_resolver()
                .resolve_resource("python/lib/python3.12/site-packages")?,
            handle
                .path_resolver()
                .resolve_resource(".venv/lib/python3.11/site-packages")?,
            handle
                .path_resolver()
                .resolve_resource("python/lib/python3.11/site-packages")?,
            // Add more versions if necessary
        ]
    };

    for path in possible_paths {
        if path.exists() {
            return Some(path);
        }
    }

    None
}

fn get_analyzer_path(handle: &AppHandle) -> Option<PathBuf> {
    handle.path_resolver().resolve_resource("src")
}

// #[tauri::command]
// pub fn analyze_audio(handle: AppHandle, file_path: String) -> Result<(String, f64), String> {
//     analyze_audio_internal(handle, file_path)
// }

pub fn analyze_audio_internal(handle: AppHandle, file_path: String) -> Result<(String, f64), String> {
    let venv_python_path = get_venv_python_path(&handle).ok_or("Python interpreter not found")?;
    let venv_site_packages = get_venv_site_packages(&handle).ok_or("Site-packages directory not found")?;
    let analyzer_path = get_analyzer_path(&handle).ok_or("Analyzer path not found")?;

    Python::with_gil(|py| {
        // Import the sys module
        let sys = py.import_bound("sys").map_err(|e| e.to_string())?;

        // Set the Python executable to the one inside the virtual environment
        let venv_python_path_str = venv_python_path.to_str().ok_or("Invalid path")?;
        sys.setattr("executable", venv_python_path_str).map_err(|e| e.to_string())?;

        // Ensure sys.prefix points to the virtual environment
        sys.setattr("prefix", venv_python_path_str).map_err(|e| e.to_string())?;
        sys.setattr("base_prefix", venv_python_path_str).map_err(|e| e.to_string())?;

        // Ensure sys.path includes the virtual environment's site-packages
        let path: Bound<'_, PyList> = sys.getattr("path").map_err(|e| e.to_string())?.extract().map_err(|e| e.to_string())?;
        let venv_site_packages_str = venv_site_packages.to_str().ok_or("Invalid path")?;
        let analyzer_path_str = analyzer_path.to_str().ok_or("Invalid path")?;

        // Prepend the virtual environment's site-packages to sys.path
        path.insert(0, PyString::new_bound(py, venv_site_packages_str)).map_err(|e| e.to_string())?;

        // Also add the analyzer path where audio_analyzer.py is located
        path.append(PyString::new_bound(py, analyzer_path_str)).map_err(|e| e.to_string())?;

        // Import the audio_analyzer module and call the analyze method
        let my_module = py.import_bound("audio_analyzer").map_err(|e| e.to_string())?;
        let py_file_path = PyString::new_bound(py, &file_path);
        let args: Bound<'_, PyTuple> = PyTuple::new_bound(py, &[py_file_path]);
        let result = my_module.call_method1("analyze", args).map_err(|e| e.to_string())?;
        let extracted_result: (String, f64) = result.extract().map_err(|e| e.to_string())?;

        Ok(extracted_result)
    })
}


// #[pymodule(name = "audio_analyzer")]
// fn my_rust_module(m: &Bound<'_, PyModule>) -> PyResult<()> {
//     m.add_function(wrap_pyfunction!(analyze_audio, m)?)?;
//     Ok(())
// }
