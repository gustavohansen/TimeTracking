var azure = require('azure-storage');
var storageClient = azure.createTableService(process.env.AZURE_STORAGE_ACCOUNT, process.env.AZURE_STORAGE_ACCESS_KEY);

module.exports = TimeEntry;

function TimeEntry() {
    this.tablename = 'timeEntries'
};

TimeEntry.prototype = {

    insert: function(item, callback) {

      self = this;

      var entity = {
        PartitionKey: entityGen.String(self.tablename),
        RowKey: entityGen.String(uuid()),
        hours: item.hours,
        description: item.description,
        date: item.date,
        taskId: item.taskId
      };
  
      self.storageClient.insertEntity(self.tableName, entity, function entityInserted(error) {
        if(error){
          callback(error);

          return;
        }
        callback(null);
      });
    },

    update: function(rowKey, callback) {

      self = this;
      self.storageClient.retrieveEntity(self.tableName, self.tablename, rowKey, function entityQueried(error, entity) {
        if(error) {
          callback(error);

          return;
        }
        entity.completed._ = true;
        self.storageClient.replaceEntity(self.tableName, entity, function entityUpdated(error) {
          if(error) {

            callback(error);
          }
          else {
          
            callback(null);
          }
        });
      });
    },

    firstOrDefault: function(userName, callback) {
        self = this;
        
        storageClient.queryEntities(this.tablename, query, null, null, function entitiesQueried(error, result) {
          if(error) {
            callback(null, error);
          } else {

            if(result.entries.length > 0) {
              
              callback(result.entries[0])
            }
            else {
              callback(null);
            }
          }
        });
    }
}