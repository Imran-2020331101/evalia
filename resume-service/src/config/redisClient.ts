import { createClient, RedisClientType } from "redis";

const client: RedisClientType = createClient({
    url: "redis://localhost:6379",
});

client.on("error", (err: Error) => console.log("Redis Client Error", err));

(async (): Promise<void> => {
    await client.connect();
    console.log("Connected to Memurai!");
    
    await client.set("test", "hello from memurai");
    const value: string | null = await client.get("test");
    console.log("Value:", value); 
})();

export default client;