import os
import random
import numpy as np
import tensorflow as tf

model_path = r"d:\derma-sense-ai\backend\model\dermasense_model_224_finetuned.keras"
val_dir = r"d:\derma-sense-ai\backend\dataset-preprocessing\train"

old_classes = {0: "Cellulitis", 1: "Impetigo", 2: "Ringworm", 3: "Athlete's Foot"}
groups = {
    "Cellulitis Impetigo and other Bacterial Infections": [0, 1],
    "Tinea Ringworm Candidiasis and other Fungal Infections": [2, 3]
}

def eval_old_model():
    model = tf.keras.models.load_model(model_path)
    
    total_samples = 0
    correct_group = 0
    
    for folder, expected_classes in groups.items():
        folder_path = os.path.join(val_dir, folder)
        if not os.path.exists(folder_path):
            continue
        files = os.listdir(folder_path)
        random.seed(42)
        test_files = random.sample(files, min(200, len(files)))
        
        for f in test_files:
            img_path = os.path.join(folder_path, f)
            try:
                img = tf.keras.utils.load_img(img_path, target_size=(224, 224))
                img_array = tf.keras.utils.img_to_array(img)
                img_array = np.expand_dims(img_array, axis=0) / 255.0
                
                prediction = model.predict(img_array, verbose=0)
                predicted_class = int(np.argmax(prediction[0]))
                
                total_samples += 1
                if predicted_class in expected_classes:
                    correct_group += 1
            except Exception as e:
                pass
                
    accuracy = correct_group / total_samples if total_samples > 0 else 0
    print(f"Old model evaluated on {total_samples} images from new dataset overlapping classes.")
    print(f"Group accuracy: {accuracy:.4f}")

if __name__ == '__main__':
    eval_old_model()
