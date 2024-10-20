const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const app = express();
const csvFilePath = 'users.csv';

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Middleware pour parser le JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Ajoutez cette ligne si vous utilisez des formulaires

// Fonction pour lire le fichier CSV
function readUsers() {
  if (!fs.existsSync(csvFilePath) || fs.readFileSync(csvFilePath, 'utf-8').trim() === '') {
    return []; // Retourne un tableau vide si le fichier n'existe pas ou est vide
  }
  
  const users = fs.readFileSync(csvFilePath, 'utf-8')
    .trim()
    .split('\n')
    .map(line => line.split(','))
    .filter(user => user.length === 3); // Vérifie que chaque ligne contient exactement 3 éléments
  return users;
}

// Route principale
app.get('/', (req, res) => {
  const users = readUsers();
  res.render('index', { users });
});

// Ajouter un utilisateur
app.post('/add', (req, res) => {
    const { firstName, lastName, email } = req.body;
    // Vérification que les champs ne sont pas vides
    if (!firstName || !lastName || !email) {
      // Redirige vers la page d'accueil avec un message d'erreur
      return res.redirect('/?error=Vous devez remplir tous les champs.');
    }
    const newUser = `${firstName},${lastName},${email}\n`;
    fs.appendFileSync(csvFilePath, newUser);
    res.redirect('/');
  });

// Modifier un utilisateur
// Votre route pour modifier un utilisateur
app.post('/update', (req, res) => {
    const { index, firstName, lastName, email } = req.body;
    let users = readUsers();
    users[index] = [lastName, firstName, email]; // Assurez-vous que l'ordre est correct
    fs.writeFileSync(csvFilePath, users.map(user => user.join(',')).join('\n'));
    res.redirect('/');
  });

// Supprimer un utilisateur
app.post('/delete', (req, res) => {
  const { index } = req.body;
  let users = readUsers();
  users.splice(index, 1);
  fs.writeFileSync(csvFilePath, users.map(user => user.join(',')).join('\n'));
  res.redirect('/');
});

// Démarrer le serveur
app.listen(3000, () => {
  console.log('Serveur démarré sur http://localhost:3000');
});
