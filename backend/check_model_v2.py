import tensorflow as tf
import os

backend_dir = r"c:\Users\Aamina Rifa\Desktop\wheat_disease\backend"
model_path = os.path.join(backend_dir, "saved_models", "wheat_disease_model.keras")

try:
    model = tf.keras.models.load_model(model_path)
    print(f"Model: {model.name}")
    print(f"Input Shape: {model.input_shape}")
    
    print("\n--- All Layers ---")
    for i, layer in enumerate(model.layers):
        print(f"Layer {i}: {layer.name} ({layer.__class__.__name__})")
        if "rescaling" in layer.name.lower():
            try:
                print(f"  Config: {layer.get_config()}")
            except:
                pass

except Exception as e:
    print(f"Error: {e}")
