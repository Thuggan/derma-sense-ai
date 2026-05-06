import os
import tensorflow as tf

def evaluate():
    try:
        dataset_dir = os.path.join(r"d:\derma-sense-ai\backend", "dataset-preprocessing", "train")
        val_dataset = tf.keras.utils.image_dataset_from_directory(
            dataset_dir,
            label_mode='categorical',
            batch_size=32,
            image_size=(224, 224),
            seed=123,
            validation_split=0.2,
            subset='validation'
        )

        model = tf.keras.models.load_model(r"d:\derma-sense-ai\backend\model\dermasense_extended_model.keras")
        
        loss, acc = model.evaluate(val_dataset, verbose=0)
        print(f"VAL_ACC:{acc:.4f}")
    except Exception as e:
        print(f"VAL_ACC_ERROR:{e}")

if __name__ == '__main__':
    evaluate()
