import os
from dotenv import load_dotenv
from groq import Groq

from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.staticfiles import StaticFiles

load_dotenv()

API_KEY = os.getenv("GROQ_API_KEY")
MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")
KNOWLEDGE_FILE = "sample_docs/knowledge.txt"


def basic_chat():
    client = Groq(api_key=API_KEY)

    messages = [
        {
            "role": "system",
            "content": "You are a helpful assistant."
        }
    ]

    print("\nBasic Groq Chat")
    print("Type 'exit' or 'quit' to stop.\n")

    while True:
        prompt = input("You: ").strip()

        if not prompt or prompt.lower() in ("exit", "quit"):
            break

        messages.append({
            "role": "user",
            "content": prompt
        })

        response = client.chat.completions.create(
            messages=messages,
            model=MODEL
        )

        reply = response.choices[0].message.content

        messages.append({
            "role": "assistant",
            "content": reply
        })

        print(f"Groq: {reply}\n")


def rag_chat():
    client = Groq(api_key=API_KEY)

    with open(KNOWLEDGE_FILE, encoding="utf-8") as file:
        document = file.read()

    print("\nGroq RAG Chat")
    print(f"Using: {KNOWLEDGE_FILE}")
    print("Type 'exit' or 'quit' to stop.\n")

    while True:
        question = input("You: ").strip()

        if not question or question.lower() in ("exit", "quit"):
            break

        response = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "Answer using only the document below."
                },
                {
                    "role": "user",
                    "content": f"Document:\n{document}\n\nQuestion: {question}"
                }
            ],
            model=MODEL
        )

        print(f"Groq: {response.choices[0].message.content}\n")




app = FastAPI(title="Groq RAG Chat")



with open(KNOWLEDGE_FILE, encoding="utf-8") as file:
    document = file.read()



class ChatRequest(BaseModel):
    question: str



client = Groq(api_key=API_KEY)



@app.post("/chat")
def chat(request: ChatRequest):

    question = request.question.strip()

    if not question:
        return {
            "answer": "Please enter a question."
        }

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {
                "role": "system",
                "content": (
    "You are a helpful AI assistant. "
    "First, check the knowledge document and use it when "
    "the user's question is related to it. "
    "If the answer is not available in the knowledge document, "
    "answer the question using your general knowledge. "
    "Do not say that the information is unavailable just because "
    "it is not in the document."
)
            },
            {
                "role": "user",
                "content": f"""
Knowledge Document:

{document}

User Question:

{question}
"""
            }
        ]
    )

    answer = response.choices[0].message.content

    return {
        "answer": answer
    }



app.mount(
    "/",
    StaticFiles(directory="static", html=True),
    name="static"
)