const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const { docClient, connectDb } = require('./config/dbConnection.cjs');
const { PutCommand    } = require("@aws-sdk/lib-dynamodb");
const app = express();
const port = 5002;

const corsOptions = {
  origin: 'http://localhost:5173', // Allow requests from your React app
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // Allow credentials
};

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json());


// Connect to the database
connectDb();

// Flask backend URL
const FLASK_BACKEND_URL = 'http://localhost:5000';  // Assuming Flask runs on port 5001

app.post('/', async (req, res) => {
  return res.json({message:"hello"})
});

app.post('/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;

  const params = {
    TableName: 'Contacts',
    Item: {
      id: Date.now().toString(), // Use timestamp as a simple unique ID
      name,
      email,
      subject,
      message,
      createdAt: new Date().toISOString()
    }
  };

  try {
    // Save to DynamoDB
    const command = new PutCommand(params);
    await docClient.send(command);

    res.json({ message: 'Message received and processed successfully!'});
  } catch (err) {
    console.error('Error processing contact data:', err);
    res.status(500).json({ message: 'An error occurred while processing your request.' });
  }
});

// Route to handle chat requests
app.post('/chat', async (req, res) => {
  try {
    const response = await axios.post(`${FLASK_BACKEND_URL}/chat`, req.body);
    res.json(response.data);
  } catch (error) {
    console.error('Error forwarding chat request to Flask:', error);
    res.status(500).json({ message: 'An error occurred while processing your chat request.' });
  }
});


// Route to get all documents (products)
app.get('/documents', async (req, res) => {
  try {
    const response = await axios.get(`${FLASK_BACKEND_URL}/documents`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching documents from Flask:', error);
    res.status(500).json({ message: 'An error occurred while fetching documents.' });
  }
});

// Route to add a document (product)
app.post('/add_document', async (req, res) => {
  try {
    const response = await axios.post(`${FLASK_BACKEND_URL}/add_document`, req.body);
    res.json(response.data);
  } catch (error) {
    console.error('Error adding document through Flask:', error);
    res.status(500).json({ message: 'An error occurred while adding the document.' });
  }
});

// Route to delete a document (product)
app.post('/delete_document', async (req, res) => {
  try {
    const response = await axios.post(`${FLASK_BACKEND_URL}/delete_document`, req.body);
    res.json(response.data);
  } catch (error) {
    console.error('Error deleting document through Flask:', error);
    res.status(500).json({ message: 'An error occurred while deleting the document.' });
  }
});

// Route to update a document (product)
app.post('/update_document', async (req, res) => {
  try {
    const response = await axios.post(`${FLASK_BACKEND_URL}/update_document`, req.body);
    res.json(response.data);
  } catch (error) {
    console.error('Error updating document through Flask:', error);
    res.status(500).json({ message: 'An error occurred while updating the document.' });
  }
});

if (require.main === module) {
  const PORT = port || 5002;
  app.listen(PORT, () => {
    console.log(`Express server is running on http://localhost:${PORT}`);
  });
}
module.exports.handler = serverless(app);
