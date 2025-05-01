from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import torch
import torchvision.transforms as transforms
import timm
import torch.nn.functional as F
import mysql.connector
import joblib

app = Flask(__name__)
CORS(app)

# Load the TorchScript models instead of models with state_dict
swin_model = torch.jit.load("../model/Ensamble Learning/swin_model_scripted.pt")
resnet_model = torch.jit.load("../model/Ensamble Learning/resnet_model_scripted.pt")

# Load the SVM meta-learner
svm_model = joblib.load("../model/Ensamble Learning/svm_meta_learner.pkl")

# Set the models to evaluation mode (although this is often unnecessary with TorchScript models)
swin_model.eval()
resnet_model.eval()

# Define the class names (these seem to be fixed for your use case)
class_names = ['Anggur', 'Apel', 'Bawang Merah', 'Bawang Putih', 'Bayam', 'Bit', 'Cabai', 'Delima', 'Jagung', 'Jahe', 'Jeruk', 
               'Kacang Polong', 'Kedelai', 'Kembang Kol', 'Kentang', 'Kiwi', 'Kubis', 'Lemon', 'Lobak', 'Mangga', 'Nanas', 'Paprika', 
               'Pir', 'Pisang', 'Selada', 'Semangka', 'Terong', 'Timun', 'Tomat', 'Turnip', 'Ubi Jalar', 'Wortel']

# Connect to MySQL (assuming your DB is set up correctly)
db = mysql.connector.connect(
    host="192.168.0.105",
    user="root",
    password="123Ferri!", 
    database="ml-project"
)

# Image pre-processing function
def transform_image(image):
    preprocess = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])
    return preprocess(image).unsqueeze(0)

@app.route('/predict', methods=['POST'])
def predict():
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file part"}), 400
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400

        # Read the image and preprocess
        img = Image.open(file).convert('RGB')
        img_tensor = transform_image(img)

        # Feature extraction from both Swin and ResNet models
        with torch.no_grad():
            swin_output = swin_model(img_tensor)
            resnet_output = resnet_model(img_tensor)

            # If output is a dictionary, get 'logits' key
            if isinstance(swin_output, dict):
                swin_output = swin_output['logits']
            if isinstance(resnet_output, dict):
                resnet_output = resnet_output['logits']

            # Print output shapes for debugging
            print(f"Swin output shape: {swin_output.shape}")
            print(f"ResNet output shape: {resnet_output.shape}")

            # Concatenate the outputs from Swin and ResNet (32 + 32 = 64 features)
            combined_output = torch.cat((swin_output, resnet_output), dim=1)  # Concatenate along the feature axis
            
            # Flatten the combined output (for SVM input)
            combined_output_flat = combined_output.flatten(start_dim=1).cpu().numpy()

            # Pass the combined output through the SVM model
            try:
                svm_prediction = svm_model.predict(combined_output_flat)  # Get the predicted class from SVM
            except Exception as e:
                print(f"SVM Prediction Error: {e}")
                return jsonify({"error": "SVM prediction failed", "details": str(e)}), 500


            # Pass the combined output through the SVM model (flattened features)
            combined_output_flat = combined_output.view(1, -1).cpu().numpy()
            print(f"Combined output flat shape: {combined_output_flat.shape}")  # Debug shape

            try:
                svm_prediction = svm_model.predict(combined_output_flat)
            except Exception as e:
                print(f"SVM Prediction Error: {e}")
                return jsonify({"error": "SVM prediction failed", "details": str(e)}), 500
            # Get the predicted class from SVM

            predicted_class = svm_prediction[0].item()  # SVM returns an array, so take the first element
            predicted_class = int(predicted_class)
            probabilities = F.softmax(combined_output, dim=1)  # Compute softmax for confidence
            confidence = probabilities[0][predicted_class].item() * 100  # Convert to percentage

        class_name = class_names[predicted_class]

        # Get nutrition data from the database based on predicted class
        cursor = db.cursor(dictionary=True)
        cursor.execute("SELECT * FROM `informasi-gizi-sayuran` WHERE class_name = %s", (class_name,))
        nutrition_row = cursor.fetchone()
        cursor.close()

        if nutrition_row:
            # Build the nutrition info dictionary
            nutrition_info = {
                "energi": {"amount": nutrition_row["energi"], "unit": "kkal", "akg": nutrition_row["akg_energi"]},
                "lemak_total": {"amount": nutrition_row["lemak_total"], "unit": "g", "akg": nutrition_row["akg_lemak_total"]},
                "vitamin_a": {"amount": nutrition_row["vitamin_a"], "unit": "mcg", "akg": nutrition_row["akg_vitamin_a"]},
                "vitamin_b1": {"amount": nutrition_row["vitamin_b1"], "unit": "mg", "akg": nutrition_row["akg_vitamin_b1"]},
                "vitamin_b2": {"amount": nutrition_row["vitamin_b2"], "unit": "mg", "akg": nutrition_row["akg_vitamin_b2"]},
                "vitamin_b3": {"amount": nutrition_row["vitamin_b3"], "unit": "mg", "akg": nutrition_row["akg_vitamin_b3"]},
                "vitamin_c": {"amount": nutrition_row["vitamin_c"], "unit": "mg", "akg": nutrition_row["akg_vitamin_c"]},
                "karbohidrat_total": {"amount": nutrition_row["karbohidrat_total"], "unit": "mg", "akg": nutrition_row["akg_karbohidrat_total"]},
                "protein": {"amount": nutrition_row["protein"], "unit": "g", "akg": nutrition_row["akg_protein"]},
                "serat_pangan": {"amount": nutrition_row["serat_pangan"], "unit": "g", "akg": nutrition_row["akg_serat_pangan"]},
                "kalsium": {"amount": nutrition_row["kalsium"], "unit": "g", "akg": nutrition_row["akg_kalsium"]},
                "fosfor": {"amount": nutrition_row["fosfor"], "unit": "mg", "akg": nutrition_row["akg_fosfor"]},
                "natrium": {"amount": nutrition_row["natrium"], "unit": "mg", "akg": nutrition_row["akg_natrium"]},
                "kalium": {"amount": nutrition_row["kalium"], "unit": "mg", "akg": nutrition_row["akg_kalium"]},
                "tembaga": {"amount": nutrition_row["tembaga"], "unit": "mg", "akg": nutrition_row["akg_tembaga"]},
                "besi": {"amount": nutrition_row["besi"], "unit": "mcg", "akg": nutrition_row["akg_besi"]},
                "seng": {"amount": nutrition_row["seng"], "unit": "mg", "akg": nutrition_row["akg_seng"]},
                "b_karoten": {"amount": nutrition_row["b_karoten"], "unit": "mg", "akg": nutrition_row["akg_b_karoten"]},
                "karoten_total": {"amount": nutrition_row["karoten_total"], "akg": nutrition_row["akg_karoten_total"]},
                "air": {"amount": nutrition_row["air"], "unit": "g", "akg": nutrition_row["akg_air"]},
                "abu": {"amount": nutrition_row["abu"], "unit": "g", "akg": nutrition_row["akg_abu"]},
            }

            # Find the highest AKG value
            highest_akg_key = max(nutrition_info, key=lambda k: nutrition_info[k]['akg'])
            highest_akg_value = nutrition_info[highest_akg_key]['akg']

            return jsonify({
                "class_id": predicted_class,
                "class_name": class_name,
                "confidence": confidence,
                "highest_akg": {
                    "name": highest_akg_key,
                    "value": highest_akg_value
                },
                "nutrition_info": nutrition_info
            })
        else:
            return jsonify({"error": "Nutrition info not found"}), 404

    except Exception as e:
        print("Error:", e)  # Log error for debugging
        return jsonify({"error": "Prediction failed", "details": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
