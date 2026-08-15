import pickle
import string
import nltk
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
import os

# Setup NLTK
nltk.download('punkt', quiet=True)
nltk.download('punkt_tab', quiet=True)
nltk.download('stopwords', quiet=True)
stop_words = set(stopwords.words('english'))

app = FastAPI()

# 1. Static files (CSS, JS) ke liye folder mount karein
app.mount("/static", StaticFiles(directory="static"), name="static")

# Request Body Schema
class TextInput(BaseModel):
    text: str

# Text Cleaning Function
def clean_text(text):
    text = text.lower()
    text = text.translate(str.maketrans('', '', string.punctuation))
    text = ''.join([i for i in text if not i.isdigit()])
    text = ''.join([i for i in text if i.isascii()])
    words = word_tokenize(text)
    cleaned = [w for w in words if w not in stop_words]
    return ' '.join(cleaned)

# Load Model Artifacts safely
try:
    with open('logistic_model.pkl', 'rb') as f:
        model = pickle.load(f)
    with open('tfidf_vectorizer.pkl', 'rb') as f:
        vectorizer = pickle.load(f)
    with open('emotion_mapping.pkl', 'rb') as f:
        mapping = pickle.load(f)
    inv_mapping = {v: k for k, v in mapping.items()}
except Exception as e:
    print(f"Error loading pickle files: {e}")

# API Endpoint for Emotion Prediction
@app.post("/predict")
def predict(payload: TextInput):
    try:
        text = payload.text
        if not text.strip():
            raise HTTPException(status_code=400, detail="Text cannot be empty")
        
        cleaned = clean_text(text)
        vectorized = vectorizer.transform([cleaned])
        prediction = model.predict(vectorized)[0]
        
        probabilities = model.predict_proba(vectorized)[0]
        confidence = float(max(probabilities) * 100)
        
        # 1. Model se raw emotion nikalna
        raw_emotion = inv_mapping.get(prediction, 'Unknown').lower()
        
        # 2. Backend Mapping Filter: Agar ML model 'joy' ya 'fun' de, 
        # toh usko UI ke liye 'happiness' mein convert kar do
        dataset_to_ui_mapping = {
            "joy": "happiness",
            "fun": "happiness"
        }
        
        final_emotion = dataset_to_ui_mapping.get(raw_emotion, raw_emotion)
        
        return {
            "emotion": final_emotion,
            "confidence": round(confidence, 2),
            "text": text
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Serve the Frontend HTML page directly from templates folder
@app.get("/")
def read_index():
    return FileResponse("templates/index.html")