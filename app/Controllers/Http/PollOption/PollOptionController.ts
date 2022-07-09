import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import PollOptionService from './PollOptionService';
import PollOptionValidator from './PollOptionValidator';
export default class PollOptionController {
  private polloptionService : PollOptionService
  private polloptionValidator : PollOptionValidator
  constructor () {
    this.polloptionService =  new PollOptionService()
    this.polloptionValidator =  new PollOptionValidator()
  }
  public async addPollOption(ctx : HttpContextContract) {
    await this.polloptionValidator.validatePollOptionSchema(ctx)
    return this.polloptionService.addPollOption(ctx)
  }
  public async closeOption(ctx : HttpContextContract) {
     return this.polloptionService.closeOption(ctx)
  }
  
}
