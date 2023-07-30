import * as express from 'express';
import * as bcrypt from 'bcrypt';
import { isLoggedIn, isNotLoggedIn } from './middlewares';
import User from '../models/user';
import * as passport from 'passport';
import Post from '../models/post';

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

router.get('/:id/followings', isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: {
        id: parseInt(req.params.id, 10) || (req.user && req.user.id) || 0,
      },
    });
    if (!user) return res.status(404).send('no user');
    const followers = await user.getFollwings({
      attribute: ['id', 'nickname'],
    });
  } catch (error) {
    console.error(error);
  }
});
