const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { execFile } = require("child_process");
require("dotenv").config();

const app = express();
const PORT = 4000;

const PRINT_ENABLED = process.env.PRINT_ENABLED === "true";
const PRINTER_NAME = process.env.PRINTER_NAME || "";

app.use(cors());
app.use(express.json({ limit: "50mb" }));

app.use(express.static(path.join(__dirname, "../client")));

const outputDir = path.join(__dirname, "output");

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Tamoom server is running",
    printEnabled: PRINT_ENABLED,
    printerName: PRINTER_NAME || null,
  });
});

app.post("/print", async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({
        success: false,
        error: "No image received",
      });
    }

    const base64Data = image.replace(/^data:image\/png;base64,/, "");
    const fileName = `strip-${Date.now()}.png`;
    const filePath = path.join(outputDir, fileName);

    fs.writeFileSync(filePath, base64Data, "base64");

    console.log("Saved:", fileName);

    if (PRINT_ENABLED) {
      await printImage(filePath);
      console.log("Printed:", fileName);
    } else {
      console.log("Print skipped. SAVE_ONLY mode.");
    }

    res.json({
      success: true,
      fileName,
      printed: PRINT_ENABLED,
    });
  } catch (error) {
    console.error("Server error:", error);

    res.status(500).json({
      success: false,
      error: error.message || "Server failed",
    });
  }
});

function printImage(filePath) {
  return new Promise((resolve, reject) => {
    if (!PRINTER_NAME) {
      return reject(new Error("PRINTER_NAME is missing in .env"));
    }

    execFile(
      "mspaint.exe",
      ["/pt", filePath, PRINTER_NAME],
      (error) => {
        if (error) {
          return reject(error);
        }

        resolve();
      }
    );
  });
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Tamoom server running on http://localhost:${PORT}`);
  console.log(`PRINT_ENABLED: ${PRINT_ENABLED}`);
  console.log(`PRINTER_NAME: ${PRINTER_NAME || "not set"}`);
});