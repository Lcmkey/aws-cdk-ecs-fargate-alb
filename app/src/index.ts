import express from "express";
import { Request, Response } from "express";

const app = express();
const mem = [];
let counter = 0;

app.get("/", (req: Request, res: Response) => {
  mem.push(counter);
  counter++;
  res.send("Hello World");
});

app.listen(3000);
