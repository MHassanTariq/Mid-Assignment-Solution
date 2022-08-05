import express from "express";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import {
  convertArrayToContent,
  convertContentToArray,
  isTodoValid,
  respondErr,
  TODO_RECORDS_FILE_PATH,
} from "./helper.js";
import {
  ERROR_NO_RECORDS_FOUND,
  ERROR_UPDATING_FILE,
  INVALID_ID_OR_OBJ_NOT_EXIST,
} from "./strings.js";

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// creating a todo here
app.post("/todo", (request, response) => {
  const todo = request.body;
  const todoErr = isTodoValid(todo);
  if (todoErr.error) {
    return response.json(respondErr(todoErr.msg));
  }

  // adding id to identify todo
  todo.id = uuidv4();

  // saving todo in file
  const todoStr = JSON.stringify(todo) + "\n"; // \n is to differentiate 2 todos from each other
  fs.appendFile(TODO_RECORDS_FILE_PATH, todoStr, (err) => {
    if (err) return response.json(respondErr(ERROR_NO_RECORDS_FOUND));

    response.json(todo);
  });
});

// reading a specific todo here
app.get("/todo/:todo_id", (request, response) => {
  const todoId = request.params.todo_id;
  fs.readFile(TODO_RECORDS_FILE_PATH, "utf8", (err, data) => {
    if (err) return response.json(respondErr(ERROR_NO_RECORDS_FOUND));

    const records = convertContentToArray(data);
    const requiredTodo = records.filter((record) => record.id === todoId); // filtering out only the required id object
    if (requiredTodo.length !== 1) {
      return response.json(respondErr(INVALID_ID_OR_OBJ_NOT_EXIST));
    }

    response.json(requiredTodo[0]);
  });
});

// reading a list of todos here
app.get("/todo", (request, response) => {
  const { sort, limit = 10, skip = 0 } = request.query;
  fs.readFile(TODO_RECORDS_FILE_PATH, "utf8", (err, data) => {
    if (err) return response.json(respondErr(ERROR_NO_RECORDS_FOUND));
    const records = convertContentToArray(data);
    // intial checks
    if (records.length === 0) {
      return response.json(respondErr(ERROR_NO_RECORDS_FOUND));
    }
    // converting string to number since query is in string
    const start = Number(skip);
    const end = Number(limit) + start;

    // applying queries
    let filteredRecords = records.slice(start, end);
    if (sort === "true") {
      filteredRecords = filteredRecords.sort(
        (todo1, todo2) => new Date(todo1.date) - new Date(todo2.date)
      );
    }

    response.json(filteredRecords);
  });
});

// delete a specific todo
app.delete("/todo/:todo_id", (request, response) => {
  const todoId = request.params.todo_id;
  fs.readFile(TODO_RECORDS_FILE_PATH, "utf-8", (err, data) => {
    if (err) return response.json(respondErr(ERROR_NO_RECORDS_FOUND));
    const records = convertContentToArray(data);
    const requiredTodoIndex = records.findIndex(
      (record) => record.id === todoId
    );
    if (requiredTodoIndex === -1) {
      return response.json(respondErr(INVALID_ID_OR_OBJ_NOT_EXIST));
    }
    const removedTodo = records.splice(requiredTodoIndex, 1);
    const content = convertArrayToContent(records);
    fs.writeFile(TODO_RECORDS_FILE_PATH, content, (err) => {
      if (err) return response.json(respondErr(ERROR_UPDATING_FILE));

      return response.json(removedTodo[0]);
    });
  });
});

// update a specific todo
app.put("/todo/:todo_id", (request, response) => {
  const attrToUpdate = request.body;
  const todoId = request.params.todo_id;

  fs.readFile(TODO_RECORDS_FILE_PATH, "utf-8", (err, data) => {
    if (err) return response.json(respondErr(ERROR_NO_RECORDS_FOUND));

    const records = convertContentToArray(data);

    const filteredTodoIndex = records.findIndex(
      (record) => record.id === todoId
    );

    if (filteredTodoIndex === -1) {
      return response.json(respondErr(INVALID_ID_OR_OBJ_NOT_EXIST));
    }
    const todoToUpdate = records[filteredTodoIndex];
    records[filteredTodoIndex] = { ...todoToUpdate, ...attrToUpdate };
    const updatedTodo = records[filteredTodoIndex];
    const content = convertArrayToContent(records);
    fs.writeFile(TODO_RECORDS_FILE_PATH, content, (err) => {
      if (err) return response.json(respondErr(ERROR_UPDATING_FILE));

      response.json(updatedTodo);
    });
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
