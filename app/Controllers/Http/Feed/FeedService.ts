import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import FeedQuery from './FeedQuery';
import { getLinkPreview } from 'link-preview-js';
import { cuid } from '@ioc:Adonis/Core/Helpers'
// import Application from '@ioc:Adonis/Core/Application'
import CustomHelpers from 'App/Helpers/CustomHelpers';
// const Redis = use('Redis')
import Redis from '@ioc:Adonis/Addons/Redis';
import Event from '@ioc:Adonis/Core/Event'
import Drive from '@ioc:Adonis/Core/Drive'
import * as _ from "lodash";
// var moment = require('moment');
import moment from 'moment'
// import { forIn } from 'lodash';
export default class FeedService {
    private feedQuery : FeedQuery
    private customHelpers : CustomHelpers
    constructor(){
      this.feedQuery = new FeedQuery
      this.customHelpers = new CustomHelpers
    }
    async gettest( ){
      await Redis.set('foo', 'bar')
      const value = await Redis.get('foo')
      return value
    }
    async testAd( ){
      await Redis.set('foo', 'bar')
      const value = await Redis.get('foo')
      return value
    }

    async createReport(vData, ctx : HttpContextContract){
      let data = ctx.request.all();
      delete data.isOpen
      data.user_id = ctx.auth.user?.id;
      data.text = vData.text
      data.feed_id = vData.feed_id
      return this.feedQuery.createReport(data)
    }
    async hidePost (data ){
      // return data
      let ob ={
        'feed_id':data.id,
        'user_id':data.user_id,
      }
       return this.feedQuery.hidePost(ob)

    }

    async createFeed(ctx : HttpContextContract){

      let data = ctx.request.all()

      data.poll_options = data.poll_options? JSON.parse(data.poll_options ) :[]
      data.poll_privacy = data.poll_privacy? JSON.parse(data.poll_privacy ) :{is_multiple_selected: false, allow_user_add_option:false }
      let userId:any = ctx.auth.user?.id
      data.is_background = data.is_background? data.is_background: 0
      data.user_id = userId
      if (data.poll_options.length > 0) {
        let poll = await this.feedQuery.createPool({
          is_multiple_selected: data.poll_privacy.is_multiple_selected ? 1 : 0,
          allow_user_add_option: data.poll_privacy.allow_user_add_option ? 1 : 0
        })
           data.poll_id = poll.id
           await this.feedQuery.insertPollOptions(
            {
              poll_id: poll.id,
              user_id:userId,
              poll_options: data.poll_options
            })
      }
      delete data.poll_privacy
      delete data.poll_options

      if(ctx.request.files('images')){
        let images:any
        images = await this.customHelpers.uploadImages3(ctx)
        if(images &&  images.length > 0){
            data.file_type = images[0].type
            data.files = JSON.stringify(images)
        }
      }

      delete data.uploadType

      let feed:any
      // let requestData = ctx.request.all()
      // return from
      // if(from && from != 'web'){
        // data.meta_data= JSON.stringify(data.meta_data)
      // }

      // if(data.page_id){
      //   delete data.user_id
      // }


      feed = await this.feedQuery.createFeed(data)
      // return feed

      feed.comments = []
      feed.comment_count  = 0
      feed.like_count  = 0
      feed.share_count  = 0
      //feed.like  = null

      let feedData = await this.getSingleFeed(feed.id,userId, feed.feed_privacy)

      if(data.share_id && feed){
        this.feedQuery.feedIncrement(data.share_id, 1)
      }
      let notiData = JSON.parse(JSON.stringify(feedData[0]))

      if(notiData && notiData.share && notiData.share.user_id){
        if(userId != notiData.share.user_id){
          let user = ctx.auth.user
          if(!user) return;
          let noti_meta = {
            id : user?.id,
            profile_pic : user?.profile_pic? this.customHelpers.getImage(user.profile_pic) :undefined,
            first_name : user?.first_name,
            last_name : user?.last_name,
            action_text: 'shared your post',
          }
          Event.emit('new:notification',
             {
              user_id: notiData.share.user_id,
              from_id: user.id,
              feed_id: notiData.share.id,
              noti_type : 'share_post',
              noti_meta: noti_meta,
              comment_id: undefined,
              other_count: notiData.share.share_count
            }
          )
        }
        return feedData[0]
      }

      return feedData[0]
    }




    async getAdds(ctx : HttpContextContract){
      // console.log("hello from get ads")
      let user:any = ctx.auth.user
      let current_date = this.customHelpers.getOnlyCurrentDate()

      return  await this.feedQuery.getAdds(current_date,user,null)
    }
    async getPageNotFollow(ctx : HttpContextContract){
      return this.feedQuery.getPageNotFollow( ctx.auth.user?.id)
    }

    async getFellings( ctx : HttpContextContract ){
      console.log(ctx.auth.user?.id)

      let feelings = await this.feedQuery.getFellings(  )
      for(let item of feelings){
        item.icon =  process.env.CLIENT+ item.icon
      }
      return feelings
    }
    async searchForFeelings( ctx : HttpContextContract ){
      let data = ctx.request.all()
      let type = data.type
      let str = data.str
      let feelings = await this.feedQuery.searchForFeelings( str , type)
      if(feelings.length > 0){
        for(let item of feelings){
          item.icon =  process.env.CLIENT+ item.icon
        }
      }
      return feelings
    }
    async searchForSubActivities( ctx : HttpContextContract ){
      let data = ctx.request.all()
      let str = data.str
      let feelings_category_id = data.id
      let feelings = await this.feedQuery.searchForSubActivities( str, feelings_category_id )
      if(feelings.length > 0){
        for(let item of feelings){
          item.icon =  process.env.CLIENT+ item.icon
        }
      }
      return feelings
    }
    async getActivities( ctx : HttpContextContract ){
      console.log(ctx.auth.user?.id)
      let feelings = await this.feedQuery.getActivities()
      if(feelings.length > 0){
        for(let item of feelings){
          item.icon =  process.env.CLIENT+ item.icon
        }
      }
      return feelings
    }
    async getSubActivities( ctx : HttpContextContract ){
      // console.log(ctx)
      let data = ctx.request.all()
      let feelings_category_id = data.id
      let feelings = await this.feedQuery.getSubActivities(feelings_category_id)
      if(feelings.length > 0){
        for(let item of feelings){
          item.icon =  process.env.CLIENT+ item.icon
        }
      }
      return feelings
    }
    async getAllReactionType( ctx : HttpContextContract ){
      // console.log(ctx)
      let data = ctx.request.all()
      let feed_id:number = data.id
      let allReaction = await this.feedQuery.getAllReactionType(feed_id)
      return allReaction
    }
    async getReactedPeople( ctx : HttpContextContract ){
      // console.log(ctx)
      let uid = ctx.auth.user?.id;
      let data = ctx.request.all()
      let feed_id:number = data.id
      let reaction:string = data.reaction
      let more_id:number = data.more
      let allReaction:any = []
      if(reaction == 'all') {
        allReaction = await this.feedQuery.getAllReactedPeople(feed_id, more_id, uid)
      }
      else{
        allReaction = await this.feedQuery.getReactedPeople(feed_id, reaction, more_id, uid)
      }
      return allReaction
    }
    async getFeed(ctx : HttpContextContract){
      // console.log('hello time1')
      let data = ctx.request.all()
      let user:any = ctx.auth.user
      // var start = new Date().getTime();
      let obj = { status : 'Running' }
      let current_date = this.customHelpers.getOnlyCurrentDate()
      this.feedQuery.pendingAdsChecking(current_date, obj)
      let pageAds:any = await Redis.get(`pageAds${user.id}`);
      pageAds = data.feed_type == "savePost" ?  [] : JSON.parse(pageAds)
      pageAds=[];
       if ((!pageAds || pageAds.length == 0) && data.feed_type != "savePost"){
        // console.log("Redis don't have pageAds ")
        pageAds = [];
        let ads = await this.feedQuery.getAdds(current_date,user,null)
        pageAds = ads
        await Redis.set(`pageAds${user.id}`, JSON.stringify(pageAds))
        await Redis.expire(`pageAds${user.id}`, 86400)
      }
      // else console.log("Redis  have pageAds ",pageAds )
      let newFeed:any=null;
      let ob :any= {}
      let  len:number = pageAds.length

      // console.log("Ads",len)
      if (len > 0) {
        let firstRandomIndex = Math.floor(Math.random() * pageAds.length);
        ob = pageAds[firstRandomIndex]
        newFeed  = await this.feedQuery.getSingleAdds(ob.id)
        await this.customHelpers.createAdActionEvent(ob.id, user.id, 'impression','page_ad')
        pageAds.splice(firstRandomIndex,1)
        if (len == 1) {
          pageAds = [];
          let ads = await this.feedQuery.getAdds(current_date,user, null)
          pageAds = ads
          await Redis.set(`pageAds${user.id}`, JSON.stringify(pageAds))
          await Redis.expire(`pageAds${user.id}`, 86400)
        }
        else {
          await Redis.set(`pageAds${user.id}`, JSON.stringify(pageAds))
        }
      }
      // console.log("newFeed on ---------------------------------------------------------------------------- ",newFeed )
      let feedData  = await this.feedQuery.getFeed(ctx.auth.user?.id, ctx.request.all().more,ctx.request.all().feed_type)
      // return feedData
      return this.customHelpers.feedResponse(feedData,newFeed, ctx.auth.user?.id)

    }

    async getStoryFeed(ctx : HttpContextContract){
      let data  = ctx.request.all()
      let user_id =  ctx.auth.user?.id
      let todayDate = moment().subtract(1, "days").format('YYYY-MM-DD HH:mm:ss');

      let limit:number  = data.limit? data.limit:6
      let id:number  = data.id? data.id:0
      let idss:any = await this.feedQuery.getStoryFeed(ctx.auth.user?.id,limit,todayDate)
      // return idss;
      idss = JSON.parse(JSON.stringify(idss))
      let  ids:any
      ids =[]

      for(let it of idss){
         if(id!=it.user_id ){
          ids.push(it.user_id)
        }

      }

      let feedData:any  = await this.feedQuery.getStoryFeedDescriptions(ids)
      // return feedData;
      let mainData:any=[]
      // return feedData
      let user_story = false
      let own_story ={}
      // return feedData
      for(let item of feedData){
          item.story.files = JSON.parse(item.story.files)
          if(item.story.feed_txt && item.story.feed_txt.trim()!=''){
            item.type='text'
            item.data=item.story.feed_txt
            item.bg_color = item.story.bg_color
          }

          else if(item.story.files && item.story.files.length>0){
            item.type=item.story.files[0].type
            item.data=item.story.files[0].fileLoc
          }
          let ob ={
            id:item.id,
            first_name:item.first_name,
            last_name:item.last_name,
            profile_pic:this.customHelpers.getImage(item.profile_pic),
            type:item.type,
            bg_color:item.bg_color?item.bg_color : null,
            data:this.customHelpers.getImage(item.data),
            created_at:item.story.created_at
          }
          if(item.id  == user_id){
            user_story = true
            own_story = ob
          }else{
            mainData.push(ob)
          }

      }
      mainData = user_story == true ? [own_story, ...mainData] : mainData


      // let i =0
      // for(let item of mainData){
      //   if(i==0){

      //   }
      //   if(i==1){
      //     item.type = 'image'
      //     item.data = 'https://ewr1.vultrobjects.com/filestore/cktx00wp2000amyxuehp23z3i.jpg'
      //   }
      //   if(i==2){
      //     item.type = 'video'
      //     item.data = 'https://www.w3schools.com/html/mov_bbb.mp4'


      //   }
      //   i++



      // }


      return mainData
    }

  async getStoryFeedDetails(ctx :HttpContextContract){
    let id = ctx.params.id
    let user_id =  ctx.auth.user?.id
    let todayDate = moment().subtract(1, "days").format('YYYY-MM-DD HH:mm:ss');
       let data:any = await  this.feedQuery.getStoryFeedDetails(id,todayDate,user_id)
      // return data
      data = JSON.parse(JSON.stringify(data))
      // return data
      let alldata:any
      alldata ={
        data:[],
        first_name:'',
        last_name:'',
        profile_pic:'',
        created_at:'',
        id:''
      }
      alldata.first_name=data.first_name
      alldata.last_name=data.last_name
      alldata.username=data.username
      alldata.profile_pic=data.profile_pic ?this.customHelpers.getImage(data.profile_pic) : undefined


      alldata.id=id
      let i =0
      for(let item of data.allfeed){

        let ob ={
          type:'text',
          data:'',
          bg_color:item.bg_color?item.bg_color : null,
          created_at: item.created_at,
          id:item.id
        }

        if(i==0)
        alldata.created_at=item.created_at
        i++
        if(item.feed_txt && item.feed_txt.trim()!=''){
          ob.data = item.feed_txt
          alldata.data.push(ob)
        }
        // return alldata
        if(item.files){
          item.files = JSON.parse(item.files)
          for(let item2 of item.files ){
            let bt = {
                type:item2.type,
                data:item2.fileLoc,
                bg_color:item.bg_color?item.bg_color : null,
                created_at:item.created_at,
                id:item.id
            }
               alldata.data.push(bt)
          }
        }

      }

      return alldata
    }

    async getAllstoryWithDetail(ctx :HttpContextContract){
      // let today_date = moment().format("YYYY-MM-DD")
      //  let today= moment(today_date)

      let user_id =  ctx.auth.user?.id

      let data_get  = ctx.request.all()
      let limit:number  = data_get.limit? data_get.limit:6
      let id:number  = data_get.id? data_get.id:0
      let todayDate = moment().subtract(1, "days").format('YYYY-MM-DD HH:mm:ss');
      // return todayDate
      let idss:any = await this.feedQuery.getStoryFeed(ctx.auth.user?.id,limit,todayDate)
      // return idss;
      idss = JSON.parse(JSON.stringify(idss))
      let  ids:any
      ids =[]
      for(let it of idss){
        if(id!=it.user_id ){
          ids.push(it.user_id)
        }
      }

      // return ids
      let feedData:any  = await this.feedQuery.getFullStoryFeedDescriptions(ids, todayDate)
      let mainData:any=[]
      let user_story = false
      let own_story ={}
      // return feedData
      for(let data of feedData){
        let alldata:any
        alldata ={
          data:[],
          first_name:'',
          last_name:'',
          username:'',
          profile_pic:'',
          created_at:'',
          id:''
        }
        alldata.first_name=data.first_name
        alldata.last_name=data.last_name
        alldata.username=data.username
        alldata.profile_pic= data.profile_pic ?this.customHelpers.getImage(data.profile_pic) :undefined
        alldata.id=data.id
        let i =0
        for(let item of data.allfeed){

          let ob ={
            type:'text',
            data:'',
            bg_color:item.bg_color?item.bg_color : null,
            id:item.id,
            created_at: item.created_at
          }
          if(i==0)
          alldata.created_at=item.created_at
          i++
          if(item.feed_txt && item.feed_txt.trim()!=''){
            ob.data = item.feed_txt
            alldata.data.push(ob)
          }
          // return alldata
          if(item.files){
            item.files = JSON.parse(item.files)
            for(let item2 of item.files ){
               let bt = {
                  type:item2.type,
                  data:item2.fileLoc,
                  id: item.id,
                  created_at:item.created_at
              }
                  alldata.data.push(bt)
            }
          }

        }
        if(alldata.id  == user_id ){
           user_story = true
           own_story = alldata
        }else{
          mainData.push(alldata)
        }
      }
      mainData = user_story == true ? [own_story, ...mainData] : mainData
      return mainData

    }


    async saveFeedforUser(ctx : HttpContextContract){
      let data = ctx.request.all()
      let user_id =  ctx.auth.user?.id
      let feed  = await this.feedQuery.getFeedInfo(data.feed_id,user_id)
      if(!feed) return ctx.response.status(404).send({msg: "This post has been deleted or you don't have permission to take this action!"})
      return await this.feedQuery.saveFeedforUser({
        feed_id: data.feed_id,
        user_id: user_id
      })
    }
    async unsaveFeedforUser(ctx : HttpContextContract){
      let data = ctx.request.all()
      let user_id =  ctx.auth.user?.id
      let feed  = await this.feedQuery.getFeedInfo(data.feed_id,user_id)
      if(!feed) return ctx.response.status(404).send({msg: "This post has been deleted or you don't have permission to take this action!"})
      return await this.feedQuery.unsaveFeedforUser({
        feed_id: data.feed_id,
        user_id: user_id
      })
    }
    async createLike(ctx : HttpContextContract){
      let data = ctx.request.all()

      data.user_id = ctx.auth.user?.id
      let feed  :any= await this.feedQuery.getFeedInfo(data.feed_id,ctx.auth.user?.id)
      if(!feed) return ctx.response.status(404).send({msg: "This post has been deleted or you don't have permission to take this action!"})
      // check if user has reacted before or not..
      if(feed.like && data.action == 'update'){ // user reacted on this post before...
        feed.like_count = feed.like_count
      }else if(!feed.like && (data.action == 'deleteOrCreate' || data.action == 'update')){
        feed.like_count++
      }else{
        feed.like_count --
      }

      let uid = ctx.auth.user?.id


      await Promise.all([
        this.feedQuery.deleteOrCreateLike({feed_id : data.feed_id, user_id : uid, reaction_type:data.reaction_type}, feed.like, data.action),
        this.feedQuery.updateFeedLike({like_count : feed.like_count}, data.feed_id)
      ])

      let feed_user_like = await this.feedQuery.feedUserLike(data.feed_id ,feed.userId);

      // fire notification events
      if(!feed.like && feed.userId != uid){
        let user = ctx.auth.user
        if(!user) return;
        let noti_meta = {
          id : user?.id,
          profile_pic :user?.profile_pic? this.customHelpers.getImage(user?.profile_pic) : undefined ,
          first_name : user?.first_name,
          last_name : user?.last_name,
          action_text: (feed_user_like?.total && feed.like_count >2) || (!feed_user_like?.total && feed.like_count >1) ? 'likes your post.':'like your post.'
        }

        noti_meta.action_text = data.reaction_type == 'LIKE'? 'likes': 'reacted on'
        noti_meta.action_text = noti_meta.action_text +' your post'
        Event.emit('new:notification',
           {
            user_id: feed.userId,
            from_id: user?.id,
            feed_id: feed.id,
            noti_type :'feed_like',
            noti_meta: noti_meta,
            comment_id: undefined,
            other_count: feed.like_count
          }
        )
        }else if(feed.like){
        Event.emit('delete:commentNotification',
        {
            user_id: feed.userId,
            from_id: uid?uid:0,
            feed_id: feed.id,
            comment_id: 0,
            noti_type :'feed_like',
            is_deleted:true
          }
        )
      }
      return feed.like_count
      // if(feed.like && feed.userId != uid ){
      //   let user = ctx.auth.user
      //   if(!user) return;
      //   let noti_meta = {
      //     id : user?.id,
      //     profile_pic : user?.profile_pic,
      //     first_name : user?.first_name,
      //     last_name : user?.last_name,
      //     action_text: (feed_user_like?.total && feed.like_count >2) || (!feed_user_like?.total && feed.like_count >1)? 'love your post':'loves your post'
      //   }
      //   Event.emit('new:notification',
      //      {
      //       user_id: feed.userId,
      //       from_id: user?.id,
      //       feed_id: feed.id,
      //       noti_type :'feed_unlike',
      //       noti_meta: noti_meta,
      //       comment_id: undefined,
      //       other_count: feed.like_count
      //     }
      //   )
      // }

    }

    async getLinkPreview(data){
      // let url =''
      var index1 = data.url.lastIndexOf('http');
      var index2 = data.url.lastIndexOf('https');
      if(index1 == -1 && index2 == -1 ){
        data.url = 'http://'+data.url
      }
      // return data.url
        try {
          let info = await getLinkPreview(`${data.url}`)
          return {
             success: true,
             metaData : info
          }
        } catch (error) {
          return {
            success: false,
            metaData : null
         }
        }
    }
    async uploadImage(ctx) {
       const images = ctx.request.files('images')
      let uploadedImages : any[] = []
      for (let image of images) {
        const fileName = `${cuid()}.${image.extname}`
        // await image.move(Application.publicPath('uploads'),{
        //   name: fileName,
        // })
        // let d= await  Drive.getSignedUrl('cdn')

       await image.move(await  Drive.getUrl('cdn'),{
          name: fileName,
        })
        let imgObj = {
          //  fileLoc : process.env.UPLOAD_URL+ '/uploads/'+fileName,
          //  fileLoc : 'https://cdn.socialnetworkstage.com/cdn/'+fileName,
           fileLoc : process.env.UPLOAD_URL+fileName,
           originalName: image.clientName,
           extname: image.extname,
           size: image.size,
           type:  ctx.request.all().uploadType
        }
        uploadedImages.push(imgObj)
      }
      return uploadedImages
    }

    async getSingleFeed(id,uid, privacy){
      let feedData  = await this.feedQuery.getSingleFeed(id,uid, privacy)
      return this.customHelpers.feedResponse(feedData,null, uid)

    }

    async updateFeed(ctx : HttpContextContract){
      let data = ctx.request.all()
      console.log(data, "on update")
      delete data.share_id
      let allFiles : any = []
      data.poll_options = data.poll_options? JSON.parse(data.poll_options ) :[]
      data.poll_privacy = data.poll_privacy? JSON.parse(data.poll_privacy ) :{is_multiple_selected: false, allow_user_add_option:false }
      let userId:any = ctx.auth.user?.id
      data.user_id = userId
      if (data.poll_options.length > 0) {
        let poll = await this.feedQuery.createPool({
          is_multiple_selected: data.poll_privacy.is_multiple_selected ? 1 : 0,
          allow_user_add_option: data.poll_privacy.allow_user_add_option ? 1 : 0
        })
          data.poll_id = poll.id
           await this.feedQuery.insertPollOptions(
            {
              poll_id: poll.id,
              user_id:userId,
              poll_options: data.poll_options
            })
      }else{
        let getPoll = await this.feedQuery.getPoll(data.id)
        if( getPoll && getPoll.pollId) {
          await this.feedQuery.deletePoll(getPoll.pollId)
        }
      }
      delete data.poll_privacy
      delete data.poll_options
      //


      data.feelings = data.feelings ? data.feelings :null
      if(ctx.request.files('images')){
        let images:any

          images = await this.customHelpers.uploadImages3(ctx)
        if(images &&  images.length > 0){
            // data.file_type = images[0].type
            allFiles = images
        }
      }else{
        data.files = null
      }


      if(data.old_files){ // add old file
          let oldFiles = JSON.parse(data.old_files)
          for(let d of oldFiles){
            allFiles.push(d)
          }
      }
      // stringify all files
      data.file_type = allFiles.length ? allFiles[0].type : null
      data.files = allFiles.length ? JSON.stringify(allFiles) : null
      // data.meta_data= JSON.stringify(data.meta_data)
      delete data.old_files
      delete data.uploadType

      if(data.page_id){
        delete data.user_id
      }
      return await this.feedQuery.updateFeed(data)


    }


    async deleteFeed(ctx : HttpContextContract){

      let data = ctx.request.all()
      let uid = ctx.auth.user?.id

       if(data.user_id == uid){
        if(data.share_id  ){
          this.feedQuery.feedIncrement(data.share_id, -1)
        }
        if(data.fileLoc && data.fileLoc != null){

          let feed:any = await this.feedQuery.getFeedById(data.id)
          let files = feed.files ? JSON.parse(feed.files) : []
          // let fileArray =[]
          if( files.length > 0 ){
            for (var i = 0; i < files.length; i++) {
              var index1 = files[i].fileLoc.search(data.fileLoc);
                if(index1 != -1){
                  files.splice(index1, 1)
                }
            }
            let obj ={
              files:null
            }
            if(files.length> 0)
            {
              feed.files = JSON.stringify(files)
              obj.files = feed.files
              return this.feedQuery.updateOneFeed(obj, data.id)
            }else{
              return await this.feedQuery.deleteFeed(data.id)
            }

          }
        }else{

          return await this.feedQuery.deleteFeed(data.id)
        }
      }
      return  ctx.response.status(422).send({message:"Invalid request"})
    }

    async deleteStoryFeed(ctx : HttpContextContract){
        let data = ctx.request.all()
        let feed = await this.feedQuery.getSingleStoryFeed(data.id)
        // if(feed && feed.meta) delete feed.meta
        let ob = {
          feed_txt:feed?.feed_txt,
          id:feed?.id,
          files:feed?.files
        }


        let files =(feed && feed.files) ? JSON.parse(feed.files) : []
        let flag = -1
        if(data.fileLoc && data.fileLoc != null && feed){

          if( files.length > 0 ){
            for (var i = 0; i < files.length; i++) {
               flag = files[i].fileLoc.search(data.fileLoc);
                if(flag != -1){
                  break
                }
            }

            if(flag!=-1){
              files.splice(flag, 1)
            }

            if(files.length> 0)
            {
              ob.files = JSON.stringify(files)
              return this.feedQuery.updateOneFeed(ob, data.id)
            }
            else if(feed.feed_txt && feed.feed_txt.trim()!=''){
              ob.files = JSON.stringify([])
              return this.feedQuery.updateOneFeed(ob, data.id)
            }
            else{
              return await this.feedQuery.deleteFeed(data.id)
            }
          }
        }
        else{
          if(feed && files.length> 0)
          {
            // return "here"
            ob.feed_txt =''
            return this.feedQuery.updateOneFeed(ob, data.id)
          }
          else{
            return  this.feedQuery.deleteFeed(data.id)
          }
        }
    }



};
