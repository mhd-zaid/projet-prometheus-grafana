const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json());

// Servir les fichiers statiques (HTML, CSS, JS) dans le dossier public
app.use(express.static(path.join(__dirname, '.')));

// Route pour envoyer un message
app.post('/send-message', (req, res) => {
    const message = req.body.message;

    // Générer un résultat aléatoire de succès ou échec
    const success = Math.random() > 0.5;

    // Générer une vitesse d'envoi aléatoire
    const sendTime = Math.floor(Math.random() * 5000); // entre 0 et 5 secondes

    const result = {
        message,
        status: success ? 'success' : 'fail',
        sendTime
    };

    // Lire le fichier JSON pour ajouter l'enregistrement
    fs.readFile('messages.json', (err, data) => {
        let messages = [];
        if (!err && data.length) {
            messages = JSON.parse(data);
        }
        messages.push(result);

        // Écrire le nouveau message dans le fichier JSON
        fs.writeFile('messages.json', JSON.stringify(messages, null, 2), (err) => {
            if (err) {
                return res.status(500).send('Erreur lors de l\'enregistrement');
            }
            // Simuler la vitesse d'envoi avec un timeout
            setTimeout(() => {
                res.json(result);
            }, sendTime);
        });
    });
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`Serveur en écoute sur le port ${PORT}`);
});
