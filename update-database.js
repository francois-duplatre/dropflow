const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  console.log('Assurez-vous d\'avoir configuré :');
  console.log('- NEXT_PUBLIC_SUPABASE_URL');
  console.log('- SUPABASE_SERVICE_ROLE_KEY (ou NEXT_PUBLIC_SUPABASE_ANON_KEY)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateDatabase() {
  console.log('🔄 Mise à jour de la base de données...');
  
  try {
    // SQL pour mettre à jour la contrainte de statut
    const sql = `
      -- Fix products status constraint to allow three statuses: active, draft, inactive
      ALTER TABLE products
      ALTER COLUMN status DROP DEFAULT,
      ALTER COLUMN status TYPE TEXT;

      -- Drop existing constraint and add new one with three statuses
      ALTER TABLE products
      DROP CONSTRAINT IF EXISTS products_status_check,
      ADD CONSTRAINT products_status_check CHECK (status IN ('active', 'draft', 'inactive'));

      -- Set default value to 'draft'
      ALTER TABLE products
      ALTER COLUMN status SET DEFAULT 'draft';
    `;

    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      console.error('❌ Erreur lors de la mise à jour:', error);
      return;
    }

    console.log('✅ Base de données mise à jour avec succès !');
    console.log('📋 Les statuts disponibles sont maintenant : active, draft, inactive');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    
    // Si la fonction RPC n'existe pas, on utilise une approche alternative
    console.log('🔄 Tentative avec une approche alternative...');
    
    try {
      // Vérifier d'abord la structure actuelle
      const { data: currentStructure, error: checkError } = await supabase
        .from('products')
        .select('status')
        .limit(1);
      
      if (checkError) {
        console.error('❌ Impossible de vérifier la structure de la table:', checkError);
        return;
      }
      
      console.log('✅ La table products est accessible');
      console.log('⚠️  Pour finaliser la mise à jour, exécutez manuellement ce SQL dans l\'interface Supabase :');
      console.log('');
      console.log('ALTER TABLE products');
      console.log('ALTER COLUMN status DROP DEFAULT,');
      console.log('ALTER COLUMN status TYPE TEXT;');
      console.log('');
      console.log('ALTER TABLE products');
      console.log('DROP CONSTRAINT IF EXISTS products_status_check,');
      console.log('ADD CONSTRAINT products_status_check CHECK (status IN (\'active\', \'draft\', \'inactive\'));');
      console.log('');
      console.log('ALTER TABLE products');
      console.log('ALTER COLUMN status SET DEFAULT \'draft\';');
      
    } catch (altError) {
      console.error('❌ Erreur lors de la vérification:', altError.message);
    }
  }
}

updateDatabase(); 