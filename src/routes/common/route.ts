import { factory } from '~/factory.js';
import { faker } from '~/lib/faker.js';
import { result } from '~/lib/result.js';

const createMobile = () => `1${faker.string.numeric({ length: 10 })}`;

function buildPatientInfo() {
  const mobile = createMobile();
  return {
    patientId: faker.string.uuid(),
    name: faker.person.fullName(),
    telePhone: mobile,
    qrCode: faker.internet.url(),
    doctorName: faker.person.fullName(),
    nurseName: faker.person.fullName(),
    dialysisDuration: `${faker.number.int({ min: 1, max: 20 })}年`,
    dialysisCount: faker.number.int({ min: 1, max: 400 }),
    dryWeight: `${faker.number.float({ min: 40, max: 80, fractionDigits: 1 }).toFixed(1)}kg`,
    sex: faker.helpers.arrayElement(['男', '女']),
    birthday: faker.date.birthdate({ min: 1950, max: 2015, mode: 'year' }).toISOString().slice(0, 10),
    telephone: mobile,
    identityTypeDesc: faker.helpers.arrayElement(['居民身份证', '护照', '军官证']),
    identityNo: faker.string.numeric({ length: 18 }),
    bloodType: faker.helpers.arrayElement(['A', 'B', 'AB', 'O']),
    maritalStatus: faker.helpers.arrayElement(['未婚', '已婚', '离异']),
    address: `${faker.location.city()}${faker.location.streetAddress()}`,
    job: faker.person.jobTitle(),
    medicalHistory: faker.lorem.sentence(),
    familyHistory: faker.lorem.sentence(),
    allergyHistory: faker.lorem.sentence(),
    surgicalHistory: faker.lorem.sentence(),
  };
}

export const commonRouter = factory.createApp();

commonRouter.get('/queryCurrentPatient', (c) => {
  const res = result(buildPatientInfo());
  return c.json(res);
});

commonRouter.get('/sendCaptcha', (c) => {
  const res = result({}, {
    data: true,
    message: '验证码发送成功',
  });
  return c.json(res);
});

commonRouter.post('/queryEnumKvList', async (c) => {
  let keys: string[] = [];
  try {
    const body = await c.req.json();
    if (Array.isArray(body)) {
      keys = body.filter((value): value is string => typeof value === 'string' && value.length > 0);
    }
  }
  catch {
    // ignore parse errors
  }

  if (keys.length === 0)
    keys = ['default'];

  const data = Object.fromEntries(
    keys.map((key) => {
      const items = faker.helpers.multiple(() => ({
        label: {
          text: faker.commerce.productAdjective(),
        },
        value: {
          code: faker.string.uuid(),
        },
        props: {
          color: faker.color.human(),
        },
      }), { count: faker.number.int({ min: 1, max: 4 }) });
      return [key, items];
    }),
  );

  const res = result({}, { data });
  return c.json(res);
});
