let backendHost;

if (process.env.NODE_ENV === "production") {
   backendHost = "http://bridge.trevr.xyz/";
} else {
   backendHost = "http://192.168.0.16/";
}

export const API_ROOT = `${backendHost}`;
