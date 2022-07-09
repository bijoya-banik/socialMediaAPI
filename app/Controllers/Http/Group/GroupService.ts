import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import CustomHelpers from 'App/Helpers/CustomHelpers';
import Event from '@ioc:Adonis/Core/Event'

import GroupQuery from './GroupQuery';
// import ProfileQuery from '../Profile/ProfileQuery';
export default class GroupService {
    private groupQuery : GroupQuery
    // private ProfileQuery : ProfileQuery
    private customHelpers : CustomHelpers

    constructor(){
      this.groupQuery = new GroupQuery
      this.customHelpers = new CustomHelpers

    }
    public async getSearchFriend(ctx : HttpContextContract){
      let data = ctx.request.all()
      data.str = await data.str.replace(/\s/g, "");
      if(data.str == '') return 'nothing matched'
      let userId:any = ctx.auth.user?.id
      return await this.groupQuery.getSearchFriend(data.str, userId, data.group_id)
    }
    public async getFriendNotGroupMember(ctx : HttpContextContract){
      let userId:any = ctx.auth.user?.id
      let data = ctx.request.all()
      return await this.groupQuery.getFriendNotGroupMember(  userId, data.group_id)
    }
    public async getGroupList(ctx : HttpContextContract){
      let data = ctx.request.all()
      let user_id:any = ctx.auth.user?.id
      const limit = data.limit
      const page = data.page
      const tab = data.tab
      if(tab == 'joinedGroups'){
        let groups: any =  await this.groupQuery.getJoinedGroupByLimit(limit,page, user_id)
        for(let e of groups){
          e.profile_pic = await this.customHelpers.getImage( e.profile_pic)
          if(e.cover) e.cover = await this.customHelpers.getImage( e.cover)
        }
        return groups
      }else if(tab == 'discover'){
        let groups: any =  await this.groupQuery.getDiscoverGroupByLimit(limit,page, user_id)
        for(let e of groups){
          e.profile_pic = await this.customHelpers.getImage( e.profile_pic)
          if(e.cover) e.cover = await this.customHelpers.getImage( e.cover)
        }
        return groups
      }else if(tab == 'mygroups'){
        let groups: any =   await this.groupQuery.getMyGroupByLimit(limit,page, user_id)
        for(let e of groups){
          e.profile_pic = await this.customHelpers.getImage( e.profile_pic)
          if(e.cover) e.cover = await this.customHelpers.getImage( e.cover)
        }
        return groups
      }else{
        return []
      }

   }

    public async getSavedPagebyLimit(ctx : HttpContextContract){
     let data = ctx.request.all()
      let user_id:any = ctx.auth.user?.id
      const page = data.page
      const limit = data.limit?data.limit :18
      let feedData = await this.groupQuery.getSavedPagebyLimit(limit, page,ctx.request.all().more, user_id)
      if(feedData.length){
        feedData = await this.customHelpers.feedResponse(feedData,null, ctx.auth.user?.id)
      }
       return {
          feedData,
       }
   }
   public async allRequest(ctx:HttpContextContract){
    let userId:any = ctx.auth.user?.id
    let data = ctx.request.all()
    const checkAdmin = await this.groupQuery.checkAdminQuery(data.group_id, userId)
    if(checkAdmin.total == 0 ) return ctx.response.status(401).send({msg: "You are not authorised !"})
    return this.groupQuery.allRequest(data.group_id, userId)

   }
   public async leaveGroup(ctx : HttpContextContract){
    let userId:any = ctx.auth.user?.id
    const data = ctx.request.all()
    await this.groupQuery.updateGroupMember(data.group_id, '-1')
    return await this.groupQuery.leaveGroup(data.group_id, userId)
   }
   public async cancelRequest(ctx : HttpContextContract){
    const data = ctx.request.all()
    // return data
    const group = await this.groupQuery.getGroupQuery(data.group_id)
    if(!group) return ctx.response.status(404).send({msg: "Group not found !"})
    await this.groupQuery.deleteNotiforSpecificUser('new_group_request',data.user_id,  group?.id )
    return this.groupQuery.deleteRequest(data.group_id, data.user_id)
   }
   public async approveJoinRequest(ctx:HttpContextContract){
    let userId:any = ctx.auth.user?.id
    const data = ctx.request.all()
    const group = await this.groupQuery.getGroupQuery(data.group_id)
    if(!group) return ctx.response.status(404).send({msg: "Group not found !"})
    const checkAdmin = await this.groupQuery.checkAdminQuery(data.group_id, userId)
    if(checkAdmin.total == 0 ) return ctx.response.status(401).send({msg: "You are not authorised !"})
    let to_user_list = await this.groupQuery.getallAdminAndModeratorid(data.group_id )
    await this.groupQuery.deleteRequest(data.group_id, data.user_id)
    await this.groupQuery.deleteNotiforSpecificUser('new_group_request',data.user_id,  group?.id )
    return this.memberCreate(to_user_list, group, data.user_id,userId)
   }

   public async joinGroup(ctx : HttpContextContract){

    let userId:any = ctx.auth.user?.id
    const data = ctx.request.all()
    const group = await this.groupQuery.getGroupQuery(data.group_id)
    let to_user_list = await this.groupQuery.getallAdminAndModeratorid(data.group_id )

    if(!group) return ctx.response.status(404).send({msg: "Group not found !"})
    if(!to_user_list.length) return ctx.response.status(404).send({msg: "Group not found !"})
    let check_pending_request =  await this.groupQuery.check_pending_request(data.group_id, userId)

    if(group.group_privacy == "ONLY ME" && check_pending_request.total == 0 ){
        // return to_user_list
       for(let obj of to_user_list){
        let check_requested =  await this.groupQuery.check_requested(data.group_id, userId)

        if(check_requested.total != 0 ){
          await this.groupQuery.deleteRequest(data.group_id, userId)
          return this.memberCreate(to_user_list, group, userId, userId)
        }else{
          // return "hihihihi"
            await this.groupQuery.createApprovalRequest(data.group_id, userId, obj.user_id)
          // return group
            await this.groupQuery.deleteNoti('new_group_request',userId,  group?.id )

            await Event.emit('new:member', {
              user_id :obj.user_id,
              from_id: userId,
              group_id:group?.id,
              noti_type: 'new_group_request',
              noti_meta: {
                slug:group?.slug,
                action_text: 'asked to join '+`${group?.group_name}`
              },
            })


          return this.groupQuery.isRequested(userId, data.group_id)
        }

      }

    }else{
      // return "hello"
        await this.groupQuery.deleteNoti('group_member_invitation',userId,   group?.id )
      // await this.groupQuery.deleteMemberRequest(data.group_id, userId)
      return this.memberCreate(to_user_list, group, userId, userId)
    }

   }
   public async memberCreate(to_user_list, group, userId, authId){
     await this.groupQuery.updateGroupMember(group.id, '1')
    let result = await this.groupQuery.joinGroup(group.id, userId)
    for(let obj of to_user_list){
      if(obj.user_id == authId){
        await Event.emit('new:member', {
          user_id :userId,
          from_id: userId,
          group_id:group?.id,
          noti_type: 'new_group_member',
          noti_meta: {
            slug:group?.slug,
            action_text: 'joined '+`${group?.group_name}`
          },
        })
      }else{
        await Event.emit('new:member', {
          user_id :obj.user_id,
          from_id: userId,
          group_id:group?.id,
          noti_type: 'new_group_member',
          noti_meta: {
            slug:group?.slug,
            action_text: 'joined '+`${group?.group_name}`
          },
        })
      }

    }
    return result
   }
   public async deleteGroup(ctx : HttpContextContract){

    let user_id:any = ctx.auth.user?.id
    const data = ctx.request.all()
    const checkAdmin = await this.groupQuery.checkAdminQuery(data.group_id, user_id)
    if(checkAdmin.total == 0 ) return ctx.response.status(401).send({msg: "You are not authorised !"})
    return await this.groupQuery.deleteGroup(data.group_id)
   }
   public async globalSearch(ctx : HttpContextContract){
    const data = ctx.request.all()
    data.str = await data.str.replace(/[&\/\\#,+@^()$~%.'":*?<>{}]/g, '');
    if(data.str == '') return 'nothing matched'
    let user_id:any = ctx.auth.user?.id
    if(data.tab == 'feed'){
      let feedData = await this.groupQuery.feedSearch(data.str, ctx.request.all().more ,user_id)
      if(feedData.length){
        feedData = await this.customHelpers.feedResponse(feedData,null, ctx.auth.user?.id)
      }
      return {
        feedData,
      }
    }
    if(data.tab == 'group'){
      let groupData:any = await this.groupQuery.groupSearch(data.str,user_id)
      for(let e of groupData){
        e.profile_pic = await this.customHelpers.getImage( e.profile_pic)
        if(e.cover) e.cover = await this.customHelpers.getImage( e.cover)
       }
       return {
          groupData,
       }
    }
    if(data.tab == 'page'){
      let pageData:any = await this.groupQuery.pageSearch(data.str,user_id)
      for(let e of pageData){
        e.profile_pic = await this.customHelpers.getImage( e.profile_pic)
        if(e.cover) e.cover = await this.customHelpers.getImage( e.cover)
       }
       return {
          pageData,
       }
    }
    if(data.tab == 'people'){
      let peopleData:any = await this.groupQuery.peopleSearch(data.str,user_id)
      for(let e of peopleData){
        e.profile_pic = await this.customHelpers.getImage( e.profile_pic)
        if(e.cover) e.cover = await this.customHelpers.getImage( e.cover)
       }
       return {
          peopleData,
       }
    }
    if(data.tab == 'event'){
      let eventData:any = await this.groupQuery.eventSearch(data.str,user_id)
      for(let e of eventData){
        // e.profile_pic = await this.customHelpers.getImage( e.profile_pic)
        if(e.cover) e.cover = await this.customHelpers.getImage( e.cover)
       }
       return {
          eventData,
       }
    }

   return 'nothing matched'

   }
   public async removeGroup(ctx : HttpContextContract){
     const data = ctx.request.all()
     await this.groupQuery.updateGroupMember(data.group_id, '-1')
    return await this.groupQuery.removeGroup(data.group_id, data.user_id)
   }
   public async makeAdmin(ctx : HttpContextContract){
     let user_id: any = ctx.auth.user?.id
    const data = ctx.request.all()
    const checkAdmin = await this.groupQuery.checkAdminQuery(data.group_id, user_id)
     if(checkAdmin.total == 0 ) return ctx.response.status(401).send({msg: "You are not authorised !"})
    return await this.groupQuery.makeAdmin(data.group_id, data.user_id)
   }
   public async removeAdminRole(ctx : HttpContextContract){
     let user_id: any = ctx.auth.user?.id
    const data = ctx.request.all()
    const checkAdmin = await this.groupQuery.checkAdminQuery(data.group_id, user_id)
     if(checkAdmin.total == 0 ) return ctx.response.status(401).send({msg: "You are not authorised !"})
    return await this.groupQuery.removeAdminRole(data.group_id, data.user_id)
   }
    public async getSingleGroup(ctx : HttpContextContract){
      // const slug = ctx.request.all().slug
      // const group = await this.groupQuery.getSingleGroupQuery(slug)
      // return group
      const data = ctx.request.all()
      if(!data.slug || !data.tab) return ctx.response.status(422).send({msg:"Invalid request"})
      let userId:any = ctx.auth.user?.id
      let basicOverView = await this.groupQuery.getSingleGroupQuery(data.slug, userId)
      if(!basicOverView) return ctx.response.status(422).send({msg:"Group not found"})
      basicOverView.profile_pic =await this.customHelpers.getImage(basicOverView.profile_pic)
      if(basicOverView.cover)  basicOverView.cover =await this.customHelpers.getImage(basicOverView.cover)
      if((basicOverView.is_member && basicOverView.is_member && basicOverView.is_member.is_admin )&& (basicOverView.is_member.is_admin=='admin' || basicOverView.is_member.is_admin=='super admin')){
        basicOverView.is_edit = true
      }
      else if(basicOverView.is_member && basicOverView.group_privacy == 'PUBLIC'){
        basicOverView.is_edit = true
      }
      // formate the data
      // console.log('tab is ', data.tab)
      if(data.tab == 'feed'){
         let privacy = ['PUBLIC']
         if(basicOverView.is_member){ // add only as well
           privacy.push('ONLY ME')
         }
         // later check if this user is a friend with logged in user..
         let feedData = await this.groupQuery.getGroupFeed(userId,ctx.request.all().more ,basicOverView.id, privacy)

         if(feedData.length){
           feedData = await this.customHelpers.feedResponse(feedData,null, ctx.auth.user?.id)
         }

         return {
            basicOverView,
            feedData
         }
      }
      if(data.tab == 'members'){
        let adminAndModerators = await this.groupQuery.getAdminAndModerators(basicOverView.id)
        let allMembers = await this.groupQuery.getAllMembers(basicOverView.id)
        return {
          basicOverView,
          adminAndModerators,
          allMembers
         }
      }
      if(data.tab == 'about'){
        return {
          basicOverView,
        }
      }
      if(data.tab == 'photos'){
         let photos = await this.groupQuery.getGroupsUploadedFile('image', basicOverView.id)
         photos = this.customHelpers.formateFiles(photos)
         return {
          basicOverView,
          photos
         }
      }
      if(data.tab == 'videos'){
         let videos = await this.groupQuery.getGroupsUploadedFile('video', basicOverView.id)
         videos = this.customHelpers.formateFilesForVideos(videos)
         return {
          basicOverView,
          videos
         }
      }
      if(data.tab == 'pending_members'){
        return {
          basicOverView,

         }
      }
      return basicOverView

   }
   public  async getAllCategory(){
    // const limit = ctx.request.all().limit
      const category = await this.groupQuery.getCategoryLimit()
      return category
   }
   public async storeGroup(ctx : HttpContextContract){
    let userId:any = ctx.auth.user?.id
      const data = ctx.request.all()
      let slug = data.group_name
      slug=slug.replace(/[^\w/ /\d]/g, '');
      slug=slug.replace(/ /g,"_");

      let totalSlugs = await this.groupQuery.searchSlug(slug)
      let numberOfSlugs : number = totalSlugs.total

      let newCount = ''
      if(numberOfSlugs >0 ){
      let lastItem:any  =  await this.groupQuery.fetchLatestSlug(slug)
        newCount = lastItem.id
      }
      slug = numberOfSlugs > 0 ? `${slug}_${newCount}` : slug
      // let newCount = numberOfSlugs > 0 ? ++numberOfSlugs : ''
      // slug = newCount > 0 ? `${slug}_${newCount}` : slug
      // return ctx.response.status(402).send({totalSlugs: slug})
      const storeData = await this.groupQuery.storeGroupQuery({
        user_id:	userId,
        group_name:	data.group_name,
        about: data.about	,
        group_privacy: data.group_privacy,
        category_name:data.category_name,
        slug: slug,
        total_members : 1
      })
      await this.groupQuery.storeGroupMemberQuery(storeData.id,userId)
      return storeData
   }
   public async addMember(ctx : HttpContextContract){
    const data = ctx.request.all()
    let user = ctx.auth.user
    let userId =user?.id?user.id:0
    const group = await this.groupQuery.getGroupQuery(data.group_id)
    if(!group) return ctx.response.status(404).send({msg: "Group not found !"})
    const checkMember = await this.groupQuery.checkMemberQuery(data.group_id, data.user_id)
    if(checkMember.total != 0 ) return ctx.response.status(404).send({msg: "Already member !"})
    await this.groupQuery.deleteRequest(data.group_id, data.user_id)
    let storeData =  this.groupQuery.createMemberRequest({
      group_id:	data.group_id,
      user_id: data.user_id	,
    })
    await Event.emit('new:member', {
      user_id : data.user_id,
      from_id: userId,
      group_id:group?.id,
      noti_type: 'group_member_invitation',
      noti_meta: {
        slug:group?.slug,
        action_text: 'invited you to join '+`${group?.group_name}`
      },
    })


    return storeData
   }

   public async confirmJoin (ctx:HttpContextContract){
        let user_id: any = ctx.auth.user?.id
        const data = ctx.request.all()
        const group = await this.groupQuery.getSingleGroupQuery(data.slug, data.user_id)
        if(!group) return ctx.response.status(404).send({msg: "Group not found !"})
        let check_requested =  await this.groupQuery.check_requested(group.id, data.user_id)
        if(check_requested.total != 0){
          await this.groupQuery.deleteRequest(group.id, data.user_id)
        }
        await this.groupQuery.deleteMemberRequest(group.id, data.user_id )
        await this.groupQuery.deleteNotis(data.noti_id )
        let to_user_list = await this.groupQuery.getallAdminAndModeratorid(group.id )
        return this.memberCreate(to_user_list, group, data.user_id,user_id )
   }
   public async deleteAdd (ctx:HttpContextContract){
    // let user_id: any = ctx.auth.user?.id
    const data = ctx.request.all()
    const group = await this.groupQuery.getSingleGroupQuery(data.slug, data.user_id)
    if(!group) return ctx.response.status(404).send({msg: "Group not found !"})
    let check_requested =  await this.groupQuery.check_requested(group.id, data.user_id)
    if(check_requested.total != 0){
      await this.groupQuery.deleteRequest(group.id, data.user_id)
    }
    await this.groupQuery.deleteNotis(data.noti_id )
    return await this.groupQuery.deleteMemberRequest(group.id, data.user_id )
   }
  public async updateGroup(ctx : HttpContextContract){
    let user_id: any = ctx.auth.user?.id
    const data = ctx.request.all()

    const checkAdmin = await this.groupQuery.checkAdminQuery(data.id, user_id)

     if(checkAdmin.total == 0 ) return ctx.response.status(401).send({msg: "You are not authorised !"})
    return await this.groupQuery.updateGroup(data)
  }
  async uploadGroupPic(ctx : HttpContextContract){
    let data = ctx.request.all()

    const image = ctx.request.file('file')
    if(!image) return

    let images:any

     images = await this.customHelpers.uploadImages2(ctx)

    // const fileName = `${cuid()}.${image.extname}`
    // await image.move(Application.publicPath('uploads'),{
    //   name: fileName,
    // })
    // let pic = `http://localhost:3333/uploads/${fileName}`
    let obj = {
      [data.uploadType] : images,
    }

    await this.groupQuery.saveGroupInfo(obj, data.group_id)
    let isPic = data.uploadType == 'profile_pic' ? true : false
    return {
      picture : images,
      isProfile: isPic
    }

  }
};
