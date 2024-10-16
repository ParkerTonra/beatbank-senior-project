use pyo3::prelude::*;
use pyo3::types::{PyAny, PyTuple, PyModule, PyString, PyList};
use pyo3::wrap_pyfunction;


use std::env;
use std::path::PathBuf;

#[pyfunction]
pub fn analyze_audio(file_path: &str) -> PyResult<(String, f64)> {
    Python::with_gil(|py| {
        // Import the sys module using import_bound
        let sys: Bound<'_, PyModule> = py.import_bound("sys")?;

        // Get the sys.path directly as a PyList
        let path: Bound<'_, PyList> = sys.getattr("path")?.extract()?;

        // Convert the path to Vec<String> and print it for debugging
        let mut path_vec: Vec<String> = path.iter()
            .map(|p| p.extract::<String>())
            .collect::<PyResult<Vec<String>>>()?;

        // Print the Python path for debugging before appending
        println!("Python path before appending: {:?}", path_vec);

        // Get the absolute path to src-tauri/src
        let current_dir = env::current_dir().expect("Failed to get current directory");
        let analyzer_path: PathBuf = current_dir.join("src-tauri\\src");
        let analyzer_path_str = analyzer_path.to_str().expect("Failed to convert path to str");

        // Append the absolute path where audio_analyzer.py is located
        path.call_method("append", (PyString::new_bound(py, analyzer_path_str),), None)?;

        // Convert the updated path to Vec<String> and print it for debugging
        path_vec = path.iter()
            .map(|p| p.extract::<String>())
            .collect::<PyResult<Vec<String>>>()?;

        // Print the Python path for debugging after appending
        println!("Updated Python path: {:?}", path_vec);

        let executable: Bound<'_, PyString> = sys.getattr("executable")?.extract()?;
        println!("Python executable: {}", executable);

        let cwd: Bound<'_, PyAny> = py.import_bound("os")?.call_method("getcwd", (), None)?;
        println!("Current working directory: {:?}", cwd);


        // Try importing the module again for debugging
        match py.import_bound("audio_analyzer") {
            Ok(_) => println!("Module imported successfully!"),
            Err(e) => println!("Failed to import module: {:?}", e),
        }


        // Import the audio_analyzer module using import_bound
        let my_module: Bound<'_, PyModule> = py.import_bound("audio_analyzer")?;

        // Create a PyString for the file path using new_bound
        let py_file_path: Bound<'_, PyString> = PyString::new_bound(py, file_path);

        // Create a PyTuple with the arguments using new_bound
        let args: Bound<'_, PyTuple> = PyTuple::new_bound(py, vec![py_file_path]); // Wrap the argument in a Vec

        // Call the analyze function and extract the result
        let result: Bound<'_, PyAny> = my_module.call_method("analyze", args, None)?;

        // Extract the result as (String, f64)
        let extracted_result: (String, f64) = result.extract()?; // Assuming the result is (String, f64)

        Ok(extracted_result) // Return the result
    })
}





#[pymodule(name = "audio_analyzer")]
fn my_rust_module(m: &Bound<'_, PyModule>) -> PyResult<()> {
    m.add_function(wrap_pyfunction!(analyze_audio, m)?)?;
    Ok(())
}




