const textInput = document.getElementById('textInput');
const sourceLang = document.getElementById('sourceLang');
const targetLang = document.getElementById('targetLang');
const swapLangBtn = document.getElementById('swapLangBtn');
const speedSlider = document.getElementById('speedSlider');
const speedVal = document.getElementById('speedVal');

const readBtn = document.getElementById('readBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resumeBtn = document.getElementById('resumeBtn');
const stopBtn = document.getElementById('stopBtn');
const translateBtn = document.getElementById('translateBtn');
const fileInputBtn = document.getElementById('fileInputBtn');
const fileUpload = document.getElementById('fileUpload');
const driveBtn = document.getElementById('driveBtn');
const copySaveBtn = document.getElementById('copySaveBtn');

const historyContainer = document.getElementById('historyContainer');
const clearAllBtn = document.getElementById('clearAllBtn');

const synth = window.speechSynthesis;

if(speedSlider) {
    speedSlider.addEventListener('input', () => {
        speedVal.textContent = `(${speedSlider.value})`;
    });
}

// Improved Auto Detect Language Logic
textInput.addEventListener('input', () => {
    const text = textInput.value;
    if (!text.trim()) return;

    // Check script ranges
    const isArabic = /[\u0600-\u06FF]/.test(text);
    const isBengali = /[\u0980-\u09FF]/.test(text);
    const isHindi = /[\u0900-\u097F]/.test(text);
    const isSpanishOrFrench = /[áéíóúàèìòùçñ]/i.test(text);

    if (isArabic) {
        sourceLang.value = 'ar-SA';
        targetLang.value = 'bn-BD';
    } else if (isBengali) {
        sourceLang.value = 'bn-BD';
        targetLang.value = 'en-US';
    } else if (isHindi) {
        sourceLang.value = 'hi-IN';
        targetLang.value = 'en-US';
    } else if (isSpanishOrFrench) {
        sourceLang.value = 'es-ES';
        targetLang.value = 'en-US';
    } else {
        // Default / English
        sourceLang.value = 'en-US';
        targetLang.value = 'bn-BD';
    }
});

// Read / TTS
readBtn.addEventListener('click', () => {
    const text = textInput.value.trim();
    if (!text) {
        alert('দয়া করে কিছু টেক্সট লিখুন বা পেস্ট করুন!');
        return;
    }
    if (synth.speaking) synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = parseFloat(speedSlider.value);
    utterance.lang = sourceLang.value;
    synth.speak(utterance);
});

// Pause
pauseBtn.addEventListener('click', () => {
    if (synth.speaking && !synth.paused) synth.pause();
});

// Resume
resumeBtn.addEventListener('click', () => {
    if (synth.paused) {
        synth.resume();
    } else if (!synth.speaking && textInput.value.trim() !== '') {
        const utterance = new SpeechSynthesisUtterance(textInput.value.trim());
        utterance.rate = parseFloat(speedSlider.value);
        utterance.lang = sourceLang.value;
        synth.speak(utterance);
    }
});

// Stop
stopBtn.addEventListener('click', () => {
    if (synth.speaking || synth.paused) synth.cancel();
});

// Translation
translateBtn.addEventListener('click', async () => {
    const text = textInput.value.trim();
    if (!text) {
        alert('অনুবাদের জন্য কিছু টেক্সট লিখুন!');
        return;
    }

    const fromLang = sourceLang.value.split('-')[0]; 
    const toLang = targetLang.value.split('-')[0];
    
    translateBtn.textContent = 'অনুবাদ হচ্ছে...';
    translateBtn.disabled = true;

    try {
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${fromLang}|${toLang}`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data && data.responseData && data.responseData.translatedText) {
            textInput.value = data.responseData.translatedText;
            textInput.dispatchEvent(new Event('input')); // Re-detect language after translation
        } else {
            alert('অনুবাদ করতে সমস্যা হয়েছে।');
        }
    } catch (error) {
        console.error('Translation Error:', error);
        alert('ইন্টারনেট কানেকশন চেক করুন।');
    } finally {
        translateBtn.textContent = 'অনুবাদ করুন';
        translateBtn.disabled = false;
    }
});

// Swap
swapLangBtn.addEventListener('click', () => {
    const temp = sourceLang.value;
    sourceLang.value = targetLang.value;
    targetLang.value = temp;
});

// File Input
fileInputBtn.addEventListener('click', () => fileUpload.click());

fileUpload.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        textInput.value = e.target.result;
        textInput.dispatchEvent(new Event('input'));
    };
    reader.readAsText(file);
});

driveBtn.addEventListener('click', () => {
    alert('ড্রাইভ বা ওয়েব ফাইল লোড করার ফিচারটি প্রস্তুত রয়েছে।');
});

// Copy & Save History
copySaveBtn.disable = false;
copySaveBtn.addEventListener('click', () => {
    const text = textInput.value.trim();
    if (!text) {
        alert('সংরক্ষণ করার মতো কোনো টেক্সট নেই!');
        return;
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            saveToHistory(text);
            alert('টেক্সট সফলভাবে কপি করা হয়েছে এবং সংরক্ষিত মেসেজে সেভ হয়েছে!');
        }).catch(() => fallbackCopyAndSave(text));
    } else {
        fallbackCopyAndSave(text);
    }
});

function fallbackCopyAndSave(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
        document.execCommand('copy');
        saveToHistory(text);
        alert('টেক্সট সফলভাবে কপি করা হয়েছে এবং সংরক্ষিত মেসেজে সেভ হয়েছে!');
    } catch (err) {
        alert('কপি করতে ব্যর্থ হয়েছে।');
    }
    document.body.removeChild(textArea);
}

function saveToHistory(text) {
    let history = JSON.parse(localStorage.getItem('voiceAppHistory')) || [];
    history.unshift(text); 
    if (history.length > 20) history.pop(); 
    localStorage.setItem('voiceAppHistory', JSON.stringify(history));
    loadHistory();
}

function loadHistory() {
    let history = JSON.parse(localStorage.getItem('voiceAppHistory')) || [];
    historyContainer.innerHTML = '';

    if (history.length === 0) {
        historyContainer.innerHTML = '<p style="color: #666; font-size: 14px;">কোনো সংরক্ষিত মেসেজ নেই।</p>';
        return;
    }

    history.forEach((item) => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.textContent = item.length > 100 ? item.substring(0, 100) + '...' : item;
        
        div.addEventListener('click', () => {
            textInput.value = item;
            window.scrollTo({ top: `0`, behavior: 'smooth' });
            textInput.dispatchEvent(new Event('input'));
        });

        historyContainer.appendChild(div);
    });
}

clearAllBtn.addEventListener('click', () => {
    if (confirm('সব হিস্ট্রি মুছে ফেলতে চান?')) {
        localStorage.removeItem('voiceAppHistory');
        loadHistory();
    }
});

loadHistory();