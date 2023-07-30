import { DataTypes, Model } from 'sequelize';
import { sequelize } from './squelize';
import { dbType } from '.';

class Comment extends Model {
  public readonly id!: number;
  public content!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Comment.init(
  {
    content: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Comment',
    tableName: 'comment',
    charset: 'utf8mb4',
    collate: 'urf8mb4_general_ci',
  },
);

export const associate = (db: dbType) => {};

export default Comment;
