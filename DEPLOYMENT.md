# Deployment Guide for Render

## Prerequisites

1. **Render Account**: Sign up at [render.com](https://render.com)
2. **GitHub Repository**: Push your code to GitHub
3. **Environment Variables**: Prepare your API keys and configuration

## Environment Variables

You'll need to set these environment variables in Render:

### Backend Environment Variables
- `XAI_API_KEY`: Your xAI API key
- `QDRANT_URL`: Your Qdrant server URL
- `COLLECTION_NAME`: Your Qdrant collection name
- `EMBED_MODEL`: Embedding model (default: all-MiniLM-L6-v2)
- `TOP_K`: Number of search results (default: 10)

### Frontend Environment Variables
- `VITE_API_URL`: Backend API URL (will be set automatically)

## Deployment Steps

### Option 1: Using render.yaml (Recommended)

1. **Push to GitHub**: Ensure your code is in a GitHub repository
2. **Connect to Render**: 
   - Go to Render Dashboard
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect the `render.yaml` file

3. **Set Environment Variables**:
   - In the backend service settings, add your environment variables
   - Mark sensitive variables (XAI_API_KEY, QDRANT_URL, COLLECTION_NAME) as "Secret"

4. **Deploy**: Render will automatically build and deploy both services

### Option 2: Manual Deployment

#### Backend Service
1. Create a new Web Service
2. Connect your GitHub repository
3. Set:
   - **Environment**: Python
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn backend:app --host 0.0.0.0 --port $PORT`
4. Add environment variables
5. Deploy

#### Frontend Service
1. Create a new Static Site
2. Connect your GitHub repository
3. Set:
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/dist`
4. Add environment variable `VITE_API_URL` pointing to your backend URL
5. Deploy

## Post-Deployment

1. **Test the API**: Visit your backend URL + `/docs` to see the FastAPI docs
2. **Test the Frontend**: Visit your frontend URL to test the chat interface
3. **Monitor Logs**: Check Render logs for any issues

## Troubleshooting

### Common Issues

1. **Build Failures**: Check that all dependencies are in `requirements.txt`
2. **Environment Variables**: Ensure all required variables are set
3. **CORS Issues**: The backend is configured to allow all origins for development
4. **API Connection**: Verify the frontend is pointing to the correct backend URL

### Logs
- Check Render service logs for detailed error messages
- Backend logs will show API requests and errors
- Frontend logs will show build issues

## Security Notes

- Environment variables marked as "Secret" in Render are encrypted
- Never commit API keys to your repository
- Use HTTPS URLs for production API calls
- Consider adding rate limiting for production use 