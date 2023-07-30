import * as dotenv from 'dotenv';
dotenv.config();

type Config = {
  username: string;
  password: string;
  database: string;
  host: string;
  [key: string]: string;
};
interface IconfigGroup {
  development: Config;
  test: Config;
  production: Config;
}

const config: IconfigGroup = {
  development: {
    username: 'root',
    password: process.env.DB_PASSWORD!, // process.env는 타입 추론이 안되기 때문에 !를 이용해서 값의 여부의 확신을 줘야 한다.
    database: 'nodebird',
    host: '127.0.0.1',
    dialect: 'mysql',
  },
  test: {
    username: 'root',
    password: process.env.DB_PASSWORD!,
    database: 'nodebird',
    host: '127.0.0.1',
    dialect: 'mysql',
  },
  production: {
    username: 'root',
    password: process.env.DB_PASSWORD!,
    database: 'nodebird',
    host: '127.0.0.1',
    dialect: 'mysql',
  },
};

export default config;
