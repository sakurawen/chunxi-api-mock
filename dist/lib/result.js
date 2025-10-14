import { merge } from 'lodash-es';
export function result(data, extra = {}) {
    return merge({
        success: true,
        data,
        message: '',
    }, extra);
}
