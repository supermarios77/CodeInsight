import DOMPurify from 'dompurify';
import { marked } from 'marked';

const MAX_MODEL_CHARS = 4000;

let pageContent = '';
let lastSummary = '';

const summaryElement = document.querySelector('#summary-content');
const warningElement = document.querySelector('#warning');
const summaryTypeSelect = document.querySelector('#type');
const summaryFormatSelect = document.querySelector('#format');
const summaryLengthSelect = document.querySelector('#length');
const targetLanguageSelect = document.querySelector('#target-language');
const themeToggle = document.querySelector('#theme-toggle');
const copyButton = document.querySelector('#copy-button');
const speakButton = document.querySelector('#speak-button');
const refreshButton = document.querySelector('#refresh-button');
const toastElement = document.querySelector('#toast');

function onConfigChange() {
    const oldContent = pageContent;
    pageContent = '';
    onContentChange(oldContent);
}

[summaryTypeSelect, summaryFormatSelect, summaryLengthSelect, targetLanguageSelect].forEach((e) =>
    e.addEventListener('change', onConfigChange)
);

chrome.storage.session.get('pageContent', ({ pageContent }) => {
    onContentChange(pageContent);
});

chrome.storage.session.onChanged.addListener((changes) => {
    const pageContent = changes['pageContent'];
    onContentChange(pageContent.newValue);
});

async function onContentChange(newContent) {
    if (pageContent == newContent) {
        return;
    }
    pageContent = newContent;
    let summary;
    if (newContent) {
        if (newContent.length > MAX_MODEL_CHARS) {
            updateWarning(
                `Text is too long for summarization with ${newContent.length} characters (maximum supported content length is ~4000 characters).`
            );
        } else {
            updateWarning('');
        }
        showSummary('Loading...');
        summary = await generateSummary(newContent);
        lastSummary = summary;
    } else {
        summary = "There's nothing to summarize";
    }
    showSummary(summary);
}

async function generateSummary(text) {
    try {
        const session = await createSummarizer(
            {
                type: summaryTypeSelect.value,
                format: summaryFormatSelect.value,
                length: summaryLengthSelect.value
            },
            (message, progress) => {
                console.log(`${message} (${progress.loaded}/${progress.total})`);
            }
        );
        const summary = await session.summarize(text);
        session.destroy();
        return summary;
    } catch (e) {
        console.log('Summary generation failed');
        console.error(e);
        return 'Error: ' + e.message;
    }
}

async function createSummarizer(config, downloadProgressCallback) {
    if (!window.ai || !window.ai.summarizer) {
        throw new Error('AI Summarization is not supported in this browser');
    }
    const canSummarize = await window.ai.summarizer.capabilities();
    if (canSummarize.available === 'no') {
        throw new Error('AI Summarization is not supported');
    }
    const summarizationSession = await self.ai.summarizer.create(
        config,
        downloadProgressCallback
    );
    if (canSummarize.available === 'after-download') {
        summarizationSession.addEventListener(
            'downloadprogress',
            downloadProgressCallback
        );
        await summarizationSession.ready;
    }
    return summarizationSession;
}

async function showSummary(text) {
    summaryElement.style.opacity = '0';
    await new Promise(resolve => setTimeout(resolve, 300));

    if (text === 'Loading...') {
        addLoadingAnimation();
    } else {
        if (targetLanguageSelect.value && text !== "Loading...") {
            addLoadingAnimation();
            text = await translateText(text, targetLanguageSelect.value);
        }
        
        summaryElement.innerHTML = DOMPurify.sanitize(marked.parse(text));
    }

    summaryElement.style.opacity = '1';
}

async function updateWarning(warning) {
    if (warning) {
        warningElement.textContent = warning;
        warningElement.hidden = false;
        warningElement.style.opacity = '0';
        await new Promise(resolve => setTimeout(resolve, 10));
        warningElement.style.opacity = '1';
    } else {
        warningElement.style.opacity = '0';
        await new Promise(resolve => setTimeout(resolve, 300));
        warningElement.hidden = true;
    }
}

async function translateText(text, targetLanguage) {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLanguage}&dt=t&q=${encodeURIComponent(text)}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        return data[0].map(x => x[0]).join('');
    } catch (error) {
        console.error('Translation error:', error);
        return text;
    }
}

function toggleDarkMode() {
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('darkMode', document.documentElement.classList.contains('dark'));

    const moonIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-moon"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
    const sunIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-sun"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;

    themeToggle.innerHTML = document.documentElement.classList.contains('dark') ? sunIcon : moonIcon;
}

const savedTheme = localStorage.getItem('darkMode');
if (savedTheme === 'true') {
    document.documentElement.classList.add('dark');
    themeToggle.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-sun"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
}

function addLoadingAnimation() {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading';
    loadingDiv.innerHTML = `
        <svg width="38" height="38" viewBox="0 0 38 38" xmlns="http://www.w3.org/2000/svg" stroke="currentColor">
            <g fill="none" fill-rule="evenodd">
                <g transform="translate(1 1)" stroke-width="2">
                    <circle stroke-opacity=".5" cx="18" cy="18" r="18"/>
                    <path d="M36 18c0-9.94-8.06-18-18-18">
                        <animateTransform
                            attributeName="transform"
                            type="rotate"
                            from="0 18 18"
                            to="360 18 18"
                            dur="1s"
                            repeatCount="indefinite"/>
                    </path>
                </g>
            </g>
        </svg>
    `;
    summaryElement.innerHTML = '';
    summaryElement.appendChild(loadingDiv);
}

let speechSynthesis;

function showToast(message) {
    toastElement.textContent = message;
    toastElement.classList.add('show');
    setTimeout(() => {
        toastElement.classList.remove('show');
    }, 3000);
}

themeToggle.addEventListener('click', toggleDarkMode);

copyButton.addEventListener('click', () => {
    navigator.clipboard.writeText(summaryElement.innerText).then(() => {
        showToast('Summary copied to clipboard!');
    });
});

speakButton.addEventListener('click', () => {
    if (speechSynthesis && speechSynthesis.speaking) {
        speechSynthesis.cancel();
        showToast('Speech stopped');
    } else {
        speechSynthesis = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance(summaryElement.innerText);
        speechSynthesis.speak(utterance);
        showToast('Reading summary aloud');
    }
});

refreshButton.addEventListener('click', () => {
    onConfigChange();
    showToast('Summary refreshed');
});

targetLanguageSelect.addEventListener('change', async () => {
    if (lastSummary) {
        showSummary(lastSummary);
    }
});