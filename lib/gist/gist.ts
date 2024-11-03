import { HighScoreData } from "@/components/types/global";

const GITHUB_API_URL = 'https://api.github.com/gists';
const TOKEN = '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';
const GIST_KEY = '9f38dd66ab07b524a197798288187e9b'

export async function readGist(): Promise<HighScoreData> {
  const response = await fetch(`${GITHUB_API_URL}/${GIST_KEY}`, {
    headers: {
      'Authorization': `token ${TOKEN}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Error reading gist: ${response.statusText}`);
  }

  const gistData = await response.json();
  const rawJSON: string  = gistData.files['marketScriptHighScores.json'].content;

  return JSON.parse(rawJSON);
}

export async function updateGist(content: string): Promise<void> {
  const response = await fetch(`${GITHUB_API_URL}/${GIST_KEY}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `token ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      files: {
        'marketScriptHighScores.json': {
          content,
        },
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Error updating gist: ${response.statusText}`);
  }
}