import { factory } from '../../factory.js';
import { faker } from '../../lib/faker.js';
import { result } from '../../lib/result.js';

const createMobile = () => `1${faker.string.numeric({ length: 10 })}`;

function booleanResponse(message: string) {
  return result({}, {
    data: true,
    message,
  });
}

export const userRouter = factory.createApp();
userRouter.post('/modify', (c) => {
  return c.json(result({}, { data: true }));
});

userRouter.post('/wechat/login', (c) => {
  const res = result({}, {
    data: {
      token: faker.string.uuid(),
      phoneNumber: createMobile(),
      photoUrl: faker.image.avatar(),
      nickName: faker.person.firstName(),
      sex: faker.helpers.arrayElement(['male', 'female', 'other']),
      birthday: faker.date.past().toISOString().split('T')[0],
      chunxiHealthId: faker.string.uuid(),
    },
    message: '登录成功',
  });
  return c.json(res);
});

userRouter.get('/wechat/getUserPhoneNumber', (c) => {
  const res = result({}, {
    data: true,
    phoneNumber: createMobile(),
    message: '手机号获取成功',
  });
  return c.json(res);
});

userRouter.get('/logout', c => c.json(booleanResponse('退出成功')));
userRouter.get('/cancel', c => c.json(booleanResponse('注销成功')));

userRouter.post('/verifyCaptcha', c => c.json(booleanResponse('验证码验证成功')));
