import {removeDiacritics} from "@/libs/compare-strings";

import AbstractModel from './AbstractModel'
import List from './List'

class Item extends AbstractModel {
  static entity = 'items'

  static primaryKey = '_id'

  static fields() {
    return {
      _id: this.attr(null),
      name: this.attr(''),
      details: this.attr(''),
      qty: this.number(null).nullable(),
      checked: this.boolean(false),
      lastCheckedAt: this.attr(null),
      createdAt: this.attr(null),
      updatedAt: this.attr(null),
      listId: this.attr(null),

      list: this.belongsTo(List, 'listId')
    }
  }

  get sortName() {
    return removeDiacritics(this.name).toLowerCase()
  }

  get search() {
    return removeDiacritics(this.name)
  }

  toggleChecked() {
    this.checked = !this.checked
  }
}

export default Item
