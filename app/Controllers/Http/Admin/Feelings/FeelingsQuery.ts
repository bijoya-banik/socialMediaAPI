import FeelingsCategory from 'App/Models/FeelingsCategory'


export default class FeelingsQuery{

  getFellings(page, limit){
    return FeelingsCategory.query().where('type', 'FEELINGS').paginate(page, limit)
  }

}
