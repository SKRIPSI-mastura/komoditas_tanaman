import fetch from 'node-fetch'; // wait, node-fetch might not be installed. Let's use global fetch (Node 18+ has fetch built-in)
import fs from 'fs';

const supabaseUrl = 'https://hetclnzcfvchqoegdyil.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhldGNsbnpjZnZjaHFvZWdkeWlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExNjAxNzcsImV4cCI6MjA5NjczNjE3N30.1oBnHVFQqaMinqaQ5IEF6jxOVh7TisTmT_FPlHbd0VY';

async function main() {
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`
      }
    });
    const schema = await res.json();
    
    // Save it to a file to inspect or print keys
    fs.writeFileSync('supabase_openapi_schema.json', JSON.stringify(schema, null, 2));
    console.log('Saved OpenAPI schema to supabase_openapi_schema.json');

    // Print definitions for data_iklim_historis and dataset_pelatihan
    const definitions = schema.definitions;
    if (definitions) {
      console.log('Available tables in definitions:', Object.keys(definitions));
      if (definitions.data_iklim_historis) {
        console.log('data_iklim_historis properties:', definitions.data_iklim_historis.properties);
      } else {
        console.log('data_iklim_historis not found in definitions');
      }
      if (definitions.dataset_pelatihan) {
        console.log('dataset_pelatihan properties:', definitions.dataset_pelatihan.properties);
      } else {
        console.log('dataset_pelatihan not found in definitions');
      }
    } else {
      console.log('No definitions found');
    }
  } catch (error) {
    console.error('Error fetching OpenAPI schema:', error);
  }
}

main();
