import os
import json
import numpy as np
import tensorflow as tf
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/predict": {"origins": "*"}})

# Load the model dynamically if training has finished
IS_EXTENDED_MODEL = False
IS_B4_MODEL = False
TARGET_SIZE = (224, 224)

if os.path.exists('model/dermasense_b4_model.keras') and os.path.exists('model/class_names.json'):
    model = tf.keras.models.load_model('model/dermasense_b4_model.keras')
    with open('model/class_names.json', 'r') as f:
        CLASS_NAMES = {i: name for i, name in enumerate(json.load(f))}
    IS_EXTENDED_MODEL = True
    IS_B4_MODEL = True
    TARGET_SIZE = (380, 380)
elif os.path.exists('model/dermasense_extended_model.keras') and os.path.exists('model/class_names.json'):
    model = tf.keras.models.load_model('model/dermasense_extended_model.keras')
    with open('model/class_names.json', 'r') as f:
        CLASS_NAMES = {i: name for i, name in enumerate(json.load(f))}
    IS_EXTENDED_MODEL = True
    TARGET_SIZE = (224, 224)
else:
    model = tf.keras.models.load_model('model/dermasense_model_224_finetuned.keras')
    CLASS_NAMES = {
        0: "Cellulitis",
        1: "Impetigo",
        2: "Ringworm",
        3: "Athlete's Foot"
    }

# Configure upload folder
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp', 'jfif', 'heic', 'bmp', 'gif', 'tiff'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/predict', methods=['POST'])
def predict():
    try:
        print("Request received!")
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400

        if file and allowed_file(file.filename):
            # Save with secure filename
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            
            # Process image
            img = tf.keras.utils.load_img(filepath, target_size=TARGET_SIZE)
            img_array = tf.keras.utils.img_to_array(img)
            
            if IS_EXTENDED_MODEL:
                # The extended models (both V2S and B4) scale their own inputs natively
                img_array = np.expand_dims(img_array, axis=0)
            else:
                img_array = np.expand_dims(img_array, axis=0) / 255.0
            
            # Predict
            prediction = model.predict(img_array)
            predicted_class = int(np.argmax(prediction[0]))
            confidence = float(np.max(prediction[0]))
            
            # We rely on the Z_Non_Skin_Images class to catch non-skin data instead of an arbitrary threshold
            disease_name = CLASS_NAMES.get(predicted_class, "Unknown")
            is_non_skin = disease_name == "Z_Non_Skin_Images"
            if disease_name == "Z_Non_Skin_Images":
                disease_name = "Non-Skin Image / Unknown Condition"
            
            # Cleanup
            if os.path.exists(filepath):
                os.remove(filepath)
            
            return jsonify({
                'disease': disease_name,
                'class': predicted_class,
                'confidence': confidence,
                'isNonSkin': is_non_skin,
                'message': 'Success'
            })
        else:
            return jsonify({'error': 'File type not allowed'}), 400
            
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5002)
