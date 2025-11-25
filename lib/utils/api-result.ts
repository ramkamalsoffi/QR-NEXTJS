export class ApiResult {
    success: boolean;
    message: string;
    data?: any;
    error?: string;
    statusCode: number;

    constructor(success: boolean, message: string, statusCode: number = 200, data?: any, error?: string) {
        this.success = success;
        this.message = message;
        this.statusCode = statusCode;
        this.data = data;
        this.error = error;
    }

    static success(data?: any, message: string = 'Success', statusCode: number = 200): ApiResult {
        return new ApiResult(true, message, statusCode, data);
    }

    static error(message: string, statusCode: number = 500, error?: string): ApiResult {
        return new ApiResult(false, message, statusCode, undefined, error);
    }

    toJSON() {
        return {
            success: this.success,
            message: this.message,
            data: this.data,
            error: this.error
        };
    }
}
