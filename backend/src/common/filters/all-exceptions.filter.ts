import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('AllExceptionsFilter');

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = 
      exception instanceof HttpException
        ? exception.getResponse()
        : (exception as Error).message || 'Error interno del servidor';

    const requestId = request.headers['x-request-id'] || `err_${Date.now()}`;

    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(request),
      message: typeof message === 'object' ? (message as any).message : message,
      requestId,
    };

    // Logging estructurado para auditoría
    this.logger.error({
      event: 'UNHANDLED_EXCEPTION',
      requestId,
      statusCode: httpStatus,
      path: httpAdapter.getRequestUrl(request),
      method: httpAdapter.getRequestMethod(request),
      error: (exception as Error).message,
      stack: (exception as Error).stack,
    });

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
