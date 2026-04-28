import express from 'express';
import cors from 'cors';
import initSqlJs from 'sql.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, 'database.db');

const app = express();
app.use(cors());
app.use(express.json());

let db;

function getTableColumns(tableName) {
  const result = db.exec(`PRAGMA table_info(${tableName})`);
  if (!result.length) return [];
  const nameIdx = result[0].columns.indexOf('name');
  return result[0].values.map((row) => row[nameIdx]);
}

function ensureColumn(tableName, columnName, definition) {
  const columns = getTableColumns(tableName);
  if (!columns.includes(columnName)) {
    db.run(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
  }
}

function getNextInternalId() {
  const result = db.exec('SELECT COALESCE(MAX(internal_id), 0) + 1 AS next_id FROM articles');
  if (!result.length) return 1;
  return Number(result[0].values[0][0]);
}

async function initDB() {
  const SQL = await initSqlJs();
  
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }
  
  db.run(`
    CREATE TABLE IF NOT EXISTS articles (
      id TEXT PRIMARY KEY,
      quantite INTEGER DEFAULT 0,
      prix_vente REAL NOT NULL,
      titre TEXT NOT NULL,
      caracteristiques TEXT,
      couleur TEXT,
      dimension TEXT,
      contenance TEXT,
      photos TEXT,
      taille TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  ensureColumn('articles', 'internal_id', 'INTEGER');
  ensureColumn('articles', 'cadeau', 'INTEGER DEFAULT 0');
  ensureColumn('articles', 'reference', 'TEXT');
  ensureColumn('articles', 'photo_urlpath', 'TEXT');

  db.run('UPDATE articles SET reference = id WHERE reference IS NULL OR reference = ""');
  db.run('UPDATE articles SET internal_id = rowid WHERE internal_id IS NULL');
  db.run('UPDATE articles SET cadeau = 0 WHERE cadeau IS NULL');
  
  db.run(`
    CREATE TABLE IF NOT EXISTS ventes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      article_id TEXT NOT NULL,
      quantite INTEGER NOT NULL,
      prix_unitaire REAL NOT NULL,
      total REAL NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (article_id) REFERENCES articles(id)
    )
  `);
  
  saveDB();
}

function saveDB() {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
}

const PORT = process.env.PORT || 3001;

app.get('/api/articles', (req, res) => {
  try {
    const results = db.exec('SELECT * FROM articles ORDER BY id');
    if (results.length === 0) return res.json([]);
    const columns = results[0].columns;
    const rows = results[0].values.map(row => {
      const obj = {};
      columns.forEach((col, i) => obj[col] = row[i]);
      return obj;
    });
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la récupération des articles' });
  }
});

app.get('/api/articles/:id', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM articles WHERE id = ?');
    stmt.bind([req.params.id]);
    if (stmt.step()) {
      const row = stmt.getAsObject();
      stmt.free();
      return res.json(row);
    }
    stmt.free();
    return res.status(404).json({ error: 'Article non trouvé' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'article' });
  }
});

app.post('/api/articles', (req, res) => {
  try {
    const {
      id,
      reference,
      quantite,
      prix_vente,
      titre,
      caracteristiques,
      couleur,
      dimension,
      contenance,
      photos,
      photo_urlpath,
      taille,
      cadeau
    } = req.body;
    const articleRef = (reference || id || '').trim();
    if (!articleRef) {
      return res.status(400).json({ error: 'Référence obligatoire' });
    }

    db.run(
      `INSERT INTO articles (id, reference, internal_id, quantite, prix_vente, titre, caracteristiques, couleur, dimension, contenance, photos, photo_urlpath, taille, cadeau)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        articleRef,
        articleRef,
        getNextInternalId(),
        quantite || 0,
        prix_vente,
        titre,
        caracteristiques,
        couleur,
        dimension,
        contenance,
        photos,
        photo_urlpath,
        taille,
        cadeau ? 1 : 0
      ]
    );
    saveDB();
    res.status(201).json({ message: 'Article créé' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la création de l\'article' });
  }
});

app.put('/api/articles/:id', (req, res) => {
  try {
    const { quantite, prix_vente, titre, caracteristiques, couleur, dimension, contenance, photos, photo_urlpath, taille, cadeau } = req.body;
    db.run(
      `UPDATE articles
       SET quantite = ?, prix_vente = ?, titre = ?, caracteristiques = ?, couleur = ?, dimension = ?, contenance = ?, photos = ?, photo_urlpath = ?, taille = ?, cadeau = ?
       WHERE id = ?`,
      [quantite, prix_vente, titre, caracteristiques, couleur, dimension, contenance, photos, photo_urlpath, taille, cadeau ? 1 : 0, req.params.id]
    );
    saveDB();
    res.json({ message: 'Article mis à jour' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'article' });
  }
});

app.delete('/api/articles/:id', (req, res) => {
  try {
    db.run('DELETE FROM articles WHERE id = ?', [req.params.id]);
    saveDB();
    res.json({ message: 'Article supprimé' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'article' });
  }
});

app.post('/api/ventes', (req, res) => {
  try {
    const { article_id, quantite } = req.body;
    const stmt = db.prepare('SELECT * FROM articles WHERE id = ?');
    stmt.bind([article_id]);
    if (!stmt.step()) {
      stmt.free();
      return res.status(404).json({ error: 'Article non trouvé' });
    }
    const article = stmt.getAsObject();
    stmt.free();
    if (article.quantite < quantite) {
      return res.status(400).json({ error: 'Quantité insuffisante' });
    }
    const total = article.prix_vente * quantite;
    db.run('INSERT INTO ventes (article_id, quantite, prix_unitaire, total) VALUES (?, ?, ?, ?)', 
      [article_id, quantite, article.prix_vente, total]);
    db.run('UPDATE articles SET quantite = quantite - ? WHERE id = ?', [quantite, article_id]);
    saveDB();
    res.status(201).json({ message: 'Vente enregistrée', total });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la vente' });
  }
});

app.get('/api/ventes', (req, res) => {
  try {
    const results = db.exec('SELECT * FROM ventes ORDER BY created_at DESC');
    if (results.length === 0) return res.json([]);
    const columns = results[0].columns;
    const rows = results[0].values.map(row => {
      const obj = {};
      columns.forEach((col, i) => obj[col] = row[i]);
      return obj;
    });
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la récupération des ventes' });
  }
});

app.get('/api/alertes', (req, res) => {
  try {
    const results = db.exec('SELECT * FROM articles WHERE quantite < 2 ORDER BY quantite');
    if (results.length === 0) return res.json([]);
    const columns = results[0].columns;
    const rows = results[0].values.map(row => {
      const obj = {};
      columns.forEach((col, i) => obj[col] = row[i]);
      return obj;
    });
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la récupération des alertes' });
  }
});

await initDB();
console.log(`Serveur démarré sur le port ${PORT}`);
app.listen(PORT, () => {});