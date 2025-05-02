# 🥦 Fruits & Vegetables Image Classification Web App

A full-stack web application for classifying fruit and vegetable images using a high-accuracy ensemble deep learning model. The app supports real-time image prediction and nutritional lookup through an interactive UI. Built with ReactJS on the frontend and Flask on the backend, the system uses a MySQL database to serve nutritional data related to the predicted class. The model is trained on a Kaggle dataset containing 32 fruit and vegetable classes, leveraging Swin Transformer, ResNet, and SVM for an ensemble prediction that achieves 98% accuracy.

---

## 🌟 Features

- 📷 Upload and classify images of fruits or vegetables in real-time
- 🧠 High-accuracy ensemble model (Swin Transformer + ResNet + SVM)
- 📊 Nutrition info fetched dynamically based on predictions
- 🧪 Training notebook with detailed analysis and results
- 📱 Responsive React frontend with TailwindCSS
- 🐍 Flask API with model integration
- 🛠️ Hosted on PythonAnywhere for accessibility

---

## 🛠️ Tools & Technologies

**Machine Learning:** Swin Transformer, ResNet, SVM, PyTorch, TorchScript, Scikit-learn  
**Backend:** Flask, Flask-CORS, MySQL, mysql-connector-python, PIL (Pillow), Pandas, NumPy  
**Frontend:** ReactJS, TailwindCSS, HTML5, JavaScript (Vite)  
**Visualization:** Matplotlib, Seaborn  
**Deployment:** PythonAnywhere  
**Other:** Git, Jupyter Notebook

---

## 📁 Project Structure

```bash
ml-project-image-classification-fruits-vegetables/
├── API/           # Flask backend for prediction
├── frontend/      # ReactJS frontend interface
├── model/         # Model files and download script
├── notebook/      # Jupyter notebook for training & evaluation
└── README.md      # Project documentation
```
---

## 🚀 How to Run Locally

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/ml-project-image-classification-fruits-vegetables.git
cd ml-project-image-classification-fruits-vegetables
```

### 2. Run Flask Backend

```bash
cd API
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

### 3. Start React Frontend

```bash
cd ../frontend
npm install
npm run dev
```

Visit http://localhost:5173 to access the web app.

## 📊 Model Training Details

The model was trained on a 32-class fruit and vegetable image dataset from Kaggle. Swin Transformer and ResNet were fine-tuned, and their predictions were combined using an SVM classifier to improve generalization. The final model achieved 98% accuracy on the test set.

Training scripts and exploratory analysis can be found in the notebook/ directory.

---

## 👤 Author

**Ferrikris Diantoro**  
*Data Scientist | Full-stack Developer*  
📧 [ferrik935@gmail.com](mailto:ferrik935@gmail.com)  
🔗 [LinkedIn](https://linkedin.com/in/ferrikrisdiantoro) | [GitHub](https://github.com/ferrikrisdiantoro)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

