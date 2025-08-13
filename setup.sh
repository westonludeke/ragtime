#!/bin/bash

echo "🚀 Setting up Ragtime - Documentation RAG Chatbot"
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found in backend directory."
    echo "Please create a .env file with your OpenAI API key:"
    echo "OPENAI_API_KEY=sk-your-openai-api-key-here"
    echo "PORT=3000"
    echo "NODE_ENV=development"
fi

cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install

cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start the application:"
echo "1. Create a .env file in the backend directory with your OpenAI API key"
echo "2. Start the backend: cd backend && npm run dev"
echo "3. Start the frontend: cd frontend && npm run dev"
echo ""
echo "The app will be available at:"
echo "- Frontend: http://localhost:3001"
echo "- Backend API: http://localhost:3000"
echo ""
echo "Happy coding! 🎉"
