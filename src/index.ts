import express, { NextFunction, Request, Response } from "express";
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = 3333;

app.use(express.json());

interface customer {
  cpf: string
  name: string
  id: number
  statement: customerStatements[]
}

type customerStatements = {
  description?: string
  amount: number
  created_at: Date
  type: string
}

interface withdraw {
  description: string
  amount: number
}

type customersProps = customer[]

const customers = [] as customersProps;

// Middleware
function verifyIfExistsAccountCPF(
  req: Request & {customer?: customer},
  res: Response,
  next: NextFunction) {
  const { cpf } = req.headers;

  const customer = customers.find(customer => customer.cpf === cpf) as customer;

  if(!customer) {
    return res.json({ error: 'Customer not found' });
  };

  req.customer = customer;

  return next();
}

function getBalance(statement: Array<customerStatements>) {
  const balance: Number = statement.reduce((acc: number , operation:customerStatements) => {
    if(operation.type === 'credit') {
      return acc + operation.amount;
    } else {
      return acc - operation.amount;
    }
  }, 0);

  return balance;
};

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

//app.use(verifyIfExistsAccountCPF); // Uma forma de especificar que tudo que tiver abaixo dessa linha passará a usar esse Middleware

// Passando o Middleware entre o path e a função callback, essa rota poderá usar Middleware especificado
app.post(
  '/statement',
  verifyIfExistsAccountCPF, // here
  (req: Request & {customer?: customer}, res) => {
  const { customer } = req as {customer: customer};

  return res.json(customer.statement);
})

app.post(
  '/deposit',
  verifyIfExistsAccountCPF, // here
  (req: Request & {customer?: customer}, res) => {
  const { description, amount } = req.body;

  const { customer } = req as {customer: customer};

  const statementOperation = {
    description,
    amount,
    created_at: new Date(),
    type: "credit"
  }

  customer.statement.push(statementOperation);

  return res.status(201).send();
})

app.post('/withdraw', verifyIfExistsAccountCPF, (req: Request & {customer?: customer}, res) => {
  const { amount } = req.body as withdraw;
  const { customer } = req as {customer: customer}

  const balance = getBalance(customer.statement)

  if(balance < amount) {
    return res.status(400).json({error: 'Insufficient funds!'})
  }

  const statementOperation = {
    amount,
    created_at: new Date(),
    type: "debit",
  }

  customer.statement.push(statementOperation);

  return res.status(201).send();
})

app.post(
  '/statement/date',
  verifyIfExistsAccountCPF,
  (req: Request & {customer?: customer}, res) => {
    const { customer } = req as {customer: customer};

    const { date } = req.query;

    const dateFormat = new Date(date + ' 00:00'); // 00:00 para buscar a data independente do horário, lembre de dar um espaço ao somar date

    const statement = customer.statement.filter((statement) => statement.created_at.toDateString() === new Date (dateFormat).toDateString());

    return res.json(statement);
  }
)

app.put(
  '/account',
  verifyIfExistsAccountCPF,
  (req: Request & {customer?: customer}, res) => {

    const { name } = req.body;
    const { customer } = req as {customer: customer}

    customer.name = name;

    return res.status(201).send()
  }
)

app.get(
  '/account',
  verifyIfExistsAccountCPF,
  (req: Request & {customer?: customer}, res) => {

    const { customer } = req as {customer: customer}

    return res.json(customer)
  }
)

app.listen(port, () => {
  console.log(`[SERVER RUNNING]: listening on port: ${port}`);
});