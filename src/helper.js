export const TODO_RECORDS_FILE_PATH = "./src/todos.txt";

function isValidDate(d) {
  return d instanceof Date && !isNaN(d);
}


export function isTodoValid(todo) {
  const missingFields = [];
  if (!todo.title) missingFields.push("title");
  if (!todo.date) missingFields.push("date");
  const date = new Date(todo.date);
  if (!isValidDate(date)) missingFields.push("date format should be yyyy-mm-dd");
  if (!todo.is_completed) missingFields.push("is_completed");

  if (missingFields.length) {
    return { error: true, msg: "Missing fields: " + missingFields.join(",") };
  }
  return { error: false };
}

export function respondErr(errMessage) {
  return { err: errMessage };
}

export function convertContentToArray(data) {
  const strDataArr = data.split("\n"); // differentiating each todo and creating an array
  strDataArr.pop(); // removing last \n
  const records = strDataArr.map((entry) => JSON.parse(entry)); // mapping each string input to JSON object
  return records;
}

export function convertArrayToContent(arr) {
  const data = arr.map((entry) => JSON.stringify(entry)).join("\n") + "\n";
  return data;
}
