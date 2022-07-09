import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ChattingQuery from './ChattingQuery';
import CustomHelpers from 'App/Helpers/CustomHelpers';
import { v4 as uuidv4 } from 'uuid';
import Event from '@ioc:Adonis/Core/Event'
import * as _ from "lodash";
import { isNull } from 'lodash';
 export default class ChattingService {
    private chattingQuery : ChattingQuery
    private customHelpers : CustomHelpers
    constructor(){
      this.chattingQuery = new ChattingQuery
      this.customHelpers = new CustomHelpers
    }
    public async getInboxByBuddyID(ctx : HttpContextContract){
      let data = ctx.request.all()
      let user = ctx.auth.user
      if(!user) return  ctx.response.status(401).send({msg: 'You are not authorised.'})
      let inbox_id:number =data.inbox_id ? data.inbox_id : 0
      let buddy_id:number =data.buddy_id ? data.buddy_id : 0
      let inbox:any
      if(inbox_id == 0)   {
        inbox = await this.chattingQuery.getOldChatRecord(user.id,buddy_id)
      }
      else {
        inbox = this.chattingQuery.getInboxRecord(inbox_id, user.id)
      }
      return inbox
    }
    public async getAllmember(ctx : HttpContextContract){
      let data = ctx.request.all()
      let user = ctx.auth.user
      if(!user) return  ctx.response.status(401).send({msg: 'You are not authorised.'})
      let inbox_id:number =data.inbox_id ? data.inbox_id : 0
      if(!inbox_id) return
      let checkMember = await this.chattingQuery.checkMember(data.inbox_id, user.id)
      if(!checkMember) return  ctx.response.status(401).send({msg: 'You are not authorised.'})
      return this.chattingQuery.getAllmember(inbox_id)
    }
    public async getAlladmin(ctx : HttpContextContract){
      let data = ctx.request.all()
      let user = ctx.auth.user
      if(!user) return  ctx.response.status(401).send({msg: 'You are not authorised.'})
      let inbox_id:number =data.inbox_id ? data.inbox_id : 0
      if(!inbox_id) return
      let checkMember = await this.chattingQuery.checkMember(data.inbox_id, user.id)
      if(!checkMember) return  ctx.response.status(401).send({msg: 'You are not authorised.'})
      return this.chattingQuery.getAlladmin(inbox_id)
    }
    public async getInboxRecordById(ctx : HttpContextContract){
      let data = ctx.request.all()
      let user = ctx.auth.user
      if(!user) return  ctx.response.status(401).send({msg: 'You are not authorised.'})
      return this.chattingQuery.getInboxRecord(data.inbox_id, user.id)
    }
    public async insertChat(ctx : HttpContextContract){
      let data = ctx.request.all()
      let meta_data =  data.meta_data ? data.meta_data :{"link_meta":null, "feed_meta":null}
      data.meta_data = JSON.stringify(meta_data)

      if((!data.msg && meta_data.link_meta == null  && meta_data.feed_meta == null )){ // validate request // need some extra works...
        return this.customHelpers.forbidden(ctx.response)
      }
      let user = ctx.auth.user
      if(!user) return  ctx.response.status(401).send({msg: 'You are not authorised.'})
      let oldChatRecord
      if(isNull(data.buddy_id)){
        let checkMember = await this.chattingQuery.checkMember(data.inbox_id, user.id)
        if(!checkMember) return  ctx.response.status(401).send({msg: 'You are not authorised.'})
        oldChatRecord = await this.chattingQuery.getInboxRecord(data.inbox_id, user.id)
        await this.chattingQuery.updateGroupConversation( data.inbox_id)
        await this.chattingQuery.updateGroupMember( data.inbox_id, user.id)

      }else{
        let checkBlock = await this.chattingQuery.checkBlock( data.buddy_id, user.id)
        if(!checkBlock) return ctx.response.status(401).send({msg: 'User is not available for chat.'})
        oldChatRecord = await this.chattingQuery.getOldChatRecord(user.id, data.buddy_id)
        await this.chattingQuery.updateConversation( data.buddy_id, user.id)
      }
      let files = data.files
      let inbox_key = uuidv4()
      let msg_daata:any = {}
      let reply_msg = null
      let reply_files = null
      let reply_id = data.reply_id
      if(data.reply_id){
          msg_daata = await this.chattingQuery.getSingleMsg(data.reply_id, user.id)
          reply_msg = msg_daata.msg
          if(msg_daata.msg == "Attachment"){
            reply_files = msg_daata.files
          }
       }
      let chatObj = { user_id : user.id, inbox_key : inbox_key, msg : data.msg, files: files,  meta_data:data.meta_data,reply_id:reply_id? reply_id : null,reply_msg:reply_msg ? reply_msg  : null, reply_files: reply_files? reply_files : null  }

      if(!oldChatRecord){
          let inboxArray
          if(user.id == data.buddy_id){
             inboxArray = [
              {user_id : data.buddy_id, buddy_id : user.id, inbox_key : inbox_key, is_seen: 0 },
            ]
          }else{
            inboxArray = [
              {user_id : user.id, buddy_id : data.buddy_id, inbox_key : inbox_key, is_seen: 1 },
              {user_id : data.buddy_id, buddy_id : user.id, inbox_key : inbox_key, is_seen: 0 },
            ]
          }
          let [chat] = await Promise.all([
            this.chattingQuery.createChat(chatObj),
            this.chattingQuery.createInbox(inboxArray),
          ])
          let chatData:any = await this.chattingQuery.getSingleMsg(chat.id, user.id)
           chat.files = chat.files? JSON.parse(chat.files) : []
          chat.reply_files = chat.reply_files? JSON.parse(chat.reply_files) : []
          chat.meta_data = chat.meta_data ? JSON.parse(chat.meta_data) :[]
          this.emitChat(data.buddy_id, chatData, user)
          return chat
      }
      chatObj.inbox_key = oldChatRecord.inbox_key

      let chat = await this.chattingQuery.createChat(chatObj)
      let chatData:any = await this.chattingQuery.getSingleMsg(chat.id, user.id)
      chatData.files = chatData.files? JSON.parse(chatData.files) : []
      chatData.meta_data = chatData.meta_data ? JSON.parse(chatData.meta_data) :[]
      chatData.reply_files = chatData.reply_files? JSON.parse(chatData.reply_files) : []
      if(data.buddy_id == null){
        await this.chattingQuery.updateGroupChatSeen( user.id, 1, data.inbox_id)
        let members =  await this.chattingQuery.getAllGroupMember(data.inbox_id, user.id)

        if(members.length > 0){
          for (const item of members) {

            if( item.mute_noti && item.mute_noti == 0 ){
              // return item
              // console.log(chatData, user, "Group notification")
              this.emitChat(item.user_id, chatData, user)
            }
          }
        }
        return chatData
      }else{
        this.emitChat(data.buddy_id, chatData, user)
        // let other users seen as unseen
         await Promise.all([
          this.chattingQuery.updateSeen(data.buddy_id,  user.id, 0),
          this.chattingQuery.updateSeen(user.id, data.buddy_id, 1),
         ])
      }
      return chatData
    }
    public async updateGroupInfo(data, ctx : HttpContextContract){
      let user = ctx.auth.user
      if(!user) return  ctx.response.status(401).send({msg: 'You are not authorised.'})
      let checkMember = await this.chattingQuery.checkMember(data.inbox_id, user.id)
      if(!checkMember) return  ctx.response.status(401).send({msg: 'You are not authorised.'})
      let images:any
      if(data.file){
        images = await this.customHelpers.uploadImages2(ctx)
      }
      await this.chattingQuery.updateGroupInfo(data.inbox_id, {group_logo:images? images: null, group_name:data.group_name})
      return this.chattingQuery.getInboxRecord(data.inbox_id, user.id )
    }
    public async createGroup(ctx : HttpContextContract){
      let data = ctx.request.all()
      let user = ctx.auth.user
      let member_list:any[] = data.member_list
      if(!user) return  ctx.response.status(401).send({msg: 'You are not authorised.'})
      let inbox_key = uuidv4()
      let inbox_obj ={ user_id : user.id, buddy_id : null, inbox_key : inbox_key, is_seen: 1 , is_group: 1, group_name:data.group_name }
      let inbox:any = await this.chattingQuery.createSingleInbox(inbox_obj)
      let inbox_member:Array<object> = []
      let obj = {
        inbox_id : inbox.id,
        user_id : user.id,
        ignore_msg:0,
        mute_noti:0,
        is_seen:1,
        is_left:0,
        role:'SUPER ADMIN'
      }
      inbox_member.push(obj)
      for (let i = 0; i < member_list.length; i++) {
        let obj = {
          inbox_id : inbox.id,
          user_id : member_list[i],
          ignore_msg:0,
          mute_noti:0,
          is_seen:1,
          is_left:0,
          role:'USER'
        }
        obj.user_id = member_list[i]
        inbox_member.push(obj)
      }
      await this.chattingQuery.createInboxMembers(inbox_member)
      let group  = await this.chattingQuery.getSingleInbox(user.id, inbox.id)
      return this.customHelpers.formateInbox(group)
    }
    async getInboxDetails(ctx : HttpContextContract){
      let data = ctx.request.all()
      let userId = ctx.auth.user?.id
      if(!userId) return ctx.response.status(401).send({msg: 'You are not authorised.'})
      return await this.chattingQuery.getInboxKey(userId, data.id)


    }
    async getChatLists(ctx : HttpContextContract){
      let data = ctx.request.all()
      if(isNull(data.buddy_id) && isNull(data.inbox_id)){ // validate request // need some extra works...
        return this.customHelpers.forbidden(ctx.response)
      }
      let userId = ctx.auth.user?.id
      if(!userId) return ctx.response.status(401).send({msg: 'You are not authorised.'})
      let chats : any = []
      // seelcting opiste member to know if that member has seen the last message I sent
      let key
      if(data.inbox_id){
        let checkMember = await this.chattingQuery.checkMember(data.inbox_id, userId)
        // return checkMember
        if(!checkMember) return  ctx.response.status(401).send({msg: 'You are not authorised.'})
        key = await this.chattingQuery.getInboxRecord(data.inbox_id, userId)
      }else if(data.buddy_id){
        key = await this.chattingQuery.getInboxKey(userId, data.buddy_id)
      }
      if(!key)
      return {
        chatLists : [],
        seen: 0
      }
      chats  = await this.chattingQuery.getChatLists(key.inbox_key,userId,data.more)
      if(chats.length){
        chats[0].is_seen = key.is_seen
        // update seenk
        if(!isNull(data.buddy_id)){
          this.chattingQuery.updateSeenWithoutTime(userId, data.buddy_id, 1)
        }else{
          this.chattingQuery.updateGroupChatSeen(userId, 1, data.inbox_id)
        }
      }
      let formatedChat = this.customHelpers.formateChat(chats)
      // if()
      if(data.isApp!=1 && !data.more){
        formatedChat =   _.sortBy(formatedChat, 'id')
      }
      return {
         chatLists : formatedChat,
         seen: key.is_seen
      }

   }
   async muteNoti(ctx : HttpContextContract){
    let data = ctx.request.all()
    let userId = ctx.auth.user?.id
    if(!userId) return ctx.response.status(401).send({msg: 'You are not authorised.'})
    let inbox_id:number =data.inbox_id ? data.inbox_id : 0
    if(inbox_id == 0 ) return ctx.response.status(401).send({msg: 'You are not authorised.'})
    let checkMember = await this.chattingQuery.checkMember(data.inbox_id, userId)
    if(!checkMember ) return  ctx.response.status(401).send({msg: 'You are not authorised.'})
    return await this.chattingQuery.muteNoti(inbox_id, userId)
   }
   async unmuteNoti(ctx : HttpContextContract){
    let data = ctx.request.all()
    let userId = ctx.auth.user?.id
    if(!userId) return ctx.response.status(401).send({msg: 'You are not authorised.'})
    let inbox_id:number =data.inbox_id ? data.inbox_id : 0
    if(inbox_id == 0 ) return ctx.response.status(401).send({msg: 'You are not authorised.'})
    let checkMember = await this.chattingQuery.checkMember(data.inbox_id, userId)
    if(!checkMember ) return  ctx.response.status(401).send({msg: 'You are not authorised.'})
    return await this.chattingQuery.unmuteNoti(inbox_id, userId)
   }
   async searchForGroupMember(ctx : HttpContextContract){
    let userId = ctx.auth.user?.id
    const data = ctx.request.all()
    let str = data.str?data.str:''
    let inbox_id = data.id?data.id:0
    return this.chattingQuery.searchForGroupMember(str,userId, inbox_id)
   }
   async getInboxGlobalSearch(ctx : HttpContextContract){
    let userId = ctx.auth.user?.id
    const data = ctx.request.all()
    let str = data.str?data.str:''
    let people  =  await this.chattingQuery.getPeopleListBySearch( str,userId)

    let group = await this.chattingQuery.getGroupListBySearch(str,userId)

    let formatedGroup = this.customHelpers.formateInbox(group)
    return{ group:formatedGroup,people:people}
   }
   async addNewChatMember(ctx : HttpContextContract){
    let data = ctx.request.all()
    let userId = ctx.auth.user?.id
    if(!userId) return ctx.response.status(401).send({msg: 'You are not authorised.'})
    let inbox_id:number =data.inbox_id ? data.inbox_id : 0
    if(inbox_id == 0 ) return ctx.response.status(401).send({msg: 'You are not authorised.'})
    let checkMember = await this.chattingQuery.checkMember(data.inbox_id, userId)
    if(!checkMember || checkMember.role == 'USER' ) return  ctx.response.status(401).send({msg: 'You are not authorised.'})
    let inbox_member:Array<object> = []

    for (let i = 0; i < data.user_id.length; i++) {
      let obj = {
        inbox_id : inbox_id,
        user_id : data.user_id[i],
        ignore_msg:0,
        mute_noti:0,
        is_seen:0,
        is_left:0,
        role:'USER'
      }
      inbox_member.push(obj)
    }
    return await this.chattingQuery.createInboxMembers(inbox_member)

   }
   async getAllChatListTillId(ctx : HttpContextContract){
      let data = ctx.request.all()
      if(isNaN(data.buddy_id)){ // validate request // need some extra works...
        return this.customHelpers.forbidden(ctx.response)
      }
      let userId = ctx.auth.user?.id
      if(!userId) return
      let chats : any = []
      // seelcting opiste member to know if that member has seen the last message I sent
      let key = await this.chattingQuery.getInboxKey(userId, data.buddy_id)
      if(!key)
       return {
        chatLists : [],
        seen: 0
     }
      chats  = await this.chattingQuery.getAllChatListTillId(key.inbox_key,userId,data.more)
      if(chats.length){
        chats[0].is_seen = key.is_seen
        // update seenk
        this.chattingQuery.updateSeenWithoutTime(userId, data.buddy_id, 1)
      }
      let formatedChat = this.customHelpers.formateChat(chats)
      // if()
      if(data.isApp!=1 && !data.more){
        formatedChat = _.sortBy(formatedChat, 'id')
      }
      return {
         chatLists : formatedChat,
         seen: key.is_seen
      }

   }
   async getInbox(ctx : HttpContextContract){
      let userId = ctx.auth.user?.id
      if(!userId) return
      let inboxes = await this.chattingQuery.getInboxes(userId )
      // return inboxes
      return this.customHelpers.formateInbox(inboxes)

   }
   async getInbox_web(ctx : HttpContextContract){
      let userId = ctx.auth.user?.id
      if(!userId) return ctx.response.status(401).send({msg: 'You are not authorised.'})
      const limit = ctx.request.all().limit ? ctx.request.all().limit :10
      const page = ctx.request.all().page ? ctx.request.all().page :1
      let inboxes = await this.chattingQuery.getInbox_web(userId,page, limit)

      return this.customHelpers.formateInbox(inboxes)
      return inboxes
   }
   async updateSeen(ctx : HttpContextContract){
      let userId = ctx.auth.user?.id

      if(!userId) return
      // console.log('user id is',  ctx.request.all().uid)
      return this.chattingQuery.updateSeenWithoutTime(userId, ctx.request.all().uid, 1)
   }

   async unSeenMsg(ctx : HttpContextContract){
    let userId = ctx.auth.user?.id
    if(!userId) return
    return this.chattingQuery.unSeenMsg(userId, ctx.request.all().id)
  }
  async seenMsg(ctx : HttpContextContract){
    let userId = ctx.auth.user?.id
    if(!userId) return
     return this.chattingQuery.seenMsg(userId, ctx.request.all().id)
  }
  async removeAdminRole(ctx : HttpContextContract){
    let userId = ctx.auth.user?.id
    if(!userId) return
    let data = ctx.request.all()
    let inbox_id:number =data.inbox_id ? data.inbox_id : 0
    let buddy_id:number =data.buddy_id ? data.buddy_id : 0
    let checkMember = await this.chattingQuery.checkMember(data.inbox_id, userId)
    if(!checkMember || checkMember.role == 'USER') return  ctx.response.status(401).send({msg: 'You are not authorised.'})
    return this.chattingQuery.removeAdminRole( buddy_id, inbox_id)
  }
  async makeAdmin(ctx : HttpContextContract){
    let userId = ctx.auth.user?.id
    if(!userId) return
    let data = ctx.request.all()
    let inbox_id:number =data.inbox_id ? data.inbox_id : 0
    let buddy_id:number =data.buddy_id ? data.buddy_id : 0

    let checkMember = await this.chattingQuery.checkMember(data.inbox_id, userId)
    if(!checkMember || checkMember.role == 'USER') return  ctx.response.status(401).send({msg: 'You are not authorised.'})
    return this.chattingQuery.makeAdmin( buddy_id, inbox_id)
  }
  async removeMember(ctx : HttpContextContract){
    let userId = ctx.auth.user?.id
    if(!userId) return
    let data = ctx.request.all()
    let inbox_id:number =data.inbox_id ? data.inbox_id : 0
    let buddy_id:number =data.buddy_id ? data.buddy_id : 0
    let checkMember = await this.chattingQuery.checkMember(data.inbox_id, userId)
    if(!checkMember || checkMember.role == 'USER') return  ctx.response.status(401).send({msg: 'You are not authorised.'})
    return this.chattingQuery.removeMember(inbox_id, buddy_id)
  }

  async markAsReadAll(ctx : HttpContextContract){
    let userId = ctx.auth.user?.id
    if(!userId) return
    return  this.chattingQuery.markAsReadAll(userId)
  }


  async emitChat(buddy_id, chatObj,user){
    // console.log('##################### from emit ', chatObj.meta_data.link_meta,chatObj.meta_data.feed_meta)
    Event.emit('new:chat', {
          noti_type : 'new_chat',
          buddy_id : buddy_id,
          from_id: user?.id,
          chatObj : chatObj,
          user: user
    })
  }

  async deleteSingleMsg(ctx : HttpContextContract){
    let userId = ctx.auth.user?.id
    if(!userId) return
    let data=ctx.request.all()
    if(  data.inbox_id != -1){
      if(data.user_id != userId) return ctx.response.status(401).send({msg: 'You are not authorised.'})
      let inbox_key:any =  await this.chattingQuery.getInboxRecord(data.inbox_id, userId)
      if(!inbox_key){
        return ctx.response.status(401).send({msg: 'You are not authorised.'})
      }
       return this.chattingQuery.singleMsgPermanentlyDelete(data.chat_id)
    }
    let key = await this.chattingQuery.getInboxKey(userId,data.buddy_id)
    if(!key){
     return ctx.response.status(401).send({msg: 'You are not authorised.'})
    }
    let isAuthorized = await this.chattingQuery.isAuthorizedUser(userId,key.inbox_key)
    if(!isAuthorized){
     return ctx.response.status(401).send({msg: 'You are not authorised.'})
    }

    if( data.user_id == userId){
       return this.chattingQuery.singleMsgPermanentlyDelete(data.chat_id)
    }else{
       let res =await this.chattingQuery.isMsgFirstDeleteTrue(data.chat_id)
      if(res){
        return this.chattingQuery.isSingleMsgFirstDelete(data.chat_id,userId)
      } else{
        return this.chattingQuery.singleMsgPermanentlyDelete(data.chat_id)
      }
    }
  }

  async leaveGroup(ctx : HttpContextContract): Promise<any>{
    let userId = ctx.auth.user?.id
    if(!userId) return ctx.response.status(401).send({msg: 'You are not authorised.'})
    let data=ctx.request.all()
    let inbox_id:number =data.inbox_id
    if(!inbox_id) return ctx.response.status(401).send({msg: 'You are not authorised.'})
    let checkMember = await this.chattingQuery.checkMember(data.inbox_id, userId)
    if(!checkMember) return  ctx.response.status(401).send({msg: 'You are not authorised.'})
    let key:any = await this.chattingQuery.getInboxRecord(data.inbox_id, userId)
    if(checkMember.role == 'SUPER ADMIN'){
      let checkAdmin = await this.chattingQuery.getAllAdmin(inbox_id, userId)
      if(checkAdmin.length <= 0 ){
        let members =  await this.chattingQuery.getAllGroupMember(inbox_id, userId)
        if(members.length > 0){
          for (let i = 0; i < members.length; i++) {
            this.chattingQuery.makeAdmin(members[i].user_id, members[i].inbox_id)
          }
        }
      }
    }
    return  this.chattingQuery.leaveGroup(key.id, userId)
  }
  async deleteGroup(ctx : HttpContextContract): Promise<any>{
    let userId = ctx.auth.user?.id
    if(!userId) return ctx.response.status(401).send({msg: 'You are not authorised.'})
    let data=ctx.request.all()
    let key
    let checkMember = await this.chattingQuery.checkMember(data.inbox_id, userId)
    if(!checkMember) return  ctx.response.status(401).send({msg: 'You are not authorised.'})
    key = await this.chattingQuery.getInboxRecord(data.inbox_id, userId)
    if(checkMember.role == 'ADMIN' || checkMember.role ==  'SUPER ADMIN'){
      await this.chattingQuery.deleteGroup(key.id)
      return await this.chattingQuery.deleteChat(key.inbox_key)
    }
  }
  async deleteFullConvers(ctx : HttpContextContract): Promise<any>{

    let userId = ctx.auth.user?.id
    if(!userId) return ctx.response.status(401).send({msg: 'You are not authorised.'})
    let data=ctx.request.all()
    let key
    // if(data.inbox_id){
    //   let checkMember = await this.chattingQuery.checkMember(data.inbox_id, userId)
    //   if(!checkMember) return  ctx.response.status(401).send({msg: 'You are not authorised.'})
    //   key = await this.chattingQuery.getInboxRecord(data.inbox_id, userId)
    //   if(checkMember.role == 'ADMIN'){
    //     await this.chattingQuery.deleteGroup(key.id)
    //     return await this.chattingQuery.deleteChat(key.inbox_key)
    //   }else{
    //     return  this.chattingQuery.deleteConversation(key.id, userId)
    //   }

    // }else{
      key = await this.chattingQuery.getInboxKey(userId, data.buddy_id)
      if(!key){
        return;
      }
      let isAuthorized = await this.chattingQuery.isAuthorizedUser(userId,key.inbox_key)
      if(!isAuthorized){
        return  ctx.response.status(401).send({msg: 'You are not authorised.'});
      }

      let res =await this.chattingQuery.isConversFirstDeleteTrue(key.inbox_key)
      if(res){
        await this.chattingQuery.inbox_update(key.inbox_key , data.buddy_id)
        await this.chattingQuery.isFirstDeleteFullConvers(key.inbox_key,userId)
        return this.chattingQuery.isDeletedByBoth(key.inbox_key,data.buddy_id)
      }else{
        return this.chattingQuery.deleteFullConversPermanently(key.inbox_key,userId)
      }
    // }




  }
};
