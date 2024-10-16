use pyo3::prelude::*;
use pyo3::types::{PyAny, PyTuple, PyModule, PyString, PyList};
use pyo3::wrap_pyfunction;
use std::env;
use std::path::PathBuf;

fn get_venv_python_path() -> PathBuf {
    // Get the current directory
    let current_dir = env::current_dir().expect("Failed to get current directory");

    // Determine the correct Python executable path for the platform
    if cfg!(target_os = "windows") {
        current_dir.join(".venv").join("Scripts").join("python.exe")
    } else {
        current_dir.join(".venv").join("bin").join("python")
    }
}

fn get_venv_site_packages() -> PathBuf {
    // Get the current directory
    let current_dir = env::current_dir().expect("Failed to get current directory");

    // Build path to the virtual environment's site-packages directory
    current_dir.join(".venv").join("Lib").join("site-packages")
}

fn get_analyzer_path() -> PathBuf {
    // Get the current directory
    let current_dir = env::current_dir().expect("Failed to get current directory");

    // Build path to the src directory (where the audio_analyzer.py is located)
    current_dir.join("src")
}

#[pyfunction]
pub fn analyze_audio(file_path: &str) -> PyResult<(String, f64)> {
    // Construct the paths outside of the GIL context
    let venv_python_path = get_venv_python_path();
    let venv_site_packages = get_venv_site_packages();
    let analyzer_path = get_analyzer_path();

    Python::with_gil(|py| {
        // Import the sys module
        let sys: Bound<'_, PyModule> = py.import_bound("sys")?;

        // Set the Python executable to the one inside the virtual environment
        let venv_python_path_str = venv_python_path.to_str().expect("Failed to convert path to str");
        println!("Setting Python executable to: {:?}", venv_python_path_str);
        sys.setattr("executable", venv_python_path_str)?;

        // Ensure sys.prefix points to the virtual environment
        sys.setattr("prefix", venv_python_path_str)?;
        sys.setattr("base_prefix", venv_python_path_str)?;

        // Ensure sys.path includes the virtual environment's site-packages
        let path: Bound<'_, PyList> = sys.getattr("path")?.extract()?;
        let venv_site_packages_str = venv_site_packages.to_str().expect("Failed to convert venv path to str");
        let analyzer_path_str = analyzer_path.to_str().expect("Failed to convert analyzer path to str");

        // Print paths for debugging
        println!("Analyzer path: {:?}", analyzer_path_str);
        println!("Virtual environment site-packages path: {:?}", venv_site_packages_str);

        // Prepend the virtual environment's site-packages to sys.path
        path.call_method("insert", (0, PyString::new_bound(py, venv_site_packages_str)), None)?;

        // Also add the analyzer path where audio_analyzer.py is located
        path.call_method("append", (PyString::new_bound(py, analyzer_path_str),), None)?;

        // Print updated sys.path for debugging
        let updated_path: Vec<String> = path.iter()
            .map(|p| p.extract::<String>())
            .collect::<PyResult<Vec<String>>>()?;
        println!("Updated Python path: {:?}", updated_path);

        // Import the audio_analyzer module and call the analyze method
        let my_module: Bound<'_, PyModule> = py.import_bound("audio_analyzer")?;
        let py_file_path: Bound<'_, PyString> = PyString::new_bound(py, file_path);
        let args = PyTuple::new_bound(py, vec![py_file_path]);
        let result: Bound<'_, PyAny> = my_module.call_method("analyze", args, None)?;
        let extracted_result: (String, f64) = result.extract()?;

        Ok(extracted_result)
    })
}





#[pymodule(name = "audio_analyzer")]
fn my_rust_module(m: &Bound<'_, PyModule>) -> PyResult<()> {
    m.add_function(wrap_pyfunction!(analyze_audio, m)?)?;
    Ok(())
}




