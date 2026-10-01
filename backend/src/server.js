// API FST Notes — données fictives en mémoire, réinitialisées à chaque démarrage.
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const PORT = Number(process.env.PORT || 3000);
const JWT_SECRET = process.env.JWT_SECRET;
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;
if (!JWT_SECRET || !ADMIN_API_KEY) {
  console.error('Variables manquantes : lancez avec le fichier backend/.env (voir README).');
  process.exit(1);
}

const users = [
  { id: 1, email: 'yassine.idrissi@etu.fstt.lab', password: bcrypt.hashSync('Etudiant1!', 8), name: 'Yassine Idrissi', cne: 'R130450210' },
  { id: 2, email: 'imane.tazi@etu.fstt.lab', password: bcrypt.hashSync('Etudiant2!', 8), name: 'Imane Tazi', cne: 'R130450211' },
  { id: 3, email: 'omar.chraibi@etu.fstt.lab', password: bcrypt.hashSync('Etudiant3!', 8), name: 'Omar Chraibi', cne: 'R130450212' },
];

const grades = {
  1: [{ module: 'Sécurité mobile', note: 12.5 }, { module: 'Big Data', note: 14 }, { module: 'Cloud computing', note: 9.75 }],
  2: [{ module: 'Sécurité mobile', note: 16 }, { module: 'Big Data', note: 15.5 }, { module: 'Cloud computing', note: 13 }],
  3: [{ module: 'Sécurité mobile', note: 8.5 }, { module: 'Big Data', note: 11 }, { module: 'Cloud computing', note: 10.25 }],
};

const publicUser = ({ password, ...u }) => u;

const app = express();
app.use(express.json());
app.use((req, res, next) => { console.log(req.method, req.url); next(); });

function auth(req, res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = users.find((u) => u.id === payload.sub);
    if (!req.user) throw new Error();
    next();
  } catch {
    res.status(401).json({ error: 'Non authentifié' });
  }
}

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.post('/api/login', (req, res) => {
  const { email, password } = req.body || {};
  const user = users.find((u) => u.email === String(email || '').trim().toLowerCase());
  if (!user || !bcrypt.compareSync(String(password || ''), user.password)) {
    return res.status(401).json({ error: 'Identifiants incorrects' });
  }
  const token = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: '30d' });
  res.json({ token, user: publicUser(user) });
});

app.get('/api/students/:id/grades', auth, (req, res) => {
  const id = Number(req.params.id);
  const student = users.find((u) => u.id === id);
  if (!student) return res.status(404).json({ error: 'Étudiant introuvable' });
  res.json({ student: publicUser(student), grades: grades[id] });
});

// Export pour la scolarité
app.get('/api/admin/export', (req, res) => {
  if (req.headers['x-api-key'] !== ADMIN_API_KEY) return res.status(403).json({ error: 'Clé invalide' });
  res.json(users.map((u) => ({ ...publicUser(u), grades: grades[u.id] })));
});

app.listen(PORT, () => console.log(`API FST Notes : http://localhost:${PORT}`));
