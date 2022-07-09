import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import CustomHelpers from 'App/Helpers/CustomHelpers';
import PageQuery from './PageQuery';
// import { cuid } from '@ioc:Adonis/Core/Helpers'
// import Application from '@ioc:Adonis/Core/Application'
import Event from '@ioc:Adonis/Core/Event'

export default class PageService {
    private pageQuery : PageQuery
    private customHelpers : CustomHelpers
    constructor(){
      this.pageQuery = new PageQuery
      this.customHelpers = new CustomHelpers
    }
    public async getPageByLimit(ctx : HttpContextContract){
      const limit = ctx.request.all().limit
      const user = await this.pageQuery.getUserByLimit(limit)
      return user
   }
    public async getCategory(){
      return this.pageQuery.getCategory()
   }
   public async getUnfollowPages(ctx){
    return this.pageQuery.getUnfollowPages(ctx.auth.user.id)
 }
    public async getAllPage(ctx : HttpContextContract){
      const data = ctx.request.all()
      const limit = data.limit
      const page = data.page
      let userId = ctx.auth.user?.id
      if(data.tab == 'followed'){
        let pages:any = await this.pageQuery.getFollowedPage(limit,page,userId)
        for(let e of pages){
          if(e.cover) e.cover = await this.customHelpers.getImage( e.cover)
          e.profile_pic = await this.customHelpers.getImage( e.profile_pic)

        }
        return pages
      }
      else if(data.tab == 'discover'){
         let pages:any = await this.pageQuery.getDiscoverPage(limit,page,userId)
        for(let e of pages){
          e.profile_pic = await this.customHelpers.getImage( e.profile_pic)
          if(e.cover) e.cover = await this.customHelpers.getImage( e.cover)
        }
        return pages
      }else{
        let pages:any = await this.pageQuery.getAllPage(limit,page,userId)
        for(let e of pages){
          e.profile_pic = await this.customHelpers.getImage( e.profile_pic)
          if(e.cover) e.cover = await this.customHelpers.getImage( e.cover)
        }
        return pages
      }
   }

   public async addPage(userData){
    let slug = userData.page_name
    slug=slug.replace(/[^\w/ /\d]/g, '');
    slug=slug.replace(/ /g,"_");

    let totalUsers : any[] = await this.pageQuery.searchSlug(slug)
    let numberOfUsers : number = totalUsers[0].total
    let newCount = ''
    if(numberOfUsers >0 ){
     let lastItem:any  =  await this.pageQuery.fetchLatestSlug(slug)
      newCount = lastItem.id
    }
    slug = numberOfUsers > 0 ? `${slug}_${newCount}` : slug

    // let newCount = numberOfUsers > 0 ? ++numberOfUsers : ''
    // slug = newCount > 0 ? `${slug}_${newCount}` : slug
    userData.slug = slug

    // let username = userData.first_name +'_'+userData.last_name
    // let totalUsers : any[] = await this.authQuery.searchUsername(username)
    // let numberOfUsers : number = totalUsers[0].total
    // let newCount = ''
    // if(numberOfUsers >0 ){
    //  let lastUser:any  =  await this.authQuery.fetchLatestUserName(username)
    //   newCount = lastUser.id
    // }
    // username = numberOfUsers > 0 ? `${username}_${newCount}` : username
    // userData.username = username


     let storeData = await this.pageQuery.addPage(userData)
     let obj = {
      page_id:storeData.id,
      user_id:storeData.user_id,
    }
    let basicOverView = await this.pageQuery.followPage(obj,storeData.id)
    return this.checkIsFollow(basicOverView,storeData.user_id)
    // return storeData
  }
   public async editPage(userData){
    // let slug = userData.page_name
    // slug=slug.replace(/[^\w/ /\d]/g, '');
    //   slug=slug.replace(/ /g,"_");
    //     let totalUsers : any[] = await this.pageQuery.searchSlug(slug)
    //     let numberOfUsers : number = totalUsers[0].total
    //     let newCount = numberOfUsers > 0 ? ++numberOfUsers : ''
    //     slug = newCount > 0 ? `${slug}_${newCount}` : slug
    //     userData.slug = slug
        return await this.pageQuery.editPage(userData,userData.id)
  }

  public async getPageDetails(ctx : HttpContextContract){

    const data = ctx.request.all()
      if(!data.user || !data.tab) return
      let userId = ctx.auth.user?.id
      let basicOverView = await this.pageQuery.getUserBasicOverView(data.user)
      basicOverView=basicOverView.toJSON()
      let isFollow=false
      for(let i of basicOverView.pageFollowers) {
        if(i.user_id==userId){
          isFollow=true
        }
      }
      basicOverView.isFollow=isFollow
      if(!basicOverView) return
      basicOverView.profile_pic =await this.customHelpers.getImage(basicOverView.profile_pic)
      if(basicOverView.cover)  basicOverView.cover =await this.customHelpers.getImage(basicOverView.cover)
      // formate the data
      // basicOverView.work_data = basicOverView.work_data ? JSON.parse(basicOverView.work_data) : []
      // basicOverView.skill_data = basicOverView.skill_data ? JSON.parse(basicOverView.skill_data) : []
      // basicOverView.education_data = basicOverView.education_data ? JSON.parse(basicOverView.education_data) : []
      // console.log('tab is ', data.tab)
      if(data.tab == 'feed'){
        //  let privacy = ['Public']
        //  if(userId == basicOverView.id){ // add only as well
        //    privacy.push('Only Me')
        //  }
         // later check if this user is a friend with logged in user..
         let feedData = await this.pageQuery.getProfileFeed(basicOverView.id, ctx.request.all().more,userId)
         if(feedData.length){
           feedData = await this.customHelpers.feedResponse(feedData,null, ctx.auth.user?.id)
         }

         return {
            basicOverView,
            feedData
         }
        // console.log('ok')
      }
      if(data.tab == 'about'){
        return {
          basicOverView,
        }
      }
      if(data.tab == 'photos'){
         let photos = await this.pageQuery.getUserUploadedFile('image', basicOverView.id)
         photos = this.customHelpers.formateFiles(photos)
         return {
          basicOverView,
          photos
         }
      }
      if(data.tab == 'videos'){
         let videos = await this.pageQuery.getUserUploadedFile('video', basicOverView.id)
         videos = this.customHelpers.formateFilesForVideos(videos)
         return {
          basicOverView,
          videos
         }
      }
      return 'nothing matched'
 }

    async uploadPagePic(ctx : HttpContextContract){
      let data = ctx.request.all()
      const image = ctx.request.file('file')
      if(!image) return
      // const fileName = `${cuid()}.${image.extname}`
      // await image.move(Application.publicPath('uploads'),{
      //   name: fileName,
      // })
      // let pic = `http://localhost:3333/uploads/${fileName}`

      let images:any

        images = await this.customHelpers.uploadImages2(ctx)

      let obj = {
        [data.uploadType] : images,
      }
      // console.log('obj',obj)
      await this.pageQuery.saveUserInfo(obj, data.page_id)
      let isPic = data.uploadType == 'profile_pic' ? true : false
      return {
        picture : images,
        isProfile: isPic
      }
    }

    public async followPage(ctx : HttpContextContract){
      let data = ctx.request.all()
      let userId = ctx.auth.user?.id
      let obj = {
        page_id:data.page_id,
        user_id:data.user_id,
      }
      if(data.follow==true){
        let basicOverView = await this.pageQuery.followPage(obj,data.page_id)
        await Event.emit('new:member', {
          user_id :basicOverView.user_id,
          from_id: data.user_id,
          noti_type: 'page_follow',
          group_id:undefined,
          noti_meta: {
            slug:basicOverView?.slug,
            action_text: 'is following '+`${basicOverView.page_name}`
          },
        })
        return this.checkIsFollow(basicOverView,userId)
      }else{
        let basicOverView = await this.pageQuery.unfollowPage(data.page_id,data.user_id)
        return this.checkIsFollow(basicOverView,userId)
      }

   }
   checkIsFollow(basicOverView,userId){
    basicOverView=basicOverView.toJSON()
        let isFollow=false
        for(let i of basicOverView.pageFollowers) {
          if(i.user_id==userId){
            isFollow=true
          }
        }
        basicOverView.isFollow=isFollow
        return basicOverView
   }


   public async getPageEditDetails(ctx : HttpContextContract){
    const data = ctx.request.all()
    return this.pageQuery.getPageEditDetails(data.page_id)
   }
   public async deletePage(ctx : HttpContextContract){
    let data = ctx.request.all()
    return this.pageQuery.deletePage('id',data.page_id)
   }

   public async getSingleStaticPage(ctx){
     return this.pageQuery.getSingleStaticPage(ctx);
   }
   public async getTermsAndCondition(){
     return this.pageQuery.getTermsAndCondition();
   }
   public async getPolicyPage(ctx){
     let data:any = await  this.pageQuery.getPolicyPage(ctx);
     data.data = JSON.parse(data.data)
     return data;
   }
   public async ignorePage(ctx){
     let data = ctx.request.all()
     let ob= {
      page_id:data.page_id,
      user_id:data.user_id

     }
    return this.pageQuery.ignorePage(ob);
  }










};
