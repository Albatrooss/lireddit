"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRegister = void 0;
const validateRegister = (options) => {
    if (options.username.length < 3) {
        return [{
                field: 'username',
                message: 'Username must contain at least 3 characters'
            }];
    }
    if (options.username.includes('@')) {
        return [{
                field: 'username',
                message: 'Invalid Username, must not contain an @ symbol'
            }];
    }
    if (options.password.length < 3) {
        return [{
                field: 'password',
                message: 'Password must contain at least 3 characters'
            }];
    }
    if (!options.email.match(/^.+@.+\..{2,3}$/)) {
        return [{
                field: 'email',
                message: 'Invalid email'
            }];
    }
    return null;
};
exports.validateRegister = validateRegister;
//# sourceMappingURL=validateRegister.js.map