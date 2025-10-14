import { factory } from '~/factory.js';
import { faker } from '~/lib/faker.js';
import { result } from '~/lib/result.js';

export const commonRouter = factory.createApp().get('/queryCurrentPatient', async (c) => {
  const res = result({
    patientId: faker.string.uuid(),
    name: faker.person.fullName(),
    telePhone: faker.phone.imei(),
    qrCode: faker.internet.url(),
  });
  return c.json(res);
});
