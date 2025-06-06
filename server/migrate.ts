import path from 'path';
import { Sequelize } from 'sequelize';
import { Umzug, SequelizeStorage } from 'umzug';
import config from './src/config/database';

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'database.sqlite'),
  logging: false,
});

const umzug = new Umzug({
  migrations: {
    glob: 'src/migrations/*.ts',
    resolve: ({ name, path, context }) => {
      // Adjust the way how migrations are loaded
      const migration = require(path!);
      return {
        name,
        up: async () => migration.up(context, Sequelize),
        down: async () => migration.down(context, Sequelize),
      };
    },
  },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ 
    sequelize,
    modelName: 'migration_meta',
  }),
  logger: console,
});

const command = process.argv[2];

async function run() {
  try {
    switch (command) {
      case 'up':
      case 'migrate':
        await umzug.up();
        console.log('Migrations completed');
        break;
      case 'down':
        await umzug.down();
        console.log('Migrations reverted');
        break;
      case 'pending':
        const pending = await umzug.pending();
        console.log('Pending migrations:', pending);
        break;
      case 'executed':
        const executed = await umzug.executed();
        console.log('Executed migrations:', executed);
        break;
      default:
        console.log('Usage: npx ts-node migrate.ts [up|down|pending|executed]');
        break;
    }
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

run();
