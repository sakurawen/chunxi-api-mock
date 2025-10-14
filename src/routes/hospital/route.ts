import { factory } from '../../factory.js';
import { faker } from '../../lib/faker.js';
import { result } from '../../lib/result.js';

export const hospitalRouter = factory.createApp();

function toPositiveInt(value: unknown, fallback: number) {
  const num = Number(value);
  if (Number.isFinite(num) && num > 0)
    return Math.floor(num);
  return fallback;
}

function buildPaginatedResult<T>(items: T[], page: number) {
  const baseTotal = Math.max(items.length, 1);
  const total = faker.number.int({ min: baseTotal, max: baseTotal * 4 });
  return result({}, {
    data: items,
    total,
    page,
    size: items.length,
  });
}

function createHospitalStore() {
  const labels = faker.helpers.multiple(() => faker.company.catchPhraseAdjective(), { count: 2 }).join('，');
  return {
    hospitalStoreId: faker.string.uuid(),
    storeName: `${faker.location.city()}${faker.helpers.arrayElement(['诊所', '医院', '门诊'])}`,
    contactNumber: `0${faker.string.numeric({ length: 2 })}-${faker.string.numeric({ length: 8 })}`,
    businessHours: `${faker.number.int({ min: 7, max: 9 }).toString().padStart(2, '0')}:00-${faker.number.int({ min: 17, max: 21 }).toString().padStart(2, '0')}:00`,
    storeAddress: `${faker.location.city()}${faker.location.streetAddress()}`,
    photoUrl: faker.image.url({ width: 640, height: 360 }),
    labels,
    distance: `${faker.number.float({ min: 0.3, max: 20, fractionDigits: 1 }).toFixed(1)}km`,
    recentVisit: faker.helpers.arrayElement([0, 1]),
    latitude: Number(faker.location.latitude({ precision: 0.0001 }).toFixed(4)),
    longitude: Number(faker.location.longitude({ precision: 0.0001 }).toFixed(4)),
    description: faker.lorem.sentences(2),
  };
}

function createDoctorTeam(hospitalStoreId?: string) {
  return {
    hospitalStoreId: hospitalStoreId ?? faker.string.uuid(),
    doctorId: faker.string.uuid(),
    name: faker.person.fullName(),
    title: faker.person.jobTitle(),
    description: faker.lorem.sentence(),
    photoUrl: faker.image.avatar(),
    language: faker.helpers.arrayElement(['普通话', '粤语', '英语', '中英双语']),
  };
}

function createEquipment() {
  return {
    photoUrl: faker.image.url({ width: 640, height: 480 }),
    description: faker.commerce.productDescription(),
  };
}

hospitalRouter.post('/queryHospitalList', async (c) => {
  let payload: Record<string, unknown> = {};
  try {
    payload = await c.req.json() as Record<string, unknown>;
  }
  catch {
    // ignore parse errors
  }
  const currentPage = toPositiveInt(payload.currentPage, 1);
  const pageSize = toPositiveInt(payload.pageSize, 10);
  const count = Math.max(1, Math.min(pageSize, 5));
  const hospitals = faker.helpers.multiple(createHospitalStore, { count });
  const res = buildPaginatedResult(hospitals, currentPage);
  return c.json(res);
});

hospitalRouter.get('/queryDetail', (c) => {
  const hospitalStoreId = c.req.query('hospitalStoreId');
  const detail = createHospitalStore();
  if (hospitalStoreId)
    detail.hospitalStoreId = hospitalStoreId;
  const res = result(detail);
  return c.json(res);
});

hospitalRouter.get('/queryDoctorTeams', (c) => {
  const hospitalStoreId = c.req.query('hospitalStoreId');
  const teams = faker.helpers.multiple(() => createDoctorTeam(hospitalStoreId ?? undefined), {
    count: faker.number.int({ min: 1, max: 5 }),
  });
  const res = result({}, {
    data: teams,
    total: teams.length,
    page: 1,
    size: teams.length,
  });
  return c.json(res);
});

hospitalRouter.get('/queryEquipment', (c) => {
  const equipments = faker.helpers.multiple(createEquipment, {
    count: faker.number.int({ min: 1, max: 6 }),
  });
  const res = result({}, {
    data: equipments,
    total: equipments.length,
    page: 1,
    size: equipments.length,
  });
  return c.json(res);
});
