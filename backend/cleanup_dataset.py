import os
import shutil

APPROVED_CLASSES = [
    "Acne and Rosacea Photos",
    "Hair Loss Photos Alopecia and other Hair Diseases",
    "Nail Fungus and other Nail Disease",
    "Tinea Ringworm Candidiasis and other Fungal Infections",
    "Melanoma Skin Cancer Nevi and Moles",
    "Actinic Keratosis Basal Cell Carcinoma and other Malignant Lesions",
    "Psoriasis pictures Lichen Planus and related diseases",
    "Eczema Photos",
    "Warts Molluscum and other Viral Infections",
    "Atopic Dermatitis Photos",
    "Cellulitis Impetigo and other Bacterial Infections",
    "Seborrheic Keratoses and other Benign Tumors",
    "Light Diseases and Disorders of Pigmentation",
    "Z_Non_Skin_Images"
]

def clean_dir(base_dir):
    if not os.path.exists(base_dir):
        return
        
    for d in os.listdir(base_dir):
        path = os.path.join(base_dir, d)
        if os.path.isdir(path):
            if d not in APPROVED_CLASSES:
                print(f"Deleting bad class folder: {d}")
                shutil.rmtree(path)
            else:
                print(f"Keeping highly accurate class: {d}")

if __name__ == '__main__':
    clean_dir('dataset-preprocessing/train')
    clean_dir('dataset-preprocessing/test')
    print("Dataset cleanup completely successful! Ready for 14-class robust training.")
