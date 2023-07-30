import User, { associate as associateUer } from './user';
import Post, { associate as associatePost } from './post';
import Comment, { associate as associateComment } from './comment';
import Hashtag, { associate as associateHashtag } from './hashtag';
import Image, { associate as associateImage } from './image';

export * from './squelize'; // export 동시에 import 하기

const db = {
  User,
  Post,
  Comment,
  Hashtag,
  Image,
};
export type dbType = typeof db;

/* db에 table들의 관계 설정을 해준다` */
associateUer(db);
associatePost(db);
associateComment(db);
associateImage(db);
associateHashtag(db);
