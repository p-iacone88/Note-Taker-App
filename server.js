const express = require('express');
const fs = require('fs');
const path = require('path');
const uniqid = require('uniqid');

const app = express();
const PORT = process.env.PORT || 4001;

app.use(express.urlencoded({ extended: true}));
app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.get('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/notes.html'));
});

app.get('/api/notes', (req, res) => {
  fs.readFile('./db/db.json', 'utf8', (err, data) => {
    if (err) {
      res.status(500).json({ error: 'Error reading the file. '});
      console.error('Error reading the file', err);
      return;
    }
    res.send(data);
  });
})

app.post('/api/notes', (req, res) => {
  const newNote = req.body;
  newNote.id = uniqid();
  console.log(newNote);
  fs.readFile('./db/db.json', 'utf8', (err, data) => {
    if (err) {
      res.status(500).json({ error: 'Error reading the file.' });
      console.error('Error reading the file:', err);
      return;
    }
    let json = JSON.parse(data);
    json.push(newNote);
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
  res.sendFile(path.join(__dirname, 'public/notes.html'));
});

app.delete('/api/notes/:id', (req, res) => {
  const id = req.params.id;
  console.log(id);
  fs.readFile('./db/db.json', 'utf8', (readErr, data) => {
    if (readErr) {
      console.error('Error reading file:', readErr);
      return res.status(500).json({ error: 'Error reading the file' });
    }
    let json = JSON.parse(data);
    console.log(json);
    let newArr = json.filter((note) => {
      return note.id !== id;
    });
    console.log(newArr);
    fs.writeFile('./db/db.json', JSON.stringify(newArr), (err, results) => {
      if (err) {
        console.error('Error writing file:', err);
        return res.status(500).json({ error: 'Error writing to the file' });
      }
    });
  });
  res.json(newArr);
});

app.listen(PORT, () => console.log(`App listening on port ${PORT}`));