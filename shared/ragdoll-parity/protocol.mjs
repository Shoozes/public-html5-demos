export const TRACE_SCHEMA_VERSION = 1;
export const PARITY_COMMAND_TYPES = Object.freeze([
  'reset',
  'release',
  'apply-impulse',
  'set-body-state',
  'cursor-start',
  'cursor-target',
  'cursor-end'
]);
export function getParityCommandType(command) {
  const type = typeof command === 'string' ? command : command?.type;
  if (!PARITY_COMMAND_TYPES.includes(type)) throw new Error(`Unknown ragdoll parity command: ${String(type)}`);
  return type;
}
export const DEFAULT_TOLERANCES = { position: 1e-3, rotation: 1e-3, linearVelocity: 1e-3, angularVelocity: 1e-3, joint: 1e-3, contactStep: 0, sleepStep: 0 };
export const INVALID_SCHEMA_ERROR = 'invalid-schema';
export const MAX_METRIC_ERROR = Number.MAX_SAFE_INTEGER;

const isFiniteVector = (value, length) => Array.isArray(value)
  && value.length === length
  && value.every(Number.isFinite);

export function isTraceBody(body) {
  return body !== null
    && typeof body === 'object'
    && typeof body.id === 'string'
    && body.id.length > 0
    && isFiniteVector(body.position, 3)
    && isFiniteVector(body.rotation, 4)
    && body.rotation.some((value) => value !== 0)
    && isFiniteVector(body.linearVelocity, 3)
    && isFiniteVector(body.angularVelocity, 3)
    && (body.mass === undefined || (Number.isFinite(body.mass) && body.mass > 0))
    && (body.sleeping === undefined || typeof body.sleeping === 'boolean');
}

export function frameBodies(frame) {
  const bodies = Array.isArray(frame?.bodies)
    ? frame.bodies
    : frame?.bodies && typeof frame.bodies === 'object'
      ? Object.entries(frame.bodies).map(([id, body]) => ({ id, ...body }))
      : Object.entries(frame?.segments || {}).map(([id, body]) => ({ id, ...body }));
  return bodies.map((body) => body && typeof body === 'object'
    ? { ...body, linearVelocity: body.linearVelocity ?? body.velocity }
    : body);
}

export function scalarDistance(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length || !a.length
    || !a.every(Number.isFinite) || !b.every(Number.isFinite)) return MAX_METRIC_ERROR;
  const distance = Math.sqrt(a.reduce((sum, value, index) => sum + (value - b[index]) ** 2, 0));
  return Number.isFinite(distance) ? distance : MAX_METRIC_ERROR;
}

export function quaternionError(a, b) {
  if (!isFiniteVector(a, 4) || !isFiniteVector(b, 4)) return MAX_METRIC_ERROR;
  const normA = Math.sqrt(a.reduce((sum, value) => sum + value * value, 0));
  const normB = Math.sqrt(b.reduce((sum, value) => sum + value * value, 0));
  if (!Number.isFinite(normA) || !Number.isFinite(normB) || normA === 0 || normB === 0) return MAX_METRIC_ERROR;
  const dot = Math.min(1, Math.max(0, Math.abs(a.reduce((sum, value, index) => sum + value * b[index], 0) / (normA * normB))));
  return 2 * Math.acos(dot);
}

export function metricRatio(error, limit) {
  if (!Number.isFinite(error)) return MAX_METRIC_ERROR;
  if (limit <= 0) return error === 0 ? 0 : MAX_METRIC_ERROR;
  const ratio = error / limit;
  return Number.isFinite(ratio) ? ratio : MAX_METRIC_ERROR;
}

const invalidFrameComparison = (metric) => ({
  divergent: true,
  metric,
  error: INVALID_SCHEMA_ERROR,
  limit: 0,
  ratio: INVALID_SCHEMA_ERROR
});

export function compareFrames(authority, clone, tolerances = DEFAULT_TOLERANCES) {
  const aa = frameBodies(authority);
  const bb = frameBodies(clone);
  if (!aa.length || !bb.length) return invalidFrameComparison('zero-bodies');
  if (aa.some((body) => !isTraceBody(body)) || bb.some((body) => !isTraceBody(body))) return invalidFrameComparison('body-schema');
  const byId = new Map(bb.map((body) => [body.id, body]));
  if (new Set(aa.map((body) => body.id)).size !== aa.length || byId.size !== bb.length) return invalidFrameComparison('duplicate-body-id');
  if (aa.length !== bb.length || aa.some((body) => !byId.has(body.id))) return invalidFrameComparison('body-id-set');
  let worst = null;
  for (const a of aa) {
    const b = byId.get(a.id);
    for (const [key, limit, compare] of [
      ['position', tolerances.position, scalarDistance],
      ['linearVelocity', tolerances.linearVelocity, scalarDistance],
      ['angularVelocity', tolerances.angularVelocity, scalarDistance]
    ]) {
      const error = compare(a[key], b[key]);
      const ratio = metricRatio(error, limit);
      if (!worst || ratio > worst.ratio) worst = { body: a.id, metric: key, error, limit, ratio };
    }
    const error = quaternionError(a.rotation, b.rotation);
    const ratio = metricRatio(error, tolerances.rotation);
    if (!worst || ratio > worst.ratio) worst = { body: a.id, metric: 'rotation', error, limit: tolerances.rotation, ratio };
  }
  return { divergent: Boolean(worst && worst.error > worst.limit), ...worst };
}

export function firstDivergence(authority, clone, tolerances) {
  if (!Array.isArray(authority) || !Array.isArray(clone) || !authority.length || !clone.length) {
    return { step: 0, ...invalidFrameComparison('empty-trace') };
  }
  const count = Math.min(authority.length, clone.length);
  for (let index = 0; index < count; index += 1) {
    const result = compareFrames(authority[index], clone[index], tolerances);
    if (result.divergent) return { step: authority[index]?.step ?? index, ...result };
  }
  return authority.length === clone.length
    ? null
    : { step: count, metric: 'trace-length', error: Math.abs(authority.length - clone.length), limit: 0 };
}
