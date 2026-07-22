import pickle
import string
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords

from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

# Download NLTK resources
nltk.download("punkt", quiet=True)
nltk.download("stopwords", quiet=True)

# Stopwords
stop_words = set(stopwords.words("english"))

# Load ML files
with open("logistic_model.pkl", "rb") as f:
    model = pickle.load(f)

with open("tfidf_vectorizer.pkl", "rb") as f:
    vectorizer = pickle.load(f)

with open("emotion_mapping.pkl", "rb") as f:
    mapping = pickle.load(f)

inv_mapping = {v: k for k, v in mapping.items()}

# FastAPI App
app = FastAPI(
    title="Emotion Detection API",
    version="1.0"
)

# Templates
templates = Jinja2Templates(directory="templates")

# Static Folder
app.mount("/static", StaticFiles(directory="static"), name="static")


# Request Model
class TextInput(BaseModel):
    text: str


# Clean Text
def clean_text(text):
    text = text.lower()
    text = text.translate(str.maketrans("", "", string.punctuation))
    text = "".join(ch for ch in text if not ch.isdigit())
    text = "".join(ch for ch in text if ch.isascii())

    words = word_tokenize(text)

    cleaned = [w for w in words if w not in stop_words]

    return " ".join(cleaned)


# Prediction
def predict_emotion(text):
    cleaned = clean_text(text)

    vector = vectorizer.transform([cleaned])

    prediction = model.predict(vector)[0]

    probabilities = model.predict_proba(vector)[0]

    confidence = round(float(max(probabilities)) * 100, 2)

    return {
        "emotion": inv_mapping[prediction],
        "confidence": confidence
    }


# Home Page
@app.get("/", response_class=HTMLResponse)
async def home(request: Request):

    return templates.TemplateResponse(
        name="index.html",
        request=request
    )


# Prediction API
@app.post("/predict")
async def predict(data: TextInput):

    result = predict_emotion(data.text)

    return {
        "text": data.text,
        "emotion": result["emotion"],
        "confidence": result["confidence"]
    }