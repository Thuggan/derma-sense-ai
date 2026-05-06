import os
import subprocess
import sys

def main():
    home_dir = os.path.expanduser('~')
    kaggle_dir = os.path.join(home_dir, '.kaggle')
    kaggle_json = os.path.join(kaggle_dir, 'kaggle.json')

    if not os.path.exists(kaggle_json):
        print(f"==================================================")
        print(f" ERROR: Kaggle API Token NOT FOUND at {kaggle_json}")
        print(f"==================================================")
        print("Please follow these steps to proceed:")
        print("1. Go to https://www.kaggle.com/ and log into your account.")
        print("2. Click on your profile picture (top right) -> 'Settings' or 'Account'.")
        print("3. Scroll down to the 'API' section.")
        print("4. Click 'Create New API Token'. This will download a 'kaggle.json' file.")
        print(f"5. Move that 'kaggle.json' file into exactly this folder: {kaggle_dir}")
        print("   (You may need to create the '.kaggle' folder if it doesn't exist).")
        print("\nOnce you have placed the file there, run this script again!")
        sys.exit(1)

    print("Kaggle API token found!")
    
    # Ensure kaggle is installed
    try:
        import kaggle
    except ImportError:
        print("Installing kaggle python module...")
        subprocess.run([sys.executable, "-m", "pip", "install", "kaggle"], check=True)
    
    dataset_dest = os.path.join(os.getcwd(), 'dataset-preprocessing')
    os.makedirs(dataset_dest, exist_ok=True)
    
    print("Downloading the 'Dermnet' dataset (19,500+ skin disease images)...")
    print("This might take a few minutes depending on your internet connection.")
    # Execute the kaggle dataset download command
    try:
        subprocess.run([
            "kaggle", "datasets", "download", "-d", "shubhamgoel27/dermnet", 
            "-p", dataset_dest, "--unzip"
        ], check=True)
        print(f"\n✅ Success! The dataset has been downloaded and extracted to: {dataset_dest}")
    except subprocess.CalledProcessError as e:
        print(f"\n❌ Error downloading the dataset: {str(e)}")

if __name__ == "__main__":
    main()
