const express = require('express');
const nodemailer = require('nodemailer');
const multer = require('multer');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Initialize express app
const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/iamges', express.static(path.join(__dirname, 'iamges')));
app.use('/scripts', express.static(path.join(__dirname, 'js')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Statische Bereitstellung der Uploads

// Routen
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/Projekte', (req, res) => res.sendFile(path.join(__dirname, 'projects.html')));
app.get('/Expertise', (req, res) => res.sendFile(path.join(__dirname, 'expertise.html')));
app.get('/Return', (req, res) => res.sendFile(path.join(__dirname, 'return.html')));
app.get('/Datenschutz', (req, res) => res.sendFile(path.join(__dirname, 'datenschutz.html')));
app.get('/Impressum', (req, res) => res.sendFile(path.join(__dirname, 'impressum.html')));

// Multer Konfiguration (Datei-Upload, max. 5MB pro Datei)
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB Limit pro Datei
});

// Nodemailer Transport-Konfiguration für Namecheap Private Email
const transporter = nodemailer.createTransport({
  host: 'mail.privateemail.com',
  port: 465,
  secure: true, // SSL aktiviert
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// POST-Route für das Formular und E-Mail-Versand
app.post('/send', upload.array('files', 10), async (req, res) => {
  console.log(req.body);

  const { first_name, last_name, email, phone, address, performance_location, Budget, message, work_type, work_area } = req.body;

  // Überprüfung der hochgeladenen Dateien
  let filesHtml = '';
  let attachments = [];

  if (req.files && req.files.length > 0) {
    filesHtml = req.files.map(file => `<p><img src="cid:${file.filename}" width="300"></p>`).join('');
    attachments = req.files.map(file => ({
      filename: file.originalname,
      path: file.path,
      cid: file.filename // Inline-Bild-ID für HTML
    }));
  }

  // Admin E-Mail mit Inline-Bildern
  const adminMailOptions = {
    from: 'info@jg-haustechnik.de',
    to: 'info@jg-haustechnik.de', // Deine E-Mail für Anfragen
    subject: 'Neue Anfrage',
    html: `
      <h2>Neue Anfrage von ${first_name} ${last_name}</h2>
      <p><strong>Art der Arbeit:</strong> ${work_type}</p>
      <p><strong>Bereich der Arbeit:</strong> ${work_area}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Telefon:</strong> ${phone}</p>
      <p><strong>Addresse:</strong> ${address}</p>
      <p><strong>Leistungsort (falls abweichend):</strong> ${performance_location}</p>
      <p><strong>Budget:</strong> ${Budget}</p>
      <p><strong>Nachricht:</strong> ${message}</p>
      <h3>Bilder:</h3>
      ${filesHtml || '<p>Keine Bilder hochgeladen.</p>'}
    `,
    attachments: attachments
  };

  // Bestätigungs-E-Mail für den Kunden
  const userMailOptions = {
    from: 'info@jg-haustechnik.de',
    to: email,
    subject: 'Vielen Dank für Ihre Anfrage!',
    html: `
      <h3>Hallo ${first_name} ${last_name},</h3>
      <p>Wir haben Ihre Nachricht erhalten und unser Team wird sich in Kürze bei Ihnen melden.</p>
      <p>Hier sind die Details Ihrer Anfrage:</p>
      <ul>
        <li><strong>Art der Arbeit:</strong> ${work_type}</li>
        <li><strong>Bereich der Arbeit:</strong> ${work_area}</li>
        <li><strong>Telefon:</strong> ${phone}</li>
        <li><strong>Addresse:</strong> ${address}</li>
        <li><strong>Budget:</strong> ${Budget}</li>
        <li><strong>Nachricht:</strong> ${message}</li>
      </ul>
      <p>Mit freundlichen Grüßen,<br>Ihr Team von JG Haustechnik</p>
    `
  };

  try {
    // E-Mail an Admin senden
    await transporter.sendMail(adminMailOptions);
    console.log('Admin E-Mail gesendet.');

    // Bestätigungs-E-Mail an den Kunden senden
    await transporter.sendMail(userMailOptions);
    console.log('Bestätigungs-E-Mail gesendet.');

    res.status(200).json({ status: 'success', message: 'E-Mails erfolgreich gesendet!' });
  } catch (error) {
    console.error('Fehler beim E-Mail-Versand:', error);
    res.status(500).json({ status: 'error', message: 'Fehler beim E-Mail-Versand.', error });
  }
});

// Server starten
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});
