import {injectable} from 'inversify';
import {Response, Router} from 'express';
import {StatusCodes} from 'http-status-codes';
import {LoggerInterface} from '../logger/logger.interface.js';
import {RouteInterface} from '../../types/route.interface.js';
import {ControllerInterface} from './controller.interface.js';
import asyncHandler from 'express-async-handler';
import {ConfigInterface} from '../config/config.interface.js';

@injectable()
export abstract class Controller implements ControllerInterface {
  private readonly _router: Router;

  constructor(protected readonly logger: LoggerInterface,
              protected readonly configService: ConfigInterface) {
    this._router = Router();
  }

  get router() {
    return this._router;
  }

  addRoute<T extends string>(route: RouteInterface<T>) {
    const routeHandler = asyncHandler(route.handler.bind(this));
    const middlewares = route.middlewares?.map(
      (middleware) => asyncHandler(middleware.execute.bind(middleware))
    );

    const allHandlers = middlewares ? [...middlewares, routeHandler] : routeHandler;
    this._router[route.method](route.path, allHandlers);
  }

  public send<T>(res: Response, statusCode: number, data: T): void {
    res.type('application/json').status(statusCode).json(data);
  }

  public created<T>(res: Response, data: T): void {
    this.send(res, StatusCodes.CREATED, data);
  }

  public noContent<T>(res: Response, data: T): void {
    this.send(res, StatusCodes.NO_CONTENT, data);
  }

  public ok<T>(res: Response, data: T): void {
    this.send(res, StatusCodes.OK, data);
  }
}
