<div align="center">

# 🧠 EmotionAI — Intelligent Text Emotion Detection System

**An End-to-End Natural Language Processing (NLP) & Machine Learning Web Application for Real-Time Sentiment and Emotion Analysis.**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110.0+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-1.6.1+-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)
[![NLTK](https://img.shields.io/badge/NLTK-3.9.1+-154f5b?style=for-the-badge)](https://www.nltk.org/)
[![HTML5/CSS3/JS](https://img.shields.io/badge/Frontend-Glassmorphism_UI-667eea?style=for-the-badge&logo=javascript&logoColor=white)](#)

[Explore Features](#-key-features) • [System Architecture](#-nlp--ml-pipeline-architecture) • [Installation](#-getting-started) • [API Documentation](#-api-reference)

</div>

---

## 📖 Overview

**EmotionAI** is a full-stack Machine Learning web application designed to detect and classify underlying human emotions from raw text in real time[cite: 12]. Powered by **Natural Language Processing (NLP)** using **NLTK** and a pre-trained **Logistic Regression** classifier with **TF-IDF Vectorization**, the system processes user input in under a second with an **82% accuracy rate**.

The frontend features a modern **Glassmorphism UI** with dynamic emotion-reactive theming, animated SVG confidence rings, contextual AI mental-wellness suggestions, and Dark/Light mode support[cite: 12, 13, 14].

---

## ✨ Key Features

### 🤖 Machine Learning & NLP Backend
* **Automated Text Preprocessing Pipeline:** Strips punctuation, numeric digits, non-ASCII characters, normalizes case, tokenizes words via NLTK `punkt`, and filters out English stopwords.
* **TF-IDF Feature Extraction:** Converts cleaned text tokens into high-dimensional numerical feature vectors using a pre-trained `tfidf_vectorizer.pkl`.
* **Probabilistic Classification:** Uses a serialized Logistic Regression model (`logistic_model.pkl`) with `predict_proba` to compute both the primary emotion label and exact model certainty percentage.
* **Smart Label Harmonization:** Includes a backend mapping filter that normalizes granular dataset labels (such as `joy` and `fun`) into unified UI categories (`happiness`).

### 🎨 Interactive Frontend & UX
* **Dynamic Emotion-Reactive Theming:** The UI automatically shifts its accent colors, glowing ambient orbs, and progress indicators based on the detected emotion (e.g., Emerald Green for *Happiness*, Crimson Red for *Anger*, Indigo for *Sadness*)[cite: 13, 14].
* **Dual Confidence Visualizations:** Displays model certainty using both an animated SVG circular progress ring and a shimmer-effect linear progress bar[cite: 12, 13, 14].
* **Contextual AI Suggestions:** Provides tailored, empathetic mental-wellness and productivity tips corresponding to the detected emotional state[cite: 12, 13].
* **One-Click Test Presets:** Built-in interactive emotion tags allow users to immediately test the model across 7 core emotions without typing[cite: 12, 13].
* **Dark & Light Mode:** Persistent theme switching backed by `localStorage`[cite: 12, 13].
* **Power-User Shortcuts:** Supports `Enter` / `Ctrl + Enter` for instant analysis, `Shift + Enter` for line breaks, `Escape` to cancel loading, and one-click formatted clipboard copying[cite: 12, 13].

---

## 🎭 Supported Emotions

| Emotion | Emoji | UI Theme Color | Contextual AI Insight Provided |
| :--- | :---: | :---: | :--- |
| **Happiness** *(+ Joy/Fun)* | 😊 | `#10b981` (Emerald) | Channels positive energy into creative activities |
| **Sadness** | 😢 | `#6366f1` (Indigo) | Encourages journaling or talking to someone trusted[cite: 13] |
| **Anger** | 😡 | `#ef4444` (Crimson) | Advises deep breathing and stepping away momentarily[cite: 13] |
| **Hate** | 👿 / 😠 | `#8b0000` (Dark Red) | Suggests distancing from draining negative triggers[cite: 12, 13] |
| **Love** | ❤️ | `#ec4899` (Pink) | Encourages open expression of warmth and affection[cite: 12, 13] |
| **Surprise** | 😲 | `#f59e0b` (Amber) | Recommends taking a moment to process unexpected news[cite: 12, 13] |
| **Neutral** | 😐 | `#6b7280` (Slate) | Highlights emotional balance for objective decision-making[cite: 12, 13] |
| **Fear** *(UI Ready)* | 😨 | `#8b5cf6` (Purple) | Guides through grounding techniques like the 5-4-3-2-1 method[cite: 13] |

---

## 🛠️ Tech Stack

* **Backend Framework:** FastAPI, Uvicorn, Pydantic
* **Machine Learning & Data Science:** Scikit-Learn, Pandas, NumPy, Pickle[cite: 10, 11]
* **Natural Language Processing:** NLTK (`punkt`, `punkt_tab`, `stopwords`)[cite: 10, 11]
* **Frontend:** HTML5, CSS3 (Custom Properties, Glassmorphism, Keyframe Animations), Vanilla JavaScript (ES6+, Fetch API, IntersectionObserver)[cite: 12, 13, 14]
* **Icons & Typography:** Feather Icons, Google Fonts (`Inter`)[cite: 12]

---

## 🔄 NLP & ML Pipeline Architecture

```text
[Raw User Text Input]
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│ 1. Text Preprocessing (clean_text)                      │
│    • Lowercasing & Punctuation Removal                  │
│    • Digit & Non-ASCII Filtering                        │
│    • NLTK Word Tokenization & Stopword Removal          │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│ 2. Feature Extraction (tfidf_vectorizer.pkl)            │
│    • Transforms cleaned tokens into TF-IDF sparse matrix│
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│ 3. Model Inference (logistic_model.pkl)                 │
│    • model.predict() ──► Raw Class Index                │
│    • model.predict_proba() ──► Confidence Score (%)     │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│ 4. Post-Processing & UI Mapping (emotion_mapping.pkl)   │
│    • Maps index to emotion label                        │
│    • Normalizes 'joy'/'fun' ──► 'happiness'             │
│    • Returns JSON payload to Frontend UI                │
└─────────────────────────────────────────────────────────┘
