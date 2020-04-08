const config = require('config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Q = require('q');
const mongo = require('mongoskin');
const db = mongo.db(config.connectionString, { native_parser: true });
db.bind('controleEstoque');

const service = {};
const ENTRADA = 'entrada';
const SAIDA = 'saida';

service.authenticate = authenticate;
service.create = create;
service.delete = _delete;
service.getAllEntrada = getAllEntrada;
service.getAllSaida = getAllSaida;
service.getAll = getAll;
service.edit = edit;
service.getById = getById;

module.exports = service;

function authenticate(username, password) {
   const deferred = Q.defer();

   db.users.findOne({ username: username }, (err, user) => {
      if (err) deferred.reject(err.name + ': ' + err.message);

      if (user && bcrypt.compareSync(password, user.hash)) {
         // authentication successful
         deferred.resolve({token :jwt.sign({ sub: user._id }, config.secret), userId: user._id});
      } else {
         // authentication failed
         deferred.resolve();
      }
   });

   return deferred.promise;
}

function getById(_id) {
   const deferred = Q.defer();
   
   db.controleEstoque.findById(_id, (err, produto) => {
      if (err) deferred.reject(err.name + ': ' + err.message);
      
       deferred.resolve(produto);
   });

   return deferred.promise;
}

function create(movimentacao) {
   const deferred = Q.defer();

   db.controleEstoque.findOne({
      "codItem":movimentacao.codItem,
      "tipo":movimentacao.tipo,
      "tamanho":movimentacao.tamanho,
      "cor":movimentacao.cor
   }, (err, movimentacaoBd) => {
      if (err) deferred.reject(err.name + ': ' + err.message);

      if (movimentacao.tipoTransacao == ENTRADA) {
         if (movimentacaoBd == null) {
            _save(movimentacao);
         } else {
            movimentacaoBd.quantidade += movimentacao.quantidade
            edit(movimentacaoBd._id, movimentacaoBd, deferred);
         }
      } else {
         if (movimentacaoBd == null) {
            deferred.reject("Não há produto cadastrado com esses dados!");
         } else {
            const quantidadeNova = movimentacaoBd.quantidade - movimentacao.quantidade;
            
            if (quantidadeNova < 0) {
               deferred.reject("Não há estoque para essa compra!");
            } else {
               movimentacaoBd.quantidade = quantidadeNova;
               edit(movimentacaoBd._id, movimentacaoBd, deferred);
            }
         }
      }
   });
   
   function _save(movimentacao) {
      db.controleEstoque.insert(
      movimentacao,
         (err, doc) => {
               if (err) deferred.reject(err.name + ': ' + err.message);
   
               deferred.resolve();
         });
   }
   return deferred.promise;    
}

function edit(id, movimentacao, deferredFromOtherFunction) {
   
   if (deferredFromOtherFunction == null) {
      deferredFromOtherFunction = Q.defer();
   }
   
   const novaMovimentacao = {
      codItem: movimentacao.codItem,
      dataEntrada: movimentacao.dataEntrada,
      tipo: movimentacao.tipo,
      tamanho: movimentacao.tamanho,
      cor: movimentacao.cor,
      valorEtiqueta: movimentacao.valorEtiqueta,
      valorPago: movimentacao.valorPago,
      precoSugerido: movimentacao.precoSugerido,
      tipoTransacao: movimentacao.tipoTransacao,
      quantidade: movimentacao.quantidade
   }

   db.controleEstoque.update(
   { 
      _id: mongo.helper.toObjectID(id) 
   }, {
      $set: novaMovimentacao
   }, function (err, doc) {
      if (err) deferredFromOtherFunction.reject(err.name + ': ' + err.message);

      deferredFromOtherFunction.resolve();
   });
   return deferredFromOtherFunction.promise;    
}

function getAllEntrada() {
   const deferred = Q.defer();

   db.controleEstoque.find({
      "tipoTransacao": ENTRADA
   }).toArray((err, items) => {
      if (err) deferred.reject(err.name + ': ' + err.message);

      deferred.resolve(items);
   });
   return deferred.promise;
}

function getAllSaida() {
   const deferred = Q.defer();

   db.controleEstoque.find({
      "tipoTransacao": SAIDA
   }).toArray((err, items) => {
       if (err) deferred.reject(err.name + ': ' + err.message);

       deferred.resolve(items);
   });
   return deferred.promise;
}

function getAll() {
   const deferred = Q.defer();

   db.controleEstoque.find().toArray((err, items) => {
       if (err) deferred.reject(err.name + ': ' + err.message);

       deferred.resolve(items);
   });
   return deferred.promise;
}

function _delete(_id) {
   const deferred = Q.defer();

   db.controleEstoque.remove(
      { _id: mongo.helper.toObjectID(_id) },
      function (err) {
         if (err) deferred.reject(err.name + ': ' + err.message);

         deferred.resolve();
      });

      return deferred.promise;
}