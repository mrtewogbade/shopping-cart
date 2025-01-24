import { Request, Response, NextFunction } from 'express';
import AppError from '../errors/AppError';
import { IUser } from '../interfaces/IUser';


function CheckRole(allowedRoles: string | string[]) {
    const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    return (req: Request, res: Response, next: NextFunction) => {
        const user = req.user as IUser;

        if (user && rolesArray.includes(user.role)) {
            return next();
        } else {
            return next(new AppError('You are not authorized to perform this action.', 403));
        }
    };
}

export default CheckRole;
