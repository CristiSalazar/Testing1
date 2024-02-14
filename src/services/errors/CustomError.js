export default class CustomError {
    static createError({ name = "Error", cause, message, code = 3 }) {
        const error = new Error(message, {cause})
        error.name = name;
        error.code = code;
        error.cause = cause;
        throw error
    }
}