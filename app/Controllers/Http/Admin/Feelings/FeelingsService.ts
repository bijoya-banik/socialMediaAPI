
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import FeelingsQuery from './FeelingsQuery'

export default class FeelingService {
    private feelingsQuery : FeelingsQuery
    constructor(){
      this.feelingsQuery = new FeelingsQuery
    }

    public async getAllFeelings(ctx: HttpContextContract): Promise<any>{
      let data =  ctx.request.all()
      let page = data.page? data.page :1
      let limit = data.limit? data.limit :10
      let feelings:any = await this.feelingsQuery.getFellings( page, limit )
      // for(let item of feelings.data){
      //   item.icon =  process.env.CLIENT+ item.icon
      // }
      return feelings

    }
};
