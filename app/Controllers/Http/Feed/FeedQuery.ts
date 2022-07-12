import Feed from 'App/Models/Feed'
import Report from 'App/Models/Report'
import Like from 'App/Models/Like'
import Campaign from 'App/Models/Campaign'
import AdRate from 'App/Models/AdRate'
import Savepost from 'App/Models/Savepost'
import User from 'App/Models/User'
import Page from 'App/Models/Page'
import Poll from 'App/Models/Poll'
import PollOption from 'App/Models/PollOption'
import VoteOption from 'App/Models/VoteOption'
import FeelingsCategory from 'App/Models/FeelingsCategory'
import FeelingSubCategory from 'App/Models/FeelingSubCategory'

import HiddenFeed from 'App/Models/HiddenFeed'
import Database from '@ioc:Adonis/Lucid/Database'
// import Notification from 'App/Models/Notification'
// import Database from '@ioc:Adonis/Lucid/Database';
export default class FeedQuery{
  async updateAddData(data){

       await Campaign.query().where('id', data.id).update(data)
       return Campaign.query().where('id', data.id).first()

  }
  async getSingleStoryFeed(id){
    return Feed.query().select('id','feed_txt','files').where('id',id).first()
  }
  async getSingleAdds(id){
    return Campaign.query().where('id', id).withCount('totalAdClick',(q)=>{
      q.where('activity_type', 'click')
    }).withCount('totalAdImpression', (q) => {
      q.where('activity_type', 'impression')
    }).first()
  }
  async getRate(){
    return AdRate.query().where('activity_type', 'click').orWhere('activity_type','impression')

  }

  async deleteFeed(id){
    return Feed.query().where('id',id).delete()
  }

  async createReport(data){
    return Report.create(data)
  }
  async hidePost(data){
    return HiddenFeed.firstOrCreate(data)
  }
  async createFeed(data){
    // return data
    return Feed.create(data)
  }
  async createPool(data){
    return Poll.create(data)
  }

  async insertPollOptions(data){
    for await (const element of data.poll_options) {
      await PollOption.create({
        pollId: data.poll_id,
        user_id: data.user_id,
        text: element    ,
        total_vote:0
      })
    }
    return "Inserted"
  }
  async feedIncrement(feedId, value){
    return Feed.query().where('id', feedId).increment('share_count', value)
  }
  async pendingAdsChecking(current_date, data){
    return Campaign.query().where('start_date_time', '<=', current_date).where('status', 'Pending').update(data)
  }
  async getAdds(current_date, user,last_id): Promise<Campaign[]>{
        let query =  Campaign.query()
      .where('start_date_time', '<=', current_date)
      .where('end_date_time', '>=', current_date)
      .where('status', 'Running')
      .where('user_id', '!=', user.id)
      .where(builder => {
        builder.where('gender', user.gender)
        builder.orWhereNull('gender')
        builder.orWhere('gender', 'all')

      })
      if(user.birth_date){
        query.where(builder => {
          builder.where('age_to', '<=', user.birth_date)
          builder.orWhereNull('age_to')
        })
        .where(builder => {
          builder.where('age_from', '>=', user.birth_date)
          builder.orWhereNull('age_from')
        })
      }
      if(user.country){
        query.where(builder => {
          builder.where('country', user.country)
          builder.orWhereNull('country')
          builder.orWhere('country', 'all')
        })
      }

      query.select('id', 'feed_id')
    if (last_id) query.where('id', '<', last_id)
      .orderBy('id', 'desc')
      .limit(5)
    return  query
  }

  getStoryFeed(uid,limit,today){
     let q = Feed.query().select('user_id')
            .where((builder) => {

              builder.whereDoesntHave('blockedUser', (qq) => {
                qq.where('user_id', uid)
              })
              builder.whereDoesntHave('userBlocked',(q)=>{
                q.where('blocked_user_id', uid )
               })
            })

          // q.preload("friend")
          q.where((builder) => {

            builder.where('is_story', 1)
            builder.where('created_at', '>=',today)
            builder.whereHas('friend', (qq) => {
              qq.where('friend_id', uid)
              qq.where('status', 'accepted')
            })
            builder.whereIn('feed_privacy', ['PUBLIC', 'FRIENDS'])
            builder.where('activity_type', 'feed')
          })
          q.orWhere((builder1) => {
            builder1.where('is_story', 1)
            builder1.where('created_at', '>=',today)
            builder1.where('activity_type', 'page')
            builder1.whereHas('is_page_followed', (qq) => {
             qq.where('user_id', uid)
             })
          })
          q.orWhere((builder1) => {
            builder1.where('activity_type', 'event')
            builder1.where('created_at', '>=',today)
            builder1.whereHas('is_event_invited', (qq) => {
             qq.where('user_id', uid)
             }).where('is_story', 1)
          })
          q.orWhere((builder1) => {
                builder1.where('user_id', uid)
                builder1.where('created_at', '>=',today)
                builder1.where('user_id', uid)
                builder1.where('is_story', 1)
            }
          )

      // }
      q.orderBy('user_id', 'desc')

     .groupBy('userId')
     if(limit>0) return q.limit(limit)
     return q
  }
  getStoryFeedDetails(id,today, uid){
    // return uid
    let q = User.query().select('id','first_name','last_name','username','profile_pic','created_at').where('id', id)
    .preload('allfeed', (builder) => {
      builder.where('is_story', 1)
      builder.where('created_at', '>=',today)
      builder.where((builder2)=>{
        builder2.whereIn('feed_privacy', ['PUBLIC', 'FRIENDS'])
        builder2.orWhere((builder3) =>{
          builder3.where('user_id', uid)
          builder3.whereIn('feed_privacy', ['PUBLIC', 'FRIENDS', "ONLY ME"])
        })
      })
      .orderBy('id','desc')
      .select('id','feed_txt','bg_color','files','created_at')
    })
    return q.first()
  }
  getPageNotFollow(id){
    return Page.query()
    .where('user_id','!=',id)
    .preload('user').preload('pageFollowers')

    .whereDoesntHave('pageFollowers', (qq) => {
           qq.where('user_id', id)
    })
    .whereDoesntHave('ignore', (qq) => {
      qq.where('user_id', id)
  })
    .limit(2)


  }
  getFellings(){
    return FeelingsCategory.query().where('type', 'FEELINGS')
  }
  searchForFeelings(str, type){
    return FeelingsCategory.query().where('type', type).where('name','LIKE','%'+str+'%')
  }
  searchForSubActivities(str, feelings_category_id){
    return FeelingSubCategory.query().where('feelings_category_id', feelings_category_id).where('name','LIKE','%'+str+'%')
  }

  getActivities(){
    return FeelingsCategory.query().where('type', 'ACTIVITY')
  }
  getSubActivities(feelings_category_id){
    return FeelingSubCategory.query().where('feelings_category_id', feelings_category_id)
  }
  getAllReactionType(feed_id){
    return Like.query().where('feed_id', feed_id)
    .select('id', 'user_id', 'feed_id', 'reaction_type', Database.raw('Count(*) as total_likes'))
    .groupBy('reaction_type')
    .orderBy('total_likes', 'desc')
  }
  getReactedPeople(feed_id, reaction, more_id ,uid){
    let q = Like.query().where('feed_id', feed_id).where('reaction_type', reaction)
    .preload('user', (builder)=>{
      builder.preload('friend', (b) => {
        b.where('user_id', uid)
      })
    })
    if(more_id > 0){
      q.where('id', '<', more_id)
    }
    return q.orderBy('id', 'desc').limit(30)
  }
  getAllReactedPeople(feed_id, more_id ,uid){
    let q = Like.query().where('feed_id', feed_id).preload('user', (builder)=>{
            builder.preload('friend', (b) => {
              b.where('user_id', uid)
            })
      })

    if(more_id > 0){
      q.where('id', '<', more_id)
    }
    return q.orderBy('id', 'desc').limit(30)
  }

  getStoryFeedDescriptions(ids){
    let q = User.query().select('id','first_name','last_name','profile_pic','created_at').whereIn('id', ids)
    .preload('story', (builder) => {
      builder.where('is_story', 1)
      .orderBy('id','desc')
      .select('id','feed_txt','files','bg_color','created_at')
    })
     return q


  }
  getFullStoryFeedDescriptions(ids, today){
    let q = User.query().select('id','first_name','last_name', 'username','profile_pic','created_at').whereIn('id', ids)
    .preload('allfeed', (builder) => {
      builder.where('is_story', 1)
      builder.where('created_at', '>=',today)
      .orderBy('id','desc')
      .select('id','feed_txt','files','bg_color','created_at','is_story')

    })
     return q


  }

  async getAllFeed(uid, more){


    let q = Feed.query()
          .where('is_story', 0)
           .preload('share', (sQuery) => {
          //   sQuery.where('feed_privacy', '!=', 'ONLY ME')
             sQuery.preload('user')
             sQuery.preload('group',(a)=>{
               a.select('id','group_name','slug','cover')
             })
             sQuery.preload('page',(a)=>{
               a.select('id','page_name','slug','profile_pic')
             })
             sQuery.preload('event',(a)=>{
               a.select('id','event_name','slug','user_id', 'cover')
             })
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
           // .preload('user',qq=>{
           //     qq.select('id','first_name','last_name','username', 'profile_pic')
           // })
           .preload('user', (usersQuery) =>{
             usersQuery.select('id','first_name','last_name','username', 'profile_pic')
           })
           .where((builder) => {
             builder.where('is_story', 0)
             builder.whereDoesntHave('blockedUser', (qq) => {
               qq.where('user_id', uid)
             })
             builder.whereDoesntHave('userBlocked',(q)=>{
               q.where('blocked_user_id', uid )
              })
           })
           .whereDoesntHave('hiddenPost', (postQuery) =>{
             postQuery.where('user_id', uid)
           })
           .preload('group')
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
           .where((builder) => {
             builder.where((query) => {
               query
                  .whereNull('group_id')
              })
             builder.orWhere((query) => {
               query
                 .whereNotNull('group_id')
                 .whereHas('group', (groupQuery) => {
                   groupQuery.where('group_privacy', 'PUBLIC')
                   groupQuery.orWhere((memberQuery) => {
                     memberQuery.whereHas('is_member', (memberQuery2) => {
                       memberQuery2.where('user_id', uid)
                     })
                   })
                 })
             })
           })
           .preload('event')
           .preload('page')
           .preload('like', (b) => {
               b.where('user_id', uid)
           })
           .preload('likeUser', (b) => {
              b.preload('user')
           })
            .preload('savedPosts', (b) => {
             b.where('user_id', uid)
           })
    //  if(feed_type == 'world'){
    //    q.where('feed_privacy', 'PUBLIC')
    //  }
    //  else if(feed_type == 'savePost'){
    //    q.whereHas('savedPosts', (b) => {
    //      b.where('user_id', uid)
    //    })
    //  }
    //  else{
    //    q.where((r) =>{
    //      r.where((builder) => {
    //        builder.where('is_story', 0)
    //        builder.whereHas('friend', (qq) => {
    //          qq.where('friend_id', uid)
    //          qq.where('status', 'accepted')
    //        })
    //        builder.whereIn('feed_privacy', ['PUBLIC', 'FRIENDS'])
    //        builder.where('activity_type', 'feed')
    //      })
    //      r.orWhere((builder1) => {
    //        builder1.where('is_story', 0)
    //        builder1.where('activity_type', 'page')
    //        builder1.whereHas('is_page_followed', (qq) => {
    //         qq.where('user_id', uid)
    //         })
    //      })
    //      r.orWhere((builder1) => {
    //        builder1.where('is_story', 0)
    //        builder1.where('activity_type', 'event')
    //        builder1.whereHas('is_event_invited', (qq) => {
    //         qq.where('user_id', uid)
    //         })
    //      })
    //      r.orWhere((builder1) => {
    //        builder1.where('is_story', 0)
    //        builder1.where('user_id',  uid)
    //      })
    //    })


    //  }

     if(more > 0){
         q.where('id', '<', more)
       }
    return q.orderBy('id', 'desc').limit(15)
 }
  async getFeed(uid, more, feed_type){


     let q = Feed.query()
           .where('is_story', 0)
            .preload('share', (sQuery) => {
              sQuery.where('feed_privacy', '!=', 'ONLY ME')
              sQuery.preload('user')
              sQuery.preload('group',(a)=>{
                a.select('id','group_name','slug','cover')
              })
              sQuery.preload('page',(a)=>{
                a.select('id','page_name','slug','profile_pic')
              })
              sQuery.preload('event',(a)=>{
                a.select('id','event_name','slug','user_id', 'cover')
              })
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
            // .preload('user',qq=>{
            //     qq.select('id','first_name','last_name','username', 'profile_pic')
            // })
            .preload('user', (usersQuery) =>{
              usersQuery.select('id','first_name','last_name','username', 'profile_pic')
            })
            .where((builder) => {
              builder.where('is_story', 0)
              builder.whereDoesntHave('blockedUser', (qq) => {
                qq.where('user_id', uid)
              })
              builder.whereDoesntHave('userBlocked',(q)=>{
                q.where('blocked_user_id', uid )
               })
            })
            .whereDoesntHave('hiddenPost', (postQuery) =>{
              postQuery.where('user_id', uid)
            })
            .preload('group')
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
            .where((builder) => {
              builder.where((query) => {
                query
                   .whereNull('group_id')
               })
              builder.orWhere((query) => {
                query
                  .whereNotNull('group_id')
                  .whereHas('group', (groupQuery) => {
                    groupQuery.where('group_privacy', 'PUBLIC')
                    groupQuery.orWhere((memberQuery) => {
                      memberQuery.whereHas('is_member', (memberQuery2) => {
                        memberQuery2.where('user_id', uid)
                      })
                    })
                  })
              })
            })
            .preload('event')
            .preload('page')
            .preload('like', (b) => {
                b.where('user_id', uid)
            })
            .preload('likeUser', (b) => {
               b.preload('user')
            })
             .preload('savedPosts', (b) => {
              b.where('user_id', uid)
            })
      if(feed_type == 'world'){
        q.where('feed_privacy', 'PUBLIC')
      }
      else if(feed_type == 'savePost'){
        q.whereHas('savedPosts', (b) => {
          b.where('user_id', uid)
        })
      }
      else{
        q.where((r) =>{
          r.where((builder) => {
            builder.where('is_story', 0)
            builder.whereHas('friend', (qq) => {
              qq.where('friend_id', uid)
              qq.where('status', 'accepted')
            })
            builder.whereIn('feed_privacy', ['PUBLIC', 'FRIENDS'])
            builder.where('activity_type', 'feed')
          })
          r.orWhere((builder1) => {
            builder1.where('is_story', 0)
            builder1.where('activity_type', 'page')
            builder1.whereHas('is_page_followed', (qq) => {
             qq.where('user_id', uid)
             })
          })
          r.orWhere((builder1) => {
            builder1.where('is_story', 0)
            builder1.where('activity_type', 'event')
            builder1.whereHas('is_event_invited', (qq) => {
             qq.where('user_id', uid)
             })
          })
          r.orWhere((builder1) => {
            builder1.where('is_story', 0)
            builder1.where('user_id',  uid)
          })
        })


      }

      if(more > 0){
          q.where('id', '<', more)
        }
     return q.orderBy('id', 'desc').limit(15)
  }

  async getFeedLike(fId){
    return Like.query().where('feed_id', fId)
    .select('id', 'user_id', 'feed_id', 'reaction_type', Database.raw('Count(*) as total_likes'))
    .groupBy('reaction_type')
    .orderBy('total_likes', 'desc')
    .limit(3)
  }
  async getTotalVote(pId){
    return VoteOption.query().where('poll_id', pId)
    .pojo<{ total: number }>().count('id as total')
      .first()
  }
  async getSingleFeed(id,uid, privacy){
     let feed :any= Feed.query().where('id', id)
       .orderBy('id', 'desc')

      .preload('share', (sQuery) => {
        sQuery.where('feed_privacy', '!=', 'ONLY ME')
        sQuery.preload('user')
        sQuery.preload('group',(a)=>{
          a.select('id','group_name','slug','profile_pic')
        })
        sQuery.preload('page',(a)=>{
          a.select('id','page_name','slug','profile_pic','user_id')
        })
        sQuery.preload('event',(a)=>{
          a.select('id','event_name','slug', 'user_id', 'cover')
        })
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

      .preload('user')
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
      //  .preload('blockedUser',(q)=>{
      //       q.where('user_id', uid )
      //  })
      //  .preload('userBlocked',(q)=>{
      //       q.where('blocked_user_id', uid )
      //  })
      .where((builder) => {
        builder.whereDoesntHave('blockedUser', (qq) => {
          qq.where('user_id', uid)
        })
        builder.whereDoesntHave('userBlocked',(q)=>{
          q.where('blocked_user_id', uid )
         })
      })
      .whereDoesntHave('hiddenPost', (postQuery) =>{
        postQuery.where('user_id', uid)
      })
      // .preload('user', (usersQuery) =>{
      //   usersQuery.preload('block',(q)=>{
      //     q.where('user_id', uid )
      //  })
      // })
       .preload('page', (sQuery) => {
        sQuery.select('id','page_name','slug','profile_pic','user_id')
      })
      .preload('group', (sQuery) => {
        sQuery.select('id','group_name','slug','profile_pic')
      })
      .preload('event', (sQuery) => {
        sQuery.select('id','event_name','slug', 'user_id', 'cover')
      })
      .preload('savedPosts', (b) => {
        b.where('user_id', uid)
      })
      .preload('like', (b) => {
          b.where('user_id', uid)
      })
      .preload('likeUser', (b) => {
        b.preload('user')
      })


     if(!privacy){
        feed.where((q) =>{
          q.where('feed_privacy', '!=', 'ONLY ME')
          q.orWhere((builder)=>{
           builder.where('feed_privacy', 'ONLY ME')
           builder.where('user_id', uid)
         })
        })

     }

    return feed
  }
  async getFeedInfo(feed_id, uid){
    return Feed.query().where('id', feed_id).select('id','like_count', 'user_id')
    .preload('like', (b)=>{
      b.where('user_id', uid)
    })
    .preload('savedPosts', (b) => {
      b.where('user_id', uid)
    })
    .first()
  }
  getFeedById(feed_id){
    return Feed.query().where('id', feed_id).first()
  }
  async feedUserLike(fId, fui){
    return Like.query().pojo<{ total: number }>().where('feed_id', fId).where('user_id', fui).count('id as total').first()
  }
  async saveFeedforUser(data){
    return  await Savepost.firstOrCreate( {feed_id:data.feed_id,user_id:data.user_id}, {})
  }
  async unsaveFeedforUser(data){
    return  await Savepost.query().where('feed_id', data.feed_id).where('user_id',data.user_id).delete()
  }
  async deleteOrCreateLike(likeData, isLike, action){

    if(!isLike && (action === 'update' || action === 'deleteOrCreate')){
        return Like.create(likeData)
     }else if(isLike && action === 'update'){
        return Like.query().where('user_id', likeData.user_id).where('feed_id', likeData.feed_id).update({'reaction_type': likeData.reaction_type});
     }else{
      return Like.query().where('user_id', likeData.user_id).where('feed_id', likeData.feed_id).delete()
     }



  }
  async updateFeedLike(likesMeta, id){
     return Feed.query().where('id', id).update(likesMeta)
  }
  async updateOneFeed(obj, id){
    return Feed.query().where('id', id).update(obj)
  }
  async getPoll(feed_id){
    return Feed.query().where('id', feed_id).first()
  }
  async deletePoll(id){
    return Poll.query().where('id', id).delete()
  }

  async updateFeed(data){
   return Feed.query().where('id', data.id).update(data)
  }
}
