import { EventsList } from '@ioc:Adonis/Core/Event'
import Database from '@ioc:Adonis/Lucid/Database'
// import Inbox from 'App/Models/Inbox'
import User from 'App/Models/User'
import Notification from 'App/Models/Notification'
// import Ws from 'App/Services/Ws'

// import FCMD from 'fcm-node'
var FCM = require('fcm-node');
//var serverKey = process.env.SERVER_KEY; //put your server key here
var serverKey = "AAAALOLSyxc:APA91bEOE0JpLKuk62aDod50UEAjGBtjrScQ84mwDxey_1Kt5zg61MuKxaTE2WCxA5tQ7mvnhptmbNtyXGnp-bQYnmBKM91U_hN1W1FFnDXnZbIOjGn0ZWe0QE4cGgedn3jHwHB-TBa6";
var fcm = new FCM(serverKey);
import Redis from '@ioc:Adonis/Addons/Redis'
export default class NotificationListener {

  async onNewNotification(notiObj: EventsList['new:notification']) {
      // let oldNoti :any = await this.getNotification(notiObj)
      // if(!oldNoti){ // there is no old notification so create one...
         await this.createNotication(notiObj)
      // }else{
      //    this.updateNotification(notiObj, oldNoti?.id)
      // }
      // console.log("new notificiaiton -",notiObj)
      // Ws.io.emit(`noti:${notiObj.user_id}`, notiObj)
      await Redis.publish('new_notification', JSON.stringify({ data: notiObj,user_id:notiObj.user_id }))
      // console.log('new:notification',notiObj.user_id,)
      this.sendFcmNoti(notiObj,notiObj.user_id,notiObj.from_id)
  }
  async deleteFriendCount(notiObj: EventsList['new:notification']){
      // Ws.io.emit(`noti:${notiObj.user_id}`, notiObj)
      await Redis.publish('new_notification', JSON.stringify({ data: notiObj,user_id:notiObj.user_id }))
      this.sendFcmNoti(notiObj,notiObj.user_id,notiObj.from_id)
  }
   async deleteNotification(notiObj: EventsList['new:notification']){
       await Notification.query().where('user_id', notiObj.user_id).where('feed_id', notiObj.feed_id)
       .where('from_id', notiObj.from_id).where('noti_type', notiObj.noti_type).delete()
      //  Ws.io.emit(`noti:${notiObj.user_id}`, notiObj)
      await Redis.publish('new_notification', JSON.stringify({ data: notiObj,user_id:notiObj.user_id }))

       this.sendFcmNoti(notiObj,notiObj.user_id,notiObj.from_id)
   }
   async deleteCommentNotification(notiObj: EventsList['delete:notification']){
      let comment_id = notiObj.comment_id
      let user_id = notiObj.user_id
      let feed_id = notiObj.feed_id
      // console.log("in the delete comment notification",notiObj.comment_id, notiObj.user_id, notiObj.feed_id  )
      if( comment_id != undefined && feed_id != undefined && user_id != undefined ){
         // console.log("deleting comment ")
        await Notification.query().where('user_id', notiObj.user_id).where('feed_id', notiObj.feed_id).where('comment_id', notiObj.comment_id)
      //   .where((builder) => {
      //      builder.where('comment_id', notiObj.comment_id)
      //      builder.whereNotNull('comment_id')
      //    })
         .where('from_id', notiObj.from_id).where('noti_type', notiObj.noti_type).delete()
         // console.log("deleted", deleted)
         // Ws.io.emit(`noti:${notiObj.user_id}`, notiObj)

         await Redis.publish('new_notification', JSON.stringify({ data: notiObj,user_id:notiObj.user_id }))

         // this.sendFcmNoti(notiObj,notiObj.user_id,notiObj.from_id)
      }

   }

  async getNotification(notiObj : EventsList['new:notification']){
     return Notification.query().where('user_id', notiObj.user_id).where('feed_id', notiObj.feed_id).where('noti_type', notiObj.noti_type).first()
  }
  async createNotication(notiObj : EventsList['new:notification']){
   //   console.log("notiObj.feed_id", notiObj.feed_id, notiObj.user_id, notiObj.comment_id )
      return Notification.create({
        userId : notiObj.user_id,
        feedId : notiObj.feed_id,
        commentId : notiObj.comment_id,
        fromId: notiObj.noti_meta.id,
        noti_type: notiObj.noti_type,
        noti_meta: JSON.stringify(notiObj.noti_meta)
     })
  }
  async updateNotification(notiObj : EventsList['new:notification'], id){
    let other_count = notiObj.other_count - 1
    if(notiObj.noti_type == 'feed_comment'){ // find unique users who commented on it
      let count = await Database
      .from('comments').where('user_id', '!=', notiObj.user_id).where('feed_id', notiObj.feed_id).countDistinct('user_id as total').first()
      other_count = count.total > 0 ? count.total - 1 : count.total
    }
    return Notification.query().where('id', id).update({
       user_id : notiObj.user_id,
       feed_id : notiObj.feed_id,
       comment_id : notiObj.comment_id,
       from_id: notiObj.noti_meta.id,
       noti_type: notiObj.noti_type,
       other_count: other_count,
       counter: 1,
       seen: 0,
       updated_at: new Date,
       noti_meta: JSON.stringify(notiObj.noti_meta)
    })
  }

  async onNewFriend(notiObj : EventsList['new:friend']){
    await Database
    .from('users')
    .where('id', notiObj.user_id).increment('friend_count')
   //   Ws.io.emit(`noti:${notiObj.user_id}`, notiObj)
     await Redis.publish('new_notification', JSON.stringify({ data: notiObj,user_id:notiObj.user_id }))

     this.sendFcmNoti(notiObj,notiObj.user_id, notiObj.from_id)
  }
  async onAcceptFriend(notiObj : EventsList['accept:friend']){
     // insert notifications
     await Notification.create({
        userId : notiObj.user_id,
        fromId: notiObj.noti_meta.id,
        noti_type: notiObj.noti_type,
        noti_meta: JSON.stringify(notiObj.noti_meta)
     })
   //   Ws.io.emit(`noti:${notiObj.user_id}`, notiObj)
     await Redis.publish('new_notification', JSON.stringify({ data: notiObj,user_id:notiObj.user_id }))

      this.sendFcmNoti(notiObj,notiObj.user_id ,notiObj.from_id)
  }
  async onNewMember(notiObj : EventsList['new:member']){
   //   console.log("this is calling from new member")
     // insert notifications
     await Notification.create({
        userId : notiObj.user_id,
        fromId: notiObj.from_id,
        group_id: notiObj.group_id,
        noti_type: notiObj.noti_type,
        noti_meta: JSON.stringify(notiObj.noti_meta)
     })
   //   Ws.io.emit(`noti:${notiObj.user_id}`, notiObj)
     await Redis.publish('new_notification', JSON.stringify({ data: notiObj,user_id:notiObj.user_id }))

     this.sendFcmNoti(notiObj,notiObj.user_id,notiObj.from_id)
  }

  async onNewChat(notiObj : EventsList['new:chat']){
   await Redis.publish('new_notification', JSON.stringify({ data: notiObj,user_id:notiObj.buddy_id }))
   //   Ws.io.emit(`noti:${notiObj.buddy_id}`, notiObj)
     this.sendFcmNoti(notiObj,notiObj.buddy_id,notiObj.from_id)
  }

  async sendFcmNoti(notiObj,user_id,from_id){
    // console.log(notiObj, "#########################################  from Push ###########################################")
   let user = await User.query().where('id', user_id).select('id','appToken').first()
   let sender = await User.query().where('id', from_id).select('id','first_name','last_name').first()
   // console.log(" ############################  New FCM Noti...",user_id,notiObj.noti_type,notiObj )


   if(!user || !sender) return
   if(!user.appToken) return
   let data
   let bodyText
   let title = process.env.IS_CAREVAN == "yes" ? "Carevan" : 'Buddyscript'
    if(notiObj.noti_type == 'new_chat'){
      data =  notiObj.chatObj
      title = sender.first_name + ' '+ sender.last_name
      // console.log(notiObj.chatObj,notiObj.chatObj.msg, "############################ notiObj.chatObj ##################################")
      if(notiObj.chatObj && notiObj.chatObj.msg){
        bodyText =  notiObj.chatObj.msg
      }
      else if( notiObj.chatObj.meta_data && notiObj.chatObj.meta_data?.link_meta != null ){
        bodyText = title + ' shared a link'
      }else if(  notiObj.chatObj.meta_data && notiObj.chatObj.meta_data?.feed_meta != null ){
        bodyText = title + ' shared a post'
      }
    }
    else{
      data =  notiObj.noti_meta
      bodyText = (data && data.action_text )? sender.first_name +' ' +sender.last_name + ' ' + data.action_text : "undefined"
    }
   //  console.log("appToken...",user.appToken, data, bodyText, "############# data")
   //  console.log("data ", bodyText, user.appToken , notiObj, title)
   var message = {
      to: user.appToken,
      collapse_key: 'your_collapse_key',
      notification: {
         title: title,
         body: bodyText ? bodyText :'undefined',
         sound:true
      },
      data: {
         click_action: "FLUTTER_NOTIFICATION_CLICK",
         metadata : notiObj,
         notiType: notiObj.noti_type? notiObj.noti_type : 'undifined'
      },
   }

  fcm.send(message, function(){
      // if (err) console.log("Something has gone wrong!" , err)
      // else console.log("Successfully sent with response: sss ", response)
  })
}




}
