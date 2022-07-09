import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import FeelingsService from './FeelingsService';
import FeelingsValidator from './FeelingsValidator';

// import Database from '@ioc:Adonis/Lucid/Database';
export default class FeelingsController {
  private feelingsService : FeelingsService
  private feelingsValidator : FeelingsValidator

  constructor () {
    this.feelingsService =  new FeelingsService()
    this.feelingsValidator =  new FeelingsValidator()
  }

  async getAllFeelings(ctx : HttpContextContract){
    // return "hi"
       return this.feelingsService.getAllFeelings(ctx)
  }
  async createFeelingCategory(ctx : HttpContextContract){

    try {
      let vData = await this.feelingsValidator.validateEditPageSchema(ctx)
      ctx.request.all().id = vData.id
      ctx.request.all().description = vData.description
      return this.feelingsService.editStaticPages(ctx)
    } catch (error) {
       return ctx.response.status(422).send(error.messages)
    }
  }


}
