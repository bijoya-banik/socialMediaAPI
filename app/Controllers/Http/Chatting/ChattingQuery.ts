import Inbox from 'App/Models/Inbox';
import InboxMember from 'App/Models/InboxMember';
import Chat from 'App/Models/Chat';
import User from 'App/Models/User';
// import { DateTime } from 'luxon'

export default class ChattingQuery{
    public async getOldChatRecord(userId,buddy_id) {

      let record:any = await Inbox.query()
      .where('user_id', userId).where('buddy_id', buddy_id)
      .preload('is_group_member', (q) => {
        q.where('user_id', userId)
      }).first()
      return record
    }
    public async updateConversation(userId,buddy_id){
      let record:any = await Inbox.query().where('user_id', userId).where('buddy_id', buddy_id).update({
        is_deleted:0
      })
      return record
    }
    public async updateGroupConversation(inbox_id){
      let record:any = await Inbox.query().where('id', inbox_id).update({
        updated_at: new Date()
      })
      return record
    }
    public async updateGroupMember(inbox_id, userId){
      await InboxMember.query().where('user_id', userId).where('inbox_id', inbox_id).update({
        is_seen:1
      })
    }
    async getPeopleListBySearch(str,userId){
      console.log(userId)
      str = await  str.replace(/[&\/\\#,+@^()$~%.'":*?<>{}]/g, '');
      if(str == '') return []
      let searchTxt = `${str}*`
       return User.query().where(q=>{
         q.whereRaw("MATCH (first_name, last_name) AGAINST (? IN BOOLEAN MODE)",[searchTxt])
       })
       .select('id', 'is_online', 'first_name', 'last_name', 'profile_pic', 'username')
       .orderBy('is_online','desc').limit(10)
    }
  
    async getGroupListBySearch(str,userId){
      str = await  str.replace(/[&\/\\#,+@^()$~%.'":*?<>{}]/g, '');
      if(str == '') return []
      let searchTxt = `${str}*`
      if(searchTxt){
        return Inbox.query().where( 'is_group', 1)
        .whereHas('group_members', (builder)=>{
          builder.where('user_id', userId)
          builder.where('is_left', 0)
          // builder.whereRaw("MATCH (group_name) AGAINST (? IN BOOLEAN MODE)",[searchTxt])
        })
        .whereRaw("MATCH (group_name) AGAINST (? IN BOOLEAN MODE)",[searchTxt])
        // .where('group_name' , 'like' ,`%${searchTxt}%`)
        .preload('group_members', (query) => {
          query.where('is_left', 0)
          query.where('user_id','!=', userId)
          query.preload('user')
        })
        .preload('is_group_member', (q) => {
          q.where('user_id', userId)
        })
        .orderBy('updated_at','desc').limit(10)
      }else{
        return []
      }

    }
    public async searchForGroupMember(str,userId, inbox_id){
      str = await  str.replace(/[&\/\\#,+@^()$~%.'":*?<>{}]/g, '');
      if(str == '') return []
      let searchTxt = `${str}*`
      return User.query().where('id', '!=', userId)
      .whereDoesntHave('isInboxMember',(q)=>{
          q.where('inbox_id','=', inbox_id )
      })
      .where(q=>{
         q.whereRaw("MATCH (first_name, last_name) AGAINST (? IN BOOLEAN MODE)",[searchTxt])
      })
      .select('id', 'is_online', 'first_name', 'last_name', 'profile_pic', 'username').orderBy('is_online','desc').limit(20)
    }
    public async getInboxRecord(inbox_id, userId) {
       return Inbox.query().where('id', inbox_id).preload('is_group_member', (q) => {
        q.where('user_id', userId)
      }).first()
    }
    public async getConversation(inbox_key, user_id)
    {
      return Inbox.query().where('inbox_key', inbox_key).whereHas('is_group_member', (q) => {
        q.where('user_id', user_id)
      }).orWhere('user_id', user_id)
      .first()
    }
    public async createInbox(inboxArray : any[]){
       return Inbox.createMany(inboxArray)
    }
    public async createSingleInbox(data:object ){
       return Inbox.create(data)
    }
    public async createInboxMembers(membersArray : any[]){
       return InboxMember.createMany(membersArray)
    }
    public async createChat(chatObj){
       return Chat.create(chatObj)
    }
    public async getInboxKey(userId, buddy_id){
      return Inbox.query().where('user_id', buddy_id).where('buddy_id', userId).first()
    }
    public async getSingleInbox(userId, inbox_id){
      return Inbox.query().where('user_id', userId)
      .where('id', inbox_id)
      .preload('group_members', (query) => {
        query.where('is_left', 0)
        query.where('user_id','!=', userId)
         query.preload('user')
      })
      .preload('buddy')
      .preload('is_group_member', (q) => {
        q.where('user_id', userId)
      })
    }
    public async getChatLists(inbox_key, userId, more){
      let q = Chat.query().where('inbox_key', inbox_key)
      .where('is_deleted', '!=', userId)
      .preload('user')
      .orderBy('created_at', 'desc')
      if(more > 0){
        q.where('id', '<', more)
      }
      return q.limit(20)
    }
    public async getAllChatListTillId(inbox_key, userId, more){
      let q = Chat.query().where('inbox_key', inbox_key).where('is_deleted', '!=', userId).orderBy('created_at', 'asc')
      if(more > 0){
        q.where('id', '<', more)
      }
      return q
    }

    async unSeenMsg(userId, id){
        return Inbox.query().where('user_id', userId).where('id',id).update({is_seen : 0})
    }
    async seenMsg(userId, id){
      return Inbox.query().where('user_id', userId).where('id',id).update({is_seen : 1})
    }

    async markAsReadAll(userId){
      return Inbox.query().where('user_id', userId).update({is_seen : 1})
    }

    public async getInboxes(userId ){
      return Inbox.query().where('is_deleted',0)
        .where((builder)=>{
          builder.where('is_group', 0)
          builder.where('user_id', userId)
        })
        .orWhereHas('group_members', (builder)=>{
          builder.where('is_left', 0)
          builder.where('user_id', userId)
        })
        .preload('group_members', (query) => {
          query.where('is_left', 0)
          query.where('user_id','!=', userId)
          query.preload('user')
        })
        .withCount('group_members', (query) => {
          query.where('is_left', 0)
          query.as('totalMembers')
        })

        .preload('lastmsg',(b) => {
            b.where('is_deleted','!=',userId)
            b.preload('user')
          })
        .preload('buddy')
        .preload('is_group_member', (q) => {
          q.where('user_id', userId)
        })
        .orderBy('updated_at', 'desc')

    }
    public async getInbox_web(userId, page, limit){
      return Inbox.query().where('is_deleted',0)
        .where((builder)=>{
          builder.where('is_group', 0)
          builder.where('user_id', userId)
        })
        .orWhereHas('group_members', (builder)=>{
          builder.where('user_id', userId)
          builder.where('is_left', 0)
        })
        .preload('group_members', (query) => {
          query.where('is_left', 0)
          query.where('user_id','!=', userId)
          query.preload('user')
        })
        .withCount('group_members', (query) => {
          query.where('is_left', 0)
          query.as('totalMembers')
        })
        .orderBy('updated_at', 'desc')
        .preload('lastmsg',(b) => {
            b.where('is_deleted','!=',userId)
            b.preload('user')
          })
        .preload('buddy')
        .preload('is_group_member', (q) => {
          q.where('user_id', userId)
        })
        .paginate(page, limit)
    }
    public async updateSeen(user_id, buddy_id, is_seen){
      let currentdate = new Date();
      let datetime =
                currentdate.getFullYear() + "-"
                + (currentdate.getMonth()+1)  + "-"
                +currentdate.getDate() + " "
                + currentdate.getHours() + ":"
                + currentdate.getMinutes() + ":"
                + currentdate.getSeconds();
      return Inbox.query().where('user_id', user_id).where('buddy_id', buddy_id).update({is_seen: is_seen, updated_at: datetime})
    }
    public async updateGroupChatSeen(user_id, is_seen, inbox_id){
      let currentdate = new Date();
      let datetime =
                currentdate.getFullYear() + "-"
                + (currentdate.getMonth()+1)  + "-"
                +currentdate.getDate() + " "
                + currentdate.getHours() + ":"
                + currentdate.getMinutes() + ":"
                + currentdate.getSeconds();
      return InboxMember.query().where('user_id', user_id).where('inbox_id', inbox_id).update({is_seen: is_seen, updated_at: datetime})

    }
    public async updateSeenWithoutTime(user_id, buddy_id, is_seen){
      return Inbox.query().where('user_id', user_id).where('buddy_id', buddy_id).update({is_seen: is_seen})
    }

    async checkBlock(value, value2){
      // return Block.query().where(column, value).where(column2, value2).first()
      return User.query().where('id', value)
      .where((builder) => {
       builder.whereDoesntHave('blockedUser', (qq) => {
         qq.where('user_id', value2)
       })
       builder.whereDoesntHave('userBlocked',(q)=>{
         q.where('blocked_user_id', value2 )
        })
      })
      .first()
   }
   async checkMember(inbox_id, user_id){
    //  return{inbox_id, user_id}
    return InboxMember.query().where('inbox_id',inbox_id)
    .where('user_id',user_id)
    .first()
   }

   async unmuteNoti (inbox_id, user_id){
     return InboxMember.query().where('inbox_id',inbox_id)
    .where('user_id',user_id)
    .update({ mute_noti: 0 })
   }
   async muteNoti (inbox_id, user_id){
     return InboxMember.query().where('inbox_id',inbox_id)
    .where('user_id',user_id)
    .update({ mute_noti: 1 })
   }
    async isAuthorizedUser(userId,inbox_key){
      return Inbox.query().where('inbox_key',inbox_key)
                          .where('user_id',userId)
                          .first()
    }
    async isMsgFirstDeleteTrue(chat_id){
      return Chat.query().where('id',chat_id).where('is_deleted',0).first()
    }
    async getSingleMsg(chat_id, user_id){
      return Chat.query().where('id',chat_id).preload('user')
      .preload('conversation', (builder)=>{

        builder.whereHas('is_group_member', (q) => {
          q.where('user_id', user_id)
        })
        builder.orWhere('user_id', user_id)
      }).first()


    }
    async isSingleMsgFirstDelete(chat_id,user_id){
      return Chat.query().where('id',chat_id).where('is_deleted',0).update({
        is_deleted:user_id
      })
    }
    async singleMsgPermanentlyDelete(chat_id){
      return Chat.query().where('id',chat_id).delete()
    }

    async isConversFirstDeleteTrue(inboxKey){
      return Chat.query().where('inbox_key',inboxKey).where('is_deleted',0).first()
    }
    async isFirstDeleteFullConvers(inboxKey,userId){
      return Chat.query().where('inbox_key',inboxKey).where('is_deleted',0).update({
        is_deleted:userId
      })
    }
    async inbox_update(inboxKey,userId){
      return Inbox.query().where('inbox_key',inboxKey).where('buddy_id',userId).update({
        is_deleted:1
      })
    }
    async isDeletedByBoth(inboxKey,buddy_id){
      return Chat.query().where('inbox_key',inboxKey).where('is_deleted',buddy_id).delete()
    }
    async deleteGroup(inbox_id){
      await  InboxMember.query().where('inbox_id',inbox_id).delete()
      return Inbox.query().where('id',inbox_id).delete()
    }
    async removeMember(inbox_id, buddy_id){
      return InboxMember.query().where('inbox_id',inbox_id).where('user_id', buddy_id).delete()
    }
    async getAllGroupMember(inbox_id, userId){
        return InboxMember.query().where('inbox_id',inbox_id).where('user_id','!=', userId)
    }
    async getAllmember(inbox_id){
        return InboxMember.query().where('inbox_id',inbox_id).preload("user")
    }
    async getAlladmin(inbox_id){
        return InboxMember.query().where('inbox_id',inbox_id).whereIn('role', ['ADMIN', 'SUPER ADMIN']).preload("user").where('is_left', 0)
    }
    async getAllAdmin(inbox_id, userId){
      return InboxMember.query().where('inbox_id',inbox_id).where('user_id', '!=', userId).where('role', 'ADMIN').where('is_left', 0)
    }
    async makeAdmin(user_id, inbox_id){
      // return await InboxMember.query().where('user_id', user_id).where('inbox_id',inbox_id).first()
      return InboxMember.query().where('user_id', user_id).where('inbox_id',inbox_id).update({
        role:'ADMIN'
      })
    }
    async removeAdminRole(user_id, inbox_id){
      return InboxMember.query().where('user_id', user_id).where('inbox_id',inbox_id).update({
        role:'USER'
      })
    }
    async updateGroupInfo(inbox_id, object){
      return Inbox.query().where('id',inbox_id).update(object)
    }
    async leaveGroup(inbox_id, user_id){
      await  InboxMember.query().where('inbox_id',inbox_id).where('user_id', user_id).delete()
    }
    async deleteConversation(inbox_id, user_id){
      await  InboxMember.query().where('inbox_id',inbox_id).where('user_id', user_id).update({
        is_deleted:0
      })
    }

    async deleteChat(inboxKey){
      return Chat.query().where('inbox_key',inboxKey).delete()
    }
    async deleteFullConversPermanently(inboxKey,userId){
      if(userId) {

      }
      return Chat.query().where('inbox_key',inboxKey).where('is_deleted','>',0).delete()
    }


}
