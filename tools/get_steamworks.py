#!/usr/bin/env python3
import os
import sys
import zipfile
import shutil
from pathlib import Path
from urllib.request import urlretrieve

# Configuration
SDK_URL = "SECRET"
DOWNLOAD_DIR = "temp_sdk"
RESOURCES_DIR = "src-tauri/resources"
ZIP_FILE = "steamworks_sdk.zip"

# Library mappings: source path -> destination path
LIBRARIES = {
    "sdk/redistributable_bin/osx/libsteam_api.dylib": "libsteam_api.dylib",
    "sdk/redistributable_bin/win64/steam_api64.dll": "steam_api64.dll",
    "sdk/redistributable_bin/linux64/libsteam_api.so": "libsteam_api.so",
}

def download_progress(block_num, block_size, total_size):
    """Display download progress"""
    downloaded = block_num * block_size
    percent = min(downloaded * 100.0 / total_size, 100)
    sys.stdout.write(f"\rDownloading: {percent:.1f}%")
    sys.stdout.flush()

def download_sdk():
    """Download the Steamworks SDK"""
    print(f"Downloading Steamworks SDK from {SDK_URL}")
    try:
        urlretrieve(SDK_URL, ZIP_FILE, reporthook=download_progress)
        print("\nDownload complete!")
        return True
    except Exception as e:
        print(f"\nError downloading SDK: {e}")
        return False

def extract_sdk():
    """Extract the SDK zip file"""
    print(f"Extracting {ZIP_FILE}...")
    try:
        with zipfile.ZipFile(ZIP_FILE, 'r') as zip_ref:
            zip_ref.extractall(DOWNLOAD_DIR)
        print("Extraction complete!")
        return True
    except Exception as e:
        print(f"Error extracting SDK: {e}")
        return False

def organize_libraries():
    """Move libraries to resources directory"""
    print(f"Organizing libraries into {RESOURCES_DIR}/")
    
    Path(RESOURCES_DIR).mkdir(exist_ok=True)
    
    copied = 0
    for src_path, dest_path in LIBRARIES.items():
        src = Path(DOWNLOAD_DIR) / src_path
        dest = Path(RESOURCES_DIR) / dest_path
        
        if src.exists():
            dest.parent.mkdir(parents=True, exist_ok=True)
            
            shutil.copy2(src, dest)
            print(f"{src_path} -> {RESOURCES_DIR}/{dest_path}")
            copied += 1
        else:
            print(f"Warning: {src_path} not found")
    
    print(f"\nCopied {copied}/{len(LIBRARIES)} libraries")
    return copied > 0

def cleanup():
    print("Cleaning up temporary files...")
    
    if os.path.exists(ZIP_FILE):
        os.remove(ZIP_FILE)
        print(f"  Removed {ZIP_FILE}")
    
    if os.path.exists(DOWNLOAD_DIR):
        shutil.rmtree(DOWNLOAD_DIR)
        print(f"  Removed {DOWNLOAD_DIR}/")

def main():
    print("=" * 60)
    print("Steamworks SDK Build Script")
    print("=" * 60)
    
    try:
        if not download_sdk():
            return 1
        
        if not extract_sdk():
            return 1
        
        if not organize_libraries():
            return 1
        
        cleanup()
        
        print("\n" + "=" * 60)
        print("Build complete! Libraries are in the resources/ directory")
        print("=" * 60)
        return 0
        
    except KeyboardInterrupt:
        print("\n\nBuild interrupted by user")
        cleanup()
        return 1
    except Exception as e:
        print(f"\nUnexpected error: {e}")
        cleanup()
        return 1

if __name__ == "__main__":
    sys.exit(main())