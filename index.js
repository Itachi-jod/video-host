const express = require('express');
const axios = require('axios');
const { Octokit } = require('@octokit/rest');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(express.json());

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

app.post('/upload', async (req, res) => {
  try {
    const { videoUrl, filename } = req.body;

    // Download video as buffer
    const response = await axios.get(videoUrl, { responseType: 'arraybuffer' });
    const content = Buffer.from(response.data).toString('base64');

    // Upload to GitHub
    const path = `videos/${filename}.mp4`;
    await octokit.repos.createOrUpdateFileContents({
      owner: process.env.REPO_OWNER,
      repo: process.env.REPO_NAME,
      path,
      message: `Uploaded ${filename}.mp4`,
      content,
      committer: { name: "Uploader Bot", email: "bot@github.com" },
      author: { name: "Uploader Bot", email: "bot@github.com" }
    });

    const videoURL = `https://${process.env.REPO_OWNER}.github.io/${process.env.REPO_NAME}/videos/${filename}.mp4`;
    res.json({ url: videoURL });

  } catch (error) {
    console.error('Upload error:', error.message);
    res.status(500).json({ error: '❌ Upload failed. Check logs.' });
  }
});

app.get('/', (req, res) => {
  res.send('🎥 Video uploader API is running.');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server started on port ${PORT}`);
});
