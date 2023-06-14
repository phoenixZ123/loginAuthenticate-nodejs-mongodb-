import mongoose from "mongoose";
import validator from 'validator';
const UserSchema = mongoose.Schema({
    email: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} is not a valid email',
            isAsync: false
        }
    },
    password: {
        type: String,
        require: true,
    }
});
export const User = mongoose.model('User', UserSchema);