import { merge } from 'lodash-es';

export function result<T extends object, E extends object>(data: T, extra: E = {} as E) {
  return merge({
    success: true,
    data,
    message: '',
  }, extra);
}
