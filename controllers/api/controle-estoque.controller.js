const config = require('config.json');
const express = require('express');
const router = express.Router();
const controleEstoqueService = require('services/controle-estoque.service');

// routes
router.get('/', getAll);
router.get('/entradas', getAllEntrada);
router.get('/saidas', getAllSaida);
router.get('/:_id', getById);
router.post('/authenticate', authenticateUser);
router.post('/create', create);
router.put('/:_id', edit);
router.delete('/:_id', _delete);

module.exports = router;

function authenticateUser(req, res) {
   controleEstoqueService.authenticate(req.body.username, req.body.password)
      .then((response) => {
         if (response) {
               // authentication successful
               res.send({ userId: response.userId, token: response.token });
         } else {
               // authentication failed
               res.status(401).send('Username or password is incorrect');
         }
      })
      .catch((err) => {
         res.status(400).send(err);
      });
}

function create(req, res) {
   controleEstoqueService.create(req.body)
      .then(() => {
         res.sendStatus(200);
      })
      .catch((err) => {
         res.status(400).send(err);
      });
}

function getAllEntrada(req, res) {
   controleEstoqueService.getAllEntrada()
      .then((movimentacoes) => {
         if (movimentacoes) {
               res.send(movimentacoes);
         } else {
               res.sendStatus(404);
         }
      })
      .catch((err) => {
         res.status(400).send(err);
      });
}

function getAll(req, res) {
   controleEstoqueService.getAll()
      .then((movimentacoes) => {
         if (movimentacoes) {
               res.send(movimentacoes);
         } else {
               res.sendStatus(404);
         }
      })
      .catch((err) => {
         res.status(400).send(err);
      });
}

function getAllSaida(req, res) {
   controleEstoqueService.getAllSaida()
      .then((movimentacoes) => {
         if (movimentacoes) {
               res.send(movimentacoes);
         } else {
               res.sendStatus(404);
         }
      })
      .catch((err) => {
         res.status(400).send(err);
      });
}

function _delete(req, res) {    
   controleEstoqueService.delete(req.params._id)
      .then(() => {
         res.sendStatus(200);
      })
      .catch((err) => {
         res.status(400).send(err);
      });
}

function edit(req, res) {    
   controleEstoqueService.edit(req.params._id, req.body)
      .then(() => {
         res.sendStatus(200);
      })
      .catch((err) => {
         res.status(400).send(err);
      });
}

function getById(req, res) {    
   controleEstoqueService.getById(req.params._id)
      .then((produto) => {
         res.send(produto);
      })
      .catch((err) => {
         res.status(400).send(err);
      });
}