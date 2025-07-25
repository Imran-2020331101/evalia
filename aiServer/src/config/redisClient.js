const redis = require("redis");

const client = redis.createClient({
    url: "redis://localhost:6379",
});

client.on("error", (err) => console.log("Redis Client Error", err));

(async () => {
    await client.connect();
    console.log("Connected to Memurai!");
    
    await client.set("test", "hello from memurai");
    const value = await client.get("test");
    console.log("Value:", value); 
})();

module.exports = client;