import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

interface ExpenseAttributes {
  id: number;
  userId: number;
  category: string;
  amount: number;
  date: Date;
  isRecurring: boolean;
  frequency?: string;
  description?: string;
  paymentMethod?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ExpenseCreationAttributes {
  userId: number;
  category: string;
  amount: number;
  date: Date;
  isRecurring: boolean;
  frequency?: string;
  description?: string;
  paymentMethod?: string;
}

class Expense extends Model<ExpenseAttributes, ExpenseCreationAttributes> implements ExpenseAttributes {
  public id!: number;
  public userId!: number;
  public category!: string;
  public amount!: number;
  public date!: Date;
  public isRecurring!: boolean;
  public frequency?: string;
  public description?: string;
  public paymentMethod?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Expense.init(
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
    paymentMethod: {
      type: DataTypes.STRING, // cash, credit card, etc.
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Expense',
    tableName: 'expenses',
  }
);

// Define associations
Expense.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Expense, { foreignKey: 'userId' });

export default Expense; 