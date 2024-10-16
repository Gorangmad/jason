const express = require('express');
const nodemailer = require('nodemailer');
const multer = require('multer');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

// Initialize express app
const app = express();

// Use middleware to parse form data and handle CORS
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/iamges', express.static(path.join(__dirname, 'iamges')));
app.use('/scripts', express.static(path.join(__dirname, 'scripts')));


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Another page route
app.get('/Projekte', (req, res) => {
  res.sendFile(path.join(__dirname, 'projects.html'));
});

app.get('/Expertise', (req, res) => {
  res.sendFile(path.join(__dirname, 'expertise.html'));
});
app.get('/Return', (req, res) => {
  res.sendFile(path.join(__dirname, 'return.html'));
});
app.get('/Datenschutz', (req, res) => {
  res.sendFile(path.join(__dirname, 'datenschutz.html'));
});
app.get('/Impressum', (req, res) => {
  res.sendFile(path.join(__dirname, 'impressum.html'));
});

// Multer configuration with file size limit (5 MB in this case)
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 } // Limit file size to 5MB
});

// Nodemailer transport configuration
const transporter = nodemailer.createTransport({
  service: 'gmail', // Use the appropriate email service (Gmail, Outlook, etc.)
  auth: {
    user: 'noreplyjghaustechnik@gmail.com', // Your email address
    pass: 'hloj iids yids dxoh' // Your email password or App-specific password if 2FA is enabled
  }
});

// POST route to handle form submission and send email
app.post('/send', upload.array('files', 10), (req, res) => {
console.log(req.body)
  const { first_name, last_name, email, phone, address, performance_location, Budget, message, work_type, work_area } = req.body;

  // If files are uploaded, get their file names
  let files = '';
  if (req.files) {
    files = req.files.map(file => file.originalname).join(', ');
  }

  // HTML email for admin notification
  const adminMailOptions = {
    from: email,
    to: 'ggorangmadaan@gmail.com', // Your email where you receive the submissions
    subject: 'Neue Anfrage',
    html: `
      <h2>Sie haben eine neue Anfrage von ${first_name} ${last_name} erhalten.</h2>

      <p><strong>Art der Arbeit:</strong> ${work_type}</p>
      <p><strong>Bereich der Arbeit:</strong> ${work_area}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Telefon:</strong> ${phone}</p>
      <p><strong>Addresse:</strong> ${address}</p>
      <p><strong>Leistungsort(falls abweichend):</strong> ${performance_location}</p>
      <p><strong>Budget:</strong> ${Budget}</p>
      <p><strong>Nachricht:</strong> ${message}</p>
      <p><strong>Bilder:</strong> ${files}</p>


    `,
    attachments: req.files.map(file => ({
      filename: file.originalname,
      path: file.path
    }))
  };

// HTML confirmation email for the user
const userMailOptions = {
    from: 'noreplyjghaustechnik@gmail.com', // Sender email
    to: email, // User email
    subject: 'Vielen Dank, dass Sie uns kontaktiert haben!',
    html: `
      <h3>Vielen Dank, ${first_name} ${last_name}, dass Sie uns kontaktiert haben!</h3>
      <p>Wir haben Ihre Nachricht erhalten und unser Team wird sich in Kürze bei Ihnen melden.</p>
      <p>Mit freundlichen Grüßen,<br/>Ihr Team</p>
    `
  };
  

  // Send the email to admin
  transporter.sendMail(adminMailOptions, (error, info) => {
    if (error) {
      console.log(error);
      return res.status(500).json({ status: 'error', message: error });
    }

    // Send confirmation email to user
    transporter.sendMail(userMailOptions, (userError, userInfo) => {
      if (userError) {
        console.log(userError);
        return res.status(500).json({ status: 'error', message: 'Failed to send confirmation email to the user.' });
      }
      res.status(200).json({ status: 'success', message: 'Emails sent successfully' });
    });
  });
});

// Serve the uploads folder statically (optional, for testing file access)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Start the server on port 5000 or an environment-specified port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
