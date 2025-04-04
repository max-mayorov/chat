import { Context, Next } from 'koa';

/**
 * Error handler middleware
 */
export async function errorHandler(ctx: Context, next: Next): Promise<void> {
  try {
    await next();
  } catch (err) {
    console.error('Server error:', err);

    const error = err as any;
    ctx.status = error.status || 500;
    ctx.body = {
      error: error.message || 'Internal Server Error',
    };

    // Emit the error for centralized error handling
    ctx.app.emit('error', error, ctx);
  }
}
