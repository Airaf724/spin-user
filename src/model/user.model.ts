import mongoose , {Document , Schema} from "mongoose";

export interface IUser extends Document {
    username: string;
    email: string;
    password?: string;
    picture?: string;
    points: number;
    diamonds: number;
    availableSpins: number;
    contestPoints: number;
    lastAdWatched?: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema : Schema<IUser> = new Schema({
    username: {
        type: String,   
        required: true,
    },
    email: {
        type: String,   
        required: true,
        unique: true,
    },
    password: {
        type: String,   
    },
    picture: {
        type: String,   
    },
    points: { 
        type: Number,
        default: 0 
    },
    diamonds: { 
        type: Number, 
        default: 0 
    },
    availableSpins: { 
        type: Number, 
        default: 0 
    },
    contestPoints: { 
        type: Number, 
        default: 0 
    },
    lastAdWatched: { 
        type: Date, 
        default: null 
    },
    createdAt: {
        type: Date,
        default: Date.now,  
    },
    updatedAt: {
        type: Date, 
        default: Date.now,
    }
},{
    timestamps: true,      
});

const User = mongoose.model<IUser>("User", userSchema);

export default User;