import Feed from 'App/Models/Feed'
import Friend from 'App/Models/Friend'
import User from 'App/Models/User'
import Notification from 'App/Models/Notification';
import Database from '@ioc:Adonis/Lucid/Database'
import Block from 'App/Models/Block';
import Transection from 'App/Models/Transection';
import _ from "lodash";
import Report from 'App/Models/Report';
 
export default class ProfileQuery{
    public async getUserBasicOverView(username : string, userId) : Promise<User|null> {
       return User.query().where('username', username).preload('friend', (b) => {
                b.where('user_id', userId)
              })
              .where((builder) => {
               builder.whereDoesntHave('blockedUser', (qq) => {
                 qq.where('user_id', userId)
               })
               builder.whereDoesntHave('userBlocked',(q)=>{
                 q.where('blocked_user_id', userId )
                })
              })
              .first()
    }
    public async getProfileFeed(uid : number,more, privacy : string[],ok=false, auid){
       let q = Feed.query().whereIn('feed_privacy', privacy).whereIn('activity_type',[ 'feed','share'])
      .where('is_story',0)
      .where('user_id', uid).orderBy('id', 'desc')
            .preload('share', (sQuery) => {
               sQuery.preload('user')
               sQuery.preload('group',(a)=>{
               a.select('id','group_name','profile_pic','slug')
               })
               sQuery.preload('page',(a)=>{
               a.select('id','page_name','profile_pic','slug')
               })
               sQuery.preload('event',(a)=>{
               a.select('id','event_name','slug')
               })
               // sQuery.whereIn(['feed_privacy'], [
               //    ['Public']
               //  ])
               sQuery.orWhere('user_id',auid)
               sQuery.orWhere('feed_privacy','!=','ONLY ME')
               sQuery.preload('poll', (q) =>{
                q.preload('pollOptions', (r) =>{
                  r.preload('voteOption', (s) =>{
                    s.preload('user')
                  })
                  r.preload('isVoted', (t) =>{
                    t.where('user_id',  uid)
                  })
                  r.preload('user')
                })
                q.preload('isVotedOne',  (u) =>{
                  u.where('user_id' , uid)
                })
               
              })
            })
            .preload('poll', (q) =>{
              q.preload('pollOptions', (r) =>{
                r.preload('voteOption', (s) =>{
                  s.preload('user')
                })
                r.preload('isVoted', (t) =>{
                  t.where('user_id',  uid)
                })
                r.preload('user')
              })
              q.preload('isVotedOne',  (u) =>{
                u.where('user_id' , uid)
              })
              
               
            })
          .preload('user')
          .preload('group')
          .preload('page')
          .preload('event')
          .preload('savedPosts', (b) => {
            b.where('user_id', uid)
          })

          .preload('like', (b) => {
              b.where('user_id', auid)
          })
          .preload('likeUser', (b) => {
            b.preload('user')
         })
          .whereDoesntHave('hiddenPost', (postQuery) =>{
            postQuery.where('user_id', auid)
          })
          if(ok) {
            q.whereNull('event_id')
            q.whereNull('group_id')
          }
          if(more > 0){
            q.where('id', '<', more)
          }
        return q.limit(15)
    }
    async saveUserInfo(userColumnsObj : object, uid){
       return User.query().where('id', uid).update(userColumnsObj)
    }
    async getSearchFriend(str : any,  uid){
        let q = Database.from('users').join('friends', (query) => {
         query
          .on('users.id', '=', 'friends.user_id')
          .andOn('friends.friend_id', uid)
       }).select('users.id','users.is_online', 'users.first_name' , 'users.last_name', 'users.profile_pic')
       .whereRaw(`users.first_name LIKE '%${str.str}%'`).orWhereRaw(`users.last_name LIKE '%${str.str}%'`)

       return q
    }
    async getUserId(username: string){
       return User.query().where('username', username).select('id').first()
    }
    async getFriendLists(userId, uid){
      return User.query().whereHas('isfriend', (b)=>{
            b.where('friend_id', userId)
          }).preload('friend', (b) => {
              b.where('friend_id', uid)
          })
    }
    async getFriendListsBySearch(userId, str){
       let q = User.query().whereHas('isfriend', (b)=>{
        b.where('friend_id', userId)
        b.where('status', 'accepted')
      }).preload('friend')
      .select('id', 'is_online', 'first_name', 'last_name', 'profile_pic', 'username','about','cover')

      if(str){
        q.where((qq)=>{
          qq.where('first_name','LIKE','%'+str+'%')
          .orWhere('last_name','LIKE','%'+str+'%')
        })
        return q.limit(10)

      }
      return  q.limit(10)
    //   return User.query().whereHas('isfriend', (b)=>{
    //     b.where('friend_id', userId)
    //     b.where('status', 'accepted')
    // }).select('id', 'is_online', 'first_name', 'last_name', 'profile_pic', 'username','about','cover').orderBy('is_online','desc').paginate(page, limit)


    }
    async getFriendStatus(userId, uid){
       return Friend.query().where('user_id', userId).where('friend_id', uid).first()
    }
    async addFriendData(friends){
       return Friend.createMany(friends)
    }
    async deleteFriend(userId, uid){
       return Friend.query().where((q)=>{
            q.where('user_id', userId).where('friend_id', uid)
          }).orWhere((q)=>{
            q.where('user_id', uid).where('friend_id', userId)
        }).delete()
    }
    async decreaseFriendCount(userId){
      await Database
      .from('users')
      .where('id', userId).where('friend_count' , '>', 0).increment('friend_count', -1)
    }
    async updateFriendStatus(userId, uid){
       return Friend.query().where((q)=>{
            q.where('user_id', userId).where('friend_id', uid)
          }).orWhere((q)=>{
            q.where('user_id', uid).where('friend_id', userId)
        }).update({status: 'accepted'})
    }
    async getUserUploadedFile(fileType, uid, privacy){
       return Feed.query().where('user_id', uid).where('activity_type', 'feed')
       .whereIn('feed_privacy', privacy).where('is_story', false)
       .where('file_type', fileType).select('id','files')
    }
    async getNotification(limit, page, userId){
       return Notification.query().where('user_id', userId)
       .preload('from_user')
       .orderBy('updated_at', 'desc').paginate(page, limit)
    }
    async updateNoti(userId){
       return Notification.query().where('user_id', userId).where('counter', '>', 0).update({counter : 0})
    }
    async unSeenNoti(userId, id){
       return Notification.query().where('user_id', userId).where('id',id).update({seen : 0})
    }
    async seenNoti(userId, id){
      return Notification.query().where('user_id', userId).where('id',id).update({seen : 1})
   }
   async deleteNoti(userId, id){
      return Notification.query().where('user_id', userId).where('id',id).delete()
   }
   async deleteUser(id){
    return User.query().where('id',id).delete()
 }
 async deleteFeed(id){
 
  return Feed.query().where('id',id).delete()
}
 async deleteReport(id){
  return Report.query().where('id',id).delete()
}
   async markAsReadAll(userId){
      return Notification.query().where('user_id', userId).update({seen : 1})
   }
    async mutualFriendsQuery(userId,limit){
      return User.query()
      .whereDoesntHave('isfriend', (b)=>{
          b.where('friend_id', userId)
      })
      .whereHas('isfriend', (b)=>{
          b.whereIn('friend_id', (builder)=>{
            builder.select('friend_id').from('friends').where('user_id',userId)
          })
      })
      // .whereDoesntHave('block', (b)=>{
      //    b.where('user_id', userId)
      // })
      .where((builder) => {
         builder.whereDoesntHave('blockedUser', (qq) => {
           qq.where('user_id', userId)
         })
         builder.whereDoesntHave('userBlocked',(q)=>{
           q.where('blocked_user_id', userId )
          })
      })
      .where('id', '!=', userId)
      .select('id', 'is_online', 'first_name', 'last_name', 'profile_pic', 'username','about').orderBy('is_online','desc').limit(limit)
    }
    async sameCityPeopleQuery(current_city,userId,limit){
      return User.query()
      .where('current_city',current_city)
      // .whereDoesntHave('block', (b)=>{
      //    b.where('user_id', userId)
      // })
      .where((builder) => {
         builder.whereDoesntHave('blockedUser', (qq) => {
           qq.where('user_id', userId)
         })
         builder.whereDoesntHave('userBlocked',(q)=>{
           q.where('blocked_user_id', userId )
          })
      })
      .where('id', '!=', userId)
      .select('id', 'is_online', 'first_name', 'last_name', 'profile_pic', 'username','about').orderBy('is_online','desc').limit(limit)
    }
    async randomPeopleList(userId,limit){
      return User.query()
      .whereDoesntHave('isfriend', (b)=>{
          b.where('friend_id', userId)
      })
      // .whereDoesntHave('block', (b)=>{
      //    b.where('user_id', userId)
      // })
      .where((builder) => {
         builder.whereDoesntHave('blockedUser', (qq) => {
           qq.where('user_id', userId)
         })
         builder.whereDoesntHave('userBlocked',(q)=>{
           q.where('blocked_user_id', userId )
          })
      })
      .where('id', '!=', userId)
      .select('id', 'is_online', 'first_name', 'last_name', 'profile_pic', 'username','about').orderBy('is_online','desc').limit(limit)
    }
    async getFriendRequests(page, limit,userId){
       return Friend.query().where('user_id', userId).where('status', 'waiting').orderBy('id','desc')
       .preload('friend').paginate(page, limit)
    }
    async resetFriend(userId){
       return User.query().where('id', userId).update({'friend_count' : 0})
    }
    async deleteRequest(userId,uid){
      return Friend.query().where((q)=>{
            q.where('user_id', userId).where('friend_id', uid)
          }).orWhere((q)=>{
            q.where('user_id', uid).where('friend_id', userId)
      }).delete()
    }
    async getFriendListsForChat(limit,page,userId){
      return User.query().whereHas('isfriend', (b)=>{
          b.where('friend_id', userId)
          b.where('status', 'accepted')
      }).select('id', 'is_online', 'first_name', 'last_name', 'profile_pic', 'username','about','cover').orderBy('is_online','desc').paginate(page, limit)
    }
    async peopleList(limit,page,userId){
      return User.query()
      .whereDoesntHave('isfriend', (b)=>{
          b.where('friend_id', userId)
      })
      // .whereDoesntHave('block', (b)=>{
      //    b.where('user_id', userId)
      // })
      .where((builder) => {
         builder.whereDoesntHave('blockedUser', (qq) => {
           qq.where('user_id', userId)
         })
         builder.whereDoesntHave('userBlocked',(q)=>{
           q.where('blocked_user_id', userId )
          })
      })
      .where('id', '!=', userId)
      .select('id', 'is_online', 'first_name', 'last_name', 'profile_pic', 'cover','username','about')
      // .orderBy('is_online','desc')
      // .orderBy('id','desc')
      .paginate(page, limit)
    }
    async blockedPeopleList(limit,page,userId){
      return User.query().whereHas('block',(b)=>{
         b.where('user_id', userId)
     }).select('id', 'username', 'first_name', 'last_name', 'profile_pic')
     .orderBy('id','desc')
     .paginate(page, limit)
    }
    async getPeopleListBySearch(str,userId){
       str = await  str.replace(/[&\/\\#,+@^()$~%.'":*?<>{}]/g, '');
       if(str == '') return []
       let searchTxt = `${str}*`
        return User.query().where('id', '!=', userId).where(q=>{
          q.whereRaw("MATCH (first_name, last_name) AGAINST (? IN BOOLEAN MODE)",[searchTxt])
        })
        .select('id', 'is_online', 'first_name', 'last_name', 'profile_pic', 'username')
        .orderBy('is_online','desc').limit(20)

        // let q = User.query().select('id', 'is_online', 'first_name', 'last_name', 'profile_pic', 'username')
        // .orderBy('is_online','desc').limit(20)
        // q.whereHas('isInboxMember', (builder)=>{
        //   builder.where('is_left', 0)
        //   builder.preload('inbox')
        //   builder.whereHas('inbox', (builder2)=>{
        //     builder2.whereRaw("MATCH (group_name) AGAINST (? IN BOOLEAN MODE)",[searchTxt])
        //   })

        // })
        // q.orWhere((m)=>{
        //   m.where('id', '!=', userId)
        //   m.whereRaw("MATCH (first_name, last_name) AGAINST (? IN BOOLEAN MODE)",[searchTxt])
        // })

        // return qF




    }

    async getAllUser(userId){
 
    
       return User.query().where('id', '!=', userId)
       .select('id', 'is_online', 'first_name', 'last_name', 'profile_pic', 'username')
       .orderBy('is_online','desc')

   }
   async getAllReport(){
 
    
    return Report.query()
    //.select('id', 'is_online', 'first_name', 'last_name', 'profile_pic', 'username')
    .orderBy('created_at','desc')

}

    async blockUser(data){
       return Block.create(data)
    }

    async unBlockUser(uId, bId){
       return Block.query().where('user_id',uId).where('blocked_user_id',bId).delete()
    }

    async darkModeChange(id, value){
       return User.query().where('id', id).update({'dark_mode':value})
    }
    async unblockUser(bId){
       return Block.query().where('blocked_user_id', bId).delete();
    }
    async ignoreSuggesion(uid){
      return User.query().where('id', uid).update({'ignored_sugegssion':1})
    }
    async signgleBlock(column, value, column2, value2){
       return Block.query().where(column, value).where(column2, value2)
       .orWhere((query) => {
        query
          .where(column2, value)
          .where(column, value2)
        })

       .first();
    }

    async checkBlock(value,  value2){
      //  return Block.query().where(column, value).where(column2, value2).first()
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
    public async getUserTransactionList(userId:number, page:number, limit:number){
      return Transection.query().where('user_id', userId).paginate(page, limit)
    }
    public async update_last_active_time(data){
      return User.query().where('id', data.id).update(data)
    }

}
