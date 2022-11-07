import express from "express";
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = 3333;

app.use(express.json());

interface customersProps extends Array<{}> {
  cpf: string
  name: string
  id: number
  statement: []
}

const customers = [] as unknown as customersProps;

app.post('/account', (req, res) => {
  const { cpf, name } = req.body;

  const id = uuidv4();

  customers.push({
    cpf,
    name,
    id,
    statement: [],
  });

  return res.status(201).send();
})

app.listen(port, () => {
  console.log(`[SERVER RUNNING]: listening on port: ${port}`);
});