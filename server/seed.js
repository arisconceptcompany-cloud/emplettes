import initSqlJs from 'sql.js';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, 'database.db');

const articles = [
  { id: 'MU0001', quantite: 10, prix_vente: 30000, titre: 'Sac "Ma Pharmacie"', caracteristiques: 'Toile', couleur: 'Blanc' },
  { id: 'MU0002', quantite: 10, prix_vente: 25000, titre: 'Trousse de maquillage "Fleurs et coeurs"', caracteristiques: 'Polyester', couleur: 'Blanc' },
  { id: 'MU0003', quantite: 10, prix_vente: 25000, titre: 'Trousse de maquillage "Wake-up and Make up"', caracteristiques: 'Toile', couleur: 'Blanc' },
  { id: 'MU0004', quantite: 10, prix_vente: 25000, titre: 'Trousse de maquillage "Fille mignonne"', caracteristiques: 'Polyester', couleur: 'Blanc' },
  { id: 'MU0005', quantite: 10, prix_vente: 30000, titre: 'Trousse de maquillage "Fleur bleue aquarelle"', caracteristiques: 'Polyester', couleur: 'Blanc' },
  { id: 'MU0006', quantite: 10, prix_vente: 25000, titre: 'Trousse de maquillage "Chaton mignon"', caracteristiques: 'Polyester', couleur: 'Beige' },
  { id: 'MU0007', quantite: 10, prix_vente: 25000, titre: 'Trousse de maquillage "amoureux des livres"', caracteristiques: 'Polyester', couleur: 'Beige' },
  { id: 'MU0008', quantite: 15, prix_vente: 25000, titre: 'Lot de 13 pinceaux de maquillage avec rangement', caracteristiques: null, couleur: 'Noir' },
  { id: 'MU0009', quantite: 15, prix_vente: 25000, titre: 'Stick Fard à Paupières', caracteristiques: 'Imperméable et longue tenue', couleur: '#12' },
  { id: 'MU0010', quantite: 15, prix_vente: 25000, titre: 'Stick Fard à Paupières', caracteristiques: 'Imperméable et longue tenue', couleur: '#03' },
  { id: 'MU0011', quantite: 5, prix_vente: 25000, titre: 'Stick Fard à Paupières', caracteristiques: 'Imperméable et longue tenue', couleur: '#01' },
  { id: 'MU0012', quantite: 20, prix_vente: 30000, titre: 'Lot de 13 pinceaux de maquillage avec rangement', caracteristiques: null, couleur: 'Beige-Marron' },
  { id: 'MU0013', quantite: 15, prix_vente: 30000, titre: 'Lot de 14 pinceaux de maquillage avec rangement', caracteristiques: null, couleur: 'Noir' },
  { id: 'MU0014', quantite: 10, prix_vente: 30000, titre: 'Cerne Couvrance totale', caracteristiques: null, couleur: 'Naturelle' },
  { id: 'MU0015', quantite: 15, prix_vente: 35000, titre: 'Lot de 6 crayons à lèvres velours mat', caracteristiques: 'Longue tenue, non desséchant', couleur: 'Rose nu' },
  { id: 'MU0016', quantite: 15, prix_vente: 30000, titre: 'Lot de 20 pinceaux de maquillage', caracteristiques: null, couleur: 'Rose' },
  { id: 'MU0017', quantite: 8, prix_vente: 30000, titre: 'Lot de 20 pinceaux de maquillage', caracteristiques: null, couleur: 'Noir' },
  { id: 'MC0018', quantite: 15, prix_vente: 40000, titre: 'Lot de 10 pinceaux de maquillage nylon', caracteristiques: null, couleur: 'Doré' }
];

async function seed() {
  const SQL = await initSqlJs();
  const db = new SQL.Database();
  
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

  for (const article of articles) {
    db.run(
      `INSERT OR IGNORE INTO articles (id, quantite, prix_vente, titre, caracteristiques, couleur) VALUES (?, ?, ?, ?, ?, ?)`,
      [article.id, article.quantite, article.prix_vente, article.titre, article.caracteristiques, article.couleur]
    );
    console.log(`Inserted: ${article.id}`);
  }

  const data = db.export();
  fs.writeFileSync(dbPath, Buffer.from(data));
  db.close();
  console.log('Seed complete!');
}

seed().catch(console.error);