// * as 쓰는 이유는 node_modules에 @types/express/index.d.ds에 export default가 없기 떄문이다
// 만약 tsconfig에 "esModuleInterop": true 로 설정해두면 * as 없이 사용할 수 있다.
import * as express from 'express';
import { Request, Response, NextFunction } from 'express';
import * as morgan from 'morgan';
import * as cors from 'cors';
import * as cookieParser from 'cookie-parser';
import * as expressSession from 'express-session';
import * as dotenv from 'dotenv';
import * as passport from 'passport';
import * as hpp from 'hpp';
import * as helmet from 'helmet';

import { sequelize } from './models';

dotenv.config();
const app = express();

// type 붙이는 원칙정하기
// 변수에 값을 할당해 줄 때, 값을 바로 넣으면 자동 할당이 되긴 하지만
// 내가 만든변수(라이브러리르 사용한 값이 아닌)는 type을 지정해두는 나만의 방식을 정하는게 좋다
const prod: boolean = process.env.NODE_ENV === 'production';

/* connnet ORM */
sequelize
  .sync({ force: true }) // Models에 지정한 table 자동 셋팅(서버 실행시 table이 다시 만들어 진다.) => dev에서만 true 하기!
  .then(() => {
    console.log('success db connect');
  })
  .catch((error: Error) => {
    // Error type이라고 기본적인 Node Error type이 있다,
    console.error(error);
  });

if (prod) {
  app.use(hpp());
  app.use(helmet());
  app.use(morgan('combined'));
  app.use(
    cors({
      origin: /nodebird\.com$/,
      credentials: true,
    }),
  );
} else {
  app.use(morgan('dev'));
  app.use(
    cors({
      origin: true,
      credentials: true,
    }),
  );
}

/* app.use */
app.use('/', express.static('upload'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(
  expressSession({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET!,
    cookie: {
      httpOnly: true,
      secure: false, // https -> true
      domain: prod ? '.nodebird.com' : undefined,
    },
    name: 'rnbck',
  }),
);
app.use(passport.initialize());
app.use(passport.session());

/* Express 변수 설정하기 */
app.set('port', prod ? process.env.PORT : 3065);

app.get('/', (req: Request, res: Response, next: NextFunction) => {
  res.send('react nodebird 서버 동작');
});

app.listen(app.get('port'), () => {
  console.log(`server is running on ${app.get('port')} port`);
});
