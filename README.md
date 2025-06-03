# Ragtime

**Ragtime** is a minimalist internal RAG (Retrieval-Augmented Generation) chatbot designed to help engineers query technical documentation using natural language. It supports file upload, chunking, embedding via OpenAI, and vector search using Chroma.

---

## 🧠 Features

* Upload and ingest `.md` or `.txt` documents
* Automatically chunk documents into sections
* Generate embeddings using OpenAI's `text-embedding-3-small`
* Store and retrieve vectors using Chroma
* Query documents via a simple REST API

---

## 🧰 Stack

| Layer     | Tech Used                                    |
| --------- | -------------------------------------------- |
| Backend   | Node.js, Express                             |
| Embedding | OpenAI API                                   |
| Vector DB | [Chroma](https://www.trychroma.com/) (local) |
| Other     | dotenv, multer                               |

---

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/ragtime.git
cd ragtime/backend
```

---

### 2. Set up your environment

Make sure you’re using **Node.js** and **Python 3.10+**.

#### a) Node packages

```bash
npm install
```

#### b) Python virtual environment (recommended)

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install chromadb uvicorn
```

---

### 3. Configure environment variables

Create a `.env` file in the `backend/` directory:

```
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

### 4. Start the Chroma server

From inside the Python virtual environment:

```bash
uvicorn chromadb.app:app --host 0.0.0.0 --port 8000
```

Keep this running in its own terminal tab.

---

### 5. Start the backend server

In a separate terminal (still in `backend/`):

```bash
node server.js
```

---

## 📂 Directory Structure

```
backend/
├── routes/
│   ├── upload.js      # For uploading/ingesting docs
│   └── query.js       # For answering user questions
├── services/
│   ├── chunker.js     # Breaks docs into chunks
│   ├── embedder.js    # Calls OpenAI to get embeddings
│   └── retriever.js   # Vector search using Chroma
├── .env               # API keys
├── package.json
├── server.js          # Entry point
└── ...
```

---

## 🧪 Testing

### Upload a file

```bash
curl -X POST http://localhost:3000/upload \
  -H "Content-Type: multipart/form-data" \
  -F "file=@your-doc.md"
```

### Ask a question

```bash
curl -X POST http://localhost:3000/query \
  -H "Content-Type: application/json" \
  -d '{"query": "What is this document about?"}'
```

---

## ✅ Status

✅ Minimal backend working


✅ Document upload + chunking + embedding

✅ Chroma vector storage + retrieval

🛠 Frontend not built yet