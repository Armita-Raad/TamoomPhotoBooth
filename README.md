# Tamoom Photobooth

A self-running iPad photobooth web app for the Tamoom event.

Guests tap **Start**, the app opens the iPad camera, takes 4 photos automatically with a countdown, creates a final photo strip, sends it to a local laptop server, and the laptop saves/prints the strip.

---

## Project Structure

```text
tamoom-photobooth/
│
├── client/
│   ├── index.html
│   ├── style.css
│   └── app.js
│
├── server/
│   ├── server.js
│   ├── .env
│   └── output/
│
├── START_SERVER.bat
├── FIND_PRINTERS.bat
└── README.md
```

---

## What This Project Does

```text
iPad Safari
    ↓
Photobooth Web App
    ↓
Takes 4 Photos
    ↓
Creates Final Strip
    ↓
Sends Image to Laptop Server
    ↓
Server Saves Image
    ↓
Optional: Server Sends Image to Printer
```

---

## Requirements

Install these before running the project:

### 1. Node.js

Download and install Node.js:

```text
https://nodejs.org/
```

Use the **LTS** version.

After installing, open Command Prompt and check:

```bash
node -v
npm -v
```

If both commands show version numbers, Node.js is installed correctly.

---

## Setup

### 1. Download the project

Download or clone this repository to the Windows laptop.

Example location:

```text
Desktop/tamoom-photobooth
```

---

### 2. Install dependencies

Open Command Prompt inside the project folder and run:

```bash
cd server
npm install
```

This installs the required server packages.

---

## Server Configuration

Inside the `server` folder, create a file named:

```text
.env
```

Add this content:

```env
PRINT_ENABLED=false
PRINTER_NAME=
```

### What this means

```env
PRINT_ENABLED=false
```

The server will only save the final photo strip inside:

```text
server/output/
```

It will NOT print yet.

This is the safest mode for testing.

---

## Start the App

### Option 1: Recommended

Double-click:

```text
START_SERVER.bat
```

The server should start and show something like:

```text
Tamoom server running on http://localhost:4000
PRINT_ENABLED: false
PRINTER_NAME: not set
```

Keep this window open while using the photobooth.

---

### Option 2: Manual Start

Open Command Prompt:

```bash
cd server
node server.js
```

---

## Test on the Laptop

Open this address on the laptop browser:

```text
http://localhost:4000
```

You should see the Tamoom Photobooth web app.

Click **Start**.

The app should:

```text
1. Open the camera
2. Take 4 photos
3. Create the final strip
4. Show "Printing..."
5. Show "Grab your strip!"
6. Save a PNG file inside server/output/
```

If a PNG file appears inside `server/output/`, the app is working.

---

## Test on iPad Using Same Wi-Fi

The iPad and laptop must be connected to the same Wi-Fi network.

For the event, a private Wi-Fi router is recommended.

Internet is NOT required if the iPad and laptop are on the same local network.

---

### 1. Find the laptop IP address

On the Windows laptop, open Command Prompt and run:

```bash
ipconfig
```

Look for:

```text
IPv4 Address
```

Example:

```text
192.168.1.108
```

---

### 2. Open the app on iPad

On iPad Safari, open:

```text
http://LAPTOP-IP:4000
```

Example:

```text
http://192.168.1.108:4000
```

Tap **Start** and allow camera access.

After the photo session, check the laptop folder:

```text
server/output/
```

A new PNG strip should appear there.

---

## If iPad Cannot Open the Laptop Address

Try these fixes:

### 1. Make sure both devices are on the same Wi-Fi

The laptop and iPad must be connected to the same network.

---

### 2. Try a private router

Some public Wi-Fi networks, hotspots, libraries, cafés, and school networks block device-to-device communication.

For the event, use a private Wi-Fi router if possible.

The router does not need internet.

It only needs to connect:

```text
iPad
Laptop
Printer
```

to the same local network.

---

### 3. Allow Node.js through Windows Firewall

When Windows asks if Node.js is allowed on private networks, click:

```text
Allow
```

If it was blocked accidentally, open:

```text
Windows Security
→ Firewall & network protection
→ Allow an app through firewall
```

Then allow Node.js on Private networks.

---

## Temporary Internet-Based Testing Option

If local Wi-Fi does not work, use Cloudflare Tunnel for testing.

Start the server first:

```bash
cd server
node server.js
```

Then in another Command Prompt window:

```bash
cloudflared tunnel --url http://localhost:4000
```

Cloudflare will give a link like:

```text
https://example.trycloudflare.com
```

Open that link on iPad Safari.

This option requires internet.

For the real event, local Wi-Fi/private router is still recommended.

---

# Printer Setup

Printing is optional during early testing.

By default:

```env
PRINT_ENABLED=false
```

This means the server only saves images.

---

## Find Printer Name

Double-click:

```text
FIND_PRINTERS.bat
```

It will show installed printer names.

Copy the exact printer name.

Example:

```text
EPSON L1250 Series
```

---

## Enable Printing

Open:

```text
server/.env
```

Change it to:

```env
PRINT_ENABLED=true
PRINTER_NAME=EPSON L1250 Series
```

Important:

The printer name must match the Windows printer name exactly.

---

## Restart the Server

After changing `.env`, close the server window and start it again:

```text
START_SERVER.bat
```

or manually:

```bash
cd server
node server.js
```

Now the server should show:

```text
PRINT_ENABLED: true
PRINTER_NAME: EPSON L1250 Series
```

---

## Test Printing

Open the app:

```text
http://localhost:4000
```

or from iPad:

```text
http://LAPTOP-IP:4000
```

Take photos.

The server should:

```text
1. Save the strip in server/output/
2. Send the image to the printer
```

---

# Event Day Checklist

Before guests arrive:

```text
1. Plug in the laptop charger
2. Plug in the printer
3. Connect printer to laptop
4. Connect iPad and laptop to the same Wi-Fi
5. Start the server
6. Open the app on iPad Safari
7. Take one test strip
8. Confirm the PNG is saved
9. Confirm the printer prints correctly
10. Keep the server window open
```

---

## Windows Settings for Event Day

Make sure the laptop does not sleep.

Go to:

```text
Settings
→ System
→ Power & battery
```

Set:

```text
Screen and sleep
```

to:

```text
Never
```

while plugged in.

---

## Recommended Event Network

Best option:

```text
Private Wi-Fi Router
```

Connect these devices to it:

```text
1. iPad
2. Windows laptop
3. Epson printer
```

Internet is not required.

Avoid public Wi-Fi because it may block iPad-to-laptop communication.

---

# Troubleshooting

## The app opens on laptop but not on iPad

Possible reasons:

```text
1. Wrong laptop IP address
2. iPad and laptop are not on the same Wi-Fi
3. Windows Firewall is blocking Node.js
4. The Wi-Fi blocks device-to-device traffic
```

Try using a private router.

---

## Camera does not open on iPad

Make sure:

```text
1. The page is opened in Safari
2. Camera permission is allowed
3. The app is opened through HTTPS if using Cloudflare
4. If using local IP, use Safari and allow camera access
```

---

## Strip is saved but not printed

Check:

```text
1. PRINT_ENABLED=true
2. PRINTER_NAME is exactly correct
3. Printer is turned on
4. Printer is connected to the laptop
5. Printer has paper and ink
6. Restart the server after editing .env
```

---

## Nothing is saved in output folder

Check:

```text
1. Server is running
2. The server window did not show an error
3. The app uses /print as the server URL
4. Try testing from laptop first using http://localhost:4000
```

---

# Important Notes

Do not use:

```js
window.print()
```

as the final printing method.

Browser printing opens a print confirmation dialog, especially on iPad Safari.

This project uses a local Node.js print server instead.

---

# Current Safe Mode

For testing without printer:

```env
PRINT_ENABLED=false
PRINTER_NAME=
```

This mode saves the photo strip but does not print.

---

# Production Mode

For event printing:

```env
PRINT_ENABLED=true
PRINTER_NAME=Exact Windows Printer Name
```

Restart the server after changing this.

---

# Final Goal

```text
Guest taps Start
    ↓
iPad takes 4 photos
    ↓
App creates branded strip
    ↓
Laptop receives image
    ↓
Laptop saves image
    ↓
Laptop prints image automatically
    ↓
App resets for next guest
```