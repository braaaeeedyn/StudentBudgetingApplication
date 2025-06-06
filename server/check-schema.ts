import { Sequelize } from 'sequelize';
import path from 'path';

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'database.sqlite'),
  logging: console.log,
});

async function checkSchema() {
  try {
    const [results] = await sequelize.query(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='savings_goals';"
    );
    
    if (!results || (results as any[]).length === 0) {
      console.log('savings_goals table does not exist');
      return;
    }
    
    const [columns] = await sequelize.query('PRAGMA table_info(savings_goals)');
    console.log('Columns in savings_goals table:');
    console.table(columns);
    
  } catch (error) {
    console.error('Error checking schema:', error);
  } finally {
    await sequelize.close();
  }
}

checkSchema();
