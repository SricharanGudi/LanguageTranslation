import express from "express";
import { dirname } from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import translate from 'translate-google';
import {languages} from "./languages.js";
import fileUpload from "express-fileupload";
import PDF from "pdf-parse-fork";
import { createWorker } from 'tesseract.js';
import gTTS from 'gtts'
import mysql from 'mysql2/promise';


const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', __dirname + "/views");
app.use(bodyParser.json());
app.use(fileUpload());

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Pl@10021124',
  database: 'seproject1'
});

pool.on('connection', () => {
  console.log('Connected to MySQL database');
});

// Listen for connection errors
pool.on('error', (err) => {
  console.error('Error connecting to MySQL database:', err);
});

app.post('/login', async (req, res) => {
  const { Username, Password } = req.body;
console.log(Username)
  try {
    // Query the database to check if the user exists with the provided email and password
    const [rows] = await pool.execute('SELECT * FROM Users WHERE Username = ? AND Password = ?', [Username, Password]);

    if (rows.length > 0) {
      // User exists, redirect to the index page
      res.render('index', { languages: languages });
    } else {
      // User does not exist or credentials are incorrect, render the login page with an error message
      res.render('login', { error: 'Invalid email or password' });
    }
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).send('Internal Server Error');
  }
});
app.post('/signup', async (req, res) => {
  const { name, password, email } = req.body;

  try {
      // Insert the new user data into the database
      await pool.execute('INSERT INTO Users (Username, Password, Email) VALUES (?, ?, ?)', [name, password, email]);
      
      // You can also send a success message back to the client if needed
      res.sendStatus(200);
  } catch (error) {
      console.error("Error during sign-up:", error);
      res.status(500).send('Internal Server Error');
  }
});


app.post('/speech', async (req, res) => {
  const { text, language } = req.body;
  console.log('Received text:', text);
  console.log('Received language:', language);

  try {
    // Create a new instance of gTTS with the received text and language
    var gtts = new gTTS(text,language);
    
    // Stream the speech audio directly to the client
    gtts.stream().pipe(res);
//});

  } catch (error) {
    console.error(error);
    res.sendStatus(500); // Send server error status code
  }
});

app.post('/usetext_n', async (req, res) => {
  const { text } = req.body;
  const {language} =req.body;
  console.log('Received text:', text);
  console.log("received language:",language);
  try {
   
    const translatedText = await translate(text, { to: language});
    console.log("translated to telugu :", translatedText);
    res.send(translatedText);
  } catch (error) {
    console.error("Error translating text:", error);
  }

});

app.post('/usetext', async (req, res) => {
  const { text } = req.body;
  const {language} =req.body;
  console.log('Received text:', text);
  console.log("received language:",language);
  try {
    const languagetype = await translate(language,{to:'en'})
    console.log(languagetype);
    const translatedText = await translate(text, { to: languagetype});
    console.log("translated to telugu :", translatedText);
    res.send(translatedText);
  } catch (error) {
    console.error("Error translating text:", error);
  }
});

app.post('/usepdf', async (req, res) => {
  const language = req.get('Language');
  
  // Check if PDF file was uploaded
  if (!req.files || !req.files.file) {
      res.status(400).send('No PDF file uploaded.');
      return;
  }

  try {
    
      const pdfFile = req.files.file;
      const pdfData = await PDF(pdfFile.data);
      
      console.log("received language:", language);
      console.log("PDF text:", pdfData.text);

      const languagetype = await translate(language,{to:'en'})
      console.log(languagetype);
      const translatedText = await translate(pdfData.text, { to: languagetype});
      console.log("translated to telugu :", translatedText);
      // Proceed with any additional processing of the PDF text
      
      res.send(translatedText)
  } catch (error) {
      console.error("Error parsing PDF:", error);
      res.status(500).send('Error parsing PDF.');
  }
});

app.post('/useimg', async (req, res) => {
  const language = req.get('Language');

  // Check if image file was uploaded
  if (!req.files || !req.files.file) {
      res.status(400).send('No image file uploaded.');
      return;
  }

  try {
      const imageFile = req.files.file;

      // Initialize Tesseract worker
      const worker = await createWorker('eng');

      // Recognize text from the uploaded image file
      const { data: { text: imgText } } = await worker.recognize(imageFile.data);

      console.log("Received language:", language);
      console.log("Image text:", imgText);

      // Translate the extracted text to the target language
      const languageType = await translate(language, { to: 'en' });
      console.log(languageType);

      const translatedText = await translate(imgText, { to: languageType });
      console.log("Translated text:", translatedText);

      // Proceed with any additional processing of the extracted text

      // Send response
      res.send(translatedText)

      // Terminate the Tesseract worker
      await worker.terminate();
  } catch (error) {
      console.error("Error parsing image:", error);
      res.status(500).send('Error parsing image.');
  }
});

app.post('/usepdf_n', async (req, res) => {
  const language = req.get('Language');
  
  // Check if PDF file was uploaded
  if (!req.files || !req.files.file) {
      res.status(400).send('No PDF file uploaded.');
      return;
  }

  try {
    
      const pdfFile = req.files.file;
      const pdfData = await PDF(pdfFile.data);
      
      console.log("received language:", language);
      console.log("PDF text:", pdfData.text);

      const translatedText = await translate(pdfData.text, { to: language});
      console.log("translated to telugu :", translatedText);
      // Proceed with any additional processing of the PDF text
      
      res.send(translatedText)
  } catch (error) {
      console.error("Error parsing PDF:", error);
      res.status(500).send('Error parsing PDF.');
  }
});

app.post('/useimg_n', async (req, res) => {
  const language = req.get('Language');

  // Check if image file was uploaded
  if (!req.files || !req.files.file) {
      res.status(400).send('No image file uploaded.');
      return;
  }

  try {
      const imageFile = req.files.file;

      // Initialize Tesseract worker
      const worker = await createWorker('eng');

      // Recognize text from the uploaded image file
      const { data: { text: imgText } } = await worker.recognize(imageFile.data);

      console.log("Received language:", language);
      console.log("Image text:", imgText);


      const translatedText = await translate(imgText, { to: language });
      console.log("Translated text:", translatedText);

      // Proceed with any additional processing of the extracted text
      res.send(translatedText)
      // Send response
      //res.sendStatus(200);

      // Terminate the Tesseract worker
      await worker.terminate();
  } catch (error) {
      console.error("Error parsing image:", error);
      res.status(500).send('Error parsing image.');
  }
});

app.use((req, res, next) => {
  console.log(`Incoming ${req.method} request to ${req.url}`);
  next();
});

// Handling GET requests to the root endpoint "/"
app.get("/", (req, res) => {
  res.render('index', { languages: languages });
});

app.get('/login', (req, res) => {
  // Render the login.ejs file and send it as the response
  res.render('login');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
