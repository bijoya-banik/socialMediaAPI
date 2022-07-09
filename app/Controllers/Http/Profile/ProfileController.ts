import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ProfileService from './ProfileService';
import ProfileValidator from './ProfileValidator';
export default class ProfileController {
  private profileService : ProfileService
  private profileValidator : ProfileValidator
  constructor () {
    this.profileService =  new ProfileService()
    this.profileValidator =  new ProfileValidator()
  }
  public async getProfile(ctx : HttpContextContract) {
     return this.profileService.getProfile(ctx)
  }
  public async getSearchFriend(ctx : HttpContextContract) {
     return this.profileService.getSearchFriend(ctx)
  }
  public async saveName(ctx : HttpContextContract) {
     return this.profileService.saveName(ctx)
  }
  public async darkModeChange(ctx : HttpContextContract) {
     return this.profileService.darkModeChange(ctx)
  }
  public async getFriendLists(ctx : HttpContextContract) {
     return this.profileService.getFriendLists(ctx)
  }
  public async friendRequest(ctx : HttpContextContract) {
     return this.profileService.friendRequest(ctx)
  }
  public async getNotification(ctx : HttpContextContract) {
     return this.profileService.getNotification(ctx)
  }
  public async unSeenNoti(ctx : HttpContextContract) {
     return this.profileService.unSeenNoti(ctx)
  }
  public async seenNoti(ctx : HttpContextContract) {
   return this.profileService.seenNoti(ctx)
   }
   public async deleteUser(ctx : HttpContextContract) {
      return this.profileService.deleteUser(ctx)
   }
   public async deleteFeed(ctx : HttpContextContract) {
      return this.profileService.deleteFeed(ctx)
   }
   public async deleteReport(ctx : HttpContextContract) {
      return this.profileService.deleteReport(ctx)
   }
   public async deleteNoti(ctx : HttpContextContract) {
      return this.profileService.deleteNoti(ctx)
   }
   public async markAsReadAll(ctx : HttpContextContract) {
      return this.profileService.markAsReadAll(ctx)
   }
   public async ignoreSuggesion(ctx : HttpContextContract) {
      return this.profileService.ignoreSuggesion(ctx)
   }



  public async getFriendRequests(ctx : HttpContextContract) {
     return this.profileService.getFriendRequests(ctx)
  }
  public async friendSugesstion(ctx : HttpContextContract) {
     return this.profileService.friendSugesstion(ctx)
  }
  public async resetFriend(ctx : HttpContextContract) {
     return this.profileService.resetFriend(ctx)
  }
  public async deleteRequest(ctx : HttpContextContract) {
     return this.profileService.deleteRequest(ctx)
  }
  public async getFriendListsForChat(ctx : HttpContextContract) {
     return this.profileService.getFriendListsForChat(ctx)
  }
  public async peopleList(ctx : HttpContextContract) {
     return this.profileService.peopleList(ctx)
  }

  public async blockedPeopleList(ctx : HttpContextContract) {
     return this.profileService.blockedPeopleList(ctx)
  }

  public async getPeopleListBySearch(ctx : HttpContextContract) {
      return this.profileService.getPeopleListBySearch(ctx)
   }
   public async getAllUser(ctx : HttpContextContract) {
      return this.profileService.getAllUser(ctx)
   }
   public async getAllReport() {
      return this.profileService.getAllReport()
   }
   public async getFriendListsBySearch(ctx : HttpContextContract) {
      return this.profileService.getFriendListsBySearch(ctx)
   }


  public async blockUser(ctx : HttpContextContract) {
   try {
      let data = ctx.request.all()
     let validataData = await this.profileValidator.validateBlockUserSchema(ctx)
     data.blocked_user_id =validataData.blocked_user_id
     return this.profileService.blockUser(ctx)
    } catch (error) {
       return ctx.response.status(422).send(error.messages)
    }

  }

  public async unBlockUser(ctx : HttpContextContract) {
   try {
      let data = ctx.request.all()
     let validataData = await this.profileValidator.validateUnBlockUserSchema(ctx)
     data.bId =validataData.bId
     return this.profileService.unBlockUser(ctx)
    } catch (error) {
       return ctx.response.status(422).send(error.messages)
    }

  }

  public async uploadUserPic(ctx : HttpContextContract) {
     return this.profileService.uploadUserPic(ctx)
  }

  async getUserTransactionList(ctx: HttpContextContract) : Promise<any>{
    return this.profileService.getUserTransactionList(ctx)
 }
 async update_last_active_time(ctx: HttpContextContract) : Promise<any>{
   return this.profileService.update_last_active_time(ctx)
}
 
}
