import * as express from 'express';
import * as bcrypt from 'bcrypt';
import { isLoggedIn, isNotLoggedIn } from './middlewares';
import User from '../models/user';
import * as passport from 'passport';
import Post from '../models/post';
import Image from '../models/image';

const router = express.Router();

router.get('/', isLoggedIn, (req, res) => {
  // get 함수의 callback함수로 들어가면 타입추론이 된다.

  const user = req.user!.toJSON();
  delete user.password;
  return res.json(user);
});

/* SignIn */
router.post('/', async (req, res, next) => {
  try {
    const exUser = await User.findOne({
      where: {
        userId: req.body.userId,
      },
    });

    if (exUser) {
      return res.status(403).send('이미 사용중인 아이디입니다.');
    }
    const hashPassword = await bcrypt.hash(req.body.password, 12);
    const newUser = await User.create({
      nickname: req.body.nickname,
      userId: req.body.userId,
      pasword: hashPassword,
    });

    return res.status(200).json(newUser);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

interface IUser extends User {
  PostCount: number;
  FollowingCount: number;
  FollowerCount: number;
}

router.post('/login', isNotLoggedIn, (req, res, next) => {
  passport.authenticate(
    'local',
    (error: Error, user: User, info: { message: string }) => {
      if (error) {
        console.error(error);
        return next(error);
      }
      if (info) {
        return res.status(401).send(info.message);
      }
      return req.login(user, async (loginErr: Error) => {
        try {
          if (loginErr) {
            return next(loginErr);
          }
          const fullUser = await User.findOne({
            where: { id: user.id },
            include: [
              {
                model: Post,
                as: 'Posts',
                attributes: ['id'],
              },
              {
                model: User,
                as: 'Followings',
                attributes: ['id'],
              },
              {
                model: User,
                as: 'Follwers',
                attributes: ['id'],
              },
            ],
            attributes: { exclude: ['password'] },
          });
          if (!user) {
            return res.status(404).send('no user');
          }
          const jsonUser = user.toJSON() as IUser;
          jsonUser.PostCount = jsonUser.Posts ? jsonUser.Posts.length : 0;
          jsonUser.FollowingCount = jsonUser.Followings
            ? jsonUser.Followings.length
            : 0;
          jsonUser.FollowerCount = jsonUser.Followers
            ? jsonUser.Followers.length
            : 0;
        } catch (error) {
          console.error(error);
          next(error);
        }
      });
    },
  )(req, res, next);
});

router.post('/logut', isLoggedIn, (req, res) => {
  req.logout((error) => {
    if (error) {
      res.redirect('/');
    } else {
      req.session!.destroy(() => {
        res.status(200).send('success logout');
      });
    }
  });
});

router.get('/:id/followers', isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: {
        id: parseInt(req.params.id, 10) || (req.user && req.user.id) || 0,
      },
    });
    if (!user) return res.status(404).send('no user');
    const followers = await user.getFollowers({
      attributes: ['id', 'nickname'],
      limit: parseInt(req.query.limit as string, 10),
      offset: parseInt(req.query.offset as string, 10),
    });
  } catch (error) {
    console.error(error);
  }
});

router.delete('/:id/follow', isLoggedIn, async (req, res, next) => {
  try {
    const me = await User.findOne({
      where: { id: req.user!.id },
    });
    await me!.removeFollower(parseInt(req.params.id, 10));
    res.send(req.params.id);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post('/:id/follow', isLoggedIn, async (req, res, next) => {
  try {
    const me = await User.findOne({
      where: { id: req.user!.id },
    });
    await me!.removeFollowing(parseInt(req.params.id, 10));
    res.send(req.params.id);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get('/:id/posts', async (req, res, next) => {
  try {
    const posts = await Post.findAll({
      where: {
        UserId: parseInt(req.params.id, 10) || (req.user && req.user.id) || 0,
        RetweetId: null,
      },
      include: [
        {
          model: User,
          attributes: ['id', 'nickname'],
        },
        { model: Image },
        { model: User, as: 'likers', attributes: ['id'] },
      ],
    });
    res.json(posts);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.patch('/nickname', isLoggedIn, async (req, res, next) => {
  try {
    await User.update(
      {
        nickname: req.body.nickname,
      },
      {
        where: { id: req.user!.id },
      },
    );
    res.send(req.body.nickname);
  } catch (error) {
    console.error(error);
    next(error);
  }
});
