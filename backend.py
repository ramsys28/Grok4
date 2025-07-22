from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# --- Import user logic ---
from pathlib import Path
from qdrant_client import QdrantClient
from sentence_transformers import SentenceTransformer
from xai_sdk import Client
from xai_sdk.chat import system as xai_system, user as xai_user
from dotenv import load_dotenv
import os

# === CONFIG ===
load_dotenv("conf.env")

XAI_API_KEY = os.getenv("XAI_API_KEY")
QDRANT_URL = os.getenv("QDRANT_URL")
COLLECTION_NAME = os.getenv("COLLECTION_NAME")
EMBED_MODEL = os.getenv("EMBED_MODEL")
TOP_K = int(os.getenv("TOP_K", 10))

embed_model = SentenceTransformer(EMBED_MODEL)
qdrant = QdrantClient(
    url=QDRANT_URL,
    api_key="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIn0.NqlYf35QWPBdw0V_Nh-XZH3u5Zy-MM2wnrVQcSeZpQ4"
)
xai_client = Client(api_key=XAI_API_KEY)


def query_qdrant(query: str, top_k=TOP_K):
    q_vec = embed_model.encode(query).tolist()
    response = qdrant.query_points(
        collection_name=COLLECTION_NAME,
        query=q_vec,
        limit=top_k,
        with_payload=True
    )
    hits = response.points
    grouped_contexts = []
    for hit in hits:
        payload = hit.payload if hasattr(hit, "payload") else None
        if not (payload and isinstance(payload, dict)):
            continue
        source = payload.get("source")
        page = payload.get("page")
        para_index = payload.get("para_index")
        text = payload.get("text", "").strip()
        if not text:
            continue
        found = False
        for group in grouped_contexts:
            if (
                group["source"] == source and
                group["page"] == page and
                abs(group["last_index"] - para_index) <= 2
            ):
                group["text"] += "\n\n" + text
                group["last_index"] = para_index
                found = True
                break
        if not found:
            grouped_contexts.append({
                "source": source,
                "page": page,
                "last_index": para_index,
                "text": text
            })
    contexts = [g["text"] for g in grouped_contexts]
    return contexts

def ask_grok4(question: str, contexts: list[str]) -> str:
    system_prompt = "You are Grok 4, an AI assistant using provided document context."
    context_block = "\n\n".join(contexts)
    chat = xai_client.chat.create(model="grok-4-0709", temperature=0.2)
    chat.append(xai_system(system_prompt))
    chat.append(xai_user(f"Context:\n{context_block}\n\nQuestion: {question}"))
    response = chat.sample()
    return response.content.strip()

def ask(question: str):
    docs = query_qdrant(question)
    if not docs:
        return "❌ No context found in Qdrant."
    return ask_grok4(question, docs)

# --- FastAPI setup ---
app = FastAPI()

# Allow CORS for local frontend dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    question: str

class ChatResponse(BaseModel):
    answer: str

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(req: ChatRequest):
    answer = ask(req.question)
    return ChatResponse(answer=answer)

if __name__ == "__main__":
    uvicorn.run("backend:app", host="0.0.0.0", port=10000, reload=True) 