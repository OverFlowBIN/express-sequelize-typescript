import { DataTypes, Model } from 'sequelize';
import { sequelize } from './squelize';
import { dbType } from '.';

class Image extends Model {
  public readonly id!: number;
  public src!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Image.init(
  {
    src: { type: DataTypes.STRING, allowNull: false },
  },
  {
    sequelize,
    modelName: 'Image',
    tableName: 'image',
    charset: 'utf8',
    collate: 'utf8_general_ci',
  },
);

export const associate = (db: dbType) => {};

export default Image;
