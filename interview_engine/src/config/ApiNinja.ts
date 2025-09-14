import axios from "axios";
export async function similarityAPINinjas(text1: string, text2: string) {
  const res = await axios.post("https://api.api-ninjas.com/v1/textsimilarity", {
    text_1: text1,
    text_2: text2
  }, { headers: { "X-Api-Key": process.env.API_NINJAS_KEY }});
  return res.data.similarity;  // e.g. 0.77
}
