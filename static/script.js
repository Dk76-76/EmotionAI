(function() {
    'use strict';

    feather.replace();

    // Cleaned and final emotion mapping
    const emotionData = {
        happiness: {
            emoji: '😊',
            color: '#10b981',
            glow: 'rgba(16, 185, 129, 0.4)',
            description: 'The text expresses happiness, excitement, and positive feelings.',
            suggestion: 'This positive energy is wonderful! Consider channeling this happiness into creative activities.'
        },
        sadness: {
            emoji: '😢',
            color: '#6366f1',
            glow: 'rgba(99, 102, 241, 0.4)',
            description: 'The text reflects feelings of sorrow, disappointment, or melancholy.',
            suggestion: 'It\'s okay to feel sad sometimes. Consider talking to someone you trust or journaling.'
        },
        anger: {
            emoji: '😡',
            color: '#ef4444',
            glow: 'rgba(239, 68, 68, 0.4)',
            description: 'The text indicates frustration, irritation, or strong displeasure.',
            suggestion: 'Take a deep breath. Consider stepping away from the situation momentarily.'
        },
        hate: {
            emoji: '😠',
            color: '#8b0000',
            glow: 'rgba(139, 0, 0, 0.4)',
            description: 'The text conveys strong dislike or extreme aversion towards something.',
            suggestion: 'Strong negative emotions can be draining. Try to distance yourself from the trigger.'
        },
        fear: {
            emoji: '😨',
            color: '#8b5cf6',
            glow: 'rgba(139, 92, 246, 0.4)',
            description: 'The text suggests anxiety, worry, or apprehension.',
            suggestion: 'Fear is a natural response. Try grounding techniques like the 5-4-3-2-1 method.'
        },
        love: {
            emoji: '❤️',
            color: '#ec4899',
            glow: 'rgba(236, 72, 153, 0.4)',
            description: 'The text conveys affection, warmth, and deep emotional connection.',
            suggestion: 'Love is a beautiful emotion! Express it openly to those you care about.'
        },
        surprise: {
            emoji: '😲',
            color: '#f59e0b',
            glow: 'rgba(245, 158, 11, 0.4)',
            description: 'The text shows astonishment, amazement, or unexpected reactions.',
            suggestion: 'Surprises keep life interesting! Take a moment to process this new information.'
        },
        neutral: {
            emoji: '😐',
            color: '#6b7280',
            glow: 'rgba(107, 114, 128, 0.4)',
            description: 'The text appears emotionally balanced without strong sentiment.',
            suggestion: 'A neutral state provides clarity for decision-making. Good time for objective analysis.'
        }
    };

    const textInput = document.getElementById('textInput');
    const charCounter = document.getElementById('charCounter');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const clearBtn = document.getElementById('clearBtn');
    const resultPlaceholder = document.getElementById('resultPlaceholder');
    const loadingContainer = document.getElementById('loadingContainer');
    const resultContent = document.getElementById('resultContent');
    const emotionDisplay = document.getElementById('emotionDisplay');
    const emotionEmoji = document.getElementById('emotionEmoji');
    const emotionLabel = document.getElementById('emotionLabel');
    const emotionDescription = document.getElementById('emotionDescription');
    const confidenceValue = document.getElementById('confidenceValue');
    const circularProgressValue = document.getElementById('circularProgressValue');
    const progressCircle = document.getElementById('progressCircle');
    const linearProgressBar = document.getElementById('linearProgressBar');
    const analyzedText = document.getElementById('analyzedText');
    const aiSuggestionText = document.getElementById('aiSuggestionText');
    const aiSuggestionCard = document.getElementById('aiSuggestionCard');
    const copyBtn = document.getElementById('copyBtn');
    const resetBtn = document.getElementById('resetBtn');
    const themeToggle = document.getElementById('themeToggle');
    const toastContainer = document.getElementById('toastContainer');

    let currentResult = null;

    function updateCharCounter() {
        const length = textInput.value.length;
        const maxLength = 1000;
        charCounter.textContent = `${length} / ${maxLength}`;
        
        charCounter.classList.remove('warning', 'error');
        if (length >= maxLength) {
            charCounter.classList.add('error');
        } else if (length >= maxLength * 0.9) {
            charCounter.classList.add('warning');
        }
    }

    function showToast(type, title, message) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const iconMap = {
            success: 'check',
            error: 'x',
            warning: 'alert-triangle',
            info: 'info'
        };
        
        toast.innerHTML = `
            <div class="toast-icon">
                <i data-feather="${iconMap[type]}"></i>
            </div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" aria-label="Close notification">
                <i data-feather="x"></i>
            </button>
        `;
        
        toastContainer.appendChild(toast);
        feather.replace();
        
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => removeToast(toast));
        
        setTimeout(() => removeToast(toast), 5000);
    }

    function removeToast(toast) {
        if (!toast.classList.contains('hiding')) {
            toast.classList.add('hiding');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }
    }

    function setEmotionTheme(emotion) {
        const data = emotionData[emotion] || emotionData.neutral;
        document.documentElement.style.setProperty('--emotion-color', data.color);
        document.documentElement.style.setProperty('--emotion-glow', data.glow);
    }

    function updateProgressRing(percentage) {
        const circumference = 2 * Math.PI * 45;
        const offset = circumference - (percentage / 100) * circumference;
        progressCircle.style.strokeDashoffset = offset;
    }

    function animateValue(element, start, end, duration, suffix = '%') {
        const startTime = performance.now();
        
        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOutQuad = 1 - (1 - progress) * (1 - progress);
            const current = start + (end - start) * easeOutQuad;
            
            element.textContent = Math.round(current * 100) / 100 + suffix;
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }
        
        requestAnimationFrame(update);
    }

    function showLoading() {
        resultPlaceholder.style.display = 'none';
        resultContent.classList.remove('active');
        loadingContainer.classList.add('active');
        analyzeBtn.disabled = true;
    }

    function hideLoading() {
        loadingContainer.classList.remove('active');
        analyzeBtn.disabled = false;
    }

    function displayResult(data) {
        // Direct assignment without any forced conversions
        const emotion = data.emotion.toLowerCase().trim();
        const emotionInfo = emotionData[emotion] || emotionData.neutral;
        const confidence = data.confidence;

        setEmotionTheme(emotion);

        emotionEmoji.textContent = emotionInfo.emoji;
        // Properly capitalize the first letter dynamically
        const displayLabel = emotionData[emotion] ? emotion : 'Neutral';
        emotionLabel.textContent = displayLabel.charAt(0).toUpperCase() + displayLabel.slice(1);
        emotionDescription.textContent = emotionInfo.description;

        confidenceValue.textContent = '0%';
        circularProgressValue.textContent = '0%';
        linearProgressBar.style.width = '0%';
        progressCircle.style.strokeDashoffset = 283;

        analyzedText.textContent = `"${data.text}"`;
        aiSuggestionText.textContent = emotionInfo.suggestion;

        hideLoading();
        resultContent.classList.add('active');

        requestAnimationFrame(() => {
            setTimeout(() => {
                animateValue(confidenceValue, 0, confidence, 1000);
                animateValue(circularProgressValue, 0, confidence, 1000);
                updateProgressRing(confidence);
                linearProgressBar.style.width = `${confidence}%`;
            }, 100);
        });

        currentResult = {
            text: data.text,
            emotion: emotion,
            confidence: confidence
        };
    }

    async function analyzeText() {
        const text = textInput.value.trim();
        
        if (!text) {
            showToast('warning', 'No Text', 'Please enter some text to analyze.');
            textInput.focus();
            return;
        }
        
        if (text.length < 3) {
            showToast('warning', 'Text Too Short', 'Please enter at least 3 characters for accurate analysis.');
            return;
        }

        showLoading();

        try {
            const response = await fetch('/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text: text
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            displayResult(data);
            showToast('success', 'Analysis Complete', `Detected emotion: ${data.emotion} with ${data.confidence.toFixed(2)}% confidence.`);

        } catch (error) {
            hideLoading();
            resultPlaceholder.style.display = 'flex';
            console.error('Error:', error);
            showToast('error', 'Analysis Failed', 'Could not connect to the server. Please try again.');
        }
    }

    function clearInput() {
        textInput.value = '';
        updateCharCounter();
        textInput.focus();
        showToast('info', 'Cleared', 'Text input has been cleared.');
    }

    function resetAnalysis() {
        resultContent.classList.remove('active');
        resultPlaceholder.style.display = 'flex';
        textInput.value = '';
        updateCharCounter();
        currentResult = null;
        
        document.documentElement.style.setProperty('--emotion-color', '#667eea');
        document.documentElement.style.setProperty('--emotion-glow', 'rgba(102, 126, 234, 0.4)');
        
        textInput.focus();
        showToast('info', 'Reset', 'Ready for a new analysis.');
    }

    async function copyResult() {
        if (!currentResult) {
            showToast('warning', 'No Result', 'Please analyze some text first.');
            return;
        }

        // Keep fallback logic safe for copying
        const safeEmotion = emotionData[currentResult.emotion] ? currentResult.emotion : 'neutral';
        const displayLabel = safeEmotion.charAt(0).toUpperCase() + safeEmotion.slice(1);
        const emoji = emotionData[safeEmotion]?.emoji || '';

        const resultText = `Emotion Analysis Result
━━━━━━━━━━━━━━━━━━━━━━
Text: "${currentResult.text}"
Emotion: ${displayLabel} ${emoji}
Confidence: ${currentResult.confidence.toFixed(2)}%
━━━━━━━━━━━━━━━━━━━━━━
Analyzed by EmotionAI`;

        try {
            await navigator.clipboard.writeText(resultText);
            showToast('success', 'Copied!', 'Result has been copied to clipboard.');
        } catch (error) {
            const textarea = document.createElement('textarea');
            textarea.value = resultText;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            showToast('success', 'Copied!', 'Result has been copied to clipboard.');
        }
    }

    function toggleTheme() {
        const body = document.body;
        const isDark = body.getAttribute('data-theme') === 'dark';
        const newTheme = isDark ? 'light' : 'dark';
        
        body.setAttribute('data-theme', newTheme);
        
        const darkIcon = themeToggle.querySelector('.theme-icon-dark');
        const lightIcon = themeToggle.querySelector('.theme-icon-light');
        
        if (isDark) {
            darkIcon.style.display = 'none';
            lightIcon.style.display = 'block';
        } else {
            darkIcon.style.display = 'block';
            lightIcon.style.display = 'none';
        }
        
        localStorage.setItem('theme', newTheme);
        showToast('info', 'Theme Changed', `Switched to ${newTheme} mode.`);
    }

    function loadSavedTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            document.body.setAttribute('data-theme', savedTheme);
            
            const darkIcon = themeToggle.querySelector('.theme-icon-dark');
            const lightIcon = themeToggle.querySelector('.theme-icon-light');
            
            if (savedTheme === 'light') {
                darkIcon.style.display = 'none';
                lightIcon.style.display = 'block';
            }
        }
    }

    textInput.addEventListener('input', updateCharCounter);

    textInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            analyzeText();
        }
    });

    analyzeBtn.addEventListener('click', analyzeText);
    clearBtn.addEventListener('click', clearInput);
    copyBtn.addEventListener('click', copyResult);
    resetBtn.addEventListener('click', resetAnalysis);
    themeToggle.addEventListener('click', toggleTheme);

    // EMOTION BUTTONS LOGIC
    const exampleTags = document.querySelectorAll('.emotion-tag');
    exampleTags.forEach(tag => {
        tag.addEventListener('click', (e) => {
            e.preventDefault(); 
            
            const exampleText = tag.getAttribute('data-example');
            if (exampleText) {
                textInput.value = exampleText; 
                updateCharCounter();           
                textInput.focus();             
                showToast('info', 'Example Loaded', 'Now click "Analyze Emotion" to test this emotion.');
            }
        });
    });

    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
            if (e.key === 'Enter') {
                e.preventDefault();
                analyzeText();
            }
        }
        
        if (e.key === 'Escape') {
            if (loadingContainer.classList.contains('active')) {
                hideLoading();
                resultPlaceholder.style.display = 'flex';
            }
        }
    });

    // Floating animation
    const orbs = document.querySelectorAll('.floating-orb');
    
    document.addEventListener('mousemove', (e) => {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;
        
        orbs.forEach((orb, index) => {
            const speed = (index + 1) * 0.02;
            const moveX = (x - 0.5) * 100 * speed;
            const moveY = (y - 0.5) * 100 * speed;
            orb.style.transform = `translate(${moveX}px, ${moveY}px)`;
        });
    });

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    document.querySelectorAll('.glass-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });

    setTimeout(() => {
        document.querySelectorAll('.glass-card').forEach(card => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        });
    }, 100);

    loadSavedTheme();
    updateCharCounter();

    console.log('%c EmotionAI ', 'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-size: 24px; font-weight: bold; padding: 10px 20px; border-radius: 8px;');
    console.log('%c Machine Learning Emotion Detection ', 'color: #667eea; font-size: 14px;');

})();