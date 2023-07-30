import { DataTypes, Model } from 'sequelize';
import { sequelize } from './squelize';
import { dbType } from '.';

class User extends Model {
  public readonly id!: number;
  public nickname!: string;
  public userId!: string;
  public password!: string;
  public readonly createdAt!: Date;
  public readonly updateddAt!: Date;
}

User.init(
  {
    nickname: {
      type: DataTypes.STRING,
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  // Table과 Modle에 대한 설정
  {
    sequelize,
    modelName: 'User',
    tableName: 'user',
    charset: 'utf8', // 한글 사용 가능
    collate: 'utf8_general_ci', // 한글 사용 가능
  }
);

export const associate = (db: dbType) => {};

export default User;
