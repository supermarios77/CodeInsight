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
    // No new content, do nothing
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
  
  if (targetLanguageSelect.value && text !== "Loading...") {
    text = await translateText(text, targetLanguageSelect.value);
  }
  
  summaryElement.innerHTML = DOMPurify.sanitize(marked.parse(text));
  summaryElement.style.opacity = '1';
}

async function updateWarning(warning) {
  if (warning) {
    warningElement.textContent = warning;
    warningElement.style.display = 'block';
    warningElement.style.opacity = '0';
    await new Promise(resolve => setTimeout(resolve, 10));
    warningElement.style.opacity = '1';
  } else {
    warningElement.style.opacity = '0';
    await new Promise(resolve => setTimeout(resolve, 300));
    warningElement.style.display = 'none';
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
  document.body.classList.toggle('dark');
  localStorage.setItem('darkMode', document.body.classList.contains('dark'));
  
  document.body.style.transition = 'background-color 0.5s ease, color 0.5s ease';
  setTimeout(() => {
    document.body.style.transition = '';
  }, 500);
}

const savedTheme = localStorage.getItem('darkMode');
if (savedTheme === 'true') {
  document.body.classList.add('dark');
}

themeToggle.addEventListener('click', toggleDarkMode);

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    document.querySelector(this.getAttribute('href')).scrollIntoView({
      behavior: 'smooth'
    });
  });
});

targetLanguageSelect.addEventListener('change', async () => {
  if (lastSummary) {
    showSummary(lastSummary);
  }
});