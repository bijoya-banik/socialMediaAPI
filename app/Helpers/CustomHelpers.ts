import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { cuid } from '@ioc:Adonis/Core/Helpers'

import Feed from 'App/Models/Feed'
import AdRate from 'App/Models/AdRate'
import TrackAd from 'App/Models/TrackAd'
import Campaign from 'App/Models/Campaign'
import Transection from 'App/Models/Transection'
import CampaignEvent from 'App/Models/CampaignEvent'
import CourseSubscriber from 'App/Models/CourseSubscriber'
import FeedQuery from '../Controllers/Http/Feed/FeedQuery';
import Application from '@ioc:Adonis/Core/Application'

import Drive from '@ioc:Adonis/Core/Drive'
import sharp from 'sharp';
// import Env from '@ioc:Adonis/Core/Env'


const AWS = require('aws-sdk');
const fs = require('fs');
const spacesEndpoint = new AWS.Endpoint('ewr1.vultrobjects.com');
// let ipLocalhost="http://192.168.108.224:3333";
// const spacesEndpoint = new AWS.Endpoint('nyc3.digitaloceanspaces.com');
// const s3 = new AWS.S3({
//    endpoint: spacesEndpoint,
//    region: 'nyc3',
//    secretAccessKey: 'Th0Myo2ohzuz4AeFgTgS6rjQaBLXBCgdnmBTosQA',
//    accessKeyId: 'YF70X80VRYM6J1O06VQ1'
// });
const s3 = new AWS.S3({
   endpoint: spacesEndpoint,
   region: 'nyc3',
   secretAccessKey: process.env.vulter_key,
   accessKeyId: process.env.vulter_id
});

export default class CustomHelpers {
  private feedQuery : FeedQuery
  constructor(){
    this.feedQuery = new FeedQuery
  }
   getImage(fileLoc:string ) {
   //   console.log( fileLoc, "fileLoc on getImage")
   //  let searched = fileLoc.indexOf('ewr1.vultrobjects.com')
   //  if(searched != -1){
   //    let url:string  = process.env.siteUrl? process.env.siteUrl : 'https://ewr1.vultrobjects.com'
   //    let updatedUrl:string =  fileLoc.replace('https://ewr1.vultrobjects.com', url)
   //    return updatedUrl
   //  }
   //  else
    return fileLoc
   // let url:string  = process.env.IS_CAREVAN == 'yes' ? 'http://carevanB.b-cdn.net' : 'http://divine9.b-cdn.net'

  }
   async createAdActionEvent(adId, uId, activity_type,ad_type){
      let rates = await AdRate.query().where('ad_type',ad_type).where('activity_type',activity_type).first();

      let data  = await  Campaign.query().where('id',adId).first()
      if(!data || !rates) return;
      // console.log("In The Wild")
      let spending_amount = data.spending_amount;
      spending_amount += rates.amount;

      if(spending_amount <= data.budget ){
          await TrackAd.create({
            ad_id: adId,
            user_id: uId,
            ad_type: ad_type,
            activity_type: activity_type,
            amount: rates.amount
        });
        await Campaign.query().where('id',adId).update({
         'spending_amount':spending_amount
        });
      }
      else {
         await this.addNewCampaignEvent(data,uId,'Stopped');
      }

      // return TrackAd.create({ ad_id: adId, user_id: uId, activity_type: activity_type, ad_type:'page_ad'})
   }

    /**
       * Compute the feed data and return back expected data
       * @param  {} feedData
       * @returns feed array
     */

   async  feedResponse(feedData,ad, user_id = 0){
       // console.log("We are in Feed Responseå")
      let randomIndex = Math.floor(Math.random() * feedData.length);
      if(ad){
         let adPost  = await this.getSinglePageAdPost(ad.feed_id, user_id);
         if(adPost) {
            adPost.campaign = ad;
            adPost.is_ad_post = true;
            feedData.splice(randomIndex, 0, adPost);
         }
      }

      for(let d of feedData){

         d.likeType = [];
         d.likeType =await this.feedQuery.getFeedLike(d.id);
         if(d.poll ){
            let isVotedAnyOne:any = await this.feedQuery.getTotalVote( d.pollId);
            if( isVotedAnyOne.total >0) d.poll.voteByAnyOne = 'yes'
            else d.poll.voteByAnyOne = 'no'
            // if(d.poll.pollOptions && d.poll.pollOptions.length >0){
            //    let len = d.poll.pollOptions.length
            //    let options = d.poll.pollOptions
            //    for(let i=0; i<len ;  i++){
            //       if(i+1 < len){
            //          if( options[i].voteOption.length < options[i+1].voteOption.length){
            //             [options[i], options[i+1]] = [options[i+1], options[i]]
            //             // console.log("swaped")
            //          }
            //          // console.log("have value to change")
            //       }
            //       // console.log("working on poll options")
            //    }
            // }
         }
         if(d.share && d.share.poll  ){

            let isVotedAnyOne:any = await this.feedQuery.getTotalVote( d.share.pollId);
            if( isVotedAnyOne.total >0) d.share.poll.voteByAnyOne = 'yes'
            else d.share.poll.voteByAnyOne = 'no'
            // if(d.share.poll.pollOptions && d.share.poll.pollOptions.length >0){
            //    let len = d.share.poll.pollOptions.length
            //    let options = d.share.poll.pollOptions
            //    for(let i=0; i<len ;  i++){
            //       if(i+1 < len){
            //          if( options[i].voteOption.length < options[i+1].voteOption.length){
            //             [options[i], options[i+1]] = [options[i+1], options[i]]
            //             // console.log("swaped")
            //          }
            //          // console.log("have value to change")
            //       }
            //       // console.log("working on poll options")
            //    }
            // }

         }
          d.is_feed_edit = false
          if(d.userId && user_id == d.userId){
            d.is_feed_edit = true
          }
          // return d.is_feed_edit
          if(!d.is_ad_post){
            d.is_ad_post = false
            d.campaign = null
          }

          if(d.share && d.share.files && d.share.files.length){
            try{
              d.share.files = d.share.files?JSON.parse(d.share.files):[]
              if(d.share.files.length){
              for(let file of d.share.files){
                // console.log(file, "on share")
                if(file.type == "image"  ){
                  file.fileLoc =  file.fileLoc? this.getImage(file.fileLoc) : ''
                }
                // console.log(file.fileLoc, "file file file")
              }
            }

            }catch(e){
              d.shareprob = true
            }
          }
          if(d.share && d.share.meta_data){
            try{
              d.share.meta_data = d.share.meta_data?JSON.parse(d.share.meta_data):''
              d.share.feelings = d.share.feelings?JSON.parse(d.share.feelings):null
            }catch(error){
              //  console.log(error)
            }
          }
          // console.log(d.id)
          d.files = d.files ? JSON.parse(d.files) : []
          if(d.files.length){
            for(let file of d.files){
              if(file.type == "image"){

                file.fileLoc = file.fileLoc?  this.getImage(file.fileLoc) : ''
              }
              //  file.fileLoc = await this.getImage(file.fileLoc)
              // console.log(file.fileLoc, "file file file")
            }
          }
          d.comments = []
          d.meta_data = JSON.parse(d.meta_data)
          d.feelings = JSON.parse(d.feelings)

          if (d.activity_type == 'share' ){
              if(d.share){
                d.share.comments = []
              }
          }
          if (d.activity_type == 'page' ){
            if(user_id == d.page.user_id){
              d.is_feed_edit = true
            }else{
              d.is_feed_edit = false
            }
            d.name = d.page.page_name
            d.url = `/page/${d.page.slug}/feed`
            d.pic = d.page.profile_pic
            d.uid = d.page.user_id
            d.slug = d.page.slug
          }
          else if (d.activity_type == 'group' && d.group){
            d.name = d.group.group_name
            d.url = `/group/${d.group.slug}/feed`
            d.pic = d.user? d.user.cover : d.group.cover
            d.uid = d.group.user_id
            d.slug = d.group.slug
            d.feed_from = 'group'

          }
          else if (d.activity_type == 'event' && d.event){
            d.name = d.event.event_name
            d.url = `/events/${d.event.slug}/feed`
            d.pic =  d.event.cover
            d.uid = d.event?.user_id
            d.slug = d.event.slug
          }
          else if(d.user) {
              d.name = `${d.user.first_name} ${d.user.last_name}`
              d.url = `/profile/${d.user.username}/feed`
              d.pic = d.user.profile_pic
              d.uid = d.user.id
              d.slug = d.user.username

          }
            d.group =null
            d.event =null
            d.pic = this.getImage(d.pic)
            if(d.user && d.user.profile_pic) d.user.profile_pic =  this.getImage(d.user.profile_pic)

          if(d.share){
            if (d.share.activity_type == 'page' && d.share.page){
              d.share.name = d.share.page.page_name
              d.share.url = `/page/${d.share.page.slug}/feed`
              d.share.pic = d.share.page.profile_pic
              d.share.uid = d.share.page.user_id
              d.share.slug = d.share.page.slug
              // if(user_id == d.share.page.user_id){
              //     d.is_feed_edit = true
              // }else{
              //     d.is_feed_edit = false
              // }
            }
            else if (d.share.activity_type == 'group' && d.share.group){
              d.share.name = d.share.group.group_name
              d.share.url = `/group/${d.share.group.slug}/feed`
              d.share.pic = d.share.group.cover
              d.share.slug = d.share.group.slug
              d.share.feed_from = 'group'
              //  return  d.share
            }
            else if (d.share.activity_type == 'event'){
              d.share.name =  d.share.event?.event_name
              d.share.url = `/events/${d.share.event?.slug}/feed`
              d.share.pic =  d.share.event?.cover
              d.share.uid = d.share.event?.user_id
              d.share.slug = d.share.event?.slug

            }
            else if( d.share.activity_type == 'feed' && d.share.user) {
              d.share.name = `${d.share.user.first_name} ${d.share.user.last_name}`
              d.share.url = `/profile/${d.share.user.username}/feed`
              d.share.pic = d.share.user.profile_pic
              d.share.uid = d.share.user.id
              d.share.slug = d.share.user.username
            }

            d.share.pic =  d.share.pic?  this.getImage(d.share.pic) : ''
            if(d.share.user && d.share.user.profile_pic) d.share.user.profile_pic =   this.getImage(d.share.user.profile_pic)

            // console.log(d.share, "######################## share #########################")
            d.share.group =null
            d.share.page =null
            d.share.event =null

          }

          // return d
        }
        return feedData
    }
    async getSinglePageAdPost(id, uid){
       return  Feed.query().where('id', id)
       .preload('page', (sQuery) => {
         sQuery.select('id','page_name','slug','profile_pic','user_id')
       })
       .preload('like', (b) => {
         b.where('user_id', uid)
       })
       .preload('savedPosts', (b) => {
          b.where('user_id', uid)
        })
       .first()
   }
  formateFiles(assets : any[]){
       let allFiles : any = []
       for(let item of assets){
          if(!item.files) continue
          let file:any =[]
          try{
              file = (!item.files || item.files==null || item.files.length==0)?[]: JSON.parse(item.files)
            }catch(e){}

          for(let f of file){
            //  f.hashName = `http://localhost:3333/uploads/${f.fileLoc}`
             f.hashName = `${f.fileLoc}`
             f.id = item.id
             if(f.hashName) f.hashName =  this.getImage(f.hashName)
             allFiles.push(f)
            //  console.log(f, "from photos format")
          }
       }
      return allFiles
    }
    formateFilesForVideos(assets : any[]){
      let allFiles : any = []
      for(let item of assets){
         if(!item.files) continue
         let file:any =[]
         try{
             file = (!item.files || item.files==null || item.files.length==0)?[]: JSON.parse(item.files)
           }catch(e){}

         for(let f of file){
           //  f.hashName = `http://localhost:3333/uploads/${f.fileLoc}`
            f.hashName = `${f.fileLoc}`
            f.id = item.id
            allFiles.push(f)
            // console.log(f, "from photos format")
         }
      }
     return allFiles
    }
    formateNotification(notification){
        for(let n of notification){
           n.noti_meta = JSON.parse(n.noti_meta)
        }
        let alldata = JSON.parse(JSON.stringify(notification))
        for(let items of alldata.data){
          // return items
          if(items.noti_meta.profile_pic) items.noti_meta.profile_pic =  this.getImage(items.noti_meta.profile_pic)
          if(items.from_user.profile_pic) items.from_user.profile_pic =  this.getImage(items.from_user.profile_pic)
        }
        return alldata
        // return notification
    }
    forbidden(response){
       response.status(403).send({msg : 'Access forbidden'})
    }
     formateChat(chats){
       for(let c of chats){
          if(!c.files){
            c.files = []
          }else{
            c.files = JSON.parse(c.files)
             for(let file of c.files){
                file.fileLoc =  this.getImage(file.fileLoc)
               //  console.log(file, "file")
             }
          }
          c.reply_files = c.reply_files? JSON.parse(c.reply_files) : []
          c.meta_data = c.meta_data? JSON.parse(c.meta_data) : {link_meta:null, feed_meta:null}
       }
       return chats
    }
    formateInbox(inbox){
      if(inbox.length > 0)
      {
        for(let i of inbox){
          if(i.is_group == 1){
            i.is_seen = i.is_group_member.is_seen
          }
          let member_names = ''
          if(i.group_members.length > 0){
            member_names = i.group_members[0].user.first_name
            let j = 1
            for( j ; j < i.group_members.length &&  j < 3 ; j++)
            {
              member_names =  member_names +', ' + i.group_members[j].user.first_name
            }
            if( i.group_members.length <= 2 ){
              member_names =  member_names  + ' and you'
            }else if(i.group_members.length >2){
              member_names =  member_names  + ' and ' + (i.group_members.length -( j - 1))+ ' others'
            }
            i.member_names = member_names
            i.group_members = []
          }else if(i.is_group == 1){
            i.member_names = 'You only'
          }

        }
        return inbox
      }
      return inbox
    }


   async getobject() {
      const file = await s3.getObject({ Bucket: 'filestore',
      Key: 'cksnalkrw000r4wv05wq9128i.mp4' }).promise()
      return file.Body

    }
    async uploadImages(ctx: HttpContextContract): Promise<any> {

        const profileImage = ctx.request.file('file', {
            size: '10mb',
            extnames: ['jpg', 'png', 'jpeg', 'webp', 'doc', 'pdf'],
        })
         // return ctx.request.all()
        if (profileImage) {
         //  return profileImage.extname
            const fileName = `${cuid()}.${profileImage.extname}`


            let type = profileImage.extname

            //*aug 14
          //   await s3.putObject({
          //       Key: fileName,
          //      // Bucket: 'filestore',
          //      Bucket: process.env.vulter_folder,
          //       Body: fs.createReadStream(profileImage.tmpPath),
          //       ACL: "public-read",
          //   }).promise();
          //  let upFile = `https://ewr1.vultrobjects.com/${process.env.vulter_folder}/${fileName}`
           //*aug 14

           await profileImage.move(Application.publicPath('uploads'),{
              name: fileName,
            })
            let upFile = `http://localhost:3333/uploads/${fileName}`
         //  let ipLocalhost="http://192.168.108.224:3333";
        
            return ctx.response.status(200).send({ response: upFile, type: type});

        }
        return ctx.response.status(422).send({ message: 'Invalid request' });
    }

    async uploadImageIntoLocalDrive(ctx: HttpContextContract): Promise<any> {
      let profileImage = ctx.request.file('file', {
         size: '10mb',
         extnames: ['jpg', 'png', 'jpeg', 'webp', 'doc', 'pdf'],
      })
      // profileImage = await sharp(profileImage?.tmpPath).toFormat('webp').toBuffer()
       if (profileImage) {
         const fileName = `${cuid()}.${profileImage.extname}`
            await profileImage.move(await  Drive.getUrl('cdn'),{
               name: fileName,
            })
         // let upFile = 'https://cdn.socialnetworkstage.com/cdn/'+fileName
         let upFile = process.env.UPLOAD_URL+fileName
         return upFile
      }

    }
    async uploadImages2(ctx: HttpContextContract): Promise<any> {
         const profileImage = ctx.request.file('file', {
            size: '10mb',
            extnames: ['jpg', 'png', 'jpeg', 'webp', 'doc', 'pdf'],
        })
         // return ctx.request.all()
        if (profileImage) {
         //  return profileImage.extname
            const fileName = `${cuid()}.${profileImage.extname}`

            //*aug 14
            // let type = profileImage.extname
            // await s3.putObject({
            //     Key: fileName,
            //    // Bucket: 'filestore',
            //     Bucket: process.env.vulter_folder,
            //     Body: fs.createReadStream(profileImage.tmpPath),
            //     ACL: "public-read",
            // }).promise();
             //  let upFile = `https://ewr1.vultrobjects.com/${process.env.vulter_folder}/${fileName}`
            //*aug 14
            
            await profileImage.move(Application.publicPath('uploads'),{
              name: fileName,
            })
            let upFile = `http://localhost:3333/uploads/${fileName}`
          

           return upFile

        }
        return ctx.response.status(422).send({ message: 'Invalid request' });
    }

    async uploadImage(ctx) {
      // console.log("from upload image for connectuiver")

      const images = ctx.request.files('images')
      let uploadedImages : any[] = []
      for (let image of images) {
        const fileName = `${cuid()}.${image.extname}`
       await image.move(await  Drive.getUrl('cdn'),{
          name: fileName,
        })
        let imgObj = {
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
    async uploadImages3(ctx: HttpContextContract): Promise<any> {

       const images = ctx.request.files('images')
       let uploadedImages: any[] = []
       for (let image of images) {
          let fileName ='' ;
          let filesCompressed ='';
          // console.log(image.type, image.extname,image.clientName, "pre" )
          if(image.type == "image"){
            // console.log("on image type")
             fileName =`${cuid()}.${image.type}.webp`
            //  console.log(fileName, "fileNAme")
            // fs.createWriteStream(image.tmpPath);
            //  const filesCompressed1 = await sharp(image.tmpPath).rotate().resize(200, 200).toFormat('webp').toBuffer();
            // console.log(filesCompressed1, "filesCompressed1", file)
            filesCompressed = await sharp(image.tmpPath).toFormat('webp').toBuffer()
          }else{
            // console.log("on else type")
             fileName = `${cuid()}.${image.extname}`
            filesCompressed = fs.createReadStream(image.tmpPath)
          }
          // console.log("after format", fileName, filesCompressed)

          //*aug 14
          // await s3.putObject({
          //    Key: fileName,
          //    Bucket: process.env.vulter_folder,
          //   //  Bucket: 'filestore',
          //    Body: filesCompressed,
          //    ACL: "public-read",
          // }).promise();
          // let upFile = `https://ewr1.vultrobjects.com/${process.env.vulter_folder}/${fileName}`
          //*aug 14
         //  let upFile = `https://scrapabill.nyc3.digitaloceanspaces.com/${fileName}`

         await image.move(Application.publicPath('uploads'),{
            name: fileName,
          })
          let upFile = `http://localhost:3333/uploads/${fileName}`
          let imgObj = {
             fileLoc: upFile,
             originalName: image.clientName,
             extname: image.extname,
             size: image.size,
             type: image.type

          }
          uploadedImages.push(imgObj)
       }
       return uploadedImages
    }



   getCurrentDateTime() {
      var nDate = new Date();
      let fDate =
         nDate.getFullYear() +
         "-" +
         ((nDate.getMonth() + 1) < 10 ? '0' + (nDate.getMonth() + 1) : (nDate.getMonth() + 1)) +
         "-" +
         (nDate.getDate() < 10 ? '0' + nDate.getDate() : nDate.getDate());
      var today = new Date();
      let time =
         (today.getHours() < 10 ? '0' + today.getHours() : today.getHours()) + ":" + (today.getMinutes() < 10 ? '0' + today.getMinutes() : today.getMinutes()) + ":" + (today.getSeconds() < 10 ? '0' + today.getSeconds() : today.getSeconds());
      return fDate + ' ' + time
   }
   getOnlyCurrentDate() {
      var nDate = new Date();
      let fDate =
         nDate.getFullYear() +
         "-" +
         ((nDate.getMonth() + 1) < 10 ? '0' + (nDate.getMonth() + 1) : (nDate.getMonth() + 1)) +
         "-" +
         (nDate.getDate() < 10 ? '0' + nDate.getDate() : nDate.getDate());
      return fDate
   }

   addDayToDateTime(days) {
      var cDate = new Date();
      var nDate = new Date(cDate.setDate(cDate.getDate() + days));
      let fDate =
        nDate.getFullYear() +
        "-" +
        ((nDate.getMonth() + 1) < 10 ? '0' + (nDate.getMonth() + 1) : (nDate.getMonth() + 1)) +
        "-" +
        (nDate.getDate() < 10 ? '0' + nDate.getDate() : nDate.getDate());

      let today = new Date();
      let time =
        (today.getHours() < 10 ? '0' + today.getHours() : today.getHours()) + ":" + (today.getMinutes() < 10 ? '0' + today.getMinutes() : today.getMinutes()) + ":" + (today.getSeconds() < 10 ? '0' + today.getSeconds() : today.getSeconds());

      // return {added_date_time: fDate}
      // console.log('fDate');
      // console.log(fDate);
      return fDate + " " + time
   }

   async addNewCampaignEvent(data,userId,type){

      let eventob = {
         ad_id:data.id,
         user_id:userId,
         type:type,
         budget:data.budget,
         spending:data.spending_amount,
         refund: data.budget - data.spending_amount,
       };

        await CampaignEvent.create(eventob)

       let updateObj = {
         id:data.id,
         status:type,
         spending_amount:0,
       };

       await Campaign.query().where('id', data.id).where('user_id',userId).update(updateObj)

   }
   public async createUserTransaction(data){
      return await Transection.create(data)
   }

   async checkCourseSubscription(courseSubscription) {

      const dateNow = new Date();
      let created_date = new Date(courseSubscription.created_at);
      created_date.setMonth(created_date.getMonth()+6);
      if(dateNow > created_date ){
         await CourseSubscriber.query().where('id',courseSubscription.id).update({
               'isActive' :0
         });
      }
  }


}
