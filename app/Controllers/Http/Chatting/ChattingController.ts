import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ChattingService from './ChattingService';
import ChattingValidator from './ChattingValidator';
export default class ChattingController {
  private chattingService : ChattingService
  private chattingValidator : ChattingValidator
  constructor () {
    this.chattingService =  new ChattingService()
    this.chattingValidator =  new ChattingValidator()
  }
  public async insertChat(ctx : HttpContextContract) {
    return this.chattingService.insertChat(ctx)
  }
  public async createGroup(ctx : HttpContextContract) {
    return this.chattingService.createGroup(ctx)
  }
  public async updateGroupInfo(ctx : HttpContextContract) {
    try {
      let data = await this.chattingValidator.validateUpdateGroupData(ctx)
      return this.chattingService.updateGroupInfo(data, ctx)
    } catch (error) {
       return ctx.response.status(422).send(error.messages)
    }
  }
  public async getChatLists(ctx : HttpContextContract) {
    return this.chattingService.getChatLists(ctx)
  }
  public async getAllChatListTillId(ctx : HttpContextContract) {
    return this.chattingService.getAllChatListTillId(ctx)
  }
  public async getInbox(ctx : HttpContextContract) {
    return this.chattingService.getInbox(ctx)
  }
  public async getInboxDetails(ctx : HttpContextContract) {
    return this.chattingService.getInboxDetails(ctx)
  }
  public async getInbox_web(ctx : HttpContextContract) {
    return this.chattingService.getInbox_web(ctx)
  }
  public async updateSeen(ctx : HttpContextContract) {
    return this.chattingService.updateSeen(ctx)
  }
  public async deleteSingleMsg(ctx : HttpContextContract) {
    return this.chattingService.deleteSingleMsg(ctx)
  }
  public async deleteFullConvers(ctx : HttpContextContract) {
    return this.chattingService.deleteFullConvers(ctx)
  }
  public async deleteGroup(ctx : HttpContextContract) {
    return this.chattingService.deleteGroup(ctx)
  }
  public async leaveGroup(ctx : HttpContextContract) {
    return this.chattingService.leaveGroup(ctx)
  }
  public async unmuteNoti(ctx : HttpContextContract) {
    return this.chattingService.unmuteNoti(ctx)
  }
  public async searchForGroupMember(ctx : HttpContextContract) {
    return this.chattingService.searchForGroupMember(ctx)
  }
  public async getInboxGlobalSearch(ctx : HttpContextContract) {
    return this.chattingService.getInboxGlobalSearch(ctx)
  }
  public async addNewChatMember(ctx : HttpContextContract) {
    return this.chattingService.addNewChatMember(ctx)
  }
  public async muteNoti(ctx : HttpContextContract) {
    return this.chattingService.muteNoti(ctx)
  }
  public async getInboxByBuddyID(ctx : HttpContextContract) {
    return this.chattingService.getInboxByBuddyID(ctx)
  }
  public async getInboxRecordById(ctx : HttpContextContract) {
    return this.chattingService.getInboxRecordById(ctx)
  }
  public async getAllmember(ctx : HttpContextContract) {
    return this.chattingService.getAllmember(ctx)
  }
  public async getAlladmin(ctx : HttpContextContract) {
    return this.chattingService.getAlladmin(ctx)
  }
  public async unSeenMsg(ctx : HttpContextContract) {
    return this.chattingService.unSeenMsg(ctx)
  }

  public async removeAdminRole(ctx : HttpContextContract) {
    await this.chattingValidator.groupmemberValidation(ctx)
    return this.chattingService.removeAdminRole(ctx)
  }
  public async makeAdmin(ctx : HttpContextContract) {
    await this.chattingValidator.groupmemberValidation(ctx)
    return this.chattingService.makeAdmin(ctx)
  }
  public async removeMember(ctx : HttpContextContract) {
    await this.chattingValidator.groupmemberValidation(ctx)
    return this.chattingService.removeMember(ctx)
  }
  public async seenMsg(ctx : HttpContextContract) {
    return this.chattingService.seenMsg(ctx)
  }
  public async markAsReadAll(ctx : HttpContextContract) {
    return this.chattingService.markAsReadAll(ctx)
  }
}
