# KeySys

An **HWID-based Key System** for revenue creation – a quick and easy licensing solution for software monetization. If you know what you’re doing, this project will help you generate and validate keys based on hardware IDs. (Disclaimer: This was built in 30 minutes, so it's a prototype. Feel free to improve and customize as needed!)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Endpoints](#endpoints)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgements](#acknowledgements)

---

## Overview

KeySys is a Node.js/Express application designed to create a licensing system that ties temporary software keys to a user’s hardware ID (HWID). By integrating with [Linkvertise](https://linkvertise.com/), the system can also drive revenue through redirections. The system uses MongoDB for storing keys and check-point data, and includes basic rate-limiting to protect endpoints.

---

## Features

- **HWID-Based Licensing:** Ensure keys are bound to a unique hardware identifier.
- **Step-Based Workflow:** A multi-step process (/c1, /c2, /getkey) for generating and verifying keys.
- **Revenue Integration:** Uses Linkvertise redirection to generate revenue.
- **Rate Limiting:** Protect endpoints from abuse using `express-rate-limit`.
- **MongoDB Storage:** Persist key and checkpoint data efficiently.
- **Quick Setup:** Minimal dependencies for a rapid prototype.

---

## Prerequisites

- **Node.js** (v14 or higher recommended)
- **MongoDB** (local or remote instance)
- A **Linkvertise account** and your corresponding **LINKVERTISE_ID**

---

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/crazycatdev/keysys.git
   cd keysys
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up your environment variables:** See the [Configuration](#configuration) section below.

4. **Start the server:**

   ```bash
   node index.js
   ```

   The server should be listening on the port specified in your `.env` file.

---

## Configuration

Modify the `.env` file in the project root with the following variables:

```env
# MongoDB connection URL
DB_URL=mongodb://localhost:27017/keysys

# Your Linkvertise ID
LINKVERTISE_ID=69420

# Port on which your server runs
PORT=3000

# Base URL of your server (without port)
FULL_URL=http://localhost

# Key expiration time in milliseconds (86400000 ms = 1 day)
KEY_TIME=86400000
```

> **Note:** Environment variables in the `.env` file are static strings. For any dynamic URL concatenation or key math, handle it directly in your JavaScript code.

---

## Endpoints

### GET `/`
- **Purpose:** Simple health check.
- **Response:** "hello world"

### GET `/c1`
- **Purpose:** Initiate the key generation process.
- **Parameters:** `hwid` (query parameter)
- **Workflow:**
  - Checks if the HWID already has a key.
  - Generates a step token and creates a checkpoint.
  - Redirects the user to a Linkvertise URL (integrated for revenue generation).

### GET `/c2`
- **Purpose:** Validate the first step.
- **Parameters:** `stepToken` (query parameter to mitigate replay attacks)
- **Workflow:**
  - Validates the checkpoint based on the IP address and step token.
  - Enforces a wait time to ensure Linkvertise is completed.
  - Updates the checkpoint and redirects to `/getkey` with a new token.

### GET `/getkey`
- **Purpose:** Finalize the key generation.
- **Parameters:** `stepToken` (query parameter to mitigate replay attacks)
- **Workflow:**
  - Validates the checkpoint.
  - Generates a new key via the `keygen` function.
  - Saves the key along with an expiration timestamp (`endsAt`).
  - Deletes the checkpoint and returns the key.

### GET `/checkkey`
- **Purpose:** Validate an existing key.
- **Parameters:** `key` and `hwid` (query parameters)
- **Workflow:**
  - Checks if the key exists for the given HWID.
  - Validates whether the key is still active (not expired).

---

## Usage

1. **Key Generation Flow:**
   - **Step 1:** User accesses `/c1` with a provided HWID.
   - **Step 2:** After redirection (Linkvertise), the user is taken to `/c2` to verify the process.
   - **Step 3:** Finally, the user is redirected to `/getkey` where a new key is generated and provided.
   
2. **Key Validation:**
   - A separate endpoint `/checkkey` allows your application to verify if a key is valid and not expired.

3. **Customization:**
   - Feel free to modify the rate limits, token expiration times, or even the revenue integration strategy as per your needs.

---

## Contributing

Contributions are welcome! If you’d like to contribute improvements or fixes:
1. Fork the repository.
2. Create a new branch (`git checkout -b feature/my-feature`).
3. Commit your changes and push your branch.
4. Open a pull request explaining your changes.

---

## License

This project is released under the [MIT License](LICENSE).

---

## Acknowledgements

- **crazycatdev** – For developing this quick and innovative solution.
- Thanks to the open-source community for the libraries and tools that make rapid prototyping possible.

---

Make your project your own – tweak, optimize, and let it evolve! Enjoy building with KeySys.

