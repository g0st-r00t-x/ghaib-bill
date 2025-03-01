import express from "express";
import { RouterOSClient } from "routeros-client";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "OPTIONS"],
        credentials: true,
    },
    transports: ["websocket", "polling"], // Support kedua mode transport
});
const PORT = 8080;

// Konfigurasi MikroTik
const api = new RouterOSClient({
    host: "103.139.193.128",
    port: 1091,
    user: "j2",
    password: "2",
    keepalive: true,
    timeout: 10,
});

// Variabel untuk menyimpan koneksi client
let clientConnection = null;

// Fungsi untuk mendapatkan koneksi client
const getClient = async () => {
    try {
        if (!clientConnection) {
            clientConnection = await api.connect();
        }
        return clientConnection;
    } catch (error) {
        console.error("Error establishing connection:", error.message);
        clientConnection = null; // Reset connection on error
        throw error;
    }
};

// Fungsi untuk mendapatkan identitas MikroTik
const getMikroTikIdentity = async () => {
    try {
        const client = await getClient();
        const result = await client.menu("/system identity").getOnly();
        return result;
    } catch (error) {
        console.error("Error fetching identity:", error.message);
        throw error;
    }
};

// Fungsi untuk mendapatkan active PPP
const getActivePPP = async () => {
    try {
        const client = await getClient();
        const result = await client.menu("/ppp active").getAll();
        return result;
    } catch (error) {
        console.error("Error fetching active PPP:", error.message);
        throw error;
    }
};

// Fungsi untuk mendapatkan active hotspot
const getActiveHotspot = async () => {
    try {
        const client = await getClient();
        const result = await client.menu("/ip hotspot active").getAll();
        return result;
    } catch (error) {
        console.error("Error fetching active hotspot:", error.message);
        throw error;
    }
};

// Fungsi untuk mendapatkan semua data PPP
const getAllPPPData = async () => {
    try {
        const client = await getClient();
        const pppSecret = await client.menu("/ppp secret print").getAll();
        const pppActive = await client.menu("/ppp active print").getAll();

        // Buat mapping untuk mempermudah pencarian uptime berdasarkan username
        const activeUsersMap = new Map(
            pppActive.map((user) => [user.name, user])
        );

        // Tambahkan properti is_active dan uptime
        const enrichedPPPSecret = pppSecret.map((user) => {
            const activeUser = activeUsersMap.get(user.name);
            return {
                ...user,
                is_active: !!activeUser, // true jika user aktif, false jika tidak
            };
        });

        // Filter user yang tidak aktif
        const pppInactive = enrichedPPPSecret.filter((user) => !user.is_active);

        return {
            pppSecret: enrichedPPPSecret,
            pppActive,
            pppInactive,
        };
    } catch (error) {
        console.error("Error fetching PPP data:", error.message);
        throw error;
    }
};

// API Endpoint
app.get("/api/identity", async (req, res) => {
    try {
        const identity = await getMikroTikIdentity();
        res.json({ identity });
    } catch (error) {
        res.status(500).json({ error: "Gagal mendapatkan identitas MikroTik" });
    }
});

app.get("/api/ppp-data", async (req, res) => {
    try {
        const pppData = await getAllPPPData();
        res.json(pppData);
    } catch (error) {
        res.status(500).json({ error: "Gagal mendapatkan data PPP" });
    }
});

app.get("/api/ppp-active", async (req, res) => {
    try {
        const activePPP = await getActivePPP();
        res.json({ activePPP });
    } catch (error) {
        res.status(500).json({ error: "Gagal mendapatkan daftar PPP aktif" });
    }
});

app.get("/api/hotspot-active", async (req, res) => {
    try {
        const activeHotspot = await getActiveHotspot();
        res.json({ activeHotspot });
    } catch (error) {
        res.status(500).json({
            error: "Gagal mendapatkan daftar hotspot aktif",
        });
    }
});

// Function to handle disconnects and reconnects
const handleConnection = async () => {
    try {
        if (!clientConnection) {
            clientConnection = await api.connect();
            console.log("Connected to MikroTik router");
        }
    } catch (error) {
        console.error("Connection error:", error.message);
        clientConnection = null;
        // Try to reconnect after a delay
        setTimeout(handleConnection, 5000);
    }
};

// Initial connection
handleConnection();

// Fungsi untuk mengirim data secara real-time
const sendRealTimeData = async () => {
    try {
        const pppData = await getAllPPPData();
        io.emit("pppDataUpdate", pppData);
    } catch (error) {
        console.error("Error sending real-time data:", error.message);
        // If we get a connection error, attempt to reconnect
        if (
            error.message.includes("ALRDYCONNECTING") ||
            error.message.includes("connection")
        ) {
            clientConnection = null;
            handleConnection();
        }
    }
};

// Panggil sendRealTimeData setiap 5 detik
setInterval(sendRealTimeData, 1000);

io.on("connection", (socket) => {
    console.log("Client terhubung:", socket.id);
    sendRealTimeData(); // Kirim data saat pertama kali terhubung

    socket.on("disconnect", () => {
        console.log("Client terputus:", socket.id);
    });
});

// Route utama
app.get("/", (req, res) => {
    res.send("API MikroTik dengan Express.js (ESM)");
});

// Graceful shutdown handling
process.on("SIGINT", async () => {
    console.log("Shutting down gracefully...");
    if (clientConnection) {
        try {
            await api.disconnect();
            console.log("Disconnected from MikroTik");
        } catch (error) {
            console.error("Error during disconnect:", error.message);
        }
    }
    process.exit(0);
});

// Jalankan server
server.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
