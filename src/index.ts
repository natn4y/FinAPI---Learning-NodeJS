import express from "express";
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = 3333;

app.use(express.json());

interface customer {
  cpf: string
  name: string
  id: number
  statement: []
}

type customersProps = customer[]

const customers = [] as customersProps;

app.post('/account', (req, res) => {
  const { cpf, name } = req.body;

  const customersAlreadyExists = customers.some(
    (customer) => customer.cpf === cpf
  );

  if(customersAlreadyExists) {
    return res.status(400).json({error: 'Customer already exist!'})
  }

  customers.push({
    cpf,
    name,
    id: uuidv4(),
    statement: [],
  });

  return res.status(201).send();
})

app.post('/statement/:cpf', (req, res) => {
  const { cpf } = req.params;

  const customer = customers.find(customer => customer.cpf === cpf) as customer;

  if(!customer) {
    return res.json({ error: 'Customer not found' })
  }

  return res.json(customer.statement)
})

app.listen(port, () => {
  console.log(`[SERVER RUNNING]: listening on port: ${port}`);
});