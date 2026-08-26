#!/usr/bin/env python3

import subprocess
import sys
import os
from pathlib import Path
from typing import Optional, List


class Colors:
    #ANSI color codes for beautiful terminal output
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'


def print_header(text: str) -> None:
    #Print a styled header
    print(f"\n{Colors.HEADER}{Colors.BOLD}{'='*60}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{text:^60}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{'='*60}{Colors.ENDC}\n")


def print_step(text: str) -> None:
    #Print a step in the process
    print(f"{Colors.OKBLUE}→ {text}{Colors.ENDC}")


def print_success(text: str) -> None:
    #Print success message
    print(f"{Colors.OKGREEN}✓ {text}{Colors.ENDC}")


def print_error(text: str) -> None:
    #Print error message
    print(f"{Colors.FAIL}✗ {text}{Colors.ENDC}")


def print_warning(text: str) -> None:
    #Print warning message
    print(f"{Colors.WARNING}⚠ {text}{Colors.ENDC}")


def run_command(cmd: List[str], description: str) -> bool:
    #Run a shell command and return success/failure
    print_step(description)
    try:
        result = subprocess.run(cmd, check=True, capture_output=False, text=True)
        print_success(description)
        return True
    except subprocess.CalledProcessError as e:
        print_error(f"{description} failed with exit code {e.returncode}")
        return False
    except FileNotFoundError:
        print_error(f"Command not found: {cmd[0]}")
        return False


def check_python_version() -> bool:
    #Ensure Python 3.9+ is installed
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 9):
        print_error(f"Python 3.9+ required; you have {version.major}.{version.minor}")
        return False
    print_success(f"Python {version.major}.{version.minor} detected")
    return True


def install_dependencies() -> bool:
    #Install required packages
    print_header("Installing Dependencies")
    
    # Upgrade pip first
    print_step("Upgrading pip...")
    subprocess.run([sys.executable, "-m", "pip", "install", "--upgrade", "pip"],
                   capture_output=True, text=True)
    
    # Install requirements
    requirements_path = Path(__file__).parent / "requirements.txt"
    if not requirements_path.exists():
        print_error(f"requirements.txt not found at {requirements_path}")
        return False
    
    return run_command(
        [sys.executable, "-m", "pip", "install", "-r", str(requirements_path)],
        "Installing packages from requirements.txt"
    )


def preprocess_data() -> bool:
    #Run data preprocessing
    print_header("Preprocessing Data")
    
    script = Path(__file__).parent / "preprocess_data.py"
    if not script.exists():
        print_error(f"preprocess_data.py not found at {script}")
        return False
    
    return run_command(
        [sys.executable, str(script)],
        "Running data preprocessing..."
    )


def train_model() -> bool:
    #Run model training
    print_header("Training Model")
    
    # Check if preprocessed data exists
    data_path = Path(__file__).parent / "data" / "processed" / "crowd_prediction_dataset_clean.csv"
    if not data_path.exists():
        print_error(f"Preprocessed data not found at {data_path}")
        print_warning("Run 'python setup_and_run.py preprocess' first")
        return False
    
    script = Path(__file__).parent / "train_model.py"
    if not script.exists():
        print_error(f"train_model.py not found at {script}")
        return False
    
    return run_command(
        [sys.executable, str(script)],
        "Training model (this may take a few minutes)..."
    )


def serve_api(host: str = "0.0.0.0", port: int = 8000) -> bool:
    #Run the FastAPI server
    print_header("Starting API Server")
    
    # Check if model exists
    model_path = Path(__file__).parent / "models" / "crowd_model.joblib"
    if not model_path.exists():
        print_error(f"Trained model not found at {model_path}")
        print_warning("Run 'python setup_and_run.py train' first")
        return False
    
    print_success("Model artifacts found")
    print(f"\n{Colors.OKGREEN}{Colors.BOLD}Starting API server...{Colors.ENDC}")
    print(f"  Dashboard: {Colors.OKBLUE}http://localhost:{port}{Colors.ENDC}")
    print(f"  Swagger:   {Colors.OKBLUE}http://localhost:{port}/docs{Colors.ENDC}")
    print(f"  ReDoc:     {Colors.OKBLUE}http://localhost:{port}/redoc{Colors.ENDC}")
    print(f"\n{Colors.WARNING}Press Ctrl+C to stop{Colors.ENDC}\n")
    
    # Import here to avoid errors if uvicorn isn't installed yet
    try:
        import uvicorn
    except ImportError:
        print_error("uvicorn not installed")
        return False
    
    # Run the server
    try:
        uvicorn.run(
            "app.main:app",
            host=host,
            port=port,
            reload=True,
            log_level="info"
        )
        return True
    except KeyboardInterrupt:
        print_success("Server stopped")
        return True
    except Exception as e:
        print_error(f"Server error: {e}")
        return False


def run_all() -> bool:
    #Run the complete pipeline
    print_header("🌏 Crowd Almanac Setup & Training")
    
    steps = [
        ("Dependencies", install_dependencies),
        ("Data Preprocessing", preprocess_data),
        ("Model Training", train_model),
    ]
    
    for step_name, step_func in steps:
        if not step_func():
            print_error(f"Failed at: {step_name}")
            print_warning("Run 'python setup_and_run.py <step>' to retry just that step")
            return False
    
    print_header("Setup Complete!")
    print(f"{Colors.OKGREEN}{Colors.BOLD}")
    print("To start the API server, run:")
    print(f"  python setup_and_run.py serve")
    print(f"{Colors.ENDC}\n")
    
    return True


def show_help() -> None:
    #Display help message
    help_text = f"""
{Colors.HEADER}{Colors.BOLD}Crowd Almanac Setup & Run{Colors.ENDC}

{Colors.BOLD}Usage:{Colors.ENDC}
  python setup_and_run.py <command>

{Colors.BOLD}Commands:{Colors.ENDC}
  install      Install Python dependencies
  preprocess   Preprocess raw data into features
  train        Train the ML model (requires preprocessed data)
  serve        Start the API server (requires trained model)
  all          Run install → preprocess → train (doesn't start server)
  help         Show this help message

{Colors.BOLD}Full workflow:{Colors.ENDC}
  1. python setup_and_run.py all        # One-time setup
  2. python setup_and_run.py serve      # Start the server
  3. Open http://localhost:8000 in your browser

{Colors.BOLD}Troubleshooting:{Colors.ENDC}
  • If a step fails, check the error above and fix the issue
  • Make sure you're in the tourism_crowd_predictor directory
  • Python 3.9+ is required

{Colors.BOLD}For more info, see:{Colors.ENDC}
  • README.md – Project overview & architecture
  • app/config.py – Configuration options
  • http://localhost:8000/docs – API documentation
"""
    print(help_text)


def main():
    #Main entry point
    if not check_python_version():
        sys.exit(1)
    
    if len(sys.argv) < 2:
        show_help()
        sys.exit(0)
    
    command = sys.argv[1].lower()
    
    commands = {
        "install": install_dependencies,
        "preprocess": preprocess_data,
        "train": train_model,
        "serve": serve_api,
        "all": run_all,
        "help": show_help,
        "-h": show_help,
        "--help": show_help,
    }
    
    if command not in commands:
        print_error(f"Unknown command: {command}")
        print_warning("Run 'python setup_and_run.py help' for available commands")
        sys.exit(1)
    
    success = commands[command]()
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
