/**
 * Float.js Type-Safe API Module
 * Automatic validation and type inference for API routes
 * 
 * This is a MAJOR differentiator from Next.js - zero boilerplate API validation!
 */

// ============================================================================
// SCHEMA TYPES (Zod-like but zero dependencies)
// ============================================================================

type SchemaType = 'string' | 'number' | 'boolean' | 'array' | 'object' | 'enum' | 'union' | 'optional';

interface BaseSchema<T = unknown> {
  _type: SchemaType;
  _output: T;
  optional(): OptionalSchema<T>;
  parse(value: unknown): T;
  safeParse(value: unknown): { success: true; data: T } | { success: false; error: ValidationError };
}

interface ValidationError {
  path: string[];
  message: string;
  received: unknown;
  expected: string;
}

// ============================================================================
// STRING SCHEMA
// ============================================================================

interface StringSchema extends BaseSchema<string> {
  _type: 'string';
  min(length: number, message?: string): StringSchema;
  max(length: number, message?: string): StringSchema;
  email(message?: string): StringSchema;
  url(message?: string): StringSchema;
  uuid(message?: string): StringSchema;
  regex(pattern: RegExp, message?: string): StringSchema;
  trim(): StringSchema;
  toLowerCase(): StringSchema;
  toUpperCase(): StringSchema;
}

function createStringSchema(): StringSchema {
  const validators: Array<(val: string) => string | null> = [];
  const transforms: Array<(val: string) => string> = [];

  const schema: StringSchema = {
    _type: 'string',
    _output: '' as string,

    min(length: number, message?: string) {
      validators.push((val) => 
        val.length >= length ? null : (message || `Must be at least ${length} characters`)
      );
      return schema;
    },

    max(length: number, message?: string) {
      validators.push((val) => 
        val.length <= length ? null : (message || `Must be at most ${length} characters`)
      );
      return schema;
    },

    email(message?: string) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      validators.push((val) => 
        emailRegex.test(val) ? null : (message || 'Invalid email address')
      );
      return schema;
    },

    url(message?: string) {
      validators.push((val) => {
        try {
          new URL(val);
          return null;
        } catch {
          return message || 'Invalid URL';
        }
      });
      return schema;
    },

    uuid(message?: string) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      validators.push((val) => 
        uuidRegex.test(val) ? null : (message || 'Invalid UUID')
      );
      return schema;
    },

    regex(pattern: RegExp, message?: string) {
      validators.push((val) => 
        pattern.test(val) ? null : (message || `Must match pattern ${pattern}`)
      );
      return schema;
    },

    trim() {
      transforms.push((val) => val.trim());
      return schema;
    },

    toLowerCase() {
      transforms.push((val) => val.toLowerCase());
      return schema;
    },

    toUpperCase() {
      transforms.push((val) => val.toUpperCase());
      return schema;
    },

    optional() {
      return createOptionalSchema(schema);
    },

    parse(value: unknown): string {
      const result = schema.safeParse(value);
      if (!result.success) {
        throw new FloatValidationError([result.error]);
      }
      return result.data;
    },

    safeParse(value: unknown) {
      if (typeof value !== 'string') {
        return {
          success: false as const,
          error: {
            path: [],
            message: 'Expected string',
            received: value,
            expected: 'string',
          },
        };
      }

      // Apply transforms
      let transformed = value;
      for (const transform of transforms) {
        transformed = transform(transformed);
      }

      // Run validators
      for (const validator of validators) {
        const error = validator(transformed);
        if (error) {
          return {
            success: false as const,
            error: {
              path: [],
              message: error,
              received: value,
              expected: 'string',
            },
          };
        }
      }

      return { success: true as const, data: transformed };
    },
  };

  return schema;
}

// ============================================================================
// NUMBER SCHEMA
// ============================================================================

interface NumberSchema extends BaseSchema<number> {
  _type: 'number';
  min(value: number, message?: string): NumberSchema;
  max(value: number, message?: string): NumberSchema;
  int(message?: string): NumberSchema;
  positive(message?: string): NumberSchema;
  negative(message?: string): NumberSchema;
  finite(message?: string): NumberSchema;
}

function createNumberSchema(): NumberSchema {
  const validators: Array<(val: number) => string | null> = [];

  const schema: NumberSchema = {
    _type: 'number',
    _output: 0 as number,

    min(value: number, message?: string) {
      validators.push((val) => 
        val >= value ? null : (message || `Must be at least ${value}`)
      );
      return schema;
    },

    max(value: number, message?: string) {
      validators.push((val) => 
        val <= value ? null : (message || `Must be at most ${value}`)
      );
      return schema;
    },

    int(message?: string) {
      validators.push((val) => 
        Number.isInteger(val) ? null : (message || 'Must be an integer')
      );
      return schema;
    },

    positive(message?: string) {
      validators.push((val) => 
        val > 0 ? null : (message || 'Must be positive')
      );
      return schema;
    },

    negative(message?: string) {
      validators.push((val) => 
        val < 0 ? null : (message || 'Must be negative')
      );
      return schema;
    },

    finite(message?: string) {
      validators.push((val) => 
        Number.isFinite(val) ? null : (message || 'Must be finite')
      );
      return schema;
    },

    optional() {
      return createOptionalSchema(schema);
    },

    parse(value: unknown): number {
      const result = schema.safeParse(value);
      if (!result.success) {
        throw new FloatValidationError([result.error]);
      }
      return result.data;
    },

    safeParse(value: unknown) {
      const num = typeof value === 'string' ? parseFloat(value) : value;
      
      if (typeof num !== 'number' || isNaN(num)) {
        return {
          success: false as const,
          error: {
            path: [],
            message: 'Expected number',
            received: value,
            expected: 'number',
          },
        };
      }

      for (const validator of validators) {
        const error = validator(num);
        if (error) {
          return {
            success: false as const,
            error: {
              path: [],
              message: error,
              received: value,
              expected: 'number',
            },
          };
        }
      }

      return { success: true as const, data: num };
    },
  };

  return schema;
}

// ============================================================================
// BOOLEAN SCHEMA
// ============================================================================

interface BooleanSchema extends BaseSchema<boolean> {
  _type: 'boolean';
}

function createBooleanSchema(): BooleanSchema {
  const schema: BooleanSchema = {
    _type: 'boolean',
    _output: false as boolean,

    optional() {
      return createOptionalSchema(schema);
    },

    parse(value: unknown): boolean {
      const result = schema.safeParse(value);
      if (!result.success) {
        throw new FloatValidationError([result.error]);
      }
      return result.data;
    },

    safeParse(value: unknown) {
      // Handle string booleans
      if (value === 'true') return { success: true as const, data: true };
      if (value === 'false') return { success: true as const, data: false };
      
      if (typeof value !== 'boolean') {
        return {
          success: false as const,
          error: {
            path: [],
            message: 'Expected boolean',
            received: value,
            expected: 'boolean',
          },
        };
      }

      return { success: true as const, data: value };
    },
  };

  return schema;
}

// ============================================================================
// ARRAY SCHEMA
// ============================================================================

interface ArraySchema<T> extends BaseSchema<T[]> {
  _type: 'array';
  min(length: number, message?: string): ArraySchema<T>;
  max(length: number, message?: string): ArraySchema<T>;
  nonempty(message?: string): ArraySchema<T>;
}

function createArraySchema<S extends BaseSchema>(itemSchema: S): ArraySchema<S['_output']> {
  const validators: Array<(val: unknown[]) => string | null> = [];

  const schema: ArraySchema<S['_output']> = {
    _type: 'array',
    _output: [] as S['_output'][],

    min(length: number, message?: string) {
      validators.push((val) => 
        val.length >= length ? null : (message || `Must have at least ${length} items`)
      );
      return schema;
    },

    max(length: number, message?: string) {
      validators.push((val) => 
        val.length <= length ? null : (message || `Must have at most ${length} items`)
      );
      return schema;
    },

    nonempty(message?: string) {
      validators.push((val) => 
        val.length > 0 ? null : (message || 'Array must not be empty')
      );
      return schema;
    },

    optional() {
      return createOptionalSchema(schema);
    },

    parse(value: unknown): S['_output'][] {
      const result = schema.safeParse(value);
      if (!result.success) {
        throw new FloatValidationError([result.error]);
      }
      return result.data;
    },

    safeParse(value: unknown) {
      if (!Array.isArray(value)) {
        return {
          success: false as const,
          error: {
            path: [],
            message: 'Expected array',
            received: value,
            expected: 'array',
          },
        };
      }

      // Validate length constraints
      for (const validator of validators) {
        const error = validator(value);
        if (error) {
          return {
            success: false as const,
            error: {
              path: [],
              message: error,
              received: value,
              expected: 'array',
            },
          };
        }
      }

      // Validate each item
      const result: S['_output'][] = [];
      for (let i = 0; i < value.length; i++) {
        const itemResult = itemSchema.safeParse(value[i]);
        if (!itemResult.success) {
          return {
            success: false as const,
            error: {
              ...itemResult.error,
              path: [String(i), ...itemResult.error.path],
            },
          };
        }
        result.push(itemResult.data);
      }

      return { success: true as const, data: result };
    },
  };

  return schema;
}

// ============================================================================
// OBJECT SCHEMA
// ============================================================================

type ObjectShape = Record<string, BaseSchema>;
type InferObject<T extends ObjectShape> = {
  [K in keyof T]: T[K]['_output'];
};

interface ObjectSchema<T extends ObjectShape> extends BaseSchema<InferObject<T>> {
  _type: 'object';
  _shape: T;
  partial(): ObjectSchema<{ [K in keyof T]: OptionalSchema<T[K]['_output']> }>;
  pick<K extends keyof T>(...keys: K[]): ObjectSchema<Pick<T, K>>;
  omit<K extends keyof T>(...keys: K[]): ObjectSchema<Omit<T, K>>;
  extend<E extends ObjectShape>(extension: E): ObjectSchema<T & E>;
  merge<E extends ObjectShape>(other: ObjectSchema<E>): ObjectSchema<T & E>;
  passthrough(): ObjectSchema<T>;
  strict(): ObjectSchema<T>;
}

function createObjectSchema<T extends ObjectShape>(shape: T): ObjectSchema<T> {
  let passthroughMode = false;
  let strictMode = false;

  const schema: ObjectSchema<T> = {
    _type: 'object',
    _output: {} as InferObject<T>,
    _shape: shape,

    partial() {
      const partialShape: Record<string, BaseSchema> = {};
      for (const key in shape) {
        partialShape[key] = shape[key].optional();
      }
      return createObjectSchema(partialShape) as any;
    },

    pick<K extends keyof T>(...keys: K[]) {
      const pickedShape: Partial<T> = {};
      for (const key of keys) {
        pickedShape[key] = shape[key];
      }
      return createObjectSchema(pickedShape as Pick<T, K>);
    },

    omit<K extends keyof T>(...keys: K[]) {
      const omittedShape = { ...shape };
      for (const key of keys) {
        delete omittedShape[key];
      }
      return createObjectSchema(omittedShape as Omit<T, K>);
    },

    extend<E extends ObjectShape>(extension: E) {
      return createObjectSchema({ ...shape, ...extension });
    },

    merge<E extends ObjectShape>(other: ObjectSchema<E>) {
      return createObjectSchema({ ...shape, ...other._shape });
    },

    passthrough() {
      passthroughMode = true;
      return schema;
    },

    strict() {
      strictMode = true;
      return schema;
    },

    optional() {
      return createOptionalSchema(schema);
    },

    parse(value: unknown): InferObject<T> {
      const result = schema.safeParse(value);
      if (!result.success) {
        throw new FloatValidationError([result.error]);
      }
      return result.data;
    },

    safeParse(value: unknown) {
      if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return {
          success: false as const,
          error: {
            path: [],
            message: 'Expected object',
            received: value,
            expected: 'object',
          },
        };
      }

      const obj = value as Record<string, unknown>;
      const result: Record<string, unknown> = {};

      // Check for unknown keys in strict mode
      if (strictMode) {
        for (const key in obj) {
          if (!(key in shape)) {
            return {
              success: false as const,
              error: {
                path: [key],
                message: `Unknown key '${key}'`,
                received: obj[key],
                expected: 'undefined',
              },
            };
          }
        }
      }

      // Validate each field
      for (const key in shape) {
        const fieldSchema = shape[key];
        const fieldResult = fieldSchema.safeParse(obj[key]);
        
        if (!fieldResult.success) {
          return {
            success: false as const,
            error: {
              ...fieldResult.error,
              path: [key, ...fieldResult.error.path],
            },
          };
        }
        
        result[key] = fieldResult.data;
      }

      // Include extra keys in passthrough mode
      if (passthroughMode) {
        for (const key in obj) {
          if (!(key in shape)) {
            result[key] = obj[key];
          }
        }
      }

      return { success: true as const, data: result as InferObject<T> };
    },
  };

  return schema;
}

// ============================================================================
// OPTIONAL SCHEMA
// ============================================================================

interface OptionalSchema<T> extends BaseSchema<T | undefined> {
  _type: 'optional';
  _innerType: BaseSchema<T>;
  default(value: T): BaseSchema<T>;
}

function createOptionalSchema<T>(innerSchema: BaseSchema<T>): OptionalSchema<T> {
  const schema: OptionalSchema<T> = {
    _type: 'optional',
    _output: undefined as T | undefined,
    _innerType: innerSchema,

    default(defaultValue: T): BaseSchema<T> {
      return {
        _type: 'optional',
        _output: defaultValue,
        optional: () => schema,
        parse(value: unknown): T {
          if (value === undefined || value === null) {
            return defaultValue;
          }
          return innerSchema.parse(value);
        },
        safeParse(value: unknown) {
          if (value === undefined || value === null) {
            return { success: true as const, data: defaultValue };
          }
          return innerSchema.safeParse(value);
        },
      };
    },

    optional() {
      return schema;
    },

    parse(value: unknown): T | undefined {
      const result = schema.safeParse(value);
      if (!result.success) {
        throw new FloatValidationError([result.error]);
      }
      return result.data;
    },

    safeParse(value: unknown) {
      if (value === undefined || value === null) {
        return { success: true as const, data: undefined };
      }
      return innerSchema.safeParse(value);
    },
  };

  return schema;
}

// ============================================================================
// ENUM SCHEMA
// ============================================================================

interface EnumSchema<T extends readonly string[]> extends BaseSchema<T[number]> {
  _type: 'enum';
  options: T;
}

function createEnumSchema<T extends readonly string[]>(values: T): EnumSchema<T> {
  const schema: EnumSchema<T> = {
    _type: 'enum',
    _output: values[0] as T[number],
    options: values,

    optional() {
      return createOptionalSchema(schema);
    },

    parse(value: unknown): T[number] {
      const result = schema.safeParse(value);
      if (!result.success) {
        throw new FloatValidationError([result.error]);
      }
      return result.data;
    },

    safeParse(value: unknown) {
      if (typeof value !== 'string' || !values.includes(value as T[number])) {
        return {
          success: false as const,
          error: {
            path: [],
            message: `Expected one of: ${values.join(', ')}`,
            received: value,
            expected: values.join(' | '),
          },
        };
      }

      return { success: true as const, data: value as T[number] };
    },
  };

  return schema;
}

// ============================================================================
// UNION SCHEMA
// ============================================================================

interface UnionSchema<T extends BaseSchema[]> extends BaseSchema<T[number]['_output']> {
  _type: 'union';
}

function createUnionSchema<T extends BaseSchema[]>(schemas: T): UnionSchema<T> {
  const schema: UnionSchema<T> = {
    _type: 'union',
    _output: undefined as T[number]['_output'],

    optional() {
      return createOptionalSchema(schema);
    },

    parse(value: unknown): T[number]['_output'] {
      const result = schema.safeParse(value);
      if (!result.success) {
        throw new FloatValidationError([result.error]);
      }
      return result.data;
    },

    safeParse(value: unknown) {
      const errors: ValidationError[] = [];
      
      for (const s of schemas) {
        const result = s.safeParse(value);
        if (result.success) {
          return result;
        }
        errors.push(result.error);
      }

      return {
        success: false as const,
        error: {
          path: [],
          message: `Value did not match any schema in union`,
          received: value,
          expected: schemas.map(s => s._type).join(' | '),
        },
      };
    },
  };

  return schema;
}

// ============================================================================
// VALIDATION ERROR
// ============================================================================

export class FloatValidationError extends Error {
  public readonly errors: ValidationError[];
  public readonly status = 400;

  constructor(errors: ValidationError[]) {
    super('Validation failed');
    this.name = 'FloatValidationError';
    this.errors = errors;
  }

  toJSON() {
    return {
      error: 'Validation Error',
      details: this.errors.map(e => ({
        path: e.path.join('.') || 'root',
        message: e.message,
        received: typeof e.received,
      })),
    };
  }

  toResponse(): Response {
    return new Response(JSON.stringify(this.toJSON()), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// ============================================================================
// SCHEMA BUILDER (f - main export)
// ============================================================================

export const f = {
  string: createStringSchema,
  number: createNumberSchema,
  boolean: createBooleanSchema,
  array: createArraySchema,
  object: createObjectSchema,
  enum: createEnumSchema,
  union: createUnionSchema,
};

// ============================================================================
// TYPE INFERENCE
// ============================================================================

export type Infer<T extends BaseSchema> = T['_output'];

// ============================================================================
// API ROUTE DECORATOR
// ============================================================================

interface TypedRouteOptions {
  body?: ObjectSchema<any>;
  query?: ObjectSchema<any>;
  params?: ObjectSchema<any>;
}

interface ValidatedData {
  body: any;
  query: any;
  params: any;
}

interface TypedRequest extends Request {
  validated: ValidatedData;
}

type RouteHandler = (
  request: TypedRequest
) => Promise<Response> | Response;

/**
 * Create a type-safe API route with automatic validation
 * 
 * @example
 * ```typescript
 * import { typedRoute, f } from '@float/core';
 * 
 * export const POST = typedRoute({
 *   body: f.object({
 *     name: f.string().min(2),
 *     email: f.string().email(),
 *     age: f.number().min(18).optional(),
 *   }),
 * }, async (req) => {
 *   // req.validated.body is fully typed!
 *   const { name, email, age } = req.validated.body;
 *   
 *   return new Response(JSON.stringify({ 
 *     message: `Hello ${name}!` 
 *   }));
 * });
 * ```
 */
export function typedRoute(
  options: TypedRouteOptions,
  handler: RouteHandler
): (request: Request) => Promise<Response> {
  return async (request: Request): Promise<Response> => {
    try {
      const validated: ValidatedData = { body: undefined, query: undefined, params: undefined };

      // Parse and validate body
      if (options.body) {
        try {
          const body = await request.json();
          const bodySchema = options.body;
          const result = bodySchema.safeParse(body);
          if (!result.success) {
            return new FloatValidationError([result.error]).toResponse();
          }
          validated.body = result.data;
        } catch {
          return new Response(
            JSON.stringify({ error: 'Invalid JSON body' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }
      }

      // Parse and validate query params
      if (options.query) {
        const url = new URL(request.url);
        const queryObj: Record<string, string> = {};
        url.searchParams.forEach((value, key) => {
          queryObj[key] = value;
        });
        
        const querySchema = options.query;
        const result = querySchema.safeParse(queryObj);
        if (!result.success) {
          return new FloatValidationError([result.error]).toResponse();
        }
        validated.query = result.data;
      }

      // Validate URL params (if provided via request context)
      if (options.params) {
        const params = (request as any).params || {};
        const paramsSchema = options.params;
        const result = paramsSchema.safeParse(params);
        if (!result.success) {
          return new FloatValidationError([result.error]).toResponse();
        }
        validated.params = result.data;
      }

      // Create typed request
      const typedRequest = request as TypedRequest;
      typedRequest.validated = validated;

      // Call handler
      return await handler(typedRequest);
    } catch (error) {
      if (error instanceof FloatValidationError) {
        return error.toResponse();
      }
      
      console.error('Route error:', error);
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  };
}

// ============================================================================
// JSON RESPONSE HELPER
// ============================================================================

interface JsonResponseOptions {
  status?: number;
  headers?: Record<string, string>;
}

/**
 * Create a JSON response with automatic serialization
 */
export function json<T>(data: T, options: JsonResponseOptions = {}): Response {
  return new Response(JSON.stringify(data), {
    status: options.status || 200,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
}

/**
 * Create an error response
 */
export function error(message: string, status = 500): Response {
  return new Response(
    JSON.stringify({ error: message }),
    { 
      status, 
      headers: { 'Content-Type': 'application/json' } 
    }
  );
}

/**
 * Create a redirect response
 */
export function redirect(url: string, status: 301 | 302 | 307 | 308 = 302): Response {
  return new Response(null, {
    status,
    headers: { Location: url },
  });
}
