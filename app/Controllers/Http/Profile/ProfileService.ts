import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import CustomHelpers from 'App/Helpers/CustomHelpers';
import ProfileQuery from './ProfileQuery';
import Event from '@ioc:Adonis/Core/Event'
import { cuid } from '@ioc:Adonis/Core/Helpers'
import Application from '@ioc:Adonis/Core/Application'

export default class ProfileService {
  private profileQuery: ProfileQuery
  private customHelpers: CustomHelpers
  constructor() {
    this.profileQuery = new ProfileQuery
    this.customHelpers = new CustomHelpers
  }

  public async getProfile(ctx: HttpContextContract) {
    const data = ctx.request.all()
    if (!data.user || !data.tab) return
    let userId = ctx.auth.user?.id
    let basicOverView = await this.profileQuery.getUserBasicOverView(data.user, userId)
    if (!basicOverView) return
    let checkBlock = await this.profileQuery.checkBlock(basicOverView.id, userId)
    if (!checkBlock) return ctx.response.status(401).send({ msg: 'User is not available.' })
    // formate the data

    basicOverView.work_data = basicOverView.work_data ? JSON.parse(basicOverView.work_data) : []
    basicOverView.skill_data = basicOverView.skill_data ? JSON.parse(basicOverView.skill_data) : []
    basicOverView.education_data = basicOverView.education_data ? JSON.parse(basicOverView.education_data) : []
    basicOverView.profile_pic = await this.customHelpers.getImage(basicOverView.profile_pic)
    if (basicOverView.cover) basicOverView.cover = await this.customHelpers.getImage(basicOverView.cover)
    // console.log('tab is ', data.tab)
    let privacy = ['PUBLIC']
    if (userId == basicOverView.id) { // add only as well
      privacy.push('ONLY ME')
      privacy.push('FRIENDS')
    } else if (basicOverView.friend && basicOverView.friend.status == 'accepted') {
      privacy.push('FRIENDS')
    }
    if (data.tab == 'feed') {

      // later check if this user is a friend with logged in user..
      let feedData = await this.profileQuery.getProfileFeed(basicOverView.id, ctx.request.all().more, privacy, true, userId)
      //  return feedData
      if (feedData.length) {
        feedData = await this.customHelpers.feedResponse(feedData, null, ctx.auth.user?.id)
      }

      return {
        basicOverView,
        feedData
      }
    }
    if (data.tab == 'about') {
      return {
        basicOverView,
      }
    }
    if (data.tab == 'photos') {
      let photos = await this.profileQuery.getUserUploadedFile('image', basicOverView.id, privacy)
      photos = this.customHelpers.formateFiles(photos)
      return {
        basicOverView,
        photos
      }
    }
    if (data.tab == 'videos') {
      let videos = await this.profileQuery.getUserUploadedFile('video', basicOverView.id, privacy)
      videos = this.customHelpers.formateFilesForVideos(videos)
      return {
        basicOverView,
        videos
      }
    }


    return 'nothing matched'

  }
  public async getSearchFriend(ctx: HttpContextContract) {
    let data = ctx.request.all()
    let userId = ctx.auth.user?.id
    if (!userId) return
    return this.profileQuery.getSearchFriend(data.str, userId)
  }
  async saveName(ctx: HttpContextContract) {
    let data = ctx.request.all()
    let userId = ctx.auth.user?.id
    if (!userId) return
    // let str = data.str
    return this.profileQuery.saveUserInfo(data, userId)
    // return this.profileQuery.saveUserInfo(data.str, userId) //sadek vai code
  }
  async getFriendLists(ctx: HttpContextContract) {
    let user = await this.profileQuery.getUserId(ctx.params.username)
    if (!user) return 'no user found'
    let uid = ctx.auth.user?.id
    if (!uid) return

    return this.profileQuery.getFriendLists(user.id, uid)
  }
  async getFriendListsBySearch(ctx: HttpContextContract) {

    let uid = ctx.auth.user?.id
    if (!uid) return
    let data = ctx.request.all()
    let str = data.str ? data.str : null
    // return this.profileQuery.getFriendListsBySearch(uid, str)
    let alldata: any = await this.profileQuery.getFriendListsBySearch(uid, str)

    if (alldata.length <= 0) return []
    for (let items of alldata) {
      items.profile_pic = await this.customHelpers.getImage(items.profile_pic)
      if (items.cover) items.cover = await this.customHelpers.getImage(items.cover)
    }
    return alldata
  }




  async friendRequest(ctx: HttpContextContract) {
    let userId = ctx.request.all().id
    if (!userId) return
    let user = ctx.auth.user
    if (!user) return
    let uid = user.id
    let friendStatus = await this.profileQuery.getFriendStatus(userId, uid)
    if (!friendStatus) { // there is no friendship for this users... so create a new one...
      let friends = [
        { user_id: userId, friend_id: uid, status: 'waiting' }, // user recieve notifications...
        { user_id: uid, friend_id: userId, status: 'pending' },
      ]
      await this.profileQuery.addFriendData(friends)
      // send friend requst notification
      Event.emit('new:friend', {
        user_id: userId,
        from_id: user?.id,
        noti_type: 'new_friend',
        noti_meta: {
          id: user.id,
          username: user?.username,
          first_name: user?.first_name,
          last_name: user?.last_name,
          profile_pic: user?.profile_pic,
          action_text: 'sent you a friend request'
        }
      })
      return { user_id: userId, friend_id: uid, status: 'pending' }
    }
    if (friendStatus.status == 'waiting' || friendStatus.status == 'accepted') { // delete the friend request and return null
      await this.profileQuery.deleteFriend(userId, uid)
      await this.profileQuery.decreaseFriendCount(userId)
      Event.emit('delete:friendCount',
        {
          user_id: userId,
          noti_type: 'new_friend',
          is_deleted: true
        }
      )
      return null
    }
    if (friendStatus.status == 'pending') { // accept the friend request
      await this.profileQuery.updateFriendStatus(userId, uid)
      await this.profileQuery.unblockUser(uid)
      Event.emit('accept:friend', {
        user_id: userId,
        from_id: user.id,
        noti_type: 'accept_friend',
        noti_meta: {
          id: user.id,
          username: user.username,
          profile_pic: user.profile_pic,
          first_name: user.first_name,
          last_name: user.last_name,
          action_text: 'accepted your friend request'
        },
      })
      return { user_id: userId, friend_id: uid, status: 'accepted' }
    }


  }
  async ignoreSuggesion(ctx: HttpContextContract) {
    let userId = ctx.auth.user?.id
    if (!userId) return
    this.profileQuery.ignoreSuggesion(userId)

  }

  async getNotification(ctx: HttpContextContract) {
    const limit = ctx.request.all().limit ? ctx.request.all().limit : 10
    const page = ctx.request.all().page ? ctx.request.all().page : 1
    let userId = ctx.auth.user?.id
    if (!userId) return
    let notification: any = await this.profileQuery.getNotification(limit, page, userId)
    this.profileQuery.updateNoti(userId)
    return this.customHelpers.formateNotification(notification)
  }

  async unSeenNoti(ctx: HttpContextContract) {
    let userId = ctx.auth.user?.id
    if (!userId) return
    return this.profileQuery.unSeenNoti(userId, ctx.request.all().id)
  }
  async seenNoti(ctx: HttpContextContract) {
    let userId = ctx.auth.user?.id
    if (!userId) return
    return this.profileQuery.seenNoti(userId, ctx.request.all().id)
  }
  async deleteUser(ctx: HttpContextContract) {
    let adminStatus = ctx.auth.user?.admin_status
    if (adminStatus == "admin") {
      return this.profileQuery.deleteUser(ctx.request.all().id)
    }
    else {
      return
    }

  }
  async deleteFeed(ctx: HttpContextContract) {
    let adminStatus = ctx.auth.user?.admin_status
    if (adminStatus == "admin") {
      return this.profileQuery.deleteFeed(ctx.request.all().id)
    }
    else {
      return
    }


  }
  async deleteReport(ctx: HttpContextContract) {

    let adminStatus = ctx.auth.user?.admin_status
    if (adminStatus == "admin") {
      return this.profileQuery.deleteReport(ctx.request.all().id)
    }
    else {
      return
    }
   
  }
  async deleteNoti(ctx: HttpContextContract) {
    let userId = ctx.auth.user?.id
    if (!userId) return
    return this.profileQuery.deleteNoti(userId, ctx.request.all().id)
  }
  async markAsReadAll(ctx: HttpContextContract) {
    let userId = ctx.auth.user?.id
    if (!userId) return
    return this.profileQuery.markAsReadAll(userId)
  }



  async friendSugesstion(ctx: HttpContextContract) {
    let userId = ctx.auth.user?.id
    let limit = 6;

    let mutualFriends = await this.profileQuery.mutualFriendsQuery(userId, limit);
    if (mutualFriends && (await mutualFriends).length) {
      for (let items of mutualFriends) {
        items.profile_pic = await this.customHelpers.getImage(items.profile_pic)
      }
      return mutualFriends;
    }
    let current_city = ctx.auth.user?.current_city
    // return current_city;
    if (current_city) {
      let sameCityFriends = await this.profileQuery.sameCityPeopleQuery(current_city, userId, limit);
      if (sameCityFriends) {
        for (let items of sameCityFriends) {
          items.profile_pic = await this.customHelpers.getImage(items.profile_pic)
        }
      }
      return sameCityFriends;
    }

    // if(!userId) return
    let alldata = await this.profileQuery.randomPeopleList(userId, limit)
    for (let items of alldata) {
      items.profile_pic = await this.customHelpers.getImage(items.profile_pic)
    }
    return alldata

    // let alldata = JSON.parse(JSON.stringify(notification))


  }
  async getFriendRequests(ctx: HttpContextContract) {
    const limit = ctx.request.all().limit ? ctx.request.all().limit : 20
    const page = ctx.request.all().page ? ctx.request.all().page : 1
    let userId = ctx.auth.user?.id
    if (!userId) return
    let friendRequests: any = await this.profileQuery.getFriendRequests(page, limit, userId)
    let alldata = JSON.parse(JSON.stringify(friendRequests))
    for (let items of alldata.data) {
      // console.log(items.friend.profile_pic, "items profile")
      items.friend.profile_pic = await this.customHelpers.getImage(items.friend.profile_pic)
    }
    return alldata
  }
  async resetFriend(ctx: HttpContextContract) {
    let userId = ctx.auth.user?.id
    if (!userId) return
    return this.profileQuery.resetFriend(userId)
  }
  async deleteRequest(ctx: HttpContextContract) {
    let userId = ctx.auth.user?.id
    let friend_id = ctx.request.all().friend_id
    if (!friend_id) return
    if (!userId) return
    return this.profileQuery.deleteRequest(userId, friend_id)
  }
  async getFriendListsForChat(ctx: HttpContextContract) {
    let userId = ctx.auth.user?.id
    const data = ctx.request.all()
    const limit = data.limit ? data.limit : 30
    const page = data.page ? data.page : 1
    let peoples: any = await this.profileQuery.getFriendListsForChat(limit, page, userId)
    for (let e of peoples) {
      e.profile_pic = await this.customHelpers.getImage(e.profile_pic)
    }
    return peoples
  }
  async peopleList(ctx: HttpContextContract) {
    let userId = ctx.auth.user?.id
    const data = ctx.request.all()
    const limit = data.limit
    const page = data.page
    let peoples: any = await this.profileQuery.peopleList(limit, page, userId)
    for (let e of peoples) {
      e.profile_pic = await this.customHelpers.getImage(e.profile_pic)
    }
    return peoples
  }

  async blockedPeopleList(ctx: HttpContextContract) {
    let userId = ctx.auth.user?.id
    const data = ctx.request.all()
    const limit = data.limit
    const page = data.page

    return this.profileQuery.blockedPeopleList(limit, page, userId)
  }
  async getPeopleListBySearch(ctx: HttpContextContract) {
    let userId = ctx.auth.user?.id
    const data = ctx.request.all()
    let str = data.str ? data.str : ''
    return this.profileQuery.getPeopleListBySearch(str, userId)
  }
  async getAllUser(ctx: HttpContextContract) {
    let userId = ctx.auth.user?.id


    return this.profileQuery.getAllUser(userId)
  }
  async getAllReport() {

    return this.profileQuery.getAllReport()
  }

  async uploadUserPic(ctx: HttpContextContract) {
    let userId = ctx.auth.user?.id
    let data = ctx.request.all()
    const image = ctx.request.file('file')
    if (!image) return
    let images: any
    images = await this.customHelpers.uploadImages2(ctx)
    let obj = {
      [data.uploadType]: images,
    }
    await this.profileQuery.saveUserInfo(obj, userId)
    let isPic = data.uploadType == 'profile_pic' ? true : false
    return {
      picture: images,
      isProfile: isPic
    }

  }

  async blockUser(ctx) {
    let userId = ctx.auth.user?.id;
    let data = ctx.request.all()
    if (data.blocked_user_id == userId) return
    let check = await this.profileQuery.signgleBlock('blocked_user_id', data.blocked_user_id, 'user_id', userId)
    if (check) return ctx.response.status(401).send({ msg: 'Already Blocked!' })
    data.user_id = userId
    let block = await this.profileQuery.blockUser(data)
    if (block) {
      return this.profileQuery.deleteFriend(data.blocked_user_id, userId)
    }
    return block
  }

  async unBlockUser(ctx) {
    let userId = ctx.auth.user?.id;
    let data = ctx.request.all()
    if (data.bId == userId) return
    data.user_id = userId
    let block = await this.profileQuery.unBlockUser(userId, data.bId)
    return block
  }
  async darkModeChange(ctx) {
    let userId = ctx.auth.user?.id;
    let data = ctx.request.all()
    let value = data.dark_mode == true ? 1 : 0
    return await this.profileQuery.darkModeChange(userId, value)
  }

  async uploadImage(ctx) {
    const images = ctx.request.files('images')
    let uploadedImages: any[] = []
    for (let image of images) {
      const fileName = `${cuid()}.${image.extname}`
      await image.move(Application.publicPath('uploads'), {
        name: fileName,
      })
      let imgObj = {
        fileLoc: fileName,
        originalName: image.clientName,
        extname: image.extname,
        size: image.size,
        type: ctx.request.all().uploadType

      }
      uploadedImages.push(imgObj)
    }
    return uploadedImages
  }


  public async getUserTransactionList(ctx: HttpContextContract) {
    let userId: any = ctx.auth.user?.id
    let data = ctx.request.all()
    return await this.profileQuery.getUserTransactionList(userId, data.page, data.limit)
  }
  public async update_last_active_time(ctx) {
    let userId: any = ctx.auth.user?.id
    if (!userId) return ctx.response.status(401).send({ msg: 'User is not available.' })
    let last_active = Math.round(Date.now() / 1000)
    let data = ctx.request.all()
    console.log(data, 'reciving data')
    let ob = {
      id: userId,
      last_active: last_active,
      is_online: 'online',
    }
    // console.log("updatating last active time")
    return this.profileQuery.update_last_active_time(ob)
  }




};
