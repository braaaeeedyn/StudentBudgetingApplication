import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

interface BudgetAttributes {
  id: number;
  userId: number;
  category: string;
  amount: number;
  month: number;
  year: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface BudgetCreationAttributes {
  userId: number;
  category: string;
  amount: number;
  month: number;
  year: number;
}

class Budget extends Model<BudgetAttributes, BudgetCreationAttributes> implements BudgetAttributes {
  public id!: number;
  public userId!: number;
  public category!: string;
  public amount!: number;
  public month!: number;
  public year!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Budget.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    month: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 12
      }
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }
  },
  {
    sequelize,
    modelName: 'Budget',
    tableName: 'budgets',
    indexes: [
      {
        unique: true,
        fields: ['userId', 'category', 'month', 'year']
      }
    ]
  }
);

// Define associations
Budget.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Budget, { foreignKey: 'userId' });

export default Budget; 