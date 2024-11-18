chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

chrome.tabs.onActivated.addListener((activeInfo) => {
  showSummary(activeInfo.tabId);
});
chrome.tabs.onUpdated.addListener(async (tabId) => {
  showSummary(tabId);
});

async function showSummary(tabId) {
  const tab = await chrome.tabs.get(tabId);
  if (!tab.url.startsWith("http")) {
    return;
  }
  const injection = await chrome.scripting.executeScript({
    target: { tabId },
    files: ["scripts/extract-content.js"],
  });
  chrome.storage.session.set({ pageContent: injection[0].result });
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "explainCode",
    title: "Explain Code",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "explainCode") {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: logSelectedText,
    });
  }
});

async function logSelectedText() {
  const selectedText = window.getSelection().toString();

  const session = await ai.languageModel.create();

  // Prompt the model and wait for the whole result to come back.
  const result = await session.prompt(`Explain this code - ${selectedText}`);
  console.log(result);

  // Prompt the model and stream the result:
  const stream = await session.promptStreaming(`Explain this code - ${selectedText}`);
  for await (const chunk of stream) {
    console.log(chunk);
  }
}
