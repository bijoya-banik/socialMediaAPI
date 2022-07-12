import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import FeedService from './FeedService';
import FeedValidator from './FeedValidator';
export default class FeedController {
  private feedService : FeedService
  private feedValidator : FeedValidator
  constructor () {
    this.feedService =  new FeedService()
    this.feedValidator =  new FeedValidator()
  }
  async gettest(){
    return this.feedService.gettest()
  }
  async getPageNotFollow(ctx : HttpContextContract){
    return this.feedService.getPageNotFollow(ctx)
  }
  async getStoryFeed(ctx : HttpContextContract){
    return this.feedService.getStoryFeed(ctx)
  }
  async getStoryFeedDetails(ctx : HttpContextContract){
    return this.feedService.getStoryFeedDetails(ctx)
  }


 async hidePost(ctx : HttpContextContract){
  try {
    let data = await this.feedValidator.deleteFeedValidate(ctx)
    return this.feedService.hidePost(data)
  } catch (error) {
     return ctx.response.status(422).send(error.messages)
  }
 }


  async createReport(ctx : HttpContextContract){
    try {
      let vData = await this.feedValidator.createReportValidate(ctx)
      return this.feedService.createReport(vData, ctx)
    } catch (error) {
       return ctx.response.status(422).send(error.messages)
    }
  }
  async createFeed(ctx : HttpContextContract){
    try {
       await this.feedValidator.createFeedValidate(ctx)
      return this.feedService.createFeed(ctx)
    } catch (error) {
       return ctx.response.status(422).send(error.messages)
    }
  }

  async deleteFeed(ctx : HttpContextContract){
    await this.feedValidator.deleteFeedValidate(ctx)
    return this.feedService.deleteFeed(ctx)
  }

  async updateFeed(ctx : HttpContextContract){
    await this.feedValidator.createFeedValidate(ctx)
    return this.feedService.updateFeed(ctx)
  }
  async getFeed(ctx : HttpContextContract){
      return this.feedService.getFeed(ctx)
  }
  async getAllFeed(ctx : HttpContextContract){
      return this.feedService.getAllFeed(ctx)
  }
  async getFellings(ctx : HttpContextContract){
      return this.feedService.getFellings(ctx)
  }
  async searchForFeelings(ctx : HttpContextContract){
      return this.feedService.searchForFeelings(ctx)
  }
  async searchForSubActivities(ctx : HttpContextContract){
      return this.feedService.searchForSubActivities(ctx)
  }
  async getActivities(ctx : HttpContextContract){
      return this.feedService.getActivities(ctx)
  }
  async getSubActivities(ctx : HttpContextContract){
      return this.feedService.getSubActivities(ctx)
  }
  async getAllReactionType(ctx : HttpContextContract){
      return this.feedService.getAllReactionType(ctx)
  }
  async getReactedPeople(ctx : HttpContextContract){
      return this.feedService.getReactedPeople(ctx)
  }
  async getAdds(ctx : HttpContextContract){
      return this.feedService.getAdds(ctx)
  }
  async createLike(ctx : HttpContextContract){
     await this.feedValidator.feedLikeValidator(ctx)
     return this.feedService.createLike(ctx)
  }
  async saveFeedforUser(ctx : HttpContextContract){
     await this.feedValidator.feedSaveValidator(ctx)
     return this.feedService.saveFeedforUser(ctx)
  }
  async unsaveFeedforUser(ctx : HttpContextContract){
     await this.feedValidator.feedSaveValidator(ctx)
     return this.feedService.unsaveFeedforUser(ctx)
  }
  async getLinkPreview({request} : HttpContextContract){
    return this.feedService.getLinkPreview(request.all())
  }
  async uploadImage(ctx : HttpContextContract){
    return "hi"
    return this.feedService.uploadImage(ctx)
  }
  async getSingleFeed(ctx : HttpContextContract){
    let privacy =ctx.request.all().privacy?ctx.request.all().privacy:''
    return this.feedService.getSingleFeed(ctx.params.id,ctx.auth.user?.id, privacy)
  }
  async getAllstoryWithDetail(ctx : HttpContextContract){
    return this.feedService.getAllstoryWithDetail(ctx)
  }
  async deleteStoryFeed(ctx : HttpContextContract){
    return this.feedService.deleteStoryFeed(ctx)
  }


}
