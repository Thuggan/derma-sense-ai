import sys
import tensorflow as tf

with open('model_info.txt', 'w') as f:
    try:
        model = tf.keras.models.load_model('backend/model/dermasense_model_224_finetuned.keras')
        f.write('Model Loaded\n')
        for layer in model.layers:
            f.write(layer.name + '\n')
            
        test_ds = tf.keras.utils.image_dataset_from_directory(
            'dataset-preprocessing/skin-disease-dataset/test_set',
            image_size=(224, 224),
            batch_size=32)
            
        model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])
        
        normalized_ds = test_ds.map(lambda x, y: (x/255.0, y))
        loss, acc = model.evaluate(normalized_ds, verbose=0)
        f.write(f'Accuracy: {acc}\n')
    except Exception as e:
        f.write(f'Error: {str(e)}\n')
