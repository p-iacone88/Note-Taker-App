//import required modules
const express = require('express');
const fs = require('fs'); // File system module for reading/writing files
const path = require('path'); // Path manipulation module
const uniqid = require('uniqid'); // Generate unique IDs

// create an Express app instance
const app = express();
// Set port for the server
const PORT = process.env.PORT || 4001;

// Middleware to parse request bodies
app.use(express.urlencoded({ extended: true}));
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Routes:
// GET '/': Serve index.html file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// GET '/notes': Serve the notes.html file
app.get('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/notes.html'));
});

//GET '/api/notes': Retrieve all motes from the JSON file
app.get('/api/notes', (req, res) => {
  fs.readFile('./db/db.json', 'utf8', (err, data) => {
    if (err) {
      res.status(500).json({ error: 'Error reading the file. '});
      console.error('Error reading the file', err);
      return;
    } 
    res.send(data); //Send notes data as JSON
  });
})

// POST '/api/notes': Create new note
app.post('/api/notes', (req, res) => {
  const newNote = req.body; //Access note data from the request body
  newNote.id = uniqid(); //Assign unique ID to the note
  console.log(newNote);
  fs.readFile('./db/db.json', 'utf8', (err, data) => {
    if (err) {
      res.status(500).json({ error: 'Error reading the file.' });
      console.error('Error reading the file:', err);
      return;
    }
    let json = JSON.parse(data); // Parse the existing notes data
    json.push(newNote); // Add the new note to the array
    json.forEach((note) => {
      console.log(note);
      console.log(uniqid());
    });
    fs.writeFile('./db/db.json', JSON.stringify(json), (err, result) => {
      if (err) {
        res.status(500).json({ error: 'Error writing the file' });
        console.error('Error writing the file:', err);
        return;
      }
    });
  });
  res.sendFile(path.join(__dirname, 'public/notes.html')); //Redirect to the notes page after saving
});

// DELETE '/api/notes/:id': Delete a note with the specified ID
app.delete('/api/notes/:id', (req, res) => {
  const id = req.params.id; // Get the ID from the URL parameters
  console.log(id);
  fs.readFile('./db/db.json', 'utf8', (readErr, data) => {
    if (readErr) {
      console.error('Error reading file:', readErr);
      return res.status(500).json({ error: 'Error reading the file' });
    }
    let json = JSON.parse(data); // Parse the existing notes data
    console.log(json);
    let newArr = json.filter((note) => {
      return note.id !== id; // Filter out the note to be deleted
    });
    console.log(newArr);
    fs.writeFile('./db/db.json', JSON.stringify(newArr), (err, results) => {
      if (err) {
        console.error('Error writing file:', err);
        return res.status(500).json({ error: 'Error writing to the file' });
      }
    });
  });
  res.json(newArr); // Send the updated notes array as a response
});

app.listen(PORT, () => console.log(`App listening on port ${PORT}`));