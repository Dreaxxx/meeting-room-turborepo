import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';

type JsonPrimitive = string | number | boolean | null;
type Json = JsonPrimitive | Json[] | { [key: string]: Json };

@Catch()
export class PrismaExceptionFilter<T> implements ExceptionFilter {
    catch(exception: T, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const res = ctx.getResponse<any>();
        const req = ctx.getRequest<any>();

        const isProd = process.env.NODE_ENV === 'production';

        // Prisma: known request errors (codes P20xx…)
        if (exception instanceof Prisma.PrismaClientKnownRequestError) {
            const { status, message, details } = mapKnownRequestError(exception);
            return res.status(status).json(buildBody(status, message, req, details, isProd));
        }

        if (exception instanceof Prisma.PrismaClientValidationError) {
            const status = HttpStatus.BAD_REQUEST;
            const message = 'Invalid query arguments for Prisma operation';
            return res.status(status).json(buildBody(status, message, req, errorText(exception, isProd)));
        }

        const status = HttpStatus.INTERNAL_SERVER_ERROR;
        const message = 'Unexpected server error';
        return res.status(status).json(buildBody(status, message, req, errorText(exception, isProd)));
    }
}

function buildBody(
    status: number,
    message: string,
    req: any,
    details?: Json,
    hideStack = true,
) {
    const base: Record<string, Json> = {
        statusCode: status,
        error: httpStatusText(status),
        message,
        path: req?.url ?? undefined,
        timestamp: new Date().toISOString(),
    };
    if (details && !hideStack) {
        base.details = details;
    } else if (details && typeof details === 'object' && !Array.isArray(details)) {

        const safe = sanitizeDetails(details as Record<string, Json>);
        if (Object.keys(safe).length) base.details = safe;
    }
    return base;
}

function httpStatusText(code: number) {
    switch (code) {
        case 400: return 'Bad Request';
        case 404: return 'Not Found';
        case 409: return 'Conflict';
        case 500: return 'Internal Server Error';
        default: return 'Error';
    }
}

function sanitizeDetails(obj: Record<string, Json>) {
    const { stack, clientVersion, ...rest } = obj;
    return rest;
}

function errorText(e: any, includeStack: boolean): Json {
    if (!e) return null;
    if (includeStack) return String(e.stack ?? e.message ?? e);
    return typeof e?.message === 'string' ? e.message : null;
}

function mapKnownRequestError(e: Prisma.PrismaClientKnownRequestError) {
    // Réfs : https://www.prisma.io/docs/reference/api-reference/error-reference
    const code = e.code;
    const meta = (e as any).meta as Record<string, unknown> | undefined;

    // Helper to recursively convert unknown to Json
    function toJson(val: unknown): Json {
        if (
            typeof val === 'string' ||
            typeof val === 'number' ||
            typeof val === 'boolean' ||
            val === null
        ) {
            return val;
        }
        if (Array.isArray(val)) {
            return val.map(toJson);
        }
        if (typeof val === 'object' && val !== null) {
            const result: { [key: string]: Json } = {};
            for (const [k, v] of Object.entries(val)) {
                result[k] = toJson(v);
            }
            return result;
        }
        return String(val);
    }

    const safeMeta = meta !== undefined ? toJson(meta) : null;

    switch (code) {
        /* Conflits / contraintes */
        case 'P2002': {
            // unique constraint failed
            const target = Array.isArray(meta?.target) ? meta?.target.join(', ') : meta?.target;
            return {
                status: HttpStatus.CONFLICT,
                message: target ? `Already exists: ${target}` : 'Unique constraint violated',
                details: { code, target: target as Json },
            };
        }
        case 'P2003': {
            // foreign key constraint failed
            const field = meta?.field_name as string | undefined;
            // Only include 'field' if it's defined
            const details: Record<string, Json> = { code };
            if (field !== undefined) details.field = field;
            return {
                status: HttpStatus.CONFLICT,
                message: field ? `Related resource not found or forbidden: ${field}` : 'Foreign key constraint failed',
                details,
            };
        }
        case 'P2004': {
            return {
                status: HttpStatus.CONFLICT,
                message: 'A database constraint failed',
                details: { code, meta: safeMeta },
            };
        }

        /* Invalid or missing values */
        case 'P2000':
            return {
                status: HttpStatus.BAD_REQUEST,
                message: 'Provided value is too long for a column',
                details: { code, meta: safeMeta },
            };
        case 'P2011':
            return {
                status: HttpStatus.BAD_REQUEST,
                message: 'Null constraint violation',
                details: { code, meta: safeMeta },
            };
        case 'P2012':
            return {
                status: HttpStatus.BAD_REQUEST,
                message: 'Missing required value',
                details: { code, meta: safeMeta },
            };
        case 'P2014':
            return {
                status: HttpStatus.BAD_REQUEST,
                message: 'Invalid relation reference',
                details: { code, meta: safeMeta },
            };
        case 'P2023':
            return {
                status: HttpStatus.BAD_REQUEST,
                message: 'Inconsistent data for a column',
                details: { code, meta: safeMeta },
            };

        case 'P2001':
        case 'P2025':
            return {
                status: HttpStatus.NOT_FOUND,
                message: 'Record not found',
                details: { code, meta: safeMeta },
            };

        default:
            return {
                status: HttpStatus.BAD_REQUEST,
                message: `Database error (${code})`,
                details: { code, meta: safeMeta },
            };
    }
}
