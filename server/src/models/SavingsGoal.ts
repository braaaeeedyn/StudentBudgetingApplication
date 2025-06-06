import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

interface SavingsGoalAttributes {
  id: number;
  userId: number;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: Date;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface SavingsGoalCreationAttributes {
  userId: number;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: Date;
  description?: string;
}

class SavingsGoal extends Model<SavingsGoalAttributes, SavingsGoalCreationAttributes> implements SavingsGoalAttributes {
  public id!: number;
  public userId!: number;
  public name!: string;
  public targetAmount!: number;
  public currentAmount!: number;
  public targetDate?: Date;
  public description?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

SavingsGoal.init(
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
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    targetAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    currentAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    targetDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    }
  },
  {
    sequelize,
    modelName: 'SavingsGoal',
    tableName: 'savings_goals',
  }
);

// Define associations
SavingsGoal.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(SavingsGoal, { foreignKey: 'userId' });

export default SavingsGoal; 