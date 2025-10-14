import { factory } from '~/factory.js';
import { faker } from '~/lib/faker.js';
import { result } from '~/lib/result.js';
export const emrRouter = factory.createApp();
function toPositiveInt(value, fallback) {
    const num = Number(value);
    if (Number.isFinite(num) && num > 0)
        return Math.floor(num);
    return fallback;
}
function buildPaginatedResult(items, page) {
    const baseTotal = Math.max(items.length, 1);
    const total = faker.number.int({ min: baseTotal, max: baseTotal * 4 });
    return result({}, {
        data: items,
        total,
        page,
        size: items.length,
    });
}
const formatDate = (date) => date.toISOString().slice(0, 10);
function createDiagnosisInfo() {
    return {
        diagnosisDate: formatDate(faker.date.past({ years: 5 })),
        diagnosisContent: faker.lorem.sentence(),
    };
}
function createTreatmentPlan() {
    return {
        dialysisMode: faker.helpers.arrayElement(['血液透析', '腹膜透析', '血滤']),
        dialysisFrequency: `${faker.number.int({ min: 1, max: 5 })}次/周`,
    };
}
function createVascularAccess() {
    return {
        content: faker.lorem.sentence(),
    };
}
function createLabItem(patientId) {
    const labItemId = faker.string.uuid();
    return {
        hospitalStoreId: faker.string.uuid(),
        patientId: patientId ?? faker.string.uuid(),
        labItemId,
        labItemName: `${faker.commerce.productMaterial()}指标`,
        labItemDate: formatDate(faker.date.recent({ days: 120 })),
    };
}
function createLabItemDetail(labItemId, patientId) {
    const base = createLabItem(patientId);
    if (labItemId)
        base.labItemId = labItemId;
    const resultValue = faker.number.float({ min: 1, max: 200, fractionDigits: 2 });
    const min = faker.number.float({ min: 1, max: Math.max(resultValue - 5, 1), fractionDigits: 2 });
    const max = min + faker.number.float({ min: 1, max: 10, fractionDigits: 2 });
    return {
        ...base,
        labItemName: `${faker.commerce.productAdjective()}${faker.commerce.product()}检测`,
        testItemId: faker.string.uuid(),
        testItemName: `${faker.science.chemicalElement().name}指标`,
        testItemResult: resultValue.toFixed(2),
        testItemMin: min.toFixed(2),
        testItemMax: max.toFixed(2),
        labItemDate: base.labItemDate,
        testFlag: faker.helpers.arrayElement([0, 1]),
    };
}
emrRouter.get('/queryBaseInfo', (c) => {
    const data = {
        diagnosisInfoList: faker.helpers.multiple(createDiagnosisInfo, { count: faker.number.int({ min: 1, max: 3 }) }),
        treatmentPlansInfoList: faker.helpers.multiple(createTreatmentPlan, { count: faker.number.int({ min: 1, max: 2 }) }),
        vascularAccessInfoList: faker.helpers.multiple(createVascularAccess, { count: faker.number.int({ min: 1, max: 3 }) }),
    };
    const res = result(data);
    return c.json(res);
});
emrRouter.post('/lab/queryLabItemList', async (c) => {
    let payload = {};
    try {
        payload = await c.req.json();
    }
    catch {
        // ignore parse errors
    }
    const currentPage = toPositiveInt(payload.currentPage, 1);
    const pageSize = toPositiveInt(payload.pageSize, 10);
    const patientId = typeof payload.patientId === 'string' ? payload.patientId : undefined;
    const count = Math.max(1, Math.min(pageSize, 5));
    const items = faker.helpers.multiple(() => createLabItem(patientId), { count });
    const res = buildPaginatedResult(items, currentPage);
    return c.json(res);
});
emrRouter.get('/lab/queryItemDetail', (c) => {
    const labItemId = c.req.query('labItemId');
    const detail = createLabItemDetail(labItemId ?? undefined);
    const res = result(detail);
    return c.json(res);
});
emrRouter.post('/lab/queryExceptionList', async (c) => {
    let payload = {};
    try {
        payload = await c.req.json();
    }
    catch {
        // ignore parse errors
    }
    const currentPage = toPositiveInt(payload.currentPage, 1);
    const pageSize = toPositiveInt(payload.pageSize, 10);
    const patientId = typeof payload.patientId === 'string' ? payload.patientId : undefined;
    const count = Math.max(1, Math.min(pageSize, 5));
    const items = faker.helpers.multiple(() => createLabItemDetail(undefined, patientId), { count });
    const res = buildPaginatedResult(items, currentPage);
    return c.json(res);
});
