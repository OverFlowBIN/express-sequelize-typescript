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
          return res.json(fullUser);
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
