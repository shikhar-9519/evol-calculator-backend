const express = require('express');
const cors = require('cors');
const { Client, Databases } = require('appwrite');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Set up Appwrite Client and Database
const client = new Client();
client
  .setEndpoint(process.env.APPWRITE_ENDPOINT) // Appwrite endpoint
  .setProject(process.env.APPWRITE_PROJECT_ID); // Project ID

// Set the API key manually in headers for authorization
client.headers['X-Appwrite-Key'] = process.env.APPWRITE_API_KEY;

const databases = new Databases(client);

app.post('/submit', async (req, res) => {
  const { name, crushName, height, crushHeight, age, crushAge, favColor, likeAbout, knowEachOther, message } = req.body;

  if (!name || !crushName) {
    return res.status(400).json({ error: 'Name and Crush Name are required' });
  }

  // Filter out empty values
  const filteredData = Object.fromEntries(
    Object.entries({
      name,
      crushName,
      height: Number(height),
      crushHeight: Number(crushHeight),
      age: Number(age),
      crushAge: Number(crushAge),
      favColor,
      likeAbout,
      knowEachOther,
      message,
    }).filter(([key, value]) => value !== undefined && value !== "" && value !== "Not provided" && value !== 0)
  );

  try {
    // Store filtered data in Appwrite
    const response = await databases.createDocument(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_COLLECTION_ID,
      'unique()', // auto-generate document ID
      filteredData
    );

    console.log('Data stored successfully:', response);
    res.status(200).json({ message: 'Submission received and stored!' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to process submission' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
