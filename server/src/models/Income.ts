import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

interface IncomeAttributes {
  id: number;
  userId: number;
  source: string;
  amount: number;
  date: Date;
  isRecurring: boolean;
  frequency?: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface IncomeCreationAttributes {
  userId: number;
  source: string;
  amount: number;
  date: Date;
  isRecurring: boolean;
  frequency?: string;
  description?: string;
}

class Income extends Model<IncomeAttributes, IncomeCreationAttributes> implements IncomeAttributes {
  public id!: number;
  public userId!: number;
  public source!: string;
  public amount!: number;
  public date!: Date;
  public isRecurring!: boolean;
  public frequency?: string;
  public description?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Income.init(
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
    source: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    isRecurring: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    frequency: {
      type: DataTypes.STRING, // weekly, monthly, etc.
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Income',
    tableName: 'incomes',
  }
);

// Define associations
Income.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Income, { foreignKey: 'userId' });

export default Income; 