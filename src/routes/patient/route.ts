import { factory } from '../../factory.js';
import { faker } from '../../lib/faker.js';
import { result } from '../../lib/result.js';

export const patientRouter = factory.createApp();

function toPositiveInt(value: unknown, fallback: number) {
  const num = Number(value);
  if (Number.isFinite(num) && num > 0)
    return Math.floor(num);
  return fallback;
}

const createMobile = () => `1${faker.string.numeric({ length: 10 })}`;

function createPatientInfo() {
  const mobile = createMobile();
  const birthday = faker.date.birthdate({ min: 1950, max: 2015, mode: 'year' });
  const weight = faker.number.float({ min: 40, max: 80, fractionDigits: 1 });
  return {
    patientId: faker.string.uuid(),
    name: faker.person.fullName(),
    telePhone: mobile,
    qrCode: faker.internet.url(),
    doctorName: faker.person.fullName(),
    nurseName: faker.person.fullName(),
    dialysisDuration: `${faker.number.int({ min: 1, max: 20 })}年`,
    dialysisCount: faker.number.int({ min: 1, max: 400 }),
    dryWeight: `${weight.toFixed(1)}kg`,
    sex: faker.helpers.arrayElement(['男', '女']),
    birthday: birthday.toISOString().slice(0, 10),
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

function createPatientSummary() {
  return {
    patientId: faker.string.uuid(),
    name: faker.person.fullName(),
    telePhone: createMobile(),
    identityNo: faker.string.numeric({ length: 18 }),
    currentPatient: 0,
  };
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

const paymentTypes = [
  { code: 0, text: '微信支付' },
  { code: 1, text: '支付宝' },
  { code: 2, text: '银行卡' },
] as const;

const invoiceStatuses = [
  { code: 0, text: '未开票' },
  { code: 1, text: '已开票' },
] as const;

const payStatuses = [
  { code: 0, text: '待支付' },
  { code: 1, text: '已支付' },
  { code: 2, text: '已退款' },
] as const;

const formatDate = (date: Date) => date.toISOString().slice(0, 10);

const formatDateTime = (date: Date) => date.toISOString().replace('T', ' ').slice(0, 19);

const formatTime = (date: Date) => date.toISOString().slice(11, 16);

const addHours = (date: Date, hours: number) => new Date(date.getTime() + hours * 60 * 60 * 1000);

const weekLabels = ['日', '一', '二', '三', '四', '五', '六'] as const;
const getWeekLabel = (date: Date) => `周${weekLabels[date.getDay()]}`;

function createSelfMedication() {
  const totalCount = faker.number.int({ min: 5, max: 40 });
  const useCount = faker.number.int({ min: 0, max: totalCount });
  const balanceCount = totalCount - useCount;
  return {
    drugSpec: `${faker.commerce.productName()} ${faker.string.alpha({ length: 3, casing: 'upper' })}`,
    totalCount,
    useCount,
    balanceCount,
    dialysisModeDesc: faker.helpers.arrayElement(['血液透析', '腹膜透析', '血滤']),
  };
}

function createOrder() {
  const paymentType = faker.helpers.arrayElement(paymentTypes);
  const invoiceStatus = faker.helpers.arrayElement(invoiceStatuses);
  const payStatus = faker.helpers.arrayElement(payStatuses);
  const orderAmount = Number(faker.number.float({ min: 100, max: 5000, fractionDigits: 2 }).toFixed(2));
  const discountAmount = Number(faker.number.float({ min: 0, max: orderAmount * 0.3, fractionDigits: 2 }).toFixed(2));
  const realAmount = Number(Math.max(orderAmount - discountAmount, 0).toFixed(2));
  return {
    hospitalStoreName: faker.company.name(),
    orderNo: faker.string.alphanumeric({ length: 16, casing: 'upper' }),
    itemName: faker.commerce.productName(),
    paymentType: paymentType.code,
    paymentTypeDesc: paymentType.text,
    invoiceStatus: invoiceStatus.code,
    invoiceStatusDesc: invoiceStatus.text,
    orderAmount,
    realAmount,
    discountAmount,
    payDate: formatDateTime(faker.date.recent({ days: 180 })),
    payStatus: payStatus.code,
    payStatusDesc: payStatus.text,
  };
}

function createVisitPlan(overrides: Partial<Record<string, unknown>> = {}) {
  const scheduleDate = faker.date.soon({ days: 60 });
  const shiftType = faker.helpers.arrayElement(['上午', '下午', '晚班']);
  const startTimeDate = scheduleDate;
  const endTimeDate = addHours(scheduleDate, faker.number.int({ min: 3, max: 5 }));
  const amount = Number(faker.number.float({ min: 200, max: 800, fractionDigits: 2 }).toFixed(2));
  const miRatio = faker.number.float({ min: 0.2, max: 0.6, fractionDigits: 2 });
  const preWeight = faker.number.float({ min: 50, max: 80, fractionDigits: 1 });
  const postWeight = Math.max(preWeight - faker.number.float({ min: 0.5, max: 3, fractionDigits: 1 }), 35);
  const base = {
    scheduleDate: formatDate(scheduleDate),
    shiftType,
    week: getWeekLabel(scheduleDate),
    bedLabel: `床位${faker.number.int({ min: 1, max: 30 })}`,
    dialysisModeDesc: faker.helpers.arrayElement(['血液透析', '腹膜透析', '血滤']),
    status: faker.helpers.arrayElement(['待就诊', '进行中', '已完成', '已取消']),
    dryWeight: `${faker.number.float({ min: 40, max: 80, fractionDigits: 1 }).toFixed(1)}kg`,
    detailDate: `${formatDate(scheduleDate)} ${shiftType}`,
    startTime: formatTime(startTimeDate),
    endTime: formatTime(endTimeDate),
    dialysisCount: faker.number.int({ min: 1, max: 500 }),
    amount,
    miAmount: Number((amount * miRatio).toFixed(2)),
    clothingWeight: `${faker.number.float({ min: 0.5, max: 2.5, fractionDigits: 1 }).toFixed(1)}kg`,
    preHdWeight: `${preWeight.toFixed(1)}kg`,
    postHdWeight: `${postWeight.toFixed(1)}kg`,
    preHdBloodPressure: `${faker.number.int({ min: 100, max: 140 })}/${faker.number.int({ min: 60, max: 90 })}`,
    preHdHeartRate: faker.number.int({ min: 60, max: 100 }).toString(),
    preHdTemp: faker.number.float({ min: 36, max: 37.5, fractionDigits: 1 }).toFixed(1),
    postHdBloodPressure: `${faker.number.int({ min: 100, max: 140 })}/${faker.number.int({ min: 60, max: 90 })}`,
    postHdHeartRate: faker.number.int({ min: 60, max: 100 }).toString(),
    postHdTemp: faker.number.float({ min: 36, max: 37.5, fractionDigits: 1 }).toFixed(1),
  };
  return { ...base, ...overrides };
}

function mutableBooleanResponse(message: string) {
  return result({}, {
    data: true,
    message,
  });
}

patientRouter.post('/queryCurrentPatient', (c) => {
  const res = result(createPatientInfo());
  return c.json(res);
});

patientRouter.get('/detail', (c) => {
  const patientId = c.req.query('patientId');
  const info = createPatientInfo();
  if (patientId)
    info.patientId = patientId;
  const res = result(info);
  return c.json(res);
});

patientRouter.post('/switchPatient', c => c.json(mutableBooleanResponse('切换成功')));
patientRouter.get('/switchPatient', c => c.json(mutableBooleanResponse('切换成功')));

patientRouter.post('/unbindPatient', c => c.json(mutableBooleanResponse('解绑成功')));
patientRouter.get('/unbindPatient', c => c.json(mutableBooleanResponse('解绑成功')));

patientRouter.post('/queryPatientList', async (c) => {
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
  const patients = faker.helpers.multiple(createPatientSummary, { count });
  if (patients.length > 0)
    patients[0].currentPatient = 1;
  const res = buildPaginatedResult(patients, currentPage);
  return c.json(res);
});

patientRouter.post('/addPatient', async (c) => {
  // request body is not used for mock result
  const res = mutableBooleanResponse('添加成功');
  return c.json(res);
});

patientRouter.post('/verifyCaptcha', async (c) => {
  // request body is not used for mock result
  const res = mutableBooleanResponse('验证码验证成功');
  return c.json(res);
});

patientRouter.get('/querySelfMedications', (c) => {
  const items = faker.helpers.multiple(createSelfMedication, { count: faker.number.int({ min: 1, max: 4 }) });
  const res = result({}, {
    data: items,
    total: items.length,
    page: 1,
    size: items.length,
  });
  return c.json(res);
});

patientRouter.post('/order/queryOrderList', async (c) => {
  let payload: Record<string, unknown> = {};
  try {
    payload = await c.req.json() as Record<string, unknown>;
  }
  catch {
    // ignore parse errors
  }
  const currentPage = toPositiveInt(payload.currentPage ?? payload.page, 1);
  const pageSize = toPositiveInt(payload.pageSize, 10);
  const count = Math.max(1, Math.min(pageSize, 5));
  const orders = faker.helpers.multiple(createOrder, { count });
  const res = buildPaginatedResult(orders, currentPage);
  return c.json(res);
});

patientRouter.get('/order/queryOrderDetail', (c) => {
  const order = createOrder();
  const items = faker.helpers.multiple(() => ({
    itemName: faker.commerce.productName(),
    itemAmount: Number(faker.number.float({ min: 20, max: 300, fractionDigits: 2 }).toFixed(2)),
  }), { count: faker.number.int({ min: 1, max: 5 }) });
  const res = result({
    ...order,
    items,
  });
  return c.json(res);
});

patientRouter.post('/visitPlan/queryVisitPlanList', async (c) => {
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
  const plans = faker.helpers.multiple(() => createVisitPlan(), { count });
  const res = buildPaginatedResult(plans, currentPage);
  return c.json(res);
});

patientRouter.get('/visitPlan/queryMedicalRecords', (c) => {
  const count = faker.number.int({ min: 1, max: 5 });
  const records = faker.helpers.multiple(() => {
    const plan = createVisitPlan({ status: '已完成' });
    const pastDate = faker.date.recent({ days: 180 });
    const start = pastDate;
    const end = addHours(pastDate, faker.number.int({ min: 3, max: 5 }));
    return {
      ...plan,
      scheduleDate: formatDate(pastDate),
      week: getWeekLabel(pastDate),
      detailDate: `${formatDate(pastDate)} ${plan.shiftType}`,
      startTime: formatTime(start),
      endTime: formatTime(end),
    };
  }, { count });
  const res = result({}, {
    data: records,
    total: records.length,
    page: 1,
    size: records.length,
  });
  return c.json(res);
});
