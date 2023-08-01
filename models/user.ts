import {
  DataTypes,
  Model,
  BelongsToManyGetAssociationsMixin,
  HasManyGetAssociationsMixin,
  BelongsToManyRemoveAssociationMixin,
  BelongsToManyAddAssociationsMixin,
} from 'sequelize';
import { sequelize } from './squelize';
import Post from './post';
import { dbType } from '.';

class User extends Model {
  public readonly id!: number;
  public nickname!: string;
  public userId!: string;
  public password!: string;
  public readonly createdAt!: Date;
  public readonly updateddAt!: Date;

  public readonly Posts?: Post[];
  public readonly Followers?: User[];
  public readonly Followings?: User[];

  public addFollowing!: BelongsToManyAddAssociationsMixin<User, number>;
  public getFollowings!: BelongsToManyGetAssociationsMixin<User>;
  public removeFollowing!: BelongsToManyRemoveAssociationMixin<User, number>;
  public getFollowers!: BelongsToManyGetAssociationsMixin<User>;
  public removeFollower!: BelongsToManyRemoveAssociationMixin<User, number>;
  public getPosts!: HasManyGetAssociationsMixin<Post>;
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
  },
);

export const associate = (db: dbType) => {
  db.User.hasMany(db.Post, { as: 'Posts' });
  db.User.belongsToMany(db.User, {
    through: 'Follow',
    as: 'Followers',
    foreignKey: 'followingId',
  });
  db.User.belongsToMany(db.User, {
    through: 'Follow',
    as: 'followingId',
    foreignKey: 'Followers',
  });
};

export default User;
