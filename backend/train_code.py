train_ds = tf.keras.utils.image_dataset_from_directory(
    "Train",
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE
)

val_ds = tf.keras.utils.image_dataset_from_directory(
    "Validation",
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE
)

test_ds = tf.keras.utils.image_dataset_from_directory(
    "Test",
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    shuffle=False
)
import os
print(os.getcwd())
DATASET_PATH = r"C:\Users\Aamina Rifa\Downloads\datasets_wheat"

train_ds = tf.keras.utils.image_dataset_from_directory(
    DATASET_PATH + "/Train",
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE
)
AUTOTUNE = tf.data.AUTOTUNE

train_ds = train_ds.prefetch(AUTOTUNE)
val_ds = val_ds.prefetch(AUTOTUNE)
test_ds = test_ds.prefetch(AUTOTUNE)
from tensorflow.keras import layers

data_augmentation = tf.keras.Sequential([
    layers.RandomFlip("horizontal"),
    layers.RandomRotation(0.1),
    layers.RandomZoom(0.2),
    layers.RandomContrast(0.1),
])
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input

train_ds = train_ds.map(lambda x,y:(preprocess_input(x),y))
val_ds   = val_ds.map(lambda x,y:(preprocess_input(x),y))
test_ds  = test_ds.map(lambda x,y:(preprocess_input(x),y))
from tensorflow.keras.applications import MobileNetV2

base_model = MobileNetV2(
    weights="imagenet",
    include_top=False,
    input_shape=(224,224,3)
)

base_model.trainable = False
x = data_augmentation(base_model.output)
x = layers.GlobalAveragePooling2D()(x)
x = layers.BatchNormalization()(x)
x = layers.Dense(128, activation="relu")(x)
x = layers.Dropout(0.4)(x)

outputs = layers.Dense(5, activation="softmax")(x)

model = tf.keras.Model(base_model.input, outputs)
model.compile(
    optimizer=tf.keras.optimizers.Adam(1e-3),
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"]
)
early_stop = tf.keras.callbacks.EarlyStopping(
    monitor="val_loss",
    patience=4,
    restore_best_weights=True
)

reduce_lr = tf.keras.callbacks.ReduceLROnPlateau(
    monitor="val_loss",
    factor=0.3,
    patience=2
)
model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=20,
    callbacks=[early_stop, reduce_lr]
)
base_model.trainable = True

for layer in base_model.layers[:-30]:
    layer.trainable = False
model.compile(
    optimizer=tf.keras.optimizers.Adam(1e-5),
    loss="categorical_crossentropy",
    metrics=["accuracy"]
)
model.compile(
    optimizer=tf.keras.optimizers.Adam(1e-5),
    loss=tf.keras.losses.SparseCategoricalCrossentropy(),
    metrics=["accuracy"]
)
model.evaluate(test_ds)
raw_train_ds = tf.keras.utils.image_dataset_from_directory(
    "Train",
    image_size=(224,224),
    batch_size=32
)

class_names = raw_train_ds.class_names
print(class_names)
import matplotlib.pyplot as plt
import numpy as np

for images, labels in test_ds.take(1):
    preds = model.predict(images)

    for i in range(5):
        plt.imshow(images[i].numpy().astype("uint8"))
        pred = class_names[np.argmax(preds[i])]
        true = class_names[labels[i]]
        plt.title(f"Pred: {pred} | True: {true}")
        plt.axis("off")
        plt.show()
base_model.trainable = True

for layer in base_model.layers[:-30]:
    layer.trainable = False
model.compile(
    optimizer=tf.keras.optimizers.Adam(1e-5),
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"]
)
model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=10,
    callbacks=[early_stop, reduce_lr]
)
model.evaluate(test_ds)
model.save("wheat_disease_model.keras")
CLASS_NAMES = [
    "BlackPoint",
    "FusariumFootRot",
    "HealthyLeaf",
    "LeafBlight",
    "WheatBlast"
]
import matplotlib.pyplot as plt
import numpy as np

for images, labels in test_ds.take(1):

    predictions = model.predict(images)

    for i in range(5):
        plt.imshow(images[i].numpy().astype("uint8"))

        predicted_label = CLASS_NAMES[np.argmax(predictions[i])]
        true_label = CLASS_NAMES[labels[i]]

        confidence = np.max(predictions[i])

        plt.title(
            f"Pred: {predicted_label} ({confidence:.2f})\nTrue: {true_label}"
        )

        plt.axis("off")
        plt.show()
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
from PIL import Image
import numpy as np
import matplotlib.pyplot as plt
from scipy.stats import entropy

# ===============================
# CLASS NAMES (MUST MATCH TRAINING)
# ===============================
CLASS_NAMES = [
    "BlackPoint",
    "FusariumFootRot",
    "HealthyLeaf",
    "LeafBlight",
    "WheatBlast"
]

# ===============================
# SMART THRESHOLDS
# ===============================
CONF_THRESHOLD = 0.85        # stricter confidence
ENTROPY_THRESHOLD = 0.80     # uncertainty control


def predict_wheat_image(img_path):

    # ---------- Load Image ----------
    img = Image.open(img_path).convert("RGB")
    img = img.resize((224, 224))

    plt.imshow(img)
    plt.title("Input Image")
    plt.axis("off")
    plt.show()

    # ---------- Preprocess ----------
    img_array = np.array(img)
    img_array = preprocess_input(img_array)
    img_array = np.expand_dims(img_array, axis=0)

    # ---------- Prediction ----------
    prediction = model.predict(img_array, verbose=0)[0]

    confidence = float(np.max(prediction))
    predicted_index = int(np.argmax(prediction))
    predicted_class = CLASS_NAMES[predicted_index]

    # safer entropy
    ent = float(entropy(prediction + 1e-10))

    # ---------- Decision Logic ----------
    print("\nPrediction Probabilities:")
    for i, prob in enumerate(prediction):
        print(f"{CLASS_NAMES[i]} : {prob:.3f}")

    print("\n----------------------------")

    if confidence < CONF_THRESHOLD or ent > ENTROPY_THRESHOLD:
        print("⚠ RESULT : Not a Wheat Leaf / Unknown Image")
    else:
        print("✅ Disease Detected :", predicted_class)

    print("Confidence :", round(confidence, 3))
    print("Entropy    :", round(ent, 3))
predict_wheat_image(
r"C:\Users\Aamina Rifa\Downloads\wheat-disease\Wheat Leaf Disease\Test\LeafBlight\center_scaled_1.3_451.jpg"
)

model.summary()
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
import numpy as np

def predict(model, img, class_names):

    # resize (safety)
    img = tf.image.resize(img, (224,224))

    # preprocess exactly like training
    img = preprocess_input(img)

    img = np.expand_dims(img, axis=0)

    prediction = model.predict(img, verbose=0)[0]

    predicted_index = np.argmax(prediction)
    predicted_class = class_names[predicted_index]
    confidence = round(100 * np.max(prediction), 2)

    return predicted_class, confidence
class_names = [
    "BlackPoint",
    "FusariumFootRot",
    "HealthyLeaf",
    "LeafBlight",
    "WheatBlast"
]
import matplotlib.pyplot as plt

plt.figure(figsize=(10,10))

for images_batch, labels_batch in test_ds.take(1):

    for i in range(9):

        ax = plt.subplot(3, 3, i + 1)

        img = images_batch[i].numpy().astype("uint8")

        actual_label = class_names[labels_batch[i].numpy()]

        predicted_class, confidence = predict(
            model,
            img,
            class_names
        )

        plt.imshow(img)
        plt.title(
            f"Pred: {predicted_class}\n"
            f"Conf: {confidence}%\n"
            f"Actual: {actual_label}"
        )

        plt.axis("off")

plt.tight_layout()
plt.show()