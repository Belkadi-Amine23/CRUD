const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const app = express();
const csvFilePath = 'users.csv';

// Middleware pour analyser les requêtes JSON et servir des fichiers statiques
app.use(bodyParser.json());
app.use(express.static('public'));

// Vérifier si le fichier CSV existe, sinon le créer
if (!fs.existsSync(csvFilePath)) {
  fs.writeFileSync(csvFilePath, ''); // Créer un fichier CSV vide si inexistant
}

// Fonction pour lire les utilisateurs depuis le CSV
function readUsers() {
  if (!fs.existsSync(csvFilePath) || fs.readFileSync(csvFilePath, 'utf-8').trim() === '') {
    return []; // Retourner un tableau vide si le fichier est vide
  }
  
  const users = fs.readFileSync(csvFilePath, 'utf-8').trim().split('\n').filter(line => line).map(line => {
    const [firstName, lastName, email] = line.split(',');
    return { firstName, lastName, email };
  });
  return users;
}

// API pour récupérer les utilisateurs
app.get('/users', (req, res) => {
  const users = readUsers();
  res.json(users);
});

// API pour ajouter un utilisateur
app.post('/add', (req, res) => {
  const { firstName, lastName, email } = req.body;

  //console.log("Requête reçue pour ajout : ", req.body); // Pour vérifier ce qui est reçu
  
  if (!firstName || !lastName || !email) {
    return res.status(400).send('Tous les champs sont obligatoires.');
  }

  const newUser = `${firstName},${lastName},${email}\n`;
  fs.appendFileSync(csvFilePath, newUser);
  //console.log("Utilisateur ajouté avec succès !");
  res.sendStatus(200);
});




// API pour supprimer un utilisateur
app.delete('/delete/:index', (req, res) => {
  const index = parseInt(req.params.index, 10);
  let users = readUsers();
  
  // Vérification de l'index
  if (index < 0 || index >= users.length) {
    console.error('Index invalide :', index);
    return res.status(400).send('Index invalide.');
  }

  // Supprimer l'utilisateur à l'index donné
  users.splice(index, 1);
  //console.log('Utilisateur supprimé à l\'index :', index);
  
  // Écrire les utilisateurs restants dans le fichier CSV
  fs.writeFileSync(csvFilePath, users.map(user => `${user.firstName},${user.lastName},${user.email}`).join('\n'));
  res.sendStatus(200);
});

// API pour modifier un utilisateur
app.put('/update/:index', (req, res) => {
  const index = parseInt(req.params.index, 10);
  const { firstName, lastName, email } = req.body;
  
  if (!firstName || !lastName || !email) {
    return res.status(400).send('Tous les champs sont obligatoires.');
  }

  let users = readUsers();

  if (index < 0 || index >= users.length) {
    return res.status(400).send('Index invalide.');
  }

  // Mettre à jour l'utilisateur
  users[index] = { firstName, lastName, email };
  fs.writeFileSync(csvFilePath, users.map(user => `${user.firstName},${user.lastName},${user.email}`).join('\n'));
  res.sendStatus(200);
});


// Démarrer le serveur
app.listen(3000, () => {
  console.log('Serveur démarré sur http://localhost:3000');
});
