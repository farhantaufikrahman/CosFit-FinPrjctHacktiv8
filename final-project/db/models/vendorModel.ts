import * as z from "zod";
import { hashSync } from "bcryptjs";
import { database } from "@/db/config/mongodb";
import { ObjectId } from "mongodb";
import { GetVendor } from "@/app/types";

const VendorSchema = z.object({
  namaToko: z.string().min(1, { message: "Nama Toko is required" }),
  alamat: z.string(),
  email: z.email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" }),
});

export default class VendorModel {
  static collection() {
    return database.collection("vendors");
  }

  static async findByEmail(email: string) {
    const vendor = await this.collection().findOne({ email: email });
    return vendor;
  }

  static async register(vendorData: z.infer<typeof VendorSchema>) {
    const parsedData = VendorSchema.parse(vendorData);
    const existingvendor = await this.collection().findOne({
      email: parsedData.email,
    });

    if (existingvendor) {
      throw { message: "Email already exists", status: 400 };
    }

    parsedData.password = hashSync(parsedData.password, 10);

    const result = await this.collection().insertOne({...parsedData, role: "Vendor", userImg: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTA-J3va8GAjJlVToUyMEcYWVD_8l9zau-wM2NdOgUh-w&s=10"});
    return "Vendor created with ID: " + result.insertedId;
  }

  static async getProfile(vendorId: string) {
    const agg = [
      {
        $match: {
          _id: new ObjectId(vendorId),
        },
      },
      {
        $project: {
          "password": false,
        },
      },
    ];
    const profile = await this.collection().aggregate(agg).toArray();
    return profile[0];
  }

  static async putProfile(profileData: Partial<GetVendor> & { userImg?: string }, vendorId: string) {
    // Whitelist: body tidak boleh mengubah password/role/email/_id
    const update: Record<string, unknown> = {};
    for (const key of ["namaToko", "alamat", "norek", "userImg"] as const) {
      if (profileData[key] !== undefined) update[key] = profileData[key];
    }

    const result = await this.collection().updateOne(
      // Sebelumnya filter `{ vendorId }` -> field itu tidak ada di collection vendors,
      // jadi update tidak pernah mengenai dokumen apa pun.
      { _id: new ObjectId(vendorId) },
      { $set: update },
    );
    if (result.matchedCount === 0) {
      throw { message: "Vendor not found", status: 404 };
    }
    return "Profile updated";
  }
}
