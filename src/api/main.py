from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import os

# Simple in-memory storage for demo
todo_lists = []
todo_items = []

app = FastAPI(
    title="Simple Todo API",
    description="A simple todo API for local development",
    version="1.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for local development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class TodoList(BaseModel):
    id: Optional[str] = None
    name: str
    description: Optional[str] = None
    createdDate: Optional[datetime] = None
    updatedDate: Optional[datetime] = None

class CreateUpdateTodoList(BaseModel):
    name: str
    description: Optional[str] = None

class TodoItem(BaseModel):
    id: Optional[str] = None
    name: str
    description: Optional[str] = None
    isComplete: bool = False
    completedDate: Optional[datetime] = None
    listId: str

class CreateUpdateTodoItem(BaseModel):
    name: str
    description: Optional[str] = None
    isComplete: bool = False
    listId: str

# Routes
@app.get("/")
async def root():
    return {"message": "Todo API is running!"}

@app.get("/lists", response_model=List[TodoList])
async def get_lists():
    return todo_lists

@app.post("/lists", response_model=TodoList)
async def create_list(list_data: CreateUpdateTodoList):
    new_list = TodoList(
        id=str(len(todo_lists) + 1),
        name=list_data.name,
        description=list_data.description,
        createdDate=datetime.now(),
        updatedDate=datetime.now()
    )
    todo_lists.append(new_list)
    return new_list

@app.get("/lists/{list_id}")
async def get_list(list_id: str):
    for todo_list in todo_lists:
        if todo_list.id == list_id:
            return todo_list
    return {"error": "List not found"}

@app.put("/lists/{list_id}")
async def update_list(list_id: str, list_data: CreateUpdateTodoList):
    for i, todo_list in enumerate(todo_lists):
        if todo_list.id == list_id:
            todo_lists[i].name = list_data.name
            todo_lists[i].description = list_data.description
            todo_lists[i].updatedDate = datetime.now()
            return todo_lists[i]
    return {"error": "List not found"}

@app.delete("/lists/{list_id}")
async def delete_list(list_id: str):
    for i, todo_list in enumerate(todo_lists):
        if todo_list.id == list_id:
            deleted_list = todo_lists.pop(i)
            # Also remove items from this list
            global todo_items
            todo_items = [item for item in todo_items if item.listId != list_id]
            return deleted_list
    return {"error": "List not found"}

@app.get("/lists/{list_id}/items")
async def get_items(list_id: str):
    items = [item for item in todo_items if item.listId == list_id]
    return items

@app.post("/lists/{list_id}/items")
async def create_item(list_id: str, item_data: CreateUpdateTodoItem):
    new_item = TodoItem(
        id=str(len(todo_items) + 1),
        name=item_data.name,
        description=item_data.description,
        isComplete=item_data.isComplete,
        listId=list_id,
        completedDate=datetime.now() if item_data.isComplete else None
    )
    todo_items.append(new_item)
    return new_item

@app.put("/lists/{list_id}/items/{item_id}")
async def update_item(list_id: str, item_id: str, item_data: CreateUpdateTodoItem):
    for i, item in enumerate(todo_items):
        if item.id == item_id and item.listId == list_id:
            todo_items[i].name = item_data.name
            todo_items[i].description = item_data.description
            todo_items[i].isComplete = item_data.isComplete
            todo_items[i].completedDate = datetime.now() if item_data.isComplete else None
            return todo_items[i]
    return {"error": "Item not found"}

@app.delete("/lists/{list_id}/items/{item_id}")
async def delete_item(list_id: str, item_id: str):
    for i, item in enumerate(todo_items):
        if item.id == item_id and item.listId == list_id:
            return todo_items.pop(i)
    return {"error": "Item not found"}

# Add some sample data
if not todo_lists:
    sample_list = TodoList(
        id="1",
        name="My First Todo List",
        description="A sample todo list to get you started",
        createdDate=datetime.now(),
        updatedDate=datetime.now()
    )
    todo_lists.append(sample_list)
    
    sample_item = TodoItem(
        id="1",
        name="Learn about this Todo app",
        description="Explore the features of this todo application",
        isComplete=False,
        listId="1"
    )
    todo_items.append(sample_item)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
