import modal
import pickle
import string
import nltk
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords

modal_app = modal.App("emotion-ai-api")

# Sirf Python aur FastAPI dependencies, frontend hata diya
modal_image = (
    modal.Image.debian_slim(python_version="3.11")
    .pip_install("fastapi", "uvicorn", "pydantic", "nltk", "scikit-learn")
    .run_commands("python -m nltk.downloader punkt punkt_tab stopwords")
)

# Cloud storage volume jahan models rakhe hain
model_volume = modal.Volume.from_name("emotion-models", create_if_missing=True)

app = FastAPI()

# ⚠️ VERCEL SE CONNECT KARNE KE LIYE CORS MIDDLEWARE ZAROORI HAI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Ye kisi bhi Vercel URL se request accept karega
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TextInput(BaseModel):
    text: str

def clean_text(text):
    text = text.lower()
    text = text.translate(str.maketrans('', '', string.punctuation))
    text = ''.join([i for i in text if not i.isdigit()])
    text = ''.join([i for i in text if i.isascii()])
    
    stop_words = set(stopwords.words('english'))
    words = word_tokenize(text)
    cleaned = [w for w in words if w not in stop_words]
    return ' '.join(cleaned)

model = None
vectorizer = None
inv_mapping = None

def load_models():
    global model, vectorizer, inv_mapping
    try:
        with open('/data/logistic_model.pkl', 'rb') as f:
            model = pickle.load(f)
        with open('/data/tfidf_vectorizer.pkl', 'rb') as f:
            vectorizer = pickle.load(f)
        with open('/data/emotion_mapping.pkl', 'rb') as f:
            mapping = pickle.load(f)
        inv_mapping = {v: k for k, v in mapping.items()}
    except Exception as e:
        print(f"Error loading pickle files: {e}")

@app.post("/predict")
def predict(payload: TextInput):
    if not model or not vectorizer:
        raise HTTPException(status_code=500, detail="Models not loaded")
        
    try:
        text = payload.text
        if not text.strip():
            raise HTTPException(status_code=400, detail="Text cannot be empty")
        
        cleaned = clean_text(text)
        vectorized = vectorizer.transform([cleaned])
        prediction = model.predict(vectorized)[0]
        
        probabilities = model.predict_proba(vectorized)[0]
        confidence = float(max(probabilities) * 100)
        
        raw_emotion = inv_mapping.get(prediction, 'Unknown').lower()
        dataset_to_ui_mapping = {"joy": "happiness", "fun": "happiness"}
        final_emotion = dataset_to_ui_mapping.get(raw_emotion, raw_emotion)
        
        return {
            "emotion": final_emotion,
            "confidence": round(confidence, 2),
            "text": text
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
def read_index():
    return {"status": "EmotionAI Backend is Active. Connected to Vercel."}

@modal_app.function(
    image=modal_image,
    cpu=2.0,
    memory=2048,
    timeout=300,
    volumes={"/data": model_volume}
)
@modal.asgi_app()
def serve():
    load_models()
    return app