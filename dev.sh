#!/bin/bash

echo "🚀 Starting Ragtime Development Servers"
echo "========================================"

# Function to cleanup background processes on exit
cleanup() {
    echo "🛑 Shutting down servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Check if .env file exists
if [ ! -f backend/.env ]; then
    echo "❌ No .env file found in backend directory."
    echo "Please create backend/.env with your OpenAI API key:"
    echo "OPENAI_API_KEY=sk-your-openai-api-key-here"
    exit 1
fi

# Start backend server
echo "🔧 Starting backend server..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend server
echo "🎨 Starting frontend server..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Servers started successfully!"
echo ""
echo "🌐 Frontend: http://localhost:3001"
echo "🔧 Backend API: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Wait for background processes
wait
