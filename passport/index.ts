import * as passport from 'passport';
import User from '../models/user';
import { local } from './local';

export default () => {
  // login시 한번 실행
  passport.serializeUser((user: User, done) => {
    done(null, user.id);
  });

  // 모든 요청에 대해서 한번씩 다 실행
  passport.deserializeUser<number>(async (id: number, done) => {
    try {
      const user = await User.findOne({
        where: {
          id,
        },
      });

      if (!user) {
        return done(new Error('no user'));
      }

      return done(null, user); // req.user를 사용 가능
    } catch (error) {
      console.error(error);
      return done(error);
    }
  });

  local();
};
