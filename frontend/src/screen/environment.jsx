let IS_PROD = false;
const server = IS_PROD ?
    "https://ai-agent-2-1.onrender.com" :

    "http://localhost:5000"


export default server;