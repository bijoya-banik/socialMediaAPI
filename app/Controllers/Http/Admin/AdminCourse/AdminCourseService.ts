import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import AdminCourseQuery from './AdminCourseQuery';
// import CustomHelpers from 'App/Helpers/CustomHelpers';
const moment = require('moment')
const AWS = require('aws-sdk');
const fs = require('fs');
const spacesEndpoint = new AWS.Endpoint('ewr1.vultrobjects.com');
// const s3 = new AWS.S3({
//    endpoint: spacesEndpoint,
//    region: 'nyc3',
//    secretAccessKey: 'VSzV39IUPdsvR69K3CCGb1HgzjxUUKrbC1NMkP75',
//    accessKeyId: '42XMXF11KWWVZG02IW29'
// });

const s3 = new AWS.S3({
  endpoint: spacesEndpoint,
  region: 'nyc3',
  secretAccessKey: process.env.vulter_key,
   accessKeyId: process.env.vulter_id
});
export default class AdminCourseService {
    private adminCourseQuery : AdminCourseQuery

    // private customHelpers : CustomHelpers
    constructor(){
      this.adminCourseQuery = new AdminCourseQuery
      // this.customHelpers = new CustomHelpers
    }

    public async getAllCarevanCourse(ctx : HttpContextContract){
      const limit = ctx.request.all().limit? ctx.request.all().limit : 10
      const activity_type = ctx.request.all().activity_type? ctx.request.all().activity_type : 'webinar'
      let courses = await this.adminCourseQuery.getAllCarevanCourseQuery(activity_type,limit)
      if(!courses.length) return courses;
      for(let d of courses ){
        let details = JSON.parse(d.data);
        d.data = details;
      }
      return courses
    }
    public async getCarevanCourse(ctx : HttpContextContract){
      const page = ctx.request.all().page? ctx.request.all().page : 1
      const activity_type = ctx.request.all().activity_type? ctx.request.all().activity_type : 'webinar'
      let courses = await this.adminCourseQuery.getCarevanCourseQuery(activity_type,page)
      if(!courses.length) return courses;
      for(let d of courses ){
        let details = JSON.parse(d.data);
        d.data = details;
      }
      return courses
    }
    public async getCourseDetailsById(ctx : HttpContextContract){
      let id =ctx.params.id;
      let courses = await this.adminCourseQuery.getCourseDetailsByIdQuery(id)
      if(!courses) return courses;
      // for(let d of courses ){
        let details = JSON.parse(courses.data);
        courses.data = details;
      // }
      return courses
    }
    async createarevanCourse(ctx) {
      let alldata = ctx.request.all()
      let user = { id:0 }
      try {
        user =  await ctx.auth.use('web').authenticate();
      } catch (error) {
        console.log("Erorro",error)
      }

      let formatedData:any = {
          user_id:user.id,
          order_id:user.id,
          activity_text:alldata.activity_text,
          description:alldata.description,
          activity_type: alldata.activity_type,
          privacy:alldata.privacy?alldata.privacy:'No',
          data:JSON.stringify(alldata.data),
      }
      if(alldata.start_date_time){
        formatedData.start_date_time = moment(alldata.start_date_time).format("YYYY-MM-DD HH:mm:ss")
      }
      let dataaa= await  this.adminCourseQuery.createCarevanCourseQuery(formatedData)
      await this.adminCourseQuery.editCarevanQuery({id:dataaa.id,order_id:dataaa.id})
      return dataaa
    }
    async editTraining(ctx) {
      let alldata = ctx.request.all()
      let user = { id:0}
      try {
        user =  await ctx.auth.use('web').authenticate();
      } catch (error) {
        console.log("Erorro",error)
      }

      let formatedData:any = {
          id:alldata.id,
          user_id:user.id,
          activity_text:alldata.activity_text,
          description:alldata.description,
          privacy:alldata.privacy?alldata.privacy:'No',
          data:JSON.stringify(alldata.data),
      }

      // let dataaa= await  this.adminCourseQuery.createCarevanCourseQuery(formatedData)
      return this.adminCourseQuery.editCarevanQuery(formatedData)
    }
    async editCarevan(ctx){
      let alldata = ctx.request.all()
    

      let data ={
        course_hours:'',
        course_price:'',
        cover:{},
        contents:[]
      }
      let cover={
        source:alldata.data.cover,
        extType:alldata.data.cover_extType,
      }
      data.cover = cover
      let contents
      contents =[]
      data.contents =[]
      if(alldata.data && alldata.data.files.length){
        for(let item of alldata.data.files){
            let ob ={
              source:item.url,
              title:item.title?item.title:'',
              extType:item.extType,
              isIframe:item.isIframe?item.isIframe:false,
          }
          contents.push(ob)
        }
      }
      data.contents = contents
      if(!alldata.start_date_time) return "ll"
      let formatedData = {
          id:alldata.id,
          activity_text:alldata.activity_text,
          description:alldata.description?alldata.description:'',
          activity_type: alldata.activity_type,
          start_date_time: moment(alldata.start_date_time).format("YYYY-MM-DD HH:mm:ss") ,
          privacy:alldata.privacy,
          data:JSON.stringify(data),
      }
      try {
          return this.adminCourseQuery.editCarevanQuery(formatedData)
      } catch (error) {
        return error

      }
    }
    public async deleteCarevan(ctx : HttpContextContract){
      const id = ctx.request.all().id
      return this.adminCourseQuery.deleteCarevanQuery(id)

    }
    public async sortCarevan(ctx : HttpContextContract){
      // return ctx.request.all();
      return this.adminCourseQuery.sortCarevanQuery(ctx.request.all().data)

    }

    async uploadImageToVulterObject(ctx) {
      const file = ctx.request.file('file', {
       size: '50mb',
        extnames: ['jpg', 'png', 'jpeg', 'gif','webp', 'doc', 'pdf','mp4','flv','wmv','mkv','mov'],
        types: ['image', 'video'],
      })
      if (file) {
        let type:any =   file.extname;

        // return type;

        let fileType
        if (type == 'mp4' || type == 'flv' || type == 'wmv' || type == 'mkv' || type == 'mov') {
            fileType = 'video'
        }
        if (type == 'jpg' || type == 'jpeg' || type == 'png' || type == 'gif') {
            fileType = 'image'
        }
        const name = `${fileType}_${new Date().getTime()}.${type}`

        await s3.putObject({
            Key: name,
            // Bucket: 'carevan-course',
            Bucket: process.env.vulter_folder,
            Body: fs.createReadStream(file.tmpPath),
            ACL:'public-read',
          }).promise();


          // let upFile = `https://ewr1.vultrobjects.com/carevan-course/${name}`
          let upFile = `https://ewr1.vultrobjects.com/${process.env.vulter_folder}/${name}`
        return ctx.response.status(200).json({
            message: 'File has been uploaded successfully!',
            url: upFile,
            extType: type,
            fileType: fileType
        })
      }
      return ctx.response.status(200).json({
          message: 'Invalid Request!'
      })
    }

    async countAllActiveUsers(){
      let d = await this.adminCourseQuery.countAllActiveUsersQuery()
      let dd = JSON.parse(JSON.stringify(d))
      return dd.meta.total
    }
    async yearlySubscribers(ctx){
      let page = ctx.request.input('page') ?ctx. request.input('page') : 1;
      let showPage = ctx.request.input('showPage') ? ctx.request.input('showPage') : 10;
      let d= await  this.adminCourseQuery.yearlySubscribersQuery(page,showPage)
      let temp = JSON.parse(JSON.stringify(d))

      for(let dd of temp.data ){
        let created_date = new Date(dd.member_expired_at);
        // var today = new Date(expire_date);
        var ddd = String(created_date.getDate()).padStart(2, '0');
        var mm = String(created_date.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = created_date.getFullYear();

        var expire_fdate = yyyy + '-' + mm + '-' + ddd;
        dd.validity = `Expire in ${expire_fdate} `;
        dd.user_name = dd.firstName +' '+ dd.lastName
      }
      return d;
    }
    async courseSubscribers(ctx) {

      let page = ctx.request.input('page') ? ctx.request.input('page') : 1;
      let showPage = ctx.request.input('showPage') ? ctx.request.input('showPage') :10;
      let type = ctx.request.input('type') ? ctx.request.input('type') :'Webnair';

      let d:any = await this.adminCourseQuery.courseSubscribersQuery(page,showPage,type)
      return d
      let temp = JSON.parse(JSON.stringify(d))
      // if(!temp.data || !temp.data.length) return temp.data

      for(let dd of temp.data){
          let created_date = new Date(dd.expired_at);
          // var today = new Date(expire_date);
          var ddd = String(created_date.getDate()).padStart(2, '0');
          var mm = String(created_date.getMonth() + 1).padStart(2, '0'); //January is 0!
          var yyyy = created_date.getFullYear();

          var expire_fdate = yyyy + '-' + mm + '-' + ddd;
          dd.validity = `Expire in ${expire_fdate} `;

          dd.user_name = dd.user.firstName +' '+ dd.user.lastName
          dd.user_email = dd.user.email
          dd.course_name = dd.course.activity_text
      }
      return temp;

    }


    async createNarCourse(ctx){
      let data = ctx.request.all()
      let ob ={
        title: data.title,
        description:data.description,
        link: data.link,
        cover: data.cover,
      }
      let a = await this.adminCourseQuery.createNarCourse(ob)
      await this.adminCourseQuery.editNarCourse({id:a.id, order_id:a.id})
      return a

  }
  async getAllNarCourse(ctx){
    let page = ctx.request.input('page') ?ctx. request.input('page') : 1;
     let pageSize = ctx.request.input('pageSize') ? ctx.request.input('pageSize') : 10;

    return this.adminCourseQuery.getAllNarCourse(page,pageSize)
  }
  async getSingleNarCourse(ctx){
    let id =ctx.params.id

    return this.adminCourseQuery.getSingleNarCourse(id)
  }
  async editNarCourse(ctx){
    let data = ctx.request.all()
    let ob ={
      id:data.id,
      title: data.title,
      description:data.description,
      link: data.link,
      cover: data.cover,
    }

    return this.adminCourseQuery.editNarCourse(ob)
  }
  async deleteNarCourse(ctx){
    let data = ctx.request.all()


    return this.adminCourseQuery.deleteNarCourse(data)
  }
  async createPreLicensing(ctx){
      let data = ctx.request.all()
      let ob ={
        title: data.title,
        description:data.description,
        link: data.link,
        cover: data.cover,
      }
      let a = await this.adminCourseQuery.createPreLicensing(ob)
      await this.adminCourseQuery.editPreLicensing({id:a.id, order_id:a.id})
      return a

  }
  async getAllPreLicensing(ctx){
    let page = ctx.request.input('page') ?ctx. request.input('page') : 1;
    let pageSize = ctx.request.input('pageSize') ? ctx.request.input('pageSize') : 10;
    return this.adminCourseQuery.getAllPreLicensing(page,pageSize)
  }
  async getAllLimitPreLicensing(ctx){
    let limit = ctx.request.input('limit') ?ctx. request.input('limit') : 10;
    return this.adminCourseQuery.getPreLicensingCourse(limit)
  }
  async getSinglePreLicensing(ctx){
    let id =ctx.params.id

    return this.adminCourseQuery.getSinglePreLicensing(id)
  }
  async editPreLicensing(ctx){
    let data = ctx.request.all()
    let ob ={
      id:data.id,
      title: data.title,
      description:data.description,
      link: data.link,
      cover: data.cover,
    }

    return this.adminCourseQuery.editPreLicensing(ob)
  }
  async deletePreLicensing(ctx){
    let data = ctx.request.all()
    return this.adminCourseQuery.deletePreLicensing(data)
  }
  async sortPreLicensing(ctx){
    let data = ctx.request.all().data
    return this.adminCourseQuery.sortPreLicensing(data)
  }


  async reorderCourse(ctx){
    let data = ctx.request.all()
      await  this.adminCourseQuery.editCarevanQuery({id:data.from.id,order_id:data.from.order_id})
      return  this.adminCourseQuery.editCarevanQuery({id:data.to.id,order_id:data.to.order_id})
  }
  async reorderPreLicensing(ctx){
    let data = ctx.request.all()
      await  this.adminCourseQuery.editPreLicensing({id:data.from.id,order_id:data.from.order_id})
      return  this.adminCourseQuery.editPreLicensing({id:data.to.id,order_id:data.to.order_id})
  }


};
