async function getAll(tableName, tableFields) {
  return `getAll: async (request, reply) => {
    try {
      const data = await readPool.request().query(``SELECT * FROM ${tableName}``);
      if (data.recordset.length > 0) {
        const message = errorHandler(data.recordset);
        return message;
      } else {
        return reply.notFound("No Data Found");
      }
    } catch (error) {
      return reply.internalServerError(error.message.toString());
    }
  }`;
}

async function getOne(tableName, tableFields) {
  return ` getOne: async (request, reply) => {
    const ${tableFields.PrimaryKey} = request.params.${tableFields.PrimaryKey};
    try {
      const data = await readPool.request().query(``SELECT *  ${tableName} WHERE ${tableFields.PrimaryKey} = ${tableFields.PrimaryKey}``);
      if (data.recordset.length > 0) {
        const message = errorHandler(data.recordset);
        return message;
      } else {
        return reply.notFound("${tableName} Does Not Exist!");
      }
    } catch (error) {
      return reply.internalServerError(error.message.toString());
    }
  },`;
}

async function updateOne(tableName, tableFields) {
  let setVariables = '';
  return `updateOne: async (request, reply) => {
    const ${tableFields.PrimaryKey} = request.params.${tableFields.PrimaryKey};
    try {
      const queryResult = await readPool.request().query(``SELECT *
    FROM ${tableName} WHERE ${tableFields.PrimaryKey} = ${tableFields.PrimaryKey}``);
      if (queryResult.recordset.length == 0) {
        reply.notFound("Does not exist!");
      } else {
        const data = await addPool.request()
          .query(``UPDATE ${tableName}
        SET
        ${setVariables}
        WHERE ${tableFields.PrimaryKey} = ${tableFields.PrimaryKey}``);
        const message = errorHandler(data);
        return message;
      }
    } catch (error) {
      return reply.internalServerError(error.message.toString());
    }
    },`;
}

async function deleteOne(tableName, tableFields) {
  return `deleteOne: async (request, reply) => {
    const ${tableFields.PrimaryKey} = request.params.${tableFields.PrimaryKey};
    try {
    const queryResult = await readPool.request().query(``SELECT *
    FROM ${tableName} WHERE ${tableFields.PrimaryKey} = ${tableFields.PrimaryKey}``);
      if (queryResult.recordset.length == 0) {
        reply.notFound("Does not exist!");
      } else {
        const data = await addPool.request()
        .query(``DELETE FROM ${tableName}
        WHERE ${tableFields.PrimaryKey} = ${tableFields.PrimaryKey}``);
        const message = errorHandler(data);
        return message;
      }
    } catch (error) {
      return reply.internalServerError(error.message.toString());
    }
    },`;
}

async function insertOne(tableName, tableFields) {
  return `insertOne: async (request, reply) => {
    const Body = request.body;
    try {
      const data = await addPool.request()
        .query(``INSERT INTO [Essentials].${tableName}
      (${fields})
      VALUES
      (${values}``);
      const message = errorHandler(data);
      return message;
    } catch (error) {
      return reply.internalServerError(error.message.toString());
    }
  },`;
}

async function prepareControllerFile(tableObject) {
  let fileContent = `"use strict";
    const errors = require("../../validations/error-handler");
    const errorHandler = errors.errorHandler;
    const getErrorMessage = require("../../utils/getErrorMessage");
    
    module.exports = {
    `;

  let getAllRouteContent = await getAll(tableObject.tableName, tableObject.fields);
  let getGetOneContent = await getOne(tableObject.tableName, tableObject.fields);
  let getUpdateOneContent = await updateOne(tableObject.tableName, tableObject.fields);
  let getDeleteOneContent = await deleteOne(tableObject.tableName, tableObject.fields);
  let getInsertOneContent = await insertOne(tableObject.tableName, tableObject.fields);

  fileContent =
    fileContent +
    `\\n` +
    getAllRouteContent +
    `\\n` +
    getGetOneContent +
    `\\n` +
    getUpdateOneContent +
    `\\n` +
    getDeleteOneContent +
    `\\n` +
    getInsertOneContent;

  fileContent = fileContent + `\\n` + `};`;

  return fileContent;
}
