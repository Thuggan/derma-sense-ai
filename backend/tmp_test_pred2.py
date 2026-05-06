import os
import json
import numpy as np
import tensorflow as tf

def predict_test():
    model = tf.keras.models.load_model('model/dermasense_extended_model.keras')
    with open('model/class_names.json', 'r') as f:
        class_names = {i: name for i, name in enumerate(json.load(f))}
    
    train_dir = "dataset-preprocessing/train"
    out_lines = []
    
    for class_folder in os.listdir(train_dir):
        class_path = os.path.join(train_dir, class_folder)
        if os.path.isdir(class_path):
            img_file = os.listdir(class_path)[0]
            img_path = os.path.join(class_path, img_file)
            
            img = tf.keras.utils.load_img(img_path, target_size=(224, 224))
            img_array = tf.keras.utils.img_to_array(img)
            img_array = np.expand_dims(img_array, axis=0)
            
            prediction = model.predict(img_array, verbose=0)
            predicted_class = int(np.argmax(prediction[0]))
            confidence = float(np.max(prediction[0]))
            
            out_lines.append(f"True Class: {class_folder}")
            out_lines.append(f"Pred Class: {class_names.get(predicted_class)} | Conf: {confidence:.4f}")
            out_lines.append(f"Probabilities: {prediction[0].tolist()}")
            break
            
    with open("test_out_clean.txt", "w") as f:
        f.write("\n".join(out_lines))

if __name__ == '__main__':
    predict_test()
