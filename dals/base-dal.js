var uuid = require('node-uuid');
var azure = require('azure-storage');
var entityGen = azure.TableUtilities.entityGenerator;

function BaseDal(tableName) {
    
    this.azure = azure;
    this.tableName = tableName;
    this.partitionKey = tableName;
    this.storageClient = azure.createTableService(process.env.AZURE_STORAGE_ACCOUNT, process.env.AZURE_STORAGE_ACCESS_KEY);
};

BaseDal.prototype.list = function (query, callback) {
    
    this.storageClient.queryEntities(this.tablename, query, null, null, function entitiesQueried(error, result) {
        
        if (error) {
            callback(error);
        }
        else {
            callback(null, result.entries);
        }
    });
};

BaseDal.prototype.insert = function (entity, callback) {

    entity.PartitionKey = entityGen.String(this.partitionKey);
    entity.RowKey = entityGen.String(uuid());

    this.storageClient.insertEntity(this.tableName, entity, function entityInserted(error) {
        if (error) {
            callback(error);

            return;
        }
        callback(null);
    });
};

BaseDal.prototype.update = function (rowKey, entity, callback) {

    this.storageClient.retrieveEntity(this.tableName, this.partitionKey, rowKey, function entityQueried(error, entity) {
        
        if (error) {
            callback(error);

            return;
        }

        entity.completed._ = true;
        
        this.storageClient.replaceEntity(this.tableName, entity, function entityUpdated(error) {
            if (error) {

                callback(error);
            }
            else {

                callback(null);
            }
        });
    });
};

BaseDal.prototype.first = function (query, callback) {

    this.storageClient.queryEntities(this.tableName, query, null, null, function entitiesQueried(error, result) {
        if (error) {
            callback(error, null);
        } else {

            if (result.entries.length > 0) {

                callback(null, result.entries[0])
            }
            else {
                callback(null, null);
            }
        }
    });
}

module.exports = BaseDal;