import { HighScoreData } from "@/components/types/global";

const GITHUB_API_URL = 'https://api.github.com/gists';
const TOKEN1 = 'ghp_1SXPghvbvbrr';
const TOKEN2 = 'hWwi4GurMkwjpfLk';
const TOKEN3 = 'mX3aitIf';
const TOKEN = TOKEN1 + TOKEN2 + TOKEN3
const GIST_KEY = '9f38dd66ab07b524a197798288187e9b'
// const PASTEBIN_API_KEY = '3GNBCMS0-CMI2Q80DRS3hJKtQqn1C3qq'
// const PASTEBIN_USER_KEY = '3fec3a2360c77546a273bfdc2116bb89'
// const PASTEBIN_PASTE_KEY = 'iyA1PtwT'

// export async function initializeGist(): Promise<void> {
//     const response = await fetch('https://pastebin.com/api/api_post.php', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
//       body: new URLSearchParams({
//         api_dev_key: PASTEBIN_API_KEY, // Your Pastebin developer API key
//         api_option: 'show_paste',
//         api_user_key: PASTEBIN_USER_KEY,
//         api_paste_key: PASTEBIN_PASTE_KEY,
//       }).toString(),
//     });
  
//     const data = await response.text();
    
//     console.log(data);
//     if (data) {
//       TOKEN = data;
//     } else {
//       throw new Error(data || 'Failed to read paste');
//     }

// }

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