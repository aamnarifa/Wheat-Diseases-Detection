import tensorflow as tf
import os

backend_dir = r"c:\Users\Aamina Rifa\Desktop\wheat_disease\backend"
model_path = os.path.join(backend_dir, "saved_models", "wheat_disease_model.keras")

try:
    model = tf.keras.models.load_model(model_path)
    print("Model Loaded Successfully")
    print("Input Shape:", model.input_shape)
    
    # Check if first layer is a preprocessing layer
    first_layer = model.layers[0]
    print("First Layer Name:", first_layer.name)
    print("First Layer Class:", first_layer.__class__.__name__)
    
    # Try to see if there is any rescaling layer
    for layer in model.layers:
        if "rescaling" in layer.name.lower():
            print("Found Rescaling Layer:", layer.name, layer.get_config())
            
    # Check some layers to guess the architecture
    print("Last 5 layers:")
    for layer in model.layers[-5:]:
        print(layer.name, layer.__class__.__name__)

except Exception as e:
    print("Error loading model:", e)
