const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;
const client = require('prom-client');

app.use(express.json());

// Servir les fichiers statiques (HTML, CSS, JS) dans le dossier public
app.use(express.static(path.join(__dirname, '.')));


const counter_request_success = new client.Counter({
  name: 'counter_request_success',
  help: "Compteur permettant de connaître le nb de requêtes success",
});


const counter_request_failed = new client.Counter({
  name: 'counter_request_failed',
  help: 'Compteur permettant de connaître le nb de requêtes failed',
});


const histogram_request_duration = new client.Histogram({
  name: 'histogram_request_duration',
  help: 'Histogramme permettant de connaître la durée de requêtes dans un interval',
  buckets: [0.5, 1, 3, 5],
});
// Route pour envoyer un message
app.post('/send-message', (req, res) => {
    const message = req.body.message;

    const start = Date.now();
    // Générer un résultat aléatoire de succès ou échec
    const success = Math.random() > 0.5;

    // Générer une vitesse d'envoi aléatoire
    const sendTime = Math.floor(Math.random() * 5000); // entre 0 et 5 secondes

    const result = {
        message,
        status: success ? 'success' : 'fail',
        sendTime
    };

    success ? counter_request_success.inc() : counter_request_failed.inc()

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
                const duration = ((Date.now() - start) / 1000);
                histogram_request_duration.observe(duration);
                res.json(result);
            }, sendTime);
        });
    });
});

app.get('/metrics', async(req, res) => {
  const metrics = await client.register.metrics();
  res.end(metrics);
})

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`Serveur en écoute sur le port ${PORT}`);
});
