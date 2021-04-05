import { UsernamePasswordInput } from "../resolvers/UsernamePasswordInput"

export const validateRegister = (options: UsernamePasswordInput) => {
    if (options.username.length < 3) {
        return [{
            field: 'username',
            message: 'Username must contain at least 3 characters'
        }]
    }
    if (options.username.includes('@')) {
        return [{
            field: 'username',
            message: 'Invalid Username, must not contain an @ symbol'
        }]
    }
    if (options.password.length < 3) {
        return [{
            field: 'password',
            message: 'Password must contain at least 3 characters'
        }]
    }
    if (!options.email.match(/^.+@.+\..{2,3}$/)) {
        return [{
            field: 'email',
            message: 'Invalid email'
        }]
    }
    return null;
}