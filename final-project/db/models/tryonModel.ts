import { put, del } from '@vercel/blob';
import { database } from "../config/mongodb";
import { ObjectId } from 'mongodb';
import UserModel from './userModel';
export default class TryOnModel {
  static collection() {
    return database.collection("cosplay");
  }

  static async UserTryOn(yourImg: File, cosImg: string, userId: string, name: string, theme: string) {
    const user = await UserModel.collection().findOne({ "_id": new ObjectId(userId) });
    if (!user || user.token <= 0) {
      throw { message: "Insufficient tokens to perform Try-On.", status: 402 };
    }

    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
    let blob1;

      blob1 = await put(yourImg.name, yourImg, {
        access: 'public',
        addRandomSuffix: true
      });

      const validator = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.API_VALIDATOR}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: process.env.VALIDATOR_MODEL || 'openrouter/free',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Tugas: Tentukan apakah gambar yang diberikan merupakan foto manusia dengan tubuh terlihat penuh (full body).
Kriteria "true": Foto manusia nyata, terlihat seluruh tubuh dari kepala hingga kaki tanpa terpotong.
Kriteria "false": Terpotong, bukan manusia, animasi/kartun, atau buram.
Balas HANYA dengan kata: true atau false.`,
                },
                {
                  type: 'image_url',
                  // Format OpenAI/OpenRouter: image_url harus object { url }, bukan string
                  // https://openrouter.ai/docs/features/multimodal/images
                  image_url: { url: blob1.url },
                },
              ],
            },
          ],
        }),
      });

      if (!validator.ok) {
        throw new Error(`Validator HTTP error! Status: ${validator.status}`);
      }

      const validatorData = await validator.json();
      const validationResult = validatorData.choices?.[0]?.message?.content?.trim().toLowerCase();

      if (!validationResult || !validationResult.includes('true')) {
        throw { message: 'Please upload a Full-body Picture!', status: 400 };
      }

      const response = await fetch('https://api.fashn.ai/v1/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.API_FASHN}`
        },
        body: JSON.stringify({
          model_name: "tryon-max",
          inputs: {
            product_image: cosImg,
            model_image: blob1.url
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Fashn API HTTP error! Status: ${response.status} - ${errorText}`);
      }

      const result = await response.json();

      if (!result.id) {
        throw new Error("Gagal mendapatkan Task ID dari Fashn.ai");
      }

      let result2;
      let isFinished = false;
      const maxRetries = 30; 
      let attempts = 0;

      while (!isFinished) {
        attempts++;
        if (attempts > maxRetries) {
          throw new Error("Proses try-on memakan waktu terlalu lama (Timeout)");
        }

        await delay(2750); 

        try {
          const response2 = await fetch(`https://api.fashn.ai/v1/status/${result.id}`, {
            headers: {
              'Authorization': `Bearer ${process.env.API_FASHN}`
            }
          });

          if (!response2.ok) continue; 

          result2 = await response2.json();

          if (result2.status === 'completed') {
            isFinished = true;
          } else if (result2.status === 'failed') {
            throw new Error(result2.error || "Proses generasi gambar gagal di server Fashn.ai");
          }
        } catch (pollError: any) {
          if (pollError.message && pollError.message.includes('generasi gambar gagal')) throw pollError;
          console.warn(`Polling attempt ${attempts} failed, retrying...`, pollError);
        }
      }

      const AIimg = result2?.output?.[0];
      if (!AIimg) {
        throw new Error("Hasil output gambar dari Fashn.ai tidak ditemukan.");
      }

      const payload = {
        UserId: userId,
        AiImgUrl: AIimg,
        Name: name,
        createdAt: new Date(),
        Theme: theme,
        UserImg: blob1.url
      };

      await Promise.all([
        this.collection().insertOne(payload),
        UserModel.collection().updateOne(
          { "_id": new ObjectId(userId), token: { $gt: 0 } },
          { $inc: { "token": -1 } }
        )
      ]);

      return AIimg;

  }

  static async getHistory(userId: string) {
    const data = await this.collection()
      .find({ "UserId": userId })
      .sort({ createdAt: -1 }) 
      .toArray();
      
    return data;
  }
} 