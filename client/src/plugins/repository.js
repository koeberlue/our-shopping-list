import eventBus from '@/service/event-bus'

import Board from '@/models/Board'
import Item from '@/models/Item'
import List from '@/models/List'

export default {
  install: (Vue, { store }) => {
    if (!store) {
      throw new Error('Please provide vuex store.')
    }

    const schemaMapping = {
      Board,
      Item,
      List,
    }

    Vue.prototype.$repository = {
      findSchemaByClassName(className) {
        if (!schemaMapping[className]) {
          throw ('Invalid model class name: ' + className)
        }

        return schemaMapping[className]
      },
      findSchemaByModel(model) {
        const schemas = Object.values(schemaMapping).filter((s) => {
          return model instanceof s
        });

        if (schemas.length === 0) {
          throw ('Invalid model: ' + JSON.stringify(model))
        }

        return schemas[0]
      },
      save(model) {
        console.log('$repository::save', model)
        const schema = this.findSchemaByModel(model)

        eventBus.$emit('repository_save::before', model, schema)

        if (model._id) {
          return schema.api()
            .patch(`/${schema.entity}/${model._id}`, model)
        } else {
          return schema.api()
            .post(`/${schema.entity}`, model)
        }
      },
      delete(model) {
        console.log('$repository::delete', model)
        const schema = this.findSchemaByModel(model)

        eventBus.$emit('repository_delete::before', model, schema)

        if (model._id) {
          return schema.api()
            .delete(`/${schema.entity}/${model._id}`, { delete: 1 })
            .then(() => {
              // https://vuex-orm.github.io/plugin-axios/guide/usage.html#delete-requests
              model.$delete()
            })
        } else {
            model.$delete()
        }
      },
      checkSync(model) {
        console.log('$repository::checkSync', model, model.constructor.name)
        const schema = this.findSchemaByModel(model)

        return new Promise((resolve, reject) => {
          if (model._id) {
            fetch(`/${schema.entity}/${model._id}`, {
                method: 'HEAD'
              })
              .then(function(res) {
                if (!res.ok) {
                  switch (res.status) {
                    case 404:
                      // Model does not exist (anymore) on server: it should not exist either on client
                      console.warn(`Model ${schema.entity}/${model._id} not found on server: deleting.`)
                      model.$delete()
                      break
                  }
                  console.error(`[${res.status}] ${res.statusText}`)
                } else {
                  const lastModified = new Date(res.headers.get('last-modified-iso'))
                  const modelUpdatedAt = new Date(model.updatedAt)
                  resolve(lastModified.getTime() === modelUpdatedAt.getTime())
                }
              })
              .catch(function(error) {
                reject({
                  reason: 'Network error',
                  originalError: error
                })
              })
          }
          else {
            reject({
              reason: 'Model has no ID'
            })
          }
        })
      },
      sync(model) {
        console.log('$repository::sync', model)

        if (model._id) {
          const schema = this.findSchemaByModel(model)

          schema.api()
            .get(`/${schema.entity}/${model._id}`)
        }
      }
    }
    Vue.$repository = Vue.prototype.$repository
  },
}
