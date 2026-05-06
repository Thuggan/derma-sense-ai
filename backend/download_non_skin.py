import os
import urllib.request
import concurrent.futures

def download_image(i, save_dir):
    url = f"https://picsum.photos/seed/{i}/224/224"
    filepath = os.path.join(save_dir, f"non_skin_{i}.jpg")
    try:
        urllib.request.urlretrieve(url, filepath)
        return True
    except Exception as e:
        return False

def main():
    target_dir = os.path.join("dataset-preprocessing", "train", "Z_Non_Skin_Images")
    os.makedirs(target_dir, exist_ok=True)
    
    num_images = 500
    print(f"Downloading {num_images} diverse non-skin images to {target_dir}...")
    
    success_count = 0
    with concurrent.futures.ThreadPoolExecutor(max_workers=20) as executor:
        futures = {executor.submit(download_image, i, target_dir): i for i in range(num_images)}
        for future in concurrent.futures.as_completed(futures):
            if future.result():
                success_count += 1
            if success_count % 50 == 0 and success_count > 0:
                print(f"Downloaded {success_count}/{num_images}...")
                
    print(f"Finished downloading {success_count} non-skin images!")

if __name__ == '__main__':
    main()
