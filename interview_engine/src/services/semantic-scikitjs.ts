import * as sc from "scikitjs";
import * as tf from "@tensorflow/tfjs";
import OpenAI from "openai";
import logger from "../utils/logger";

export class MatchingService {

    private openai       : OpenAI;
    private defaultModel : string;
    
    constructor(apiKey?: string) {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        })
        this.defaultModel = 'text-embedding-3-small';
    }

    /**
    * Create embedding from a single text string
    */
    async createEmbedding( text: string ): Promise<number[]> {
        try {
        if (!text || text.trim().length === 0) {
            throw new Error('Text input cannot be empty');
        }

        const response = await this.openai.embeddings.create({
            model: this.defaultModel || 'text-embedding-3-small',
            input: text.trim(),
            encoding_format: "float",
        });

        const embedding = response.data[0].embedding;
        
        return embedding;
        } catch (error) {
        logger.error('Error creating embedding:', error);
        throw error;
        }
    }

    /**
     * Compute cosine similarity between two numeric arrays using tfjs (fast).
     * Returns a number in [-1, 1].
     */
    cosineTfRaw(vecA: number[], vecB: number[]): number {
        if (vecA.length !== vecB.length) {
            throw new Error("Vector lengths must match");
        }

        // tf.tidy to keep memory clean
        return tf.tidy(() => {
            const a = tf.tensor1d(vecA);
            const b = tf.tensor1d(vecB);
            const dot = a.mul(b).sum(); // scalar
            const normA = a.norm(); // scalar
            const normB = b.norm(); // scalar
            const denom = normA.mul(normB);
            // if denom is zero -> return 0 similarity
            const zero = tf.scalar(0);
            const safeDenom = denom.equal(zero).arraySync() ? tf.scalar(Number.EPSILON) : denom;
            const cos = dot.div(safeDenom);
            const cosNum = (cos.arraySync() as number) ?? 0;
            // cleanup done by tidy
            return cosNum;
        });
    }

    /**
     * Public API: returns similarity in 0..1
     */
    async semanticSimilarity(a: string, b: string): Promise<number> {

        if (!a && !b) return 1;
        if (!a || !b) return 0;

        // ensure scikitjs is loaded (no-op if already initialized).
        // scikitjs loads TF backend underneath; calling ready keeps intent explicit.
        try {
            // sc.ready() isn't strictly necessary in many installs, but calling won't hurt.
            // If scikitjs does not export ready in your version, this will be a no-op.
            // @ts-ignore
            if (typeof sc.ready === "function") {
            // some versions expose a ready/init function
            // @ts-ignore
            await sc.ready();
            }
        } catch {
            // ignore: scikitjs initialization errors are non-fatal for our tiny compute (we use tfjs directly)
        }

        // fetch embeddings in parallel
        const [embA, embB] = await Promise.all([this.createEmbedding(a), this.createEmbedding(b)]);
        // compute cosine in [-1,1]
        const cos = this.cosineTfRaw(embA, embB);
        // map to 0..1 for easier interpretation
        const normalized = this.cosTo01(cos);
        return normalized;
    }


    // utility:
    /** Convert cosine (-1..1) to 0..1 */
    cosTo01(cos: number) {
        return Math.max(0, Math.min(1, (cos + 1) / 2));
    }

}

export const matchingService = new MatchingService();



