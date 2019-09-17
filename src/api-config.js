let backendHost;

if (process.env.NODE_ENV === "production") {
   backendHost = "http://bridge.trevr.xyz/";
} else {
   backendHost = "http://localhost/";
}

export const API_ROOT = `${backendHost}`;
