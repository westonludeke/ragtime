# Ragtime

**Ragtime** is a modern RAG (Retrieval-Augmented Generation) chatbot designed to help engineers query technical documentation using natural language. Built with LangChain, OpenAI, Chroma, and Next.js.

---

## 🧠 Features

* **Smart Document Ingestion**: Upload `.md`, `.txt`, or `.mdx` files, or ingest directly from URLs
* **LangChain Integration**: Built on LangChain's robust RAG pipeline
* **Vector Search**: Powered by Chroma vector database with OpenAI embeddings
* **Source Attribution**: See exactly which documents were used to answer your questions
* **Modern UI**: Clean, responsive chat interface inspired by chat.langchain.com
* **Real-time Chat**: Interactive conversation with your documentation

---

## 🧰 Stack

| Layer     | Tech Used                                    |
| --------- | -------------------------------------------- |
| Backend   | Node.js, Express, LangChain                  |
| Frontend  | Next.js 14, React, TypeScript, Tailwind CSS |
| Embedding | OpenAI API (text-embedding-3-small)         |
| LLM       | OpenAI GPT-4o-mini                           |
| Vector DB | Chroma (in-memory)                           |
| Other     | Lucide React, clsx, tailwind-merge          |

---

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/ragtime.git
cd ragtime
```

### 2. Set up the backend

```bash
cd backend
npm install
```

### 3. Set up the frontend

```bash
cd ../frontend
npm install
```

### 4. Configure environment variables

Create a `.env` file in the `backend/` directory:

```env
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 5. Start the development servers

#### Backend (Terminal 1)
```bash
cd backend
npm run dev
```

#### Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```

The app will be available at:
- Frontend: http://localhost:3001
- Backend API: http://localhost:3000

---

## 📂 Directory Structure

```
ragtime/
├── backend/
│   ├── routes/
│   │   ├── upload.js      # File upload endpoints
│   │   ├── query.js       # Query processing endpoints
│   │   └── ingest.js      # Document ingestion endpoints
│   ├── services/
│   │   ├── ragService.js  # Main RAG pipeline (LangChain)
│   │   └── docIngester.js # Document fetching & processing
│   ├── .env               # API keys
│   ├── package.json
│   └── server.js          # Express server
├── frontend/
│   ├── app/
│   │   ├── globals.css    # Global styles
│   │   ├── layout.tsx     # Root layout
│   │   └── page.tsx       # Main chat interface
│   ├── lib/
│   │   └── utils.ts       # Utility functions
│   ├── package.json
│   └── tailwind.config.js # Tailwind configuration
└── README.md
```

---

## 🧪 Usage

### 1. Load LangChain Documentation

Click the "📚 Load LangChain Docs" button in the UI to automatically fetch and ingest LangChain's documentation from GitHub.

### 2. Upload Your Own Documents

Use the upload button to add your own `.md`, `.txt`, or `.mdx` files.

### 3. Ask Questions

Type natural language questions about your documentation and get AI-powered answers with source attribution.

### API Endpoints

#### Query Documents
```bash
curl -X POST http://localhost:3000/api/query \
  -H "Content-Type: application/json" \
  -d '{"query": "What is LangChain?"}'
```

#### Upload File
```bash
curl -X POST http://localhost:3000/api/upload \
  -H "Content-Type: multipart/form-data" \
  -F "file=@your-doc.md"
```

#### Ingest LangChain Docs
```bash
curl -X POST http://localhost:3000/api/ingest/langchain-docs
```

#### Get Collection Stats
```bash
curl http://localhost:3000/api/query/stats
```

---

## 🔧 Development

### Backend Development

The backend uses LangChain's RAG pipeline with:
- **Text Splitting**: RecursiveCharacterTextSplitter with 1000-character chunks
- **Embeddings**: OpenAI's text-embedding-3-small model
- **Vector Store**: Chroma with cosine similarity search
- **LLM**: GPT-4o-mini with custom prompt engineering

### Frontend Development

The frontend is built with:
- **Next.js 14**: App Router for modern React development
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Beautiful icons

---

## 🚀 Deployment

### Local Development

This project is designed for local development. To deploy to production, you would need to:

1. Set up a production server (e.g., AWS, DigitalOcean, Railway)
2. Configure environment variables
3. Set up a persistent vector database (Chroma server)
4. Deploy both backend and frontend

### Environment Variables for Production

```env
OPENAI_API_KEY=your_openai_api_key
NODE_ENV=production
PORT=3000
```

---

## ✅ Status

✅ **v1 Complete**: LangChain-based RAG pipeline

✅ **Modern UI**: Next.js frontend with chat interface

✅ **Document Ingestion**: File upload + GitHub integration

✅ **Source Attribution**: See which documents were used

✅ **Real-time Chat**: Interactive conversation interface

🛠 **Future Enhancements**:
- YouTube transcript ingestion
- Confidence scoring
- RAGAS evaluation integration
- Multi-modal document support
- Advanced filtering and search

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

