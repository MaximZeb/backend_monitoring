import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
    login: string;
    password: string;
    name: string;
    surname: string;
    middleName: string;
    position: string;
    division: string;
}

const userSchema = new Schema<IUser>({
    login: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    surname: { type: String, required: true },
    middleName: { type: String, required: true },
    position: { type: String, required: true },
    division: { type: String, required: true },
});

const User = mongoose.model<IUser>('User', userSchema);

export default User;