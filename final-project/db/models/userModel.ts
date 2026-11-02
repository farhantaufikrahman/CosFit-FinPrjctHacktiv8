import * as z from "zod";
import { hashSync } from "bcryptjs";
import { database } from "../config/mongodb";
import { ObjectId } from "mongodb";


const UserSchema = z.object({
    email: z.email({ message: "Invalid email address" }),
    username: z
        .string()
        .min(3, { message: "Username must be at least 3 characters long" }),
    password: z
        .string()
        .min(6, { message: "Password must be at least 6 characters long" }),
});


export default class UserModel {
    
    static collection(){
        return database.collection("users")
    }

    static async findByEmail(email: string){
        const user = await this.collection().findOne({email: email})
        return user

    }
    
    static async register(userData: z.infer<typeof UserSchema>)
    {
        const parsedData = UserSchema.parse(userData)
        const existingUser = await this.collection().findOne({
            email: parsedData.email
        })

        if(existingUser)
        {
            throw {message: "Email already exists", status: 400}
        }

        parsedData.password = hashSync(parsedData.password, 10)

        const result = await this.collection().insertOne({...parsedData, token: 5, role: "User", createdAt: new Date(), updatedAt: new Date(), claimedAt: new Date(), UserImg: "https://i.pinimg.com/originals/8a/e9/e9/8ae9e92fa4e69967aa61bf2bda967b7b.jpg?nii=t"})
        return {msg: "User created with ID: " + result.insertedId, insertedId: result.insertedId}
    }

    static async addToken (userId: string){
        const checkToken = await this.collection().findOne({"_id": new ObjectId(userId)})
        if (!checkToken) {
  throw { message: "User not found", status: 404 };
}
        if(checkToken.token !== 0){
            throw {message: `Spend all your token to claim more token`, status: 400}
        }
        const oneWeek = 7 * 24 * 60 * 60 * 1000;

const lastClaim = checkToken.claimedAt ? new Date(checkToken.claimedAt).getTime() : 0;
if (Date.now() - lastClaim < oneWeek) {
  throw {
    message: "You must wait 1 week to claim more token",
    status: 400,
  };
}

        const result = await this.collection().updateOne(
  { _id: new ObjectId(userId) },
  {
    $set: {
      token: 5,
      claimedAt: new Date(),
    },
  }
);
        return {message: `Success to claim Token`}
    }

    static async checkToken(userId: string){
    const agg = [
  {
    '$match': {
      '_id': new ObjectId(userId)
    }
  }, {
    '$project': {
      'password': false, 
      '_id': false, 
      'username': false, 
      'email': false, 
      'createdAt': false,
      'updatedAt': false,
      'userImg': false,

    }
  }
];
const result = await this.collection().aggregate(agg).toArray()
return result[0]
    }

    static async topUpToken(userId: string, credit: number){
      const res = await this.collection().updateOne({_id: new ObjectId(userId)}, {$inc:{token: Number(credit)}})
      return res
    }
}