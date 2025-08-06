require('dotenv').config();
const fetch = require('node-fetch');

const ollama_host = process.env.HOST_ADDRESS || 'http://localhost:11434';

async function getModels() {
  const response = await fetch(`${ollama_host}/api/tags`);
  const data = await response.json();
  return data;
}

function postRequest(data, signal) {
  const URL = `${ollama_host}/api/generate`;
  return fetch(URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    signal
  });
}

async function getResponse(response, callback) {
  const reader = response.body.getReader();
  let partialLine = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const textChunk = new TextDecoder().decode(value);
    const lines = (partialLine + textChunk).split('\n');
    partialLine = lines.pop();

    for (const line of lines) {
      if (line.trim() === '') continue;
      const parsed = JSON.parse(line);
      callback(parsed);
    }
  }

  if (partialLine.trim() !== '') {
    const parsed = JSON.parse(partialLine);
    callback(parsed);
  }
}

// Example usage (optional for testing)
getModels().then(models => {
  console.log("Available Models:", models);
});
